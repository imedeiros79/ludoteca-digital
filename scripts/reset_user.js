
const { createClient } = require('@supabase/supabase-js');
const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);
const prisma = new PrismaClient();

const USER_EMAIL = 'imedeiros@outlook.com';
const NEW_PASSWORD = 'Senha123!'; // Senha temporária conhecida

async function fullReset() {
    console.log(`Iniciando reset total para ${USER_EMAIL}...`);

    // 1. Localizar no Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const authUser = users.find(u => u.email === USER_EMAIL);

    if (!authUser) {
        console.error("Usuário não encontrado. Cadastre-se no site primeiro!");
        return;
    }

    // 2. Atualizar Senha e Confirmar Email no Auth
    console.log("Atualizando Auth (Senha e Confirmação)...");
    const { error: authError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        {
            password: NEW_PASSWORD,
            email_confirm: true
        }
    );
    if (authError) throw authError;

    // 3. Garantir que existe na tabela User do Prisma e é VIP
    console.log("Garantindo status VIP no Banco de Dados...");
    await prisma.user.upsert({
        where: { email: USER_EMAIL },
        update: { subscriptionStatus: 'active' },
        create: {
            id: authUser.id,
            email: USER_EMAIL,
            subscriptionStatus: 'active'
        }
    });

    console.log(`\n✅ TUDO PRONTO!`);
    console.log(`Email: ${USER_EMAIL}`);
    console.log(`Nova Senha: ${NEW_PASSWORD}`);
    console.log(`\nAgora faça o login no site com esses dados!`);
}

fullReset()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
