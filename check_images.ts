
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const items = await prisma.item.findMany({
        take: 5,
        select: {
            title: true,
            gameUrl: true,
            imageUrl: true
        }
    });
    console.log('Amostra de Jogos:', JSON.stringify(items, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
