
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const url = "https://dmrafr2igetxh.cloudfront.net/todas/0_ao_20_em_ingles_49439/index.html";
    const item = await prisma.item.findFirst({ where: { gameUrl: url } });
    if (item) {
        console.log("ITEM ENCONTRADO NO BANCO:");
        console.log(JSON.stringify(item, null, 2));
    } else {
        console.log("ITEM NÃO ENCONTRADO NO BANCO.");
    }
}

check().finally(() => prisma.$disconnect());
