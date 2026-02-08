'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface SubscribeButtonProps {
    priceId: string;
    children: React.ReactNode;
    className?: string;
}

export default function SubscribeButton({ priceId, children, className }: SubscribeButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleCheckout = async () => {
        setLoading(true);

        // Verificar se está logado
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // Salvar intenção de compra? Por enquanto só login.
            router.push('/login?next=checkout'); // Poderíamos melhorar isso
            return;
        }

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId }),
            });

            const { sessionId } = await response.json();
            const stripe = await stripePromise;

            if (stripe) {
                const { error } = await stripe.redirectToCheckout({ sessionId });
                if (error) console.error(error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Erro ao iniciar pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleCheckout}
            disabled={loading}
            className={className}
        >
            {loading ? <Loader2 className="animate-spin" /> : children}
        </button>
    );
}
