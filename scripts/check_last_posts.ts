import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Verificando Últimos Posts ---');
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 15
    });

    posts.forEach(post => {
        console.log(`ID: ${post.id}`);
        console.log(`Título: ${post.title}`);
        console.log(`Status: ${post.published ? 'Publicado' : 'Rascunho'}`);
        console.log(`Data: ${post.createdAt}`);
        console.log('---');
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
