const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixImages() {
    const posts = await prisma.post.findMany();
    console.log(`Atualizando ${posts.length} posts...`);

    for (const post of posts) {
        const keywords = post.title.split(' ').slice(0, 3).join(',');
        const randomId = Math.floor(Math.random() * 1000);
        const newImageUrl = `https://loremflickr.com/1200/675/education,school,learning?lock=${randomId}`;

        await prisma.post.update({
            where: { id: post.id },
            data: { imageUrl: newImageUrl }
        });
        console.log(`✓ Atualizado: ${post.title}`);
    }
}

fixImages().finally(() => prisma.$disconnect());
