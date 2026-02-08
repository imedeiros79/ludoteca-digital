import { getAdminStats, getAllUsers, toggleUserVIP, deleteUser, createUserManually } from './actions';
import AddUserModal from './AddUserModal';
import UserTable from './UserTable';
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
                        <AddUserModal />
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
                <UserTable initialUsers={users} />

                {/* Footer Admin */}
                <div className="mt-12 flex items-center justify-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    Acesso Restrito ao Proprietário da Ludoteca Digital
                </div>
            </main>
        </div>
    );
}
