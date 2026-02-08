
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    // Amostra de sucesso (tem imagem)
    const success = await prisma.item.findFirst({
        where: { imageUrl: { contains: 'thumbnail' } }, // likely fixed
        select: { title: true, imageUrl: true }
    });

    // Amostra de falha (provavelmente manteve a URL antiga errada ou null, vamos pegar um aleatório e checar)
    // Actually, script only updated if found. So failures still have the old 'seed' URL which was probably broken.
    // Let's grab one that looks "default" or check count.

    // We want to see what a "failure" looks like. 
    // The script didn't clear broken URLs, just didn't update them. 
    // So we can't easily distinguish without checking validity again, but let's just show a sample.

    console.log('Exemplo Sucesso:', success);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
