import Stripe from 'stripe';
import * as dotenv from 'dotenv';

dotenv.config({ path: 'd:/Antigravity-projetos/aulasssas/ludoteca-digital/.env' });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2026-01-28.clover',
});

async function main() {
    const products = {
        mensal: 'prod_TwDXzrfaz3vbwp',
        anual: 'prod_TwDVmUWJqo65TI'
    };

    console.log('Buscando preços...');

    try {
        const pricesMensal = await stripe.prices.list({ product: products.mensal, active: true, limit: 1 });
        const pricesAnual = await stripe.prices.list({ product: products.anual, active: true, limit: 1 });

        if (pricesMensal.data.length > 0) {
            console.log(`MENSAL_PRICE_ID=${pricesMensal.data[0].id}`);
        } else {
            console.log('Preço Mensal não encontrado.');
        }

        if (pricesAnual.data.length > 0) {
            console.log(`ANUAL_PRICE_ID=${pricesAnual.data[0].id}`);
        } else {
            console.log('Preço Anual não encontrado.');
        }

    } catch (error) {
        console.error('Erro ao buscar preços:', error);
    }
}

main();
