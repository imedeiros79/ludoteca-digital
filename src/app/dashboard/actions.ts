'use server'

import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createPortalSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Não autenticado');

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!dbUser?.stripeCustomerId) {
        throw new Error('Você ainda não possui uma assinatura ativa para gerenciar.');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-01-27.clover' as any,
    });

    const session = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    if (session.url) {
        redirect(session.url);
    }
}
