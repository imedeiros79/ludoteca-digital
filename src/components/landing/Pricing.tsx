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
                        <h3 className="text-xl font-semibold text-gray-300 mb-2">Individual Mensal</h3>
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
                        <h3 className="text-xl font-semibold text-purple-200 mb-2">Individual Anual</h3>
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
                        </ul>
                        <SubscribeButton
                            priceId="ANUAL"
                            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center p-4 shadow-xl"
                        >
                            Assinar Anual (Melhor Oferta)
                        </SubscribeButton>
                    </div>
                </div>

                {/* Planos Escolares */}
                <div className="mt-20 text-center mb-16">
                    <h2 className="text-3xl font-bold mb-4">Planos para Escolas</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Leve a gamificação para toda a sua equipe com gestão centralizada.
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
                    {/* Bronze */}
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all flex flex-col">
                        <h3 className="text-lg font-bold text-purple-300 mb-2">Plano Bronze</h3>
                        <div className="text-3xl font-bold mb-1">R$ 1.188</div>
                        <div className="text-xs text-gray-400 mb-6">Pagamento Anual</div>
                        <ul className="space-y-3 mb-8 text-sm text-gray-300 flex-1">
                            <li className="flex items-center gap-2 font-bold text-white">Até 10 Professores</li>
                            <li className="flex items-center gap-2">Painel do Gestor</li>
                            <li className="flex items-center gap-2">Link de Convite</li>
                        </ul>
                        <SubscribeButton priceId="ESCOLA_BRONZE" className="w-full py-3 bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/50 rounded-xl font-bold text-sm transition-all">
                            Contratar Bronze
                        </SubscribeButton>
                    </div>

                    {/* Prata */}
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-purple-500 hover:bg-gray-800 transition-all flex flex-col relative">
                        <div className="absolute -top-3 right-4 bg-purple-600 text-[10px] px-2 py-1 rounded font-black italic">Bestseller</div>
                        <h3 className="text-lg font-bold text-purple-300 mb-2">Plano Prata</h3>
                        <div className="text-3xl font-bold mb-1">R$ 2.388</div>
                        <div className="text-xs text-gray-400 mb-6">Pagamento Anual</div>
                        <ul className="space-y-3 mb-8 text-sm text-gray-300 flex-1">
                            <li className="flex items-center gap-2 font-bold text-white">Até 25 Professores</li>
                            <li className="flex items-center gap-2">Painel do Gestor</li>
                            <li className="flex items-center gap-2">Reset de Senhas</li>
                        </ul>
                        <SubscribeButton priceId="ESCOLA_PRATA" className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg">
                            Contratar Prata
                        </SubscribeButton>
                    </div>

                    {/* Ouro */}
                    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700 hover:border-purple-500 transition-all flex flex-col">
                        <h3 className="text-lg font-bold text-amber-300 mb-2">Plano Ouro</h3>
                        <div className="text-3xl font-bold mb-1">R$ 4.788</div>
                        <div className="text-xs text-gray-400 mb-6">Pagamento Anual</div>
                        <ul className="space-y-3 mb-8 text-sm text-gray-300 flex-1">
                            <li className="flex items-center gap-2 font-bold text-white">Até 50 Professores</li>
                            <li className="flex items-center gap-2">Suporte por WhatsApp</li>
                            <li className="flex items-center gap-2">Gestão Ilimitada</li>
                        </ul>
                        <SubscribeButton priceId="ESCOLA_OURO" className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold text-sm transition-all">
                            Contratar Ouro
                        </SubscribeButton>
                    </div>

                    {/* Enterprise */}
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-dashed border-gray-600 flex flex-col">
                        <h3 className="text-lg font-bold text-gray-200 mb-2">Enterprise</h3>
                        <div className="text-2xl font-bold mb-6">Sob Consulta</div>
                        <ul className="space-y-3 mb-8 text-sm text-gray-400 flex-1">
                            <li className="flex items-center gap-2">Vagas Ilimitadas</li>
                            <li className="flex items-center gap-2">Treinamento AO VIVO</li>
                            <li className="flex items-center gap-2">Nota Fiscal (PJ)</li>
                        </ul>
                        <a href="https://wa.me/5531972198551" className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold text-sm text-center hover:bg-gray-100 transition-all">
                            Falar no WhatsApp
                        </a>
                    </div>
                </div>

                <div className="mt-12 text-center flex items-center justify-center gap-2 text-gray-400 text-sm">
                    <ShieldCheck size={16} /> Pagamento 100% seguro via Asaas
                </div>
            </div>
        </section>
    );
}
