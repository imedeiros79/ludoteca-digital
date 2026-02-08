import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
});

export async function POST(req: Request) {
    try {
        const { priceId } = await req.json();

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Buscar ou criar customer no Stripe (opcional, mas bom pra rastreio)
        // Para simplificar MVP, vamos deixar o Stripe criar um novo ou usar email se bater.
        // Mas para webhook funcionar bem com nosso user, passamos metadata.

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'boleto'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard?success=true`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?canceled=true`,
            customer_email: user.email,
            metadata: {
                userId: user.id,
            },
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
