import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';

export async function createPortalSession() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error('Não autenticado');

    const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
    });

    if (!dbUser?.stripeCustomerId) {
        throw new Error('Cliente Stripe não encontrado');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2025-01-27.clover' as any,
    });

    const session = await stripe.billingPortal.sessions.create({
        customer: dbUser.stripeCustomerId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    });

    return session.url;
}
