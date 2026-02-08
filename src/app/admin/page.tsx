import { getAdminStats, getAllUsers, toggleUserVIP } from './actions';
import { Gamepad2, Users, CreditCard, PlayCircle, ShieldCheck, UserCheck, UserMinus } from 'lucide-react';
import Link from 'next/link';
import { SignOutButton } from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const stats = await getAdminStats();
    const users = await getAllUsers();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            {/* Navbar Admin */}
            <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xl border-b border-purple-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <span className="text-xl font-bold tracking-tight">Admin Console</span>
                        <div className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">Ludoteca Digital</div>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
                        Voltar ao App
                    </Link>
                    <SignOutButton />
                </div>
            </nav>

            <main className="container mx-auto px-6 py-10 flex-1">
                {/* Cabeçalho */}
                <div className="mb-10">
                    <h1 className="text-3xl font-black text-gray-900 mb-2">Painel de Controle</h1>
                    <p className="text-gray-500">Gestão total de usuários, assinaturas e acervo.</p>
                </div>

                {/* Grid de Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: 'Usuários Totais', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
                        { label: 'Assinantes Ativos', value: stats.activeSubs, icon: CreditCard, color: 'bg-green-500' },
                        { label: 'Jogos no Acervo', value: stats.totalGames, icon: PlayCircle, color: 'bg-purple-500' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6 group hover:shadow-md transition-shadow">
                            <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg`}>
                                <stat.icon size={28} />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
                                <div className="text-4xl font-black text-gray-900">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lista de Usuários */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-900">Usuários Recentes</h2>
                        <span className="bg-purple-100 text-purple-700 text-xs font-black px-3 py-1 rounded-full uppercase">Tempo Real</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-gray-400 text-xs uppercase tracking-widest font-bold border-b border-gray-50">
                                    <th className="px-8 py-5">Usuário</th>
                                    <th className="px-8 py-5">Status VIP</th>
                                    <th className="px-8 py-5">Criado em</th>
                                    <th className="px-8 py-5 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-gray-900">{user.email}</div>
                                            <div className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.subscriptionStatus === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {user.subscriptionStatus === 'active' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <form action={async () => {
                                                'use server'
                                                await toggleUserVIP(user.id, user.subscriptionStatus || 'inactive');
                                            }}>
                                                <button
                                                    type="submit"
                                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${user.subscriptionStatus === 'active'
                                                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                            : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                                                        }`}
                                                >
                                                    {user.subscriptionStatus === 'active' ? (
                                                        <><UserMinus size={14} /> Remover VIP</>
                                                    ) : (
                                                        <><UserCheck size={14} /> Ativar VIP</>
                                                    )}
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
