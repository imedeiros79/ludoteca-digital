'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'node:crypto';

async function getAuthManager() {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) throw new Error('Acesso negado');

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { organization: true }
    });

    if (!dbUser || dbUser.role !== 'MANAGER') {
        throw new Error('Apenas gestores podem acessar esta área');
    }

    return dbUser;
}

export async function getOrganizationData() {
    const manager = await getAuthManager();
    const org = await prisma.organization.findUnique({
        where: { managerId: manager.id },
        include: {
            _count: {
                select: { users: { where: { role: 'TEACHER' } } }
            }
        }
    });

    return org;
}

export async function getTeachersList() {
    const manager = await getAuthManager();
    if (!manager.organizationId) return [];

    return prisma.user.findMany({
        where: { 
            organizationId: manager.organizationId,
            role: 'TEACHER'
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function resetInviteToken() {
    const manager = await getAuthManager();
    const newToken = randomUUID();

    await prisma.organization.update({
        where: { managerId: manager.id },
        data: { inviteToken: newToken }
    });

    revalidatePath('/dashboard/escola');
    return newToken;
}

export async function resetTeacherPassword(teacherId: string) {
    const manager = await getAuthManager();
    
    // Garantir que o professor pertence à organização do gestor
    const teacher = await prisma.user.findFirst({
        where: { 
            id: teacherId, 
            organizationId: manager.organizationId,
            role: 'TEACHER'
        }
    });

    if (!teacher) throw new Error('Professor não encontrado nesta escola');

    const admin = createAdminClient();
    const defaultPassword = 'Ludo' + Math.random().toString(36).substring(2, 6).toUpperCase();

    // 1. Resetar no Supabase Auth
    const { error } = await admin.auth.admin.updateUserById(teacherId, {
        password: defaultPassword
    });

    if (error) throw new Error('Erro ao resetar senha no Auth: ' + error.message);

    // 2. Invalida sessão no Prisma (Para o SessionGuard agir)
    await prisma.user.update({
        where: { id: teacherId },
        data: { currentSessionId: 'RESET_' + randomUUID() }
    });

    revalidatePath('/dashboard/escola');
    return defaultPassword;
}

export async function removeTeacher(teacherId: string) {
    const manager = await getAuthManager();

    // 1. Desvincular o professor da organização e torná-lo individual inativo
    await prisma.user.update({
        where: { 
            id: teacherId,
            organizationId: manager.organizationId 
        },
        data: {
            organizationId: null,
            role: 'INDIVIDUAL',
            subscriptionStatus: 'inactive',
            currentSessionId: 'REMOVE_' + randomUUID() // Forçar logout
        }
    });

    revalidatePath('/dashboard/escola');
}

export async function validateInviteToken(token: string) {
    const org = await prisma.organization.findUnique({
        where: { inviteToken: token },
        include: {
            _count: {
                select: { users: { where: { role: 'TEACHER' } } }
            }
        }
    });

    if (!org) return { error: 'Link de convite inválido ou expirado.' };

    if (org.planType !== 'Ouro' && org._count.users >= org.teacherLimit) {
        return { error: 'Esta escola atingiu o limite de vagas para professores.' };
    }

    return { orgName: org.name, orgId: org.id };
}

export async function signUpTeacher(data: any) {
    const { email, password, name, orgId, token } = data;

    // 1. Validar token e vagas novamente (Segurança)
    const org = await prisma.organization.findUnique({
        where: { id: orgId, inviteToken: token },
        include: {
            _count: {
                select: { users: { where: { role: 'TEACHER' } } }
            }
        }
    });

    if (!org) throw new Error('Convite inválido');
    if (org._count.users >= org.teacherLimit) throw new Error('Limite de vagas atingido');

    // 2. Criar no Supabase Auth usando Admin client
    const admin = createAdminClient();
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: name }
    });

    if (authError) throw new Error(authError.message);

    // 3. Criar no Prisma vinculado à organização
    await prisma.user.create({
        data: {
            id: authData.user.id,
            email,
            name,
            role: 'TEACHER',
            organizationId: orgId,
            subscriptionStatus: 'active',
            currentSessionId: 'INIT_' + randomUUID()
        }
    });

    return { success: true };
}
