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

export async function getSubjectsWithCount() {
    const subjects = await prisma.item.groupBy({
        by: ['subject'],
        _count: { id: true },
        where: { subject: { not: null } },
        orderBy: { _count: { id: 'desc' } },
    });
    return subjects
        .filter(s => !!s.subject)
        .map(s => ({ name: s.subject as string, count: s._count.id }));
}

export async function getYearsBySubject(subject: string) {
    // Busca TODOS os valores brutos (podem ser compostos, ex: "1º Ano – EF I, 2º Ano – EF I")
    const rows = await prisma.item.findMany({
        where: { subject, year: { not: null } },
        select: { year: true },
    });

    const yearSet = new Set<string>();

    rows.forEach(r => {
        if (!r.year) return;
        // Separa valores compostos por vírgula e ponto-e-vírgula
        const parts = r.year.split(/[,;]/);
        parts.forEach(part => {
            // Pega só a parte antes do traço ("1º Ano – Ensino Fundamental I" → "1º Ano")
            const short = part.split(/\s*[–\-]\s*/)[0].trim();
            if (short) yearSet.add(short);
        });
    });

    // Ordena: números primeiro (1º, 2º...), depois textos (Pré-escola, etc.)
    return Array.from(yearSet).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] ?? '99');
        const numB = parseInt(b.match(/\d+/)?.[0] ?? '99');
        if (numA !== numB) return numA - numB;
        return a.localeCompare(b, 'pt-BR');
    });
}

export async function getItemsBySubject(subject: string, year?: string, query?: string) {
    // Usa contains para capturar todos os itens cujo campo year contenha "1º Ano"
    // independente das variações como "1º Ano – Ensino Fundamental I, 2º Ano..."
    const where: Record<string, unknown> = { subject };
    if (year) where.year = { contains: year, mode: 'insensitive' };
    if (query && query.length >= 2) {
        where.title = { contains: query, mode: 'insensitive' };
    }
    const items = await prisma.item.findMany({
        where,
        select: { id: true, title: true, subject: true, year: true, imageUrl: true },
        orderBy: { title: 'asc' },
        take: 30,
    });
    return items;
}


