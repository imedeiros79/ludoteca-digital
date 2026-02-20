import { PrismaClient } from '@prisma/client';
import https from 'https';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const BASE_URL = 'https://dmrafr2igetxh.cloudfront.net/todas/';
const VARIATIONS = [
    'thumbnail.png', 'thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.webp',
    'thumbnail.PNG', 'thumbnail.JPG', 'thumbnail.JPEG', 'thumbnail.WEBP',
    'Thumbnail.png', 'Thumbnail.jpg', 'Thumbnail.jpeg',
    'capa.jpg', 'capa.png', 'Capa.jpg', 'Capa.png',
    'CAPA.JPG', 'CAPA.PNG',
    'icons/icon-512.png', 'icons/icon-256.png'
];

async function checkUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD', timeout: 5000 }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => { req.destroy(); resolve(false); });
        req.end();
    });
}

async function findCorrectImageUrl(gameUrl: string): Promise<string | null> {
    const match = gameUrl.match(/\/todas\/([^\/]+)\/index\.html/);
    if (!match) return null;

    const folder = match[1];
    const folderWithoutL = folder.replace(/(_l_?\d+)$/, (m) => m.replace('_l_', '_').replace('_l', ''));

    // 1. Tenta na pasta atual do jogo
    for (const filename of VARIATIONS) {
        const testUrl = `${BASE_URL}${folder}/${filename}`;
        if (await checkUrl(testUrl)) return testUrl;
    }

    // 2. Tenta na pasta sem o sufixo _l_ (Muitas vezes a imagem está lá)
    if (folder !== folderWithoutL) {
        for (const filename of VARIATIONS) {
            const testUrl = `${BASE_URL}${folderWithoutL}/${filename}`;
            if (await checkUrl(testUrl)) return testUrl;
        }

        // Também tenta remover completamente o ID se houver
        const folderSlug = folder.split('_')[0];
        if (folderSlug && folderSlug !== folder && folderSlug !== folderWithoutL) {
            for (const filename of ['thumbnail.png', 'thumbnail.jpg', 'thumbnail.jpeg', 'thumbnail.PNG', 'thumbnail.JPG']) {
                const testUrl = `${BASE_URL}${folderSlug}/${filename}`;
                if (await checkUrl(testUrl)) return testUrl;
            }
        }
    }

    return null;
}

async function main() {
    console.log('Iniciando busca de imagens...');
    const items = await prisma.item.findMany({
        select: { id: true, gameUrl: true, imageUrl: true }
    });
    console.log(`Total: ${items.length} jogos.`);

    let updated = 0;
    let failed = 0;

    const CHUNK_SIZE = 10;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        const chunk = items.slice(i, i + CHUNK_SIZE);

        await Promise.all(chunk.map(async (item) => {
            try {
                if (item.imageUrl && await checkUrl(item.imageUrl)) return;

                const correctUrl = await findCorrectImageUrl(item.gameUrl);
                if (correctUrl) {
                    await prisma.item.update({
                        where: { id: item.id },
                        data: { imageUrl: correctUrl }
                    });
                    updated++;
                } else {
                    failed++;
                }
            } catch (err: any) {
                console.error(`Erro no item ${item.id}:`, err.message);
            }
        }));

        console.log(`Progresso: ${i + chunk.length}/${items.length} (Atualizados: ${updated})`);
        // Pequena pausa para não sobrecarregar
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`Fim. Total atualizados: ${updated}, Não encontrados: ${failed}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
