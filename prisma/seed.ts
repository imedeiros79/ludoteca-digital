
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.item.count();

    if (count > 0) {
        console.log('Banco de dados já contém jogos.');
        return;
    }

    console.log('Populando banco de dados com jogos de exemplo...');

    await prisma.item.createMany({
        data: [
            {
                title: 'Vogais Iniciais',
                description: 'Jogo educativo de Escuta, Fala, Pensamento e Imaginação para 1º Nível - Educação Infantil, 2º Nível - Educação Infantil, 1º Ano - Ensino Fundamental I.',
                year: 'Educação Infantil',
                subject: 'Língua Portuguesa',
                gameUrl: 'https://cdn.example.com/jogos/vogais.html', // Placeholder
                imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
                bncc: 'EI02EF09'
            },
            {
                title: 'Vogais e Consoantes',
                description: 'Jogo educativo de Língua Portuguesa para 1º Ano - Ensino Fundamental I.',
                year: '1° Ano',
                subject: 'Língua Portuguesa',
                gameUrl: 'https://cdn.example.com/jogos/consoantes.html', // Placeholder
                imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d',
                bncc: 'EF01LP02'
            },
            {
                title: 'Matemática Divertida',
                description: 'Aprenda operações básicas de forma lúdica.',
                year: '2° Ano',
                subject: 'Matemática',
                gameUrl: 'https://cdn.example.com/jogos/matematica.html', // Placeholder
                imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904',
                bncc: 'EF02MA06'
            }
        ]
    });

    console.log('Jogos criados com sucesso!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
