'use client'

import { useState } from 'react';
import {
    Search, ShieldCheck, UserMinus, UserCheck, Trash2,
    Calendar, Mail, Fingerprint
} from 'lucide-react';
import { toggleUserVIP, deleteUser } from './actions';

interface User {
    id: string;
    email: string | null;
    name: string | null;
    subscriptionStatus: string | null;
    createdAt: Date;
}

export default function UserTable({ initialUsers }: { initialUsers: User[] }) {
    const [search, setSearch] = useState('');

    const filteredUsers = initialUsers.filter(user =>
        user.email?.toLowerCase().includes(search.toLowerCase()) ||
        user.name?.toLowerCase().includes(search.toLowerCase())
    );

    async function handleDelete(id: string, email: string) {
        if (confirm(`Tem certeza que deseja deletar permanentemente o usuário ${email}?`)) {
            await deleteUser(id);
        }
    }

    return (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6 bg-gray-50/30">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 italic">Usuários da Plataforma</h2>
                    <p className="text-sm text-gray-500 font-medium">Gestão direta de acessos e assinaturas.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar por e-mail ou nome..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-50">
                            <th className="px-10 py-6 text-center w-16">#</th>
                            <th className="px-10 py-6">Identificação do Usuário</th>
                            <th className="px-10 py-6 text-center">Acesso VIP</th>
                            <th className="px-10 py-6">Data de Cadastro</th>
                            <th className="px-10 py-6 text-right">Controle de Segurança</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-10 py-20 text-center text-gray-400 font-medium italic">
                                    Nenhum usuário encontrado para "{search}"
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, index) => (
                                <tr key={user.id} className="hover:bg-purple-50/10 transition-colors group">
                                    <td className="px-10 py-6 text-center text-xs font-black text-gray-300">
                                        {(index + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors font-black text-xs shrink-0">
                                                {user.email?.[0].toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 flex items-center gap-2">
                                                    {user.email}
                                                    {user.email === 'imedeiros@outlook.com' && <ShieldCheck size={14} className="text-blue-500" />}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-mono tracking-tighter flex items-center gap-1 mt-0.5">
                                                    <Fingerprint size={10} /> {user.id}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-center">
                                        <span className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm ${user.subscriptionStatus === 'active'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {user.subscriptionStatus === 'active' ? 'Diamante ✨' : 'Standard'}
                                        </span>
                                    </td>
                                    <td className="px-10 py-6 text-sm text-gray-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-300" />
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center justify-end gap-3">
                                            {/* Toggle VIP */}
                                            <form action={async () => {
                                                await toggleUserVIP(user.id, user.subscriptionStatus || 'inactive');
                                            }}>
                                                <button
                                                    type="submit"
                                                    title={user.subscriptionStatus === 'active' ? "Remover acesso manual" : "Dar acesso VIP grátis"}
                                                    className={`p-2.5 rounded-xl transition-all shadow-sm border ${user.subscriptionStatus === 'active'
                                                        ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                                                        : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                                        }`}
                                                >
                                                    {user.subscriptionStatus === 'active' ? <UserMinus size={18} /> : <UserCheck size={18} />}
                                                </button>
                                            </form>

                                            {/* Delete User */}
                                            <button
                                                onClick={() => handleDelete(user.id, user.email || '')}
                                                title="Deletar Usuário"
                                                className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
