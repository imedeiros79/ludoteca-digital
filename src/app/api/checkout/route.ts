import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { asaas, AsaasService } from '@/lib/asaas';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { priceId } = await req.json();

        const supabase = await createClient();
        const {
            data: { user: authUser },
        } = await supabase.auth.getUser();

        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Definir valores baseado no priceId (que agora pode ser apenas 'MENSAL' ou 'ANUAL')
        const isAnnual = priceId === 'ANUAL';
        const value = isAnnual ? 120.00 : 19.90;
        const cycle = isAnnual ? 'ANNUALLY' : 'MONTHLY';

        const asaasService = new AsaasService(); // Instantiate AsaasService

        // Buscar dados atualizados do usuário (com CPF/Phone)
        const userDetails = await prisma.user.findUnique({
            where: { id: authUser.id },
        });

        const safeUserDetails = userDetails as any; // Cast to any to avoid TS errors with new fields if types aren't updated

        // 1. Obter ou Criar Cliente no Asaas
        const customerId = await asaasService.getOrCreateCustomer(
            authUser.email!,
            authUser.user_metadata?.full_name || safeUserDetails?.name || 'Cliente',
            safeUserDetails?.cpfCnpj || undefined,
            safeUserDetails?.phone || undefined
        );

        // 2. Criar Assinatura no Asaas (UNDEFINED permite ao usuário escolher no checkout: PIX, Boleto ou Cartão)
        const date = new Date();
        date.setDate(date.getDate() + 1); // Vencimento para amanhã
        const nextDueDate = date.toISOString().split('T')[0];

        const subscription = await asaas.createSubscription({
            customer: customerId,
            billingType: 'PIX', // Inicia como PIX, o usuário pode alterar no portal se necessário
            value: value,
            nextDueDate: nextDueDate,
            cycle: cycle,
        });

        // 3. Salvar o customerId no banco
        await prisma.user.update({
            where: { email: authUser.email! },
            data: { stripeCustomerId: customerId }
        });

        // O Asaas retorna invoiceUrl na primeira cobrança da assinatura
        // Para garantir, vamos buscar a fatura se não vier na resposta direta
        let url = subscription.invoiceUrl || subscription.bankSlipUrl;

        if (!url) {
            // Se não vier na criação da assinatura, buscamos a cobrança gerada
            try {
                const payments = await asaasService.getSubscriptionPayments(subscription.id);
                if (payments.data && payments.data.length > 0) {
                    url = payments.data[0].invoiceUrl || payments.data[0].bankSlipUrl;
                }
            } catch (pErr) {
                console.warn('Erro ao buscar pagamentos da assinatura:', pErr);
            }
        }

        // Fallback final (mas idealmente deve ter achado acima)
        if (!url) {
            url = `https://www.asaas.com/c/checkout/${subscription.id}`; // Tenta link genérico se falhar tudo
        }

        return NextResponse.json({
            id: subscription.id,
            url: url
        });
    } catch (err) {
        console.error('Asaas Checkout Error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
