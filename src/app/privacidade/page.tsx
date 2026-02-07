import Link from 'next/link';
import { ArrowLeft, Lock, Eye, Database, ShieldCheck } from 'lucide-react';

export default function Privacidade() {
    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors font-medium">
                        <ArrowLeft size={18} />
                        Voltar para o Início
                    </Link>
                    <div className="font-semibold text-gray-900">Ludoteca Digital</div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-4xl">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Política de Privacidade</h1>
                            <p className="text-gray-500 text-sm">Em conformidade com a LGPD (Lei 13.709/2018)</p>
                        </div>
                    </div>

                    <div className="prose prose-green max-w-none text-gray-700 leading-relaxed space-y-8">
                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                1. Compromisso com a Privacidade
                            </h2>
                            <p>
                                A <strong>Ludoteca Digital</strong> leva sua privacidade a sério. Esta política descreve como coletamos,
                                usamos, armazenamos e protegemos seus dados pessoais ao utilizar nossa plataforma de objetos de aprendizagem.
                                Estamos comprometidos em seguir rigorosamente a Lei Geral de Proteção de Dados (LGPD).
                            </p>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                2. Dados que Coletamos
                            </h2>
                            <p>
                                Coletamos apenas os dados essenciais para o funcionamento do serviço:
                            </p>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Eye size={16} /> Dados de Cadastro</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                        <li>Nome completo</li>
                                        <li>Endereço de e-mail</li>
                                        <li>Senha (criptografada)</li>
                                    </ul>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2"><Lock size={16} /> Dados Financeiros</h3>
                                    <p className="text-sm">
                                        Não armazenamos dados completos de cartão de crédito. Todo o processamento é feito pelo <strong>Stripe</strong>,
                                        uma das plataformas de pagamento mais seguras do mundo.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                3. Finalidade do Tratamento
                            </h2>
                            <p>
                                Utilizamos seus dados exclusivamente para:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Liberar e gerenciar seu acesso à área de membros.</li>
                                <li>Processar pagamentos e cobranças recorrentes.</li>
                                <li>Enviar comunicações transacionais (confirmação de compra, recuperação de senha).</li>
                                <li>Melhorar a experiência de uso da plataforma (cookies técnicos).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                4. Compartilhamento e Segurança
                            </h2>
                            <p>
                                <strong>Não vendemos nem alugamos seus dados para terceiros.</strong> O compartilhamento ocorre apenas com parceiros
                                estritamente necessários para a operação (ex: processador de pagamentos e servidor de hospedagem).
                            </p>
                            <p className="mt-4">
                                Adotamos medidas de segurança técnicas e administrativas, incluindo criptografia SSL de ponta a ponta e bancos de dados protegidos.
                            </p>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                5. Seus Direitos (LGPD)
                            </h2>
                            <p>
                                Como titular dos dados, você tem o direito de a qualquer momento:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Confirmar a existência de tratamento de dados.</li>
                                <li>Acessar seus dados.</li>
                                <li>Corrigir dados incompletos ou desatualizados.</li>
                                <li>Solicitar a exclusão de sua conta e dados pessoais.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                6. Cookies e Tecnologias
                            </h2>
                            <p>
                                Utilizamos cookies apenas para manter sua sessão ativa e segura ("Cookies Essenciais").
                                Não utilizamos cookies de rastreamento publicitário invasivo.
                            </p>
                        </section>

                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Encarregado de Dados (DPO)</h3>
                            <p className="text-gray-600">
                                Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato: <a href="mailto:privacidade@ludotecadigital.com.br" className="text-green-600 hover:underline">privacidade@ludotecadigital.com.br</a>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer Simple */}
            <footer className="bg-white border-t border-gray-200 py-8 text-center text-sm text-gray-500">
                <div className="container mx-auto px-4">
                    &copy; {new Date().getFullYear()} Ludoteca Digital. Todos os direitos reservados.
                </div>
            </footer>
        </div>
    );
}
