'use server';

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { headers } from 'next/headers';

interface SignUpData {
    email: string;
    password?: string;
    name: string;
    cpfCnpj: string;
    phone: string;
    next?: string | null;
}

export async function signUpAction(data: SignUpData) {
    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    if (!data.email || !data.password || !data.name || !data.cpfCnpj || !data.phone) {
        return { error: 'Todos os campos são obrigatórios.' };
    }

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            emailRedirectTo: `${origin}/auth/callback?next=${data.next || '/dashboard'}`,
            data: {
                full_name: data.name,
                cpf: data.cpfCnpj,
                phone: data.phone,
            },
        },
    });

    if (authError) {
        // Traduzir erros comuns
        if (authError.message.includes('already registered')) {
            return { error: 'Este email já está cadastrado.' };
        }
        return { error: authError.message };
    }

    if (!authData.user) {
        return { error: 'Erro ao criar conta.' };
    }

    // 2. Criar/Atualizar usuário no Prisma (Banco de Dados da Aplicação)
    try {
        await prisma.user.upsert({
            where: { email: data.email },
            update: {
                name: data.name,
                cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
                phone: data.phone.replace(/\D/g, ''),
            } as any,
            create: {
                id: authData.user.id,
                email: data.email,
                name: data.name,
                cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
                phone: data.phone.replace(/\D/g, ''),
                subscriptionStatus: 'inactive',
            } as any,
        });
    } catch (dbError) {
        console.error('Erro ao salvar no banco:', dbError);
        // Não vamos falhar o cadastro se o banco der erro, pois o auth já foi criado.
        // O usuário pode completar depois no perfil ou checkout.
    }

    // 3. Tentar logar automaticamente se possível (depende da config de confirmação de email)
    // Se "Confirm Email" estiver ligado no Supabase, o login falha até clicar no link.
    // Retornamos sucesso para a UI avisar.

    return { success: true };
}
