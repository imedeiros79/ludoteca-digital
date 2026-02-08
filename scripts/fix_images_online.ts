
import { PrismaClient } from '@prisma/client';
import https from 'https';

const prisma = new PrismaClient();

const BASE_URL = 'https://dmrafr2igetxh.cloudfront.net/todas/';
const VARIATIONS = [
    // Standard lower
    'thumbnail.png', 'thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.webp', 'thumbnail.gif', 'thumbnail.bmp',
    // Standard Capitalized
    'Thumbnail.png', 'Thumbnail.jpg', 'Thumbnail.jpeg', 'Thumbnail.webp', 'Thumbnail.gif', 'Thumbnail.bmp',
    // ALL CAPS
    'THUMBNAIL.PNG', 'THUMBNAIL.JPG', 'THUMBNAIL.JPEG', 'THUMBNAIL.WEBP', 'THUMBNAIL.GIF', 'THUMBNAIL.BMP',
    // Mixed Extensions
    'thumbnail.PNG', 'thumbnail.JPG', 'thumbnail.JPEG', 'thumbnail.WEBP',
    'Thumbnail.PNG', 'Thumbnail.JPG', 'Thumbnail.JPEG',
    // Other common variations seen in legacy data
    'Thumb.jpg', 'Thumb.png', 'thumb.jpg', 'thumb.png',
    'capa.jpg', 'capa.png', 'Capa.jpg', 'Capa.png',
    'imagem.jpg', 'imagem.png',
    'cover.jpg', 'cover.png',
    // No extension
    'thumbnail', 'Thumbnail', 'THUMBNAIL',
    'thumb', 'Thumb', 'THUMB',
    'capa', 'Capa', 'CAPA',
    'index.jpg', 'index.png', 'index.jpeg'
];

async function checkUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

async function findCorrectImageUrl(gameUrl: string): Promise<string | null> {
    // gameUrl format: https://.../todas/<folder>/index.html
    // We need extract <folder>
    const match = gameUrl.match(/\/todas\/([^\/]+)\/index\.html/);
    if (!match) return null;

    const folder = match[1];

    // Parallel check is faster but be careful with rate limits. 
    // Cloudfront handles high load well.
    const promises = VARIATIONS.map(async (filename) => {
        const testUrl = `${BASE_URL}${folder}/${filename}`;
        const exists = await checkUrl(testUrl);
        return exists ? testUrl : null;
    });

    const results = await Promise.all(promises);
    return results.find(url => url !== null) || null;
}

async function main() {
    console.log('Buscando jogos...');
    const items = await prisma.item.findMany({
        select: { id: true, gameUrl: true, imageUrl: true }
    });
    console.log(`Total de jogos para verificar: ${items.length}`);

    let updated = 0;
    let failed = 0;
    let skipped = 0;

    // Process in chunks to avoid blowing up memory/connections
    const CHUNK_SIZE = 50;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);
        const updates = await Promise.all(chunk.map(async (item) => {
            // If we already have a working URL, maybe skip? 
            // But User says they are broken so let's verify even existing ones?
            // Or at least verify the current one first.

            if (item.imageUrl) {
                const isWorking = await checkUrl(item.imageUrl);
                if (isWorking) {
                    return null; // All good
                }
            }

            // If null or broken, search for correct one
            const correctUrl = await findCorrectImageUrl(item.gameUrl);
            if (correctUrl && correctUrl !== item.imageUrl) {
                return prisma.item.update({
                    where: { id: item.id },
                    data: { imageUrl: correctUrl }
                });
            }

            if (!correctUrl) failed++;
            return null;
        }));

        const validUpdates = updates.filter(u => u !== null);
        updated += validUpdates.length;
        console.log(`Processado ${i + chunk.length}/${items.length} (Correções lote: ${validUpdates.length})`);
    }

    console.log('--- Resumo ---');
    console.log(`Total Atualizados: ${updated}`);
    console.log(`Falhas (Nenhuma imagem encontrada): ${failed}`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
