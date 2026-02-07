export default function Termos() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Termos de Uso - Ludoteca Digital</h1>

            <div className="prose lg:prose-xl text-gray-700">
                <p className="mb-4">
                    Bem-vindo à Ludoteca Digital. Ao assinar nossa plataforma, você ganha o direito de utilizar nossos 1.442 objetos de aprendizagem em suas aulas.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Licença</h2>
                <p className="mb-4">
                    A licença é individual e intransferível. É proibida a revenda dos links ou a extração dos arquivos para uso fora da plataforma.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Assinatura</h2>
                <p className="mb-4">
                    O acesso é liberado mediante confirmação de pagamento via Stripe. O cancelamento pode ser feito a qualquer momento pelo painel do usuário.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Uso Pedagógico</h2>
                <p className="mb-4">
                    Os materiais são destinados a fins educativos e alinhados à BNCC.
                </p>

                <h2 className="text-2xl font-semibold mt-8 mb-4">Limitação de Responsabilidade</h2>
                <p className="mb-4">
                    A Ludoteca Digital garante o funcionamento dos links, mas não se responsabiliza por falhas de conexão de internet do usuário.
                </p>
            </div>
        </div>
    );
}
