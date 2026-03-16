'use client'

import { useState } from 'react';
import { UserPlus, X, Loader2 } from 'lucide-react';
import { createUserManually } from './actions';

export default function AddUserModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [isVip, setIsVip] = useState(true);
    const [role, setRole] = useState<'INDIVIDUAL' | 'MANAGER'>('INDIVIDUAL');
    const [plan, setPlan] = useState('Bronze');

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await createUserManually(email, name, isVip, role, role === 'MANAGER' ? plan : undefined);
            setIsOpen(false);
            setEmail('');
            setName('');
            setRole('INDIVIDUAL');
            alert('Usuário criado com sucesso!');
        } catch (error) {
            alert('Erro ao criar usuário: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all flex items-center gap-2"
            >
                <UserPlus size={18} /> Novo Usuário
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                <div className="bg-gray-900 px-8 py-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-xl">
                            <UserPlus size={20} />
                        </div>
                        <h3 className="text-xl font-bold">Cadastrar Usuário</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} aria-label="Fechar" className="hover:bg-white/10 p-2 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-2xl mb-4">
                        <button
                            type="button"
                            onClick={() => setRole('INDIVIDUAL')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${role === 'INDIVIDUAL' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Professor (VIP)
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('MANAGER')}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${role === 'MANAGER' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500'}`}
                        >
                            Escola (B2B)
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nome Completo</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            placeholder={role === 'MANAGER' ? "Ex: Escola Machado de Assis" : "Ex: João Silva"}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">E-mail de Acesso</label>
                        <input
                            required
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                            placeholder="email@exemplo.com"
                        />
                    </div>

                    {role === 'MANAGER' && (
                        <div>
                            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Plano da Escola</label>
                            <select
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-bold text-gray-700"
                            >
                                <option value="Bronze">Plano Bronze (10 Profs)</option>
                                <option value="Prata">Plano Prata (25 Profs)</option>
                                <option value="Ouro">Plano Ouro (50 Profs)</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                        <input
                            type="checkbox"
                            id="isVip"
                            checked={isVip}
                            onChange={(e) => setIsVip(e.target.checked)}
                            className="w-5 h-5 accent-purple-600"
                        />
                        <label htmlFor="isVip" className="text-sm font-bold text-purple-900 cursor-pointer">
                            Ativar Acesso imediatamente?
                        </label>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
}
