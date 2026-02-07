export default function Privacidade() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Política de Privacidade - Ludoteca Digital</h1>

            <div className="prose lg:prose-xl text-gray-700">
                <p className="mb-4">
                    Na Ludoteca Digital, respeitamos sua privacidade e a LGPD.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Dados Coletados</h2>
                <p className="mb-4">
                    Coletamos apenas seu nome, e-mail e dados de pagamento (processados de forma segura pelo Stripe).
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Uso de Dados</h2>
                <p className="mb-4">
                    Seus dados são usados exclusivamente para garantir seu acesso à plataforma e para comunicações sobre sua assinatura.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Segurança</h2>
                <p className="mb-4">
                    Não compartilhamos seus dados com terceiros. Utilizamos criptografia de ponta a ponta via Supabase e Stripe.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Seus Direitos</h2>
                <p className="mb-4">
                    Você pode solicitar a exclusão de sua conta e dados a qualquer momento através do nosso suporte.
                </p>
            </div>
        </div>
    );
}
