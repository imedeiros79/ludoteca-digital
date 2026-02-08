
import { PrismaClient } from '@prisma/client';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import https from 'https';

dotenv.config();

// AWS Credentials from User (Hardcoded for this script only, or could be passed via env)
const S3_CONFIG = {
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
};

const BUCKET_NAME = 'minas-educa-games-br';
const CLOUDFRONT_BASE = 'https://dmrafr2igetxh.cloudfront.net';

const prisma = new PrismaClient();
const s3 = new S3Client(S3_CONFIG);

async function checkUrl(url: string): Promise<boolean> {
    if (!url) return false;
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

function getGameFolder(gameUrl: string) {
    // Format: https://dmrafr2igetxh.cloudfront.net/todas/folder_name/index.html
    const match = gameUrl.match(/\/todas\/([^\/]+)\/index\.html/);
    if (!match) return null;
    return match[1];
}

async function findImageInBucket(folderName: string): Promise<string | null> {
    try {
        const prefix = `todas/${folderName}/`;
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: prefix
        });

        const response = await s3.send(command);
        if (!response.Contents) return null;

        // Look for common image extensions
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

        // Prioritize "thumbnail" or "capa" if possible, but any valid image is better than nothing
        const images = response.Contents
            .map(item => item.Key)
            .filter(key => key && imageExtensions.some(ext => key.toLowerCase().endsWith(ext)));

        if (images.length === 0) return null;

        // Strategy: 
        // 1. Exact match for 'thumbnail.*'
        // 2. Exact match for 'capa.*'
        // 3. Any image that is not explicitly excluded (like icons, sprites if identifiable)

        const thumbnail = images.find(key => key?.toLowerCase().includes('thumbnail'));
        if (thumbnail) return thumbnail;

        const capa = images.find(key => key?.toLowerCase().includes('capa'));
        if (capa) return capa;

        // Fallback: Return the first image found
        // Warning: Might pick up assets/sprites if they are in root folder. 
        // Usually game assets are in subfolders like 'images/', 'media/'. 
        // The prefix search is recursive? Yes if Delimiter is not set.
        // Let's check if the image is in the IMMEDIATE folder to reduce risk of picking game assets.

        const rootImages = images.filter(key => {
            // key is like 'todas/folder/image.png'
            // check if it has more slashes after the prefix
            const relativePath = key?.substring(prefix.length);
            return relativePath && !relativePath.includes('/');
        });

        if (rootImages.length > 0) return rootImages[0];

        // If no root images, return first found (risky but better than broken?)
        return images[0] || null;

    } catch (error) {
        console.error(`Error listing bucket for ${folderName}:`, error);
        return null;
    }
}

async function main() {
    console.log('Iniciando correção via S3...');

    // Fetch all items or just potentially broken ones?
    // Let's filter for items we suspect are broken or verify them.
    // Iterating 1444 items with S3 calls might be slow/costly if we do ALL.
    // Let's do the "checkUrl" first, if broken -> hit S3.

    const items = await prisma.item.findMany({
        select: { id: true, title: true, gameUrl: true, imageUrl: true }
    });

    let fixedCount = 0;
    let notFoundCount = 0;

    for (const item of items) {
        let needsFix = false;

        if (!item.imageUrl) {
            needsFix = true;
        } else {
            const isWorking = await checkUrl(item.imageUrl);
            if (!isWorking) needsFix = true;
        }

        if (needsFix) {
            process.stdout.write(`Checking ${item.title}... `);
            const folderName = getGameFolder(item.gameUrl);
            if (!folderName) {
                console.log('Skipping (Invalid Game URL)');
                continue;
            }

            const s3Key = await findImageInBucket(folderName);

            if (s3Key) {
                // Construct new URL
                const newUrl = `${CLOUDFRONT_BASE}/${s3Key}`; // s3Key includes 'todas/folder/file.ext'

                await prisma.item.update({
                    where: { id: item.id },
                    data: { imageUrl: newUrl }
                });

                console.log(`FIXED! -> ${s3Key}`);
                fixedCount++;
            } else {
                console.log('NOT FOUND IN BUCKET');
                notFoundCount++;
            }
        }
    }

    console.log(`\n\n--- RESUMO S3 ---`);
    console.log(`Corrigidos: ${fixedCount}`);
    console.log(`Não encontrados no Bucket: ${notFoundCount}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
