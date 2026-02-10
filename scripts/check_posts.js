const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPosts() {
    const posts = await prisma.post.findMany({
        select: { title: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
    });
    console.log('Posts no Banco de Dados:');
    posts.forEach(p => console.log(`- ${p.title} (${p.createdAt})`));
    await prisma.$disconnect();
}

checkPosts();
