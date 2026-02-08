
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const { PrismaClient } = require('@prisma/client');
const Groq = require('groq-sdk');
const dotenv = require('dotenv');
const Stripe = require('stripe');

dotenv.config({ path: 'd:/Antigravity-projetos/aulasssas/ludoteca-digital/.env' });

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-01-28.clover',
});

const GAMES_DIR = 'D:/aulas baixadas do portal/todas';
const EXCEL_PATH = 'd:/Antigravity-projetos/aulasssas/tabela_link_objetos.xlsx';

async function generateDescription(title, metadata) {
    if (!process.env.GROQ_API_KEY) return 'Descrição automática indisponível.';
    try {
        const completion = await groq.chat.completions.create({
            messages: [{
                role: "user",
                content: `Crie uma descrição curta e pedagógica para o jogo "${title}". Contexto: Matéria ${metadata.subject}, Ano ${metadata.year}.`
            }],
            model: "llama-3.3-70b-versatile",
        });
        return completion.choices[0]?.message?.content || "";
    } catch (e) {
        return `Jogo educativo de ${metadata.subject} para ${metadata.year}.`;
    }
}

function parseInfoTxt(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const data = {};
        let currentKey = '';

        lines.forEach(line => {
            const parts = line.split(':');
            if (parts.length > 1 && !line.startsWith(' ')) {
                const key = parts[0].trim();
                const value = parts.slice(1).join(':').trim();
                data[key] = value;
                currentKey = key;
            } else if (currentKey === 'BNCC' && line.trim().startsWith('-')) {
                const codes = data['BNCC_Codes'] || [];
                const code = line.replace('-', '').trim().split(' ')[0];
                codes.push(code);
                data['BNCC_Codes'] = codes;
            }
        });

        return {
            title: data['Nome'] || '',
            subject: data['Componente/Campo de experiência'] || '',
            year: data['Etapa Letiva'] || '',
            bncc: data['BNCC_Codes'] ? data['BNCC_Codes'].join(', ') : '',
        };
    } catch { return null; }
}

async function main() {
    const workbook = XLSX.readFile(EXCEL_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log(`Total de linhas no Excel: ${data.length}`);
    let processed = 0;

    for (const row of data) {
        const folder = row[0] ? row[0].toString().trim() : null;
        const gameUrl = row[1] ? row[1].toString().trim() : null;

        if (!folder || !gameUrl) continue;

        const infoPath = path.join(GAMES_DIR, folder, 'info.txt');
        if (!fs.existsSync(infoPath)) continue;

        const metadata = parseInfoTxt(infoPath);
        if (!metadata || !metadata.title) continue;

        // Upsert
        const existing = await prisma.item.findFirst({ where: { gameUrl } });
        if (!existing) {
            const description = await generateDescription(metadata.title, metadata);

            // Determinar thumbnail básica
            let thumbUrl = null;
            if (fs.existsSync(path.join(GAMES_DIR, folder, 'thumbnail.png'))) thumbUrl = gameUrl.replace('index.html', 'thumbnail.png');
            else if (fs.existsSync(path.join(GAMES_DIR, folder, 'thumbnail.jpg'))) thumbUrl = gameUrl.replace('index.html', 'thumbnail.jpg');
            else if (fs.existsSync(path.join(GAMES_DIR, folder, 'thumbnail.jpeg'))) thumbUrl = gameUrl.replace('index.html', 'thumbnail.jpeg');

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
            console.log(`[NEW] ${metadata.title}`);
            processed++;
        }
    }
    console.log(`Concluído! Itens novos adicionados: ${processed}`);

    const dbTotal = await prisma.item.count();
    console.log(`Total final no Banco de Dados: ${dbTotal}`);
}

main().finally(() => prisma.$disconnect());
