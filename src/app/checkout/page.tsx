'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { getUserData, saveUserData } from './actions';

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const priceId = searchParams.get('priceId');
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'loading' | 'missing_info' | 'processing' | 'error'>('loading');

    // Form state
    const [cpfCnpj, setCpfCnpj] = useState('');
    const [phone, setPhone] = useState('');
    const [saving, setSaving] = useState(false);

    // Formatters
    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCpfCnpj(formatCPF(e.target.value));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value));
    };

    const fetchData = async () => {
        try {
            const userData = await getUserData();

            // If user is not logged in, they should be redirected by middleware/login page logic, 
            // but just in case:
            if (!userData) {
                // Wait a bit for auth state to settle or redirect logic to kick in
                return;
            }

            const safeUserData = userData as any;

            if (!safeUserData.cpfCnpj || !safeUserData.phone) {
                setStatus('missing_info');
            } else {
                setStatus('processing');
                initiateCheckout(safeUserData.cpfCnpj, safeUserData.phone);
            }
        } catch (err: any) {
            console.error('Error fetching user data:', err);
            setError('Erro ao verificar dados do usuário.');
            setStatus('error');
        }
    };

    useEffect(() => {
        if (!priceId) {
            setError('Plano não selecionado.');
            setStatus('error');
            return;
        }
        fetchData();
    }, [priceId]);

    const initiateCheckout = async (userCpf: string, userPhone: string) => {
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    // The API *might* need to refetch fresh data from DB, 
                    // or we can pass it here if the API is updated to use it.
                    // For now, let's assume the API will fetch the updated User record from DB 
                    // since we just saved it.
                }),
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
            setStatus('error');
        }
    };

    const handleSaveInfo = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await saveUserData({ cpfCnpj, phone });
            setStatus('processing');
            initiateCheckout(cpfCnpj, phone);
        } catch (err: any) {
            alert(err.message);
            setSaving(false);
        }
    };

    if (status === 'error' || error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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

    if (status === 'missing_info') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-purple-600 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Quase lá! 🚀</h2>
                    <p className="text-gray-600 mb-6">
                        Para emitir sua cobrança com segurança, o sistema de pagamentos precisa de alguns dados adicionais.
                    </p>

                    <form onSubmit={handleSaveInfo} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CPF (apenas números)</label>
                            <input
                                type="text"
                                required
                                value={cpfCnpj}
                                onChange={handleCpfChange}
                                placeholder="000.000.000-00"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Celular / WhatsApp</label>
                            <input
                                type="text"
                                required
                                value={phone}
                                onChange={handlePhoneChange}
                                placeholder="(11) 99999-9999"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 mt-4"
                        >
                            {saving ? <Loader2 className="animate-spin" /> : 'Continuar para Pagamento'}
                        </button>
                    </form>

                    <p className="text-xs text-gray-400 mt-4 text-center">
                        Seus dados estão seguros e são usados apenas para emissão da nota fiscal/cobrança.
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
