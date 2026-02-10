import { MessageCircle } from 'lucide-react';

export default function FAQ() {
    const faqs = [
        {
            q: "Como recebo o acesso?",
            a: "O acesso é imediato após a confirmação do pagamento. Você receberá os dados por e-mail e poderá usar o sistema imediatamente."
        },
        {
            q: "Os jogos funcionam no celular?",
            a: "Sim! Todos os nossos jogos são desenvolvidos em HTML5, o que garante funcionamento perfeito em celulares, tablets e computadores."
        },
        {
            q: "Posso cancelar a assinatura?",
            a: "Sim, você pode cancelar a qualquer momento diretamente pelo painel do usuário, sem burocracia ou taxas de cancelamento."
        },
        {
            q: "Preciso baixar os jogos?",
            a: "Não, todo o nosso acervo é online. Isso garante que você sempre tenha a versão mais atualizada e não ocupe espaço no seu dispositivo."
        }
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
                    <p className="text-gray-600">Tudo o que você precisa saber sobre a Ludoteca Digital.</p>
                </div>
                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-2">{faq.q}</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 bg-purple-50 p-8 rounded-3xl text-center border border-purple-100">
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Ainda tem dúvidas?</h3>
                    <p className="text-purple-700 mb-6">Nossa equipe de suporte está pronta para te ajudar no WhatsApp.</p>
                    <a
                        href="https://wa.me/5531972198551"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                    >
                        <MessageCircle size={20} /> Falar com Consultor
                    </a>
                </div>
            </div>
        </section>
    );
}
