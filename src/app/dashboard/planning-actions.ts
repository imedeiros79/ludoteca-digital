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

export interface WeeklyPlanEntry {
    id: string;
    userId: string;
    turma: string;
    dayOfWeek: number;
    timeSlot: string | null;
    itemId: string;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    item?: {
        id: string;
        title: string;
        subject: string | null;
        year: string | null;
        imageUrl: string | null;
    };
}

export async function getWeeklyPlans(): Promise<WeeklyPlanEntry[]> {
    const userId = await getCurrentUserId();
    const plans = await prisma.weeklyPlan.findMany({
        where: { userId },
        orderBy: [{ dayOfWeek: 'asc' }, { timeSlot: 'asc' }],
    });

    if (plans.length === 0) return [];

    const itemIds = [...new Set(plans.map(p => p.itemId))];
    const items = await prisma.item.findMany({
        where: { id: { in: itemIds } },
        select: { id: true, title: true, subject: true, year: true, imageUrl: true },
    });

    const itemMap = new Map(items.map(i => [i.id, i]));

    return plans.map(p => ({
        ...p,
        item: itemMap.get(p.itemId),
    }));
}

export async function addToPlan(data: {
    turma: string;
    dayOfWeek: number;
    timeSlot?: string;
    itemId: string;
    notes?: string;
}) {
    const userId = await getCurrentUserId();
    await prisma.weeklyPlan.create({
        data: {
            userId,
            turma: data.turma,
            dayOfWeek: data.dayOfWeek,
            timeSlot: data.timeSlot || null,
            itemId: data.itemId,
            notes: data.notes || null,
        },
    });
    revalidatePath('/dashboard/planejamento');
}

export async function removeFromPlan(planId: string) {
    const userId = await getCurrentUserId();
    await prisma.weeklyPlan.deleteMany({
        where: { id: planId, userId },
    });
    revalidatePath('/dashboard/planejamento');
}

export async function updatePlanNotes(planId: string, notes: string) {
    const userId = await getCurrentUserId();
    await prisma.weeklyPlan.updateMany({
        where: { id: planId, userId },
        data: { notes },
    });
    revalidatePath('/dashboard/planejamento');
}

export async function searchItemsForPlan(query: string) {
    const items = await prisma.item.findMany({
        where: {
            OR: [
                { title: { contains: query, mode: 'insensitive' } },
                { subject: { contains: query, mode: 'insensitive' } },
            ],
        },
        select: { id: true, title: true, subject: true, year: true, imageUrl: true },
        take: 10,
    });
    return items;
}
