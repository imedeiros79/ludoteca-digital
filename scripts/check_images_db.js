const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPostsImages() {
    const posts = await prisma.post.findMany({
        select: { title: true, imageUrl: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10
    });
    console.log('--- Últimos Posts e suas Imagens ---');
    posts.forEach(p => {
        console.log(`Título: ${p.title}`);
        console.log(`Imagem: ${p.imageUrl}`);
        console.log(`Data: ${p.createdAt}`);
        console.log('---');
    });
    await prisma.$disconnect();
}

checkPostsImages();
