const { PrismaClient } = require('@prisma/client');
const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config(); // Tenta carregar do diretório atual

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateBlogPost() {
    console.log('--- Iniciando Geração de Post Manual com IA ---');

    if (!process.env.GROQ_API_KEY) {
        console.error('ERRO: GROQ_API_KEY não configurada no .env');
        return;
    }

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
    console.log(`Tema selecionado: ${tema}`);

    try {
        const completion = await groq.chat.completions.create({
            messages: [{
                role: "system",
                content: "Você é um especialista em educação brasileira, BNCC e gamificação. Sua tarefa é criar um artigo de blog altamente otimizado para SEO, com tom profissional e acolhedor para professores brasileiros. Responda APENAS em formato JSON puro com as chaves: title, slug, description, content."
            }, {
                role: "user",
                content: `Crie um artigo detalhado sobre o tema "${tema}".
                O conteúdo deve ter pelo menos 4 parágrafos, explicar a importância da tecnologia e citar a BNCC.
                O slug deve ser no formato: titulo-do-post.
                Não use markdown de cabeçalho no content, apenas os parágrafos dividos por \n.`
            }],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

        if (!result.title || !result.content) {
            throw new Error('IA retornou conteúdo incompleto');
        }

        // Usar LoremFlickr para maior estabilidade e compatibilidade
        const randomId = Math.floor(Math.random() * 1000);
        const randomImage = `https://loremflickr.com/1200/675/education,school,learning?lock=${randomId}`;

        const post = await prisma.post.create({
            data: {
                title: result.title,
                slug: result.slug + '-' + Date.now(),
                description: result.description,
                content: result.content,
                published: true,
                imageUrl: randomImage
            }
        });

        console.log(`✓ Post Criado com Sucesso: ${post.title}`);
        console.log(`URL: /blog/${post.slug}`);

    } catch (error) {
        console.error('Falha na geração:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

generateBlogPost();
