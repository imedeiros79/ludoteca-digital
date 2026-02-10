export default function Testimonials() {
    const testimonials = [
        {
            text: "A Ludoteca mudou minha forma de ensinar. Os alunos ficam super engajados e eu economizo muito tempo de planejamento!",
            author: "Profa. Carla Silva",
            role: "Ensino Fundamental I"
        },
        {
            text: "Excelente variedade de jogos. O alinhamento com a BNCC facilita muito o meu relatório pedagógico no final do mês.",
            author: "Prof. Ricardo Santos",
            role: "Matemática e Ciências"
        },
        {
            text: "Melhor investimento que fiz este ano. Os jogos rodam liso no tablet e na lousa digital da escola.",
            author: "Profa. Mariana Lima",
            role: "Educação Infantil"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">O que dizem os professores</h2>
                    <p className="text-gray-600">Junte-se a milhares de educadores que já transformaram suas salas de aula.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((d, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 italic text-gray-700 relative">
                            <div className="text-purple-300 absolute top-4 left-4 text-4xl leading-none">"</div>
                            <p className="relative z-10 mb-6">{d.text}</p>
                            <div className="not-italic flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                                    {d.author[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 text-sm">{d.author}</div>
                                    <div className="text-xs text-gray-500">{d.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
