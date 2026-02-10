import { CheckCircle, ShieldCheck } from 'lucide-react';
import SubscribeButton from '@/components/SubscribeButton';

export default function Pricing() {
    return (
        <section id="precos" className="py-20 bg-gray-900 text-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Investimento Acessível</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Tenha acesso ilimitado a todo o acervo por um valor menor que um lanche.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Mensal */}
                    <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all">
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">Mensal</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold">R$ 19,90</span>
                            <span className="text-gray-400">/mês</span>
                        </div>
                        <ul className="space-y-4 mb-8 text-gray-300">
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-400" /> Acesso a 1.431 Jogos</li>
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-400" /> Filtros por BNCC</li>
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-400" /> Cancele quando quiser</li>
                        </ul>
                        <SubscribeButton
                            priceId="MENSAL"
                            className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center"
                        >
                            Assinar Mensal
                        </SubscribeButton>
                    </div>

                    {/* Anual */}
                    <div className="bg-gradient-to-b from-purple-900 to-purple-950 rounded-2xl p-8 border border-purple-500 relative transform hover:-translate-y-2 transition-transform duration-300">
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                            MAIS POPULAR
                        </div>
                        <h3 className="text-xl font-semibold text-purple-200 mb-2">Anual</h3>
                        <div className="flex items-baseline gap-1 mb-6">
                            <span className="text-4xl font-bold text-white">R$ 120,00</span>
                            <span className="text-purple-200">/ano</span>
                        </div>
                        <p className="text-sm text-purple-200 mb-6 bg-purple-800/50 p-2 rounded">
                            Economize R$ 118,80 (equivalente a R$ 10,00/mês)
                        </p>
                        <ul className="space-y-4 mb-8 text-purple-100">
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-amber-400" /> Todos os benefícios do Mensal</li>
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-amber-400" /> Suporte Prioritário</li>
                            <li className="flex items-center gap-3"><CheckCircle size={20} className="text-amber-400" /> Acesso antecipado a novidades</li>
                        </ul>
                        <SubscribeButton
                            priceId="ANUAL"
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center p-4 shadow-xl"
                        >
                            Assinar Anual (Melhor Oferta)
                        </SubscribeButton>
                    </div>
                </div>

                <div className="mt-12 text-center flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <ShieldCheck size={16} /> Pagamento 100% seguro via Stripe
                </div>
            </div>
        </section>
    );
}
