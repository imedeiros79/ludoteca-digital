'use server'

import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}
