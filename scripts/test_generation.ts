import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function runDiagnostic() {
    console.log('=== DIAGNÓSTICO DE GERAÇÃO DE BLOG ===');
    const startOverall = Date.now();

    try {
        if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY ausente');

        const tema = 'Tecnologia na Educação';
        console.log(`[1] Iniciando chamada ao Groq (Modelo: llama-3.3-70b-versatile)...`);

        const startGroq = Date.now();
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Responda apenas JSON puro: {title, slug, description, content}" },
                { role: "user", content: `Artigo sobre ${tema}` }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });
        const durationGroq = (Date.now() - startGroq) / 1000;
        console.log(`[2] Groq respondeu em ${durationGroq}s`);

        const rawContent = completion.choices[0]?.message?.content || "";
        console.log(`[3] Tamanho da resposta: ${rawContent.length} caracteres`);

        const data = JSON.parse(rawContent);
        console.log(`[4] JSON parseado com sucesso. Título: ${data.title}`);

        console.log(`[5] Criando registro no Prisma...`);
        const startPrisma = Date.now();
        await prisma.post.create({
            data: {
                title: data.title,
                slug: `${data.slug}-${Date.now()}`,
                description: data.description,
                content: data.content,
                published: true
            }
        });
        console.log(`[6] Prisma finalizado em ${(Date.now() - startPrisma) / 1000}s`);

    } catch (err: any) {
        console.error('!!! ERRO DURANTE DIAGNÓSTICO !!!');
        console.error(err.message);
    } finally {
        await prisma.$disconnect();
        console.log(`=== Diagnóstico concluído em ${(Date.now() - startOverall) / 1000}s ===`);
    }
}

runDiagnostic();
