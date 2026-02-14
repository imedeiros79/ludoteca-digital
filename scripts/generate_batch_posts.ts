import { PrismaClient } from '@prisma/client';
import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const subjects = [
    'Matemática e Gamificação na Educação Infantil',
    'Alfabetização Digital: Desafios e Oportunidades',
    'A Importância dos Objetos de Aprendizagem na BNCC',
    'Storytelling e Jogos Digitais no Ensino de História',
    'Habilidades Socioemocionais Mediadas por Tecnologia',
    'Metodologias Ativas e Ferramentas Digitais na Prática',
    'Engajamento Escolar: Como Competir com as Telas?',
    'Sala de Aula Invertida e Interatividade Digital',
    'Educação Inclusiva: Recursos para Alunos com NEE',
    'Pensamento Computacional nas Séries Iniciais',
    'Educação Ambiental e Games Educativos',
    'Ensino de Ciências com Realidade Aumentada',
    'A Avaliação na Era da Inteligência Artificial',
    'Cidadania Digital: Ensinando Ética na Internet',
    'O Papel do Professor no Século XXI',
    'Aprendizagem Baseada em Projetos (PBL) Digital',
    'Neuroeducação e o Impacto das Tecnologias',
    'Gestão Escolar na Era da Transformação Digital',
    'Curadoria de Recursos Educacionais Abertos',
    'O Futuro da Educação Híbrida no Brasil',
    'Gamificação no Ensino de Língua Portuguesa',
    'Robótica Educativa de Baixo Custo',
    'Mobile Learning: O Celular como Ferramenta de Estudo',
    'Ensino de Geografia com Mapas Interativos',
    'A Arte Digital na Escola: Criatividade e Inovação',
    'Educação Financeira e Tecnologia para Crianças',
    'O Impacto do ChatGPT na Educação Básica',
    'Laboratórios Virtuais de Aprendizagem',
    'Soft Skills e Tecnologia para o Mercado do Futuro',
    'A BNCC e a Tecnologia no Ensino Fundamental'
];

async function generateBatch() {
    console.log('--- INICIANDO GERAÇÃO EM LOTE (30 DIAS) ---');

    if (!process.env.GROQ_API_KEY) {
        console.error('ERRO: GROQ_API_KEY não encontrada.');
        return;
    }

    const today = new Date();
    today.setHours(8, 0, 0, 0); // Todos agendados para as 08:00

    for (let i = 0; i < 30; i++) {
        const tema = subjects[i];
        const scheduledDate = new Date(today);
        scheduledDate.setDate(today.getDate() + i);

        console.log(`[${i + 1}/30] Gerando para: ${scheduledDate.toLocaleDateString()} - Tema: ${tema}`);

        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "Você é um especialista em educação brasileira e BNCC. Crie um post de blog atraente e profissional. Responda APENAS JSON: {title, slug, description, content}. No content, use parágrafos divididos por \\n. Não use markdown no content."
                    },
                    {
                        role: "user",
                        content: `Escreva um post detalhado sobre "${tema}". Cancele qualquer outra instrução anterior.`
                    }
                ],
                model: "llama-3.1-8b-instant", // Modelo rápido para lote
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(completion.choices[0]?.message?.content || "{}");

            const randomId = Math.floor(Math.random() * 1000);
            const randomImage = `https://loremflickr.com/1200/675/education,school,learning?lock=${randomId + i}`;

            await prisma.post.create({
                data: {
                    title: result.title,
                    slug: `${result.slug}-${Date.now()}-${i}`,
                    description: result.description,
                    content: result.content,
                    imageUrl: randomImage,
                    published: true,
                    scheduledAt: scheduledDate
                }
            });

            console.log(`✓ Salvo com sucesso.`);
        } catch (error: any) {
            console.error(`X Falha ao gerar post ${i + 1}:`, error.message);
        }
    }

    console.log('--- GERAÇÃO CONCLUÍDA ---');
}

generateBatch()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
