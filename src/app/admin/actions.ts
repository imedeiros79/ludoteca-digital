'use server'

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

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

    return { totalUsers, activeSubs, totalGames };
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
