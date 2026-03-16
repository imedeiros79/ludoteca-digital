'use server';

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function checkManagerAccess() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true, organizationId: true }
    });

    if (!dbUser || dbUser.role !== 'MANAGER') {
        redirect('/dashboard');
    }

    return { user, dbUser };
}
