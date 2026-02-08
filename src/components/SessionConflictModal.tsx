'use client'

import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SessionConflictModal() {
    const router = useRouter();

    const handleBackToHome = () => {
        localStorage.removeItem('ludoteca_session_id');
        router.push('/');
        router.refresh();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20 animate-in zoom-in slide-in-from-bottom-8 duration-500">
                {/* Header Decorativo */}
                <div className="bg-gradient-to-br from-red-600 to-amber-600 px-8 py-10 text-white text-center relative overflow-hidden">
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="p-4 bg-white/20 rounded-2xl mb-4 backdrop-blur-xl border border-white/30">
                            <AlertCircle size={40} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-black italic tracking-tight">ACESSO DUPLICADO</h2>
                        <p className="text-red-100 text-sm font-medium mt-1">Sua conta foi acessada em outro local.</p>
                    </div>
                    {/* Pattern de fundo */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="px-8 py-10 text-center">
                    <p className="text-gray-600 leading-relaxed font-medium">
                        Por segurança, desconectamos este dispositivo pois <span className="text-gray-900 font-bold">um novo login</span> foi realizado agora mesmo usando suas credenciais.
                    </p>

                    <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
                        <div className="flex items-start gap-3">
                            <div className="mt-1 text-amber-600">🔔</div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Se não foi você, recomendamos <span className="font-bold text-gray-700">alterar sua senha</span> imediatamente nas configurações do perfil para proteger sua conta.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleBackToHome}
                        className="w-full mt-8 bg-gray-900 text-white font-bold py-4 rounded-2xl shadow-xl shadow-gray-900/20 hover:bg-black transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <ArrowLeft size={18} /> Entendi, ir para página inicial
                    </button>

                    <p className="mt-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        Protocolo de Segurança Ludoteca 🛡️
                    </p>
                </div>
            </div>
        </div>
    );
}
