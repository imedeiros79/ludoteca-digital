const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const educationImages = [
    'https://images.unsplash.com/photo-1509062522246-373b1d7973d6?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1546410531-bb4caa1b424d?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1200'
];

async function fixImages() {
    console.log('--- Iniciando Correção de Imagens ---');
    const posts = await prisma.post.findMany();

    for (const post of posts) {
        if (!post.imageUrl || post.imageUrl.includes('source.unsplash.com')) {
            const randomImage = educationImages[Math.floor(Math.random() * educationImages.length)];
            console.log(`Corrigindo [${post.title}]...`);
            await prisma.post.update({
                where: { id: post.id },
                data: { imageUrl: randomImage }
            });
        }
    }
    console.log('--- Correção Concluída ---');
    await prisma.$disconnect();
}

fixImages();
