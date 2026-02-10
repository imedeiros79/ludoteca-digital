import { CheckCircle, ShieldCheck, Gamepad2 } from 'lucide-react';

export default function Benefits() {
    return (
        <section className="py-12 bg-white border-y border-gray-100">
            <div className="container mx-auto px-4">
                <h2 className="sr-only">Nossos diferenciais e benefícios</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-purple-50/50">
                        <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-white shrink-0">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Pronto para Usar</h3>
                            <p className="text-gray-600 text-sm">Economize horas de planejamento com atividades prontas e testadas.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-blue-50/50">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">100% BNCC</h3>
                            <p className="text-gray-600 text-sm">Alinhamento completo com os códigos da Base Nacional Comum Curricular.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-6 rounded-2xl bg-green-50/50">
                        <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white shrink-0">
                            <Gamepad2 size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-1">Multiplataforma</h3>
                            <p className="text-gray-600 text-sm">Funciona perfeitamente em computadores, tablets, celulares e lousas digitais.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
