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

    console.log('[CRON] Iniciando Geração Automática...');

    const subjects = [
        'Matemática e Gamificação',
        'Alfabetização no Século XXI',
        'Ciências e Objetos de Aprendizagem',
        'História através de Jogos Digitais',
        'Desenvolvimento Socioemocional e Tecnologia',
        'BNCC na Prática com Tecnologia',
        'Engajamento Escolar no Século XXI',
        'O Futuro das Aulas Interativas',
        'Educação Inclusiva e Ferramentas Digitais'
    ];

    const tema = subjects[Math.floor(Math.random() * subjects.length)];
    console.log(`[CRON] Tema selecionado: ${tema}`);

    try {
        if (!process.env.GROQ_API_KEY) {
            console.error('[CRON] Erro: GROQ_API_KEY ausente');
            throw new Error('GROQ_API_KEY não configurada');
        }

        console.log('[CRON] Solicitando conteúdo ao Groq (llama-3.3-70b)...');
        const completion = await groq.chat.completions.create({
            messages: [{
                role: "system",
                content: "Você é um especialista em educação brasileira. Responda APENAS JSON puro com as chaves: title, slug, description, content. No content, use apenas parágrafos divididos por \\n."
            }, {
                role: "user",
                content: `Artigo detalhado sobre "${tema}" citando a BNCC.`
            }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const rawJson = completion.choices[0]?.message?.content || "{}";
        console.log('[CRON] Resposta recebida do Groq');

        let result;
        try {
            result = JSON.parse(rawJson);
        } catch (pErr) {
            console.error('[CRON] Erro ao parsear JSON da IA:', rawJson);
            throw new Error('Conteúdo da IA inválido');
        }

        if (!result.title || !result.content) {
            console.error('[CRON] Conteúdo incompleto retornado:', result);
            throw new Error('IA retornou conteúdo incompleto');
        }

        const randomId = Math.floor(Math.random() * 1000);
        const randomImage = `https://loremflickr.com/1200/675/education,school,learning?lock=${randomId}`;

        console.log('[CRON] Persistindo no banco de dados...');
        const post = await prisma.post.create({
            data: {
                title: result.title,
                slug: `${result.slug}-${Date.now()}`,
                description: result.description || '',
                content: result.content,
                published: true,
                imageUrl: randomImage
            }
        });

        console.log(`[CRON] SUCESSO: Post "${post.title}" criado.`);
        return NextResponse.json({ success: true, post: post.title });
    } catch (error: any) {
        console.error('[CRON] FALHA CRÍTICA:', error.message);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
