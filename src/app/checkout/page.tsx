'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const priceId = searchParams.get('priceId');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!priceId) {
            setError('Plano não selecionado.');
            return;
        }

        const initiateCheckout = async () => {
            try {
                const response = await fetch('/api/checkout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ priceId }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao iniciar pagamento');
                }

                if (data.url) {
                    window.location.href = data.url;
                } else {
                    throw new Error('URL de checkout não recebida do sistema.');
                }
            } catch (err: any) {
                console.error('Checkout error:', err);
                setError(err.message || 'Erro inesperado ao conectar com o pagamento.');
            }
        };

        initiateCheckout();
    }, [priceId]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <h1 className="text-xl font-bold text-red-600 mb-4">Ops! Algo deu errado.</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                    >
                        Voltar para o Início
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                        Se o erro persistir, entre em contato com o suporte informando: "Erro no Checkout Asaas".
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-purple-600 text-white">
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <h1 className="text-2xl font-bold mb-2">Preparando seu pagamento...</h1>
            <p className="text-purple-200">Você será redirecionado para o ambiente seguro em instantes.</p>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-10 h-10 animate-spin" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}
