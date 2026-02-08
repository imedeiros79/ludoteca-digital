import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { event, payment, subscription } = body;

        console.log('Asaas Webhook Received:', event, subscription?.id || payment?.id);

        // O Asaas envia vários eventos. Os principais para nós:
        // PAYMENT_CONFIRMED: Pagamento único ou de fatura de assinatura confirmado
        // PAYMENT_RECEIVED: Pagamento recebido (cartão/pix na hora)
        // SUBSCRIPTION_DELETED: Assinatura cancelada

        const customerId = payment?.customer || subscription?.customer;

        if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
            // Buscar usuário pelo stripeCustomerId (que agora armazena o id do Asaas)
            await prisma.user.updateMany({
                where: { stripeCustomerId: customerId },
                data: { subscriptionStatus: 'active' }
            });
            console.log(`User for customer ${customerId} activated via Asaas.`);
        }

        if (event === 'SUBSCRIPTION_DELETED' || event === 'PAYMENT_OVERDUE') {
            await prisma.user.updateMany({
                where: { stripeCustomerId: customerId },
                data: { subscriptionStatus: 'inactive' }
            });
            console.log(`User for customer ${customerId} deactivated via Asaas.`);
        }

        return NextResponse.json({ received: true });
    } catch (err) {
        console.error('Webhook Error:', err);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
    }
}
