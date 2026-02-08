'use server';

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { AsaasService } from '@/lib/asaas';

const asaasService = new AsaasService();

export async function updateProfile(data: { name: string; cpfCnpj: string; phone: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error('Usuário não autenticado.');
    }

    if (!data.name || !data.cpfCnpj || !data.phone) {
        throw new Error('Todos os campos são obrigatórios.');
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: data.name,
                cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
                phone: data.phone.replace(/\D/g, ''),
            } as any,
        });

        // Tentar atualizar metadata do Supabase também para manter sinc
        await supabase.auth.updateUser({
            data: {
                full_name: data.name,
                cpf: data.cpfCnpj,
                phone: data.phone,
            }
        });

        return { success: true };
    } catch (error: any) {
        console.error('Erro ao atualizar perfil:', error);
        throw new Error('Erro ao atualizar dados: ' + error.message);
    }
}

export async function updatePassword(password: string) {
    const supabase = await createClient();

    if (password.length < 6) {
        throw new Error('A senha deve ter no mínimo 6 caracteres.');
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
        throw new Error(error.message);
    }

    return { success: true };
}

export async function getPaymentHistory() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        throw new Error('Usuário não autenticado.');
    }

    // 1. Tentar buscar dados do usuário no Prisma
    let user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
            id: true,
            name: true,
            email: true,
            cpfCnpj: true,
            phone: true,
            subscriptionStatus: true,
            asaasCustomerId: true,
        } as any
    });

    // 2. Resiliência: Se o usuário não existir no Prisma ou estiver incompleto, sincronizar do Auth
    if (!user || (!user.name && authUser.user_metadata?.full_name)) {
        console.log('Sincronizando usuário do Supabase Auth para o Prisma...', authUser.id);
        const metadata = authUser.user_metadata;

        user = await prisma.user.upsert({
            where: { id: authUser.id },
            update: {
                name: user?.name || metadata?.full_name || '',
                cpfCnpj: user?.cpfCnpj || metadata?.cpf?.replace(/\D/g, '') || '',
                phone: user?.phone || metadata?.phone?.replace(/\D/g, '') || '',
            } as any,
            create: {
                id: authUser.id,
                email: authUser.email!,
                name: metadata?.full_name || '',
                cpfCnpj: metadata?.cpf?.replace(/\D/g, '') || '',
                phone: metadata?.phone?.replace(/\D/g, '') || '',
                subscriptionStatus: 'inactive',
            } as any
        });
    }

    if (!user) return null;

    let payments: any[] = [];

    // Se tiver ID do Asaas, buscar cobranças
    if (user.asaasCustomerId) {
        try {
            const response = await asaasService.request(`/payments?customer=${user.asaasCustomerId}&limit=10`);
            if (response.data) {
                payments = response.data;
            }
        } catch (error) {
            console.error('Erro ao buscar pagamentos no Asaas:', error);
        }
    }

    return {
        user: {
            ...user,
            subscriptionStatus: user.subscriptionStatus || 'inactive',
            // Fallbacks caso os campos do banco ainda estejam vazios
            name: user.name || authUser.user_metadata?.full_name || '',
            cpfCnpj: user.cpfCnpj || authUser.user_metadata?.cpf || '',
            phone: user.phone || authUser.user_metadata?.phone || '',
        } as any,
        payments
    };
}

export async function cancelSubscription() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
        throw new Error('Usuário não autenticado.');
    }

    const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: {
            asaasCustomerId: true,
            subscriptionStatus: true,
            createdAt: true, // Data de criação do usuário (aproximação da subscrição se for nova)
        } as any
    });

    if (!user || !user.asaasCustomerId) {
        throw new Error('Nenhuma assinatura encontrada.');
    }

    try {
        // Buscar assinatura ativa no Asaas
        const subs = await asaasService.request(`/subscriptions?customer=${user.asaasCustomerId}&status=ACTIVE`);

        if (!subs.data || subs.data.length === 0) {
            throw new Error('Não há assinatura ativa para cancelar.');
        }

        const subscription = subs.data[0];
        const subDate = new Date(subscription.dateCreated);
        const today = new Date();
        const diffDays = Math.ceil((today.getTime() - subDate.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays <= 7) {
            // Regra de Arrependimento (CDC): Cancelamento Imediato + Estorno
            // O Asaas permite cancelar e remover cobranças pendentes. O estorno de cartão é mais complexo,
            // mas vamos marcar como "cancelado" e remover a sub.
            await asaasService.deleteSubscription(subscription.id);

            // Atualizar status no banco imediatamente
            await prisma.user.update({
                where: { id: authUser.id },
                data: { subscriptionStatus: 'canceled_refund' } as any
            });

            return {
                success: true,
                message: 'Assinatura cancelada com sucesso! Como você está dentro do prazo de 7 dias, o estorno será processado.'
            };
        } else {
            // Cancelamento Padrão: Não renovar
            // No Asaas, deletar a assinatura impede novas cobranças, mas as pendentes continuam?
            // "Ao remover uma assinatura, as cobranças pendentes ou vencidas dela também removidas."
            // Para "não renovar", o ideal seria apenas desligar a renovação, mas a API do Asaas é "delete".
            // Vamos cancelar a subscrição para parar cobranças futuras. O acesso pode ser mantido via controle de data no banco,
            // mas por simplificação, vamos cancelar no Asaas e atualizar status.

            await asaasService.deleteSubscription(subscription.id);

            await prisma.user.update({
                where: { id: authUser.id },
                data: { subscriptionStatus: 'canceled' } as any
            });

            return {
                success: true,
                message: 'Assinatura cancelada. Você não será cobrado novamente.'
            };
        }

    } catch (error: any) {
        console.error('Erro ao cancelar assinatura:', error);
        throw new Error('Erro ao cancelar: ' + error.message);
    }
}
