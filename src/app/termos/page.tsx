import Link from 'next/link';
import { ArrowLeft, Shield, Scale, ScrollText, AlertCircle } from 'lucide-react';

export default function Termos() {
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
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                            <ScrollText size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Termos de Uso</h1>
                            <p className="text-gray-500 text-sm">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>

                    <div className="prose prose-purple max-w-none text-gray-700 leading-relaxed space-y-8">
                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                1. Aceitação dos Termos
                            </h2>
                            <p>
                                Bem-vindo à <strong>Ludoteca Digital</strong> ("Plataforma"). Ao acessar nosso site e efetuar a assinatura,
                                você ("Usuário") concorda inteiramente com estes Termos de Uso. Caso não concorde com qualquer parte destes termos,
                                recomendamos que não utilize nossos serviços.
                            </p>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                2. Descrição do Serviço e Licença de Uso
                            </h2>
                            <p>
                                A Ludoteca Digital concede ao Usuário uma <strong>licença limitada, não exclusiva, intransferível e revogável</strong>
                                para acessar e utilizar nosso acervo de 1.442 objetos de aprendizagem interativos (jogos HTML5) exclusivamente para:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Uso em sala de aula (presencial ou remota).</li>
                                <li>Planejamento pedagógico pessoal.</li>
                                <li>Atividades educativas com alunos.</li>
                            </ul>
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4 text-red-700 text-sm">
                                <strong>É estritamente proibido:</strong> Revender, sublicenciar, redistribuir ou extrair o código-fonte dos jogos
                                para hospedar em outros servidores ou sites sem autorização expressa.
                            </div>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                3. Assinatura, Pagamentos e Cancelamento
                            </h2>
                            <p>
                                O acesso à plataforma é liberado mediante a confirmação do pagamento da assinatura (Mensal ou Anual),
                                processado de forma segura através do nosso parceiro <strong>Stripe</strong>.
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li><strong>Renovação Automática:</strong> As assinaturas são renovadas automaticamente ao final de cada período, salvo cancelamento prévio.</li>
                                <li><strong>Cancelamento:</strong> O Usuário pode cancelar a renovação automática a qualquer momento através do painel de controle. O acesso permanecerá ativo até o fim do período já pago.</li>
                                <li><strong>Reembolso:</strong> Garantimos o direito de arrependimento de 7 dias conforme o Art. 49 do Código de Defesa do Consumidor (CDC).</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                4. Responsabilidades e Garantias
                            </h2>
                            <p>
                                A Ludoteca Digital se compromete a manter a plataforma online e disponível. No entanto, não nos responsabilizamos por:
                            </p>
                            <ul className="list-disc pl-6 space-y-2 mt-4">
                                <li>Instabilidade na conexão de internet do usuário.</li>
                                <li>Incompatibilidade de dispositivos obsoletos (navegadores antigos).</li>
                                <li>Interrupções temporárias para manutenção programada.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                5. Propriedade Intelectual
                            </h2>
                            <p>
                                Todo o conteúdo, design, logotipos e códigos presentes na Ludoteca Digital são protegidos por leis de direitos autorais
                                e propriedade intelectual. O uso da plataforma não transfere qualquer direito de propriedade ao Usuário.
                            </p>
                        </section>

                        <section>
                            <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                                6. Alterações nos Termos
                            </h2>
                            <p>
                                Reservamo-nos o direito de modificar estes termos a qualquer momento para refletir mudanças na legislação ou em nossos serviços.
                                Alterações significativas serão notificadas por e-mail ou aviso na plataforma.
                            </p>
                        </section>

                        <div className="mt-12 pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Dúvidas?</h3>
                            <p className="text-gray-600">
                                Entre em contato com nosso suporte através do e-mail: <a href="mailto:suporte@ludotecadigital.com.br" className="text-purple-600 hover:underline">suporte@ludotecadigital.com.br</a>
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
