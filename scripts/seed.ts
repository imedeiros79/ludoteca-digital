import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';
import Stripe from 'stripe'; // Added Stripe import

dotenv.config({ path: 'd:/Antigravity-projetos/aulasssas/ludoteca-digital/.env' });

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover', // Updated API version if needed, kept as is
});

const GAMES_DIR = 'D:/aulas baixadas do portal/todas';
const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

interface InfoMetadata {
    title: string;
    subject: string;
    year: string;
    bncc: string;
}

// Map folder name to URL
function loadExcelMap(): Map<string, string> {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as (string | number | undefined)[][];

    const map = new Map<string, string>();

    data.forEach(row => {
        if (row[0] && row[1]) {
            map.set(row[0].toString().trim(), row[1].toString().trim());
        }
    });
    return map;
}

function parseInfoTxt(filePath: string): InfoMetadata | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const data: Record<string, string | string[]> = {};

        let currentKey = '';

        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length > 1 && !line.startsWith(' ')) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                data[key] = value;
                currentKey = key;
            } else if (currentKey === 'BNCC' && line.trim().startsWith('-')) {
                // Capture BNCC codes
                const codes = (data['BNCC_Codes'] as string[]) || [];
                const code = line.replace('-', '').trim().split(' ')[0];
                codes.push(code);
                data['BNCC_Codes'] = codes;
            }
        });

        const bnccCodes = data['BNCC_Codes'] as string[];

        return {
            title: (data['Nome'] as string) || '',
            subject: (data['Componente/Campo de experiência'] as string) || '',
            year: (data['Etapa Letiva'] as string) || '',
            bncc: bnccCodes ? bnccCodes.join(', ') : '',
        };
    } catch {
        return null;
    }
}

async function generateDescription(title: string, metadata: InfoMetadata) {
    // FAST IMPORT: Skip AI for now to restore data quickly
    return `Jogo educativo de ${metadata.subject} para ${metadata.year}.`;
}

async function main() {
    console.log("Iniciando importação...");
    const urlMap = loadExcelMap();
    console.log(`Carregados ${urlMap.size} URLs do Excel.`);

    const folders = fs.readdirSync(GAMES_DIR).filter(f => fs.statSync(path.join(GAMES_DIR, f)).isDirectory());
    console.log(`Encontradas ${folders.length} pastas de jogos.`);

    let processed = 0;

    for (const folder of folders) {
        const gameUrl = urlMap.get(folder);
        if (!gameUrl) {
            // console.log(`[SKIP] URL não encontrada para pasta: ${folder}`);
            continue;
        }

        const infoPath = path.join(GAMES_DIR, folder, 'info.txt');
        if (!fs.existsSync(infoPath)) {
            // console.log(`[SKIP] info.txt não encontrado em: ${folder}`);
            continue;
        }

        const metadata = parseInfoTxt(infoPath);
        if (!metadata || !metadata.title) continue;

        let thumbUrl: string | null = null;

        // Dynamic thumbnail detection (case insensitive)
        try {
            const gameFolderPath = path.join(GAMES_DIR, folder);
            const files = fs.readdirSync(gameFolderPath);
            const thumbFile = files.find(f =>
                f.toLowerCase().startsWith('thumbnail.') &&
                ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(path.extname(f).toLowerCase())
            );

            if (thumbFile) {
                // Construct URL using the ACTUAL filename found on disk
                thumbUrl = gameUrl.replace('index.html', thumbFile);
            }
        } catch (err) {
            console.error(`Erro ao ler pasta ${folder}:`, err);
        }

        const description = await generateDescription(metadata.title, metadata);

        // Upsert to DB
        const existing = await prisma.item.findFirst({ where: { gameUrl } });

        if (existing) {
            await prisma.item.update({
                where: { id: existing.id },
                data: {
                    title: metadata.title,
                    description,
                    subject: metadata.subject,
                    year: metadata.year,
                    bncc: metadata.bncc,
                    imageUrl: thumbUrl,
                }
            });
        } else {
            await prisma.item.create({
                data: {
                    title: metadata.title,
                    description,
                    subject: metadata.subject,
                    year: metadata.year,
                    bncc: metadata.bncc,
                    gameUrl,
                    imageUrl: thumbUrl
                }
            });
        }

        processed++;
        if (processed % 50 === 0) console.log(`Processados: ${processed}...`);
    }

    console.log(`Concluído! Total importados/atualizados: ${processed}`);
}

main()
    .catch(e => {
        const error = e as Error;
        console.error(error.message);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
