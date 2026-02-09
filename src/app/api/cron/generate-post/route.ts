import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function GET(request: Request) {
    // Verificar se é uma chamada do Vercel Cron (ou tem a chave de segurança)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return new Response('Unauthorized', { status: 401 });
    }

    console.log('--- Iniciando Geração Automática via Cron ---');

    const subjects = [
        'Gamificação na Alfabetização',
        'Matemática Divertida com Tecnologia',
        'BNCC e Recursos Digitais',
        'Engajamento Escolar no Século XXI',
        'O Futuro das Aulas Interativas',
        'Educação Inclusiva e Ferramentas Digitais'
    ];

    const tema = subjects[Math.floor(Math.random() * subjects.length)];

    try {
        const completion = await groq.chat.completions.create({
            messages: [{
                role: "system",
                content: "Você é um especialista em educação, BNCC e gamificação. Crie um artigo de blog JSON com chaves: title, slug, description, content."
            }, {
                role: "user",
                content: `Crie um artigo detalhado sobre "${tema}". Use pelo menos 4 parágrafos. Não use markdown de título no content.`
            }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

        const post = await prisma.post.create({
            data: {
                title: result.title,
                slug: `${result.slug}-${Date.now()}`,
                description: result.description,
                content: result.content,
                published: true,
                imageUrl: `https://images.unsplash.com/photo-1497633762265-9a177c8098a2?q=80&w=1200&auto=format&fit=crop`
            }
        });

        return NextResponse.json({ success: true, post: post.title });
    } catch (error: any) {
        console.error('Falha no Cron:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
