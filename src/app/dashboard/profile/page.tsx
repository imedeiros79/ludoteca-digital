'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Loader2, User, Phone, FileText, Lock, ShieldCheck, History, CreditCard } from 'lucide-react';
import { updateProfile, updatePassword, getPaymentHistory } from './actions';

export default function ProfilePage() {
    const router = useRouter();
    const supabase = createClient();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'billing'>('profile');

    // Profile Form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [savingProfile, setSavingProfile] = useState(false);

    // Password Form
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    // Billing
    const [payments, setPayments] = useState<any[]>([]);
    const [loadingPayments, setLoadingPayments] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) {
                router.push('/login');
                return;
            }

            // Fetch additional data from actions (Prisma)
            // For now, we use metadata or assume action will return it.
            // Actually, let's create a getProfile action or use metadata if synced.
            // For simplicity, let's assume we can get it from a GET action.
            try {
                // We'll reimplement getPaymentHistory to also return user profile data for simplicity or use separate action.
                // Let's assume we fetch from fetching the action we are about to create: getUserProfile
                const profile = await getPaymentHistory(); // Misused name for now, I'll update actions.ts to include getProfile
                if (profile && profile.user) {
                    setUser(profile.user);
                    setName(profile.user.name || '');
                    setEmail(profile.user.email || '');
                    setCpf(profile.user.cpfCnpj || '');
                    setPhone(profile.user.phone || '');
                    setPayments(profile.payments || []);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);


    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        try {
            await updateProfile({ name, cpfCnpj: cpf, phone });
            alert('Perfil atualizado com sucesso!');
        } catch (error: any) {
            alert('Erro ao atualizar perfil: ' + error.message);
        } finally {
            setSavingProfile(false);
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem.');
            return;
        }
        setSavingPassword(true);
        try {
            await updatePassword(newPassword);
            alert('Senha alterada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            alert('Erro ao alterar senha: ' + error.message);
        } finally {
            setSavingPassword(false);
        }
    };

    // Formatters (reused)
    const formatCPF = (value: string) => {
        return value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').replace(/(-\d{2})\d+?$/, '$1');
    };
    const formatPhone = (value: string) => {
        return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{4})\d+?$/, '$1');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-purple-600" size={40} /></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Minha Conta</h1>
            <p className="text-gray-500 mb-8">Gerencie seus dados pessoais, segurança e assinatura.</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <User size={18} /> Dados Pessoais
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <ShieldCheck size={18} /> Segurança
                        </button>
                        <button
                            onClick={() => setActiveTab('billing')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'billing' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            <CreditCard size={18} /> Assinatura e Pagamentos
                        </button>
                    </nav>
                </aside>

                {/* Content Area */}
                <main className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User className="text-purple-600" /> Seus Dados
                            </h2>
                            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email (Não editável)</label>
                                    <input type="email" value={email} disabled className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input type="text" value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="000.000.000-00" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input type="text" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="(00) 00000-0000" />
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" disabled={savingProfile} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                                    {savingProfile ? <Loader2 className="animate-spin" size={18} /> : 'Salvar Alterações'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* SECURITY TAB */}
                    {activeTab === 'security' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ShieldCheck className="text-purple-600" /> Segurança
                            </h2>
                            <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nova Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" minLength={6} placeholder="Mínimo 6 caracteres" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Nova Senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-9 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Repita a senha" />
                                    </div>
                                </div>
                                <button type="submit" disabled={savingPassword} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors flex items-center gap-2">
                                    {savingPassword ? <Loader2 className="animate-spin" size={18} /> : 'Alterar Senha'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* BILLING TAB */}
                    {activeTab === 'billing' && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="text-purple-600" /> Assinatura e Pagamentos
                            </h2>

                            {/* Subscription Status Card */}
                            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-xl p-6 mb-8">
                                <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-2">Status da Assinatura</h3>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${user?.subscriptionStatus === 'active' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                                        {user?.subscriptionStatus === 'active' ? 'ATIVO (VIP)' : 'INATIVO / GRATUITO'}
                                    </span>
                                </div>
                                {user?.subscriptionStatus !== 'active' && (
                                    <button onClick={() => router.push('/#precos')} className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm font-bold rounded-lg hover:bg-purple-700 transition">
                                        Assinar Agora
                                    </button>
                                )}
                            </div>

                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <History size={18} /> Histórico de Cobranças
                            </h3>

                            {payments.length === 0 ? (
                                <p className="text-gray-500 text-sm">Nenhuma cobrança encontrada.</p>
                            ) : (
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-700 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Data</th>
                                                <th className="px-4 py-3">Valor</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Fatura</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {payments.map((payment: any) => (
                                                <tr key={payment.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3">{new Date(payment.dueDate).toLocaleDateString('pt-BR')}</td>
                                                    <td className="px-4 py-3">R$ {payment.value.toFixed(2)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${payment.status === 'RECEIVED' || payment.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                            payment.status === 'OVERDUE' ? 'bg-red-100 text-red-700' :
                                                                'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <a href={payment.bankSlipUrl || payment.invoiceUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                                                            Ver Fatura
                                                        </a>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            <div className="mt-8 pt-8 border-t">
                                <h4 className="font-bold text-gray-900 mb-2">Zona de Perigo</h4>
                                <p className="text-sm text-gray-500 mb-4">
                                    Caso deseje cancelar sua renovação automática, clique no botão abaixo.
                                    <br /><span className="text-xs text-gray-400">Cancelamentos em até 7 dias têm reembolso garantido.</span>
                                </p>
                                <button
                                    onClick={async () => {
                                        if (confirm('Tem certeza que deseja cancelar sua assinatura?')) {
                                            try {
                                                const { cancelSubscription } = await import('./actions');
                                                const res = await cancelSubscription();
                                                alert(res.message);
                                                window.location.reload();
                                            } catch (err: any) {
                                                alert(err.message);
                                            }
                                        }
                                    }}
                                    className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-sm font-medium transition"
                                >
                                    Cancelar Assinatura
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
