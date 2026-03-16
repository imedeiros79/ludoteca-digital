'use server'

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { Role } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { asaas } from '@/lib/asaas';

async function checkAdmin() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user?.email !== 'imedeiros@outlook.com') {
        throw new Error('Não autorizado');
    }

    // Auto-reparo: Garantir que o Admin existe no Banco de Dados Novo (Neon)
    await prisma.user.upsert({
        where: { email: user.email },
        update: { role: 'ADMIN', subscriptionStatus: 'active' },
        create: {
            id: user.id,
            email: user.email,
            name: 'Administrador',
            role: 'ADMIN',
            subscriptionStatus: 'active'
        }
    });

    return user;
}

export async function getAdminStats() {
    await checkAdmin();

    const [totalUsers, activeSubs, totalGames, totalOrgs, totalManagers, totalTeachers] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { subscriptionStatus: 'active' } }),
        prisma.item.count(),
        prisma.organization.count(),
        prisma.user.count({ where: { role: 'MANAGER' } }),
        prisma.user.count({ where: { role: 'TEACHER' } }),
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
        pendingRevenue,
        totalOrgs,
        totalManagers,
        totalTeachers
    };
}

export async function getAllUsers(page = 1) {
    await checkAdmin();
    const itemsPerPage = 50;

    return prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: itemsPerPage,
        skip: (page - 1) * itemsPerPage,
        include: { organization: true }
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

export async function createUserManually(email: string, name: string, isVip: boolean, role: Role = 'INDIVIDUAL', planType?: string) {
    await checkAdmin();

    // 1. Criar/Atualizar Usuário
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            name,
            role,
            subscriptionStatus: isVip ? 'active' : 'inactive'
        },
        create: {
            id: randomUUID(), // ID temporário, será sobrescrito pelo Auth no login se necessário, mas para Prisma precisamos de um ID
            email,
            name,
            role,
            subscriptionStatus: isVip ? 'active' : 'inactive'
        }
    });

    // 2. Se for MANAGER, garantir que tem uma Organization
    if (role === 'MANAGER') {
        const teacherLimit = planType === 'Bronze' ? 10 : planType === 'Prata' ? 25 : 50;
        
        await prisma.organization.upsert({
            where: { managerId: user.id },
            update: {
                name: `Escola de ${name}`,
                planType: planType || 'Bronze',
                teacherLimit
            },
            create: {
                name: `Escola de ${name}`,
                managerId: user.id,
                planType: planType || 'Bronze',
                teacherLimit,
                inviteToken: randomUUID()
            }
        });
        
        // Vincular user à org
        const org = await prisma.organization.findUnique({ where: { managerId: user.id } });
        await prisma.user.update({
            where: { id: user.id },
            data: { organizationId: org?.id }
        });
    }

    revalidatePath('/admin');
    return user;
}

export async function resetUserPassword(userId: string) {
    try {
        await checkAdmin();

        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing');
            throw new Error('Configuração de servidor incompleta (Key ausente).');
        }

        const { createAdminClient } = await import('@/utils/supabase/admin');
        const supabaseAdmin = createAdminClient();

        // Gerar senha forte
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
        let newPassword = "";
        for (let i = 0, n = charset.length; i < length; ++i) {
            newPassword += charset.charAt(Math.floor(Math.random() * n));
        }

        const { error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            { password: newPassword }
        );

        if (error) {
            console.error('Supabase Admin Update Error:', error);
            throw new Error(error.message);
        }

        return newPassword;
    } catch (error: any) {
        console.error('Reset Password Action Error:', error);
        throw new Error(error.message || 'Falha interna ao redefinir senha');
    }
}

export async function promoteToManager(userId: string, orgName: string, planType: string, teacherLimit: number) {
    await checkAdmin();

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('Usuário não encontrado');

    const inviteToken = crypto.randomUUID();

    // 1. Criar Organização
    const org = await prisma.organization.create({
        data: {
            name: orgName,
            planType,
            teacherLimit,
            managerId: userId,
            inviteToken
        }
    });

    // 2. Atualizar Usuário
    await prisma.user.update({
        where: { id: userId },
        data: {
            role: 'MANAGER',
            organizationId: org.id,
            subscriptionStatus: 'active' // Ativar VIP automaticamente
        }
    });

    revalidatePath('/admin');
    revalidatePath('/dashboard');
    return { success: true };
}
