'use server';

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getUserData() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        return null;
    }

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email },
    });

    return dbUser as any; // Cast to any to include new fields
}

export async function saveUserData(formData: { cpfCnpj: string; phone: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
        throw new Error('Usuário não autenticado.');
    }

    // Basic server-side validation
    if (!formData.cpfCnpj || !formData.phone) {
        throw new Error('CPF/CNPJ e Telefone são obrigatórios.');
    }

    try {
        await prisma.user.update({
            where: { email: user.email },
            data: {
                cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''), // Remove formatting before saving
                phone: formData.phone.replace(/\D/g, ''),     // Remove formatting before saving
            } as any, // Cast to any to allow new fields
        });

        revalidatePath('/checkout');
        return { success: true };
    } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
        throw new Error('Erro ao salvar dados. Tente novamente.');
    }
}
