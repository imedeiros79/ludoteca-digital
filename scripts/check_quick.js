const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
    });
    console.log('--- URLs de Imagem ---');
    posts.forEach(p => console.log(`[${p.title}]: ${p.imageUrl}`));
    await prisma.$disconnect();
}
check();
