'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

async function getCurrentUserId(): Promise<string> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Usuário não autenticado');
    return user.id;
}

export async function toggleFavorite(itemId: string): Promise<{ isFavorite: boolean }> {
    const userId = await getCurrentUserId();

    const existing = await prisma.favorite.findUnique({
        where: { userId_itemId: { userId, itemId } },
    });

    if (existing) {
        await prisma.favorite.delete({ where: { id: existing.id } });
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/favoritos');
        return { isFavorite: false };
    } else {
        await prisma.favorite.create({ data: { userId, itemId } });
        revalidatePath('/dashboard');
        revalidatePath('/dashboard/favoritos');
        return { isFavorite: true };
    }
}

export async function getUserFavoriteIds(): Promise<string[]> {
    try {
        const userId = await getCurrentUserId();
        const favorites = await prisma.favorite.findMany({
            where: { userId },
            select: { itemId: true },
        });
        return favorites.map(f => f.itemId);
    } catch {
        return [];
    }
}

export async function getFavoriteItems() {
    const userId = await getCurrentUserId();
    const favorites = await prisma.favorite.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    if (favorites.length === 0) return [];

    const itemIds = favorites.map(f => f.itemId);
    const items = await prisma.item.findMany({
        where: { id: { in: itemIds } },
    });

    return items;
}
