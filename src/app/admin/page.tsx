import { getAdminStats, getAllUsers, toggleUserVIP, deleteUser, createUserManually } from './actions';
import {
    Gamepad2, Users, CreditCard, PlayCircle, ShieldCheck,
    UserCheck, UserMinus, Trash2, UserPlus, Search,
    TrendingUp, Wallet, AlertCircle, RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const stats = await getAdminStats();
    const users = await getAllUsers();

    // Helper para formatar moeda
    const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-purple-100">
            {/* Navbar Admin - Ultra Premium */}
            <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl border-b border-purple-500/30 backdrop-blur-md bg-opacity-95">
                <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                        <ShieldCheck size={28} className="text-white" />
                    </div>
                    <div>
                        <span className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300">Super Admin</span>
                        <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold flex items-center gap-1">
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Controle Total
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="text-sm font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2">
                        <Gamepad2 size={18} />
                        Painel Jogos
                    </Link>
                    <div className="h-6 w-px bg-gray-800" />
                    <SignOutButton />
                </div>
            </nav>

            <main className="container mx-auto px-6 py-10 flex-1">
                {/* Header Dinâmico */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight italic">Painel Executivo</h1>
                        <p className="text-gray-500 font-medium">Análise de métricas financeiras e gestão de ativos digitais.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="bg-white text-gray-700 px-6 py-3 rounded-2xl font-bold border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                            <RefreshCw size={18} /> Atualizar Tudo
                        </button>
                        <button className="bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-purple-500/20 hover:bg-purple-700 transition-all flex items-center gap-2">
                            <UserPlus size={18} /> Novo Usuário
                        </button>
                    </div>
                </div>

                {/* Grid Financeiro & Operacional - O "Super" Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {/* Faturamento Total */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-purple-200 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">+12% total</span>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Faturamento Realizado</div>
                            <div className="text-3xl font-black text-gray-900 leading-none">{fmt(stats.totalRevenue)}</div>
                        </div>
                    </div>

                    {/* Pendente / A Receber */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-amber-200 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                                <Wallet size={24} />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">A Receber (Asaas)</div>
                            <div className="text-3xl font-black text-gray-900 leading-none">{fmt(stats.pendingRevenue)}</div>
                        </div>
                    </div>

                    {/* Assinantes Ativos */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-blue-200 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                <CreditCard size={24} />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assinantes VIP</div>
                            <div className="text-3xl font-black text-gray-900">{stats.activeSubs}</div>
                        </div>
                    </div>

                    {/* Acervo Total */}
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-between group hover:border-indigo-200 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <PlayCircle size={24} />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Jogos no Acervo</div>
                            <div className="text-3xl font-black text-gray-900">{stats.totalGames}</div>
                        </div>
                    </div>
                </div>

                {/* Seção de Gestão de Usuários */}
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
                                placeholder="Buscar por e-mail..."
                                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-gray-50">
                                    <th className="px-10 py-6">Identificação do Usuário</th>
                                    <th className="px-10 py-6 text-center">Acesso VIP</th>
                                    <th className="px-10 py-6">Data de Cadastro</th>
                                    <th className="px-10 py-6 text-right">Controle de Segurança</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-purple-50/10 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-purple-100 group-hover:text-purple-600 transition-colors font-black text-xs">
                                                    {user.email?.[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 flex items-center gap-2">
                                                        {user.email}
                                                        {user.email === 'imedeiros@outlook.com' && <ShieldCheck size={14} className="text-blue-500" />}
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-mono tracking-tighter">REF: {user.id}</div>
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
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center justify-end gap-3">
                                                {/* Toggle VIP */}
                                                <form action={async () => {
                                                    'use server'
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
                                                <form action={async () => {
                                                    'use server'
                                                    await deleteUser(user.id);
                                                }}>
                                                    <button
                                                        type="submit"
                                                        title="Deletar Usuário"
                                                        className="p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-all shadow-sm"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer Admin */}
                <div className="mt-12 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    Acesso Restrito ao Proprietário da Ludoteca Digital
                </div>
            </main>
        </div>
    );
}
