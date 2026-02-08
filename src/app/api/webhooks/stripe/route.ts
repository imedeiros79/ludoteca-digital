import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function getStripe() {
    return new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: '2026-01-28.clover',
    });
}

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('Stripe-Signature') as string;

    let event: Stripe.Event;

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error('STRIPE_WEBHOOK_SECRET is missing');
        }
        const stripe = getStripe();
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === 'checkout.session.completed') {
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        if (!session?.metadata?.userId) {
            return new NextResponse('User ID is missing in metadata', { status: 400 });
        }

        await prisma.user.update({
            where: {
                id: session.metadata.userId,
            },
            data: {
                stripeCustomerId: subscription.customer as string,
                subscriptionStatus: 'active',
            },
        });
    }

    if (event.type === 'invoice.payment_succeeded') {
        const stripe = getStripe();
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        );

        // Update status to active (in case it was past_due)
        // We need to find user by customer ID since metadata might not be here
        await prisma.user.updateMany({
            where: {
                stripeCustomerId: subscription.customer as string,
            },
            data: {
                subscriptionStatus: 'active',
            }
        });
    }

    return new NextResponse(null, { status: 200 });
}
