
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const USER_EMAIL = 'imedeiros@outlook.com';

async function makeVip() {
    const user = await prisma.user.findUnique({
        where: { email: USER_EMAIL }
    });

    if (!user) {
        console.error(`Usuário com email ${USER_EMAIL} não encontrado. Cadastre-se primeiro na página de login!`);
        return;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'active' }
    });

    console.log(`\nSUCESSO! Usuário ${USER_EMAIL} agora é VIP.`);
    console.log("Você já pode acessar o /dashboard e jogar!");
}

makeVip()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
