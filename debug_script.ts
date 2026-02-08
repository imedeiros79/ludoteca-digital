
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const gameCount = await prisma.item.count();
        console.log('--- DIAGNOSTICO ---');
        console.log(`Total de Jogos no Banco: ${gameCount}`);

        const user = await prisma.user.findUnique({
            where: { email: 'imedeiros@outlook.com' }
        });

        if (user) {
            console.log(`Usuário encontrado: ${user.email}`);
            console.log(`Status da Assinatura (Prisma): ${user.subscriptionStatus}`);
            console.log(`ID do Usuário: ${user.id}`);
            console.log(`Asaas Customer ID: ${user.asaasCustomerId}`);
        } else {
            console.log('Usuário imedeiros@outlook.com NÃO encontrado no banco Prisma.');
        }
        console.log('-------------------');
    } catch (e) {
        console.error('Erro no script:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
