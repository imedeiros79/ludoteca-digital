import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    const authToken = req.headers.get('asaas-access-token');
    const secret = process.env.ASAAS_WEBHOOK_TOKEN;

    if (!secret || authToken !== secret) {
        console.error('Tentativa de acesso não autorizado ao Webhook do Asaas!');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { event, payment, subscription } = body;

        console.log('Asaas Webhook Received:', event, subscription?.id || payment?.id);

        const customerId = payment?.customer || subscription?.customer;
        const planId = subscription?.externalReference || payment?.externalReference;

        if (event === 'PAYMENT_CONFIRMED' || event === 'PAYMENT_RECEIVED') {
            const user = await prisma.user.findFirst({
                where: { stripeCustomerId: customerId }
            });

            if (user) {
                // 1. Ativar Assinatura comum
                await prisma.user.update({
                    where: { id: user.id },
                    data: { subscriptionStatus: 'active' }
                });

                // 2. Se for plano escolar, promover a MANAGER e criar Organização
                if (planId?.startsWith('ESCOLA_')) {
                    let teacherLimit = 10;
                    if (planId === 'ESCOLA_PRATA') teacherLimit = 25;
                    if (planId === 'ESCOLA_OURO') teacherLimit = 50;

                    // Promover para MANAGER
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: 'MANAGER' }
                    });

                    // Criar Organização se não existir
                    const existingOrg = await prisma.organization.findUnique({
                        where: { managerId: user.id }
                    });

                    if (!existingOrg) {
                        await prisma.organization.create({
                            data: {
                                name: `Escola de ${user.name || user.email}`,
                                planType: planId.replace('ESCOLA_', '').charAt(0) + planId.replace('ESCOLA_', '').slice(1).toLowerCase(),
                                teacherLimit: teacherLimit,
                                managerId: user.id,
                                inviteToken: crypto.randomUUID()
                            }
                        });
                    } else {
                        // Atualizar limites se for um upgrade
                        await prisma.organization.update({
                            where: { managerId: user.id },
                            data: {
                                planType: planId.replace('ESCOLA_', '').charAt(0) + planId.replace('ESCOLA_', '').slice(1).toLowerCase(),
                                teacherLimit: teacherLimit
                            }
                        });
                    }
                    
                    // Vincular o usuário à sua própria organização
                    const org = await prisma.organization.findUnique({ where: { managerId: user.id } });
                    if (org) {
                        await prisma.user.update({
                            where: { id: user.id },
                            data: { organizationId: org.id }
                        });
                    }
                }
            }
            console.log(`User for customer ${customerId} activated via Asaas (Plan: ${planId}).`);
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
