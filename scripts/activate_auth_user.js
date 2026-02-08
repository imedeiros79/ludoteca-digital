
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Admin key
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

const USER_EMAIL = 'imedeiros@outlook.com';

async function activateUser() {
    console.log(`Buscando usuário ${USER_EMAIL} no Auth...`);

    // 1. Buscar o usuário
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const authUser = users.find(u => u.email === USER_EMAIL);

    if (!authUser) {
        console.error("Usuário não encontrado no Supabase Auth. Garanta que você terminou o cadastro na página do site!");
        return;
    }

    console.log(`Usuário encontrado ID: ${authUser.id}. Ativando...`);

    // 2. Confirmar email e ativar
    const { error: updateError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { email_confirm: true }
    );

    if (updateError) throw updateError;

    console.log(`\n✅ SUCESSO! O email ${USER_EMAIL} foi confirmado administrativamente.`);
    console.log("Você já pode fazer o login no site com sua senha!");
}

activateUser().catch(console.error);
