'use server'

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { asaas } from '@/lib/asaas';

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email !== 'imedeiros@outlook.com') {
        throw new Error('Não autorizado');
    }
    return user;
}

export async function getAdminStats() {
    await checkAdmin();

    const [totalUsers, activeSubs, totalGames] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { subscriptionStatus: 'active' } }),
        prisma.item.count()
    ]);

    // Buscar dados financeiros do Asaas (Métricas reais)
    let totalRevenue = 0;
    let pendingRevenue = 0;

    try {
        const receivedPayments = await asaas.getAllPayments('RECEIVED', 0, 100);
        const confirmedPayments = await asaas.getAllPayments('CONFIRMED', 0, 100);
        const pendingPayments = await asaas.getAllPayments('PENDING', 0, 100);

        const allReceived = [...(receivedPayments.data || []), ...(confirmedPayments.data || [])];
        totalRevenue = allReceived.reduce((acc: number, p: any) => acc + p.value, 0);
        pendingRevenue = (pendingPayments.data || []).reduce((acc: number, p: any) => acc + p.value, 0);
    } catch (e) {
        console.error('Erro ao buscar métricas financeiras:', e);
    }

    return {
        totalUsers,
        activeSubs,
        totalGames,
        totalRevenue,
        pendingRevenue
    };
}

export async function getAllUsers(page = 1) {
    await checkAdmin();
    const itemsPerPage = 50;

    return prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage
    });
}

export async function toggleUserVIP(userId: string, currentStatus: string) {
    await checkAdmin();

    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    await prisma.user.update({
        where: { id: userId },
        data: { subscriptionStatus: newStatus }
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
}

export async function deleteUser(userId: string) {
    await checkAdmin();

    // Opcional: Se quiser remover do Supabase Auth também, precisaria do Admin Client.
    // Por enquanto, removemos apenas do nosso BD para sumir do painel.
    await prisma.user.delete({
        where: { id: userId }
    });

    revalidatePath('/admin');
}

export async function createUserManually(email: string, name: string, isVip: boolean) {
    await checkAdmin();

    // Upsert no banco local
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name,
            subscriptionStatus: isVip ? 'active' : 'inactive'
        },
        create: {
            email,
            name,
            subscriptionStatus: isVip ? 'active' : 'inactive'
        }
    });

    revalidatePath('/admin');
    return user;
}
