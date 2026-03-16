'use client';

import { useState } from 'react';
import { 
    School, 
    Users, 
    UserPlus, 
    Copy, 
    RefreshCw, 
    Key, 
    UserMinus, 
    Check, 
    AlertTriangle,
    Mail,
    Calendar,
    ArrowLeft
} from 'lucide-react';
import { resetInviteToken, resetTeacherPassword, removeTeacher } from './actions';
import Link from 'next/link';

interface Props {
    organization: any;
    teachers: any[];
    baseUrl: string;
}

export default function ManagerDashboardView({ organization, teachers, baseUrl }: Props) {
    const [inviteToken, setInviteToken] = useState(organization.inviteToken);
    const [copying, setCopying] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const inviteLink = `${baseUrl}/convite/${inviteToken}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopying(true);
        setTimeout(() => setCopying(false), 2000);
    };

    const handleResetToken = async () => {
        if (!confirm('Tem certeza? O link atual parará de funcionar imediatamente.')) return;
        const newToken = await resetInviteToken();
        setInviteToken(newToken);
    };

    const handleResetPassword = async (teacher: any) => {
        if (!confirm(`Deseja resetar a senha de ${teacher.email}? O professor será deslogado.`)) return;
        setLoading(teacher.id);
        try {
            const newPwd = await resetTeacherPassword(teacher.id);
            setSuccessMsg(`Senha de ${teacher.email} resetada para: ${newPwd}`);
            alert(`Sucesso! A nova senha é: ${newPwd}. Informe ao professor.`);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setLoading(null);
        }
    };

    const handleRemoveTeacher = async (teacher: any) => {
        if (!confirm(`Remover acesso de ${teacher.email}?`)) return;
        setLoading(teacher.id);
        await removeTeacher(teacher.id);
        setLoading(null);
        window.location.reload();
    };

    const spotsUsed = organization._count.users;
    const totalSpots = organization.teacherLimit;
    const usagePercent = Math.min((spotsUsed / totalSpots) * 100, 100);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header / Nav */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-2 text-purple-600 font-bold text-xl">
                        <School size={24} />
                        <span>Gestão Escolar</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
                {/* Hero / Org Info */}
                <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-8 text-white shadow-xl">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-3xl font-extrabold">{organization.name}</h1>
                            <p className="text-purple-100 mt-1 flex items-center gap-2">
                                <Users size={18} /> Plano {organization.planType} • Ativo
                            </p>
                        </div>
                        
                        {/* Vacancy Counter */}
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-full md:w-auto">
                            <div className="flex justify-between items-end mb-2 gap-8">
                                <div className="text-sm font-medium text-purple-100">Vagas Utilizadas</div>
                                <div className="text-2xl font-black">{spotsUsed} / {totalSpots}</div>
                            </div>
                            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-red-400' : 'bg-green-400'}`}
                                    style={{ width: `${usagePercent}%` }}
                                />
                            </div>
                            {spotsUsed >= totalSpots && (
                                <p className="text-[10px] text-red-200 mt-2 font-bold animate-pulse">
                                    Limite atingido! Gere um novo link após remover professores antigos.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Invite Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
                            <div className="flex items-center gap-2 text-gray-900 font-bold mb-4">
                                <UserPlus size={20} className="text-purple-600" />
                                <h2>Convidar Professores</h2>
                            </div>
                            <p className="text-sm text-gray-600 mb-6">
                                Compartilhe este link com sua equipe. Eles poderão criar suas próprias contas vinculadas à escola.
                            </p>
                            
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-500 font-mono break-all pr-12">
                                        {inviteLink}
                                    </div>
                                    <button 
                                        onClick={handleCopy}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm transition-all"
                                    >
                                        {copying ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-gray-600" />}
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={handleResetToken}
                                    className="w-full flex items-center justify-center gap-2 text-xs font-bold text-gray-500 hover:text-red-600 transition-colors py-2"
                                >
                                    <RefreshCw size={14} /> Resetar Link de Convite
                                </button>

                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                                    <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                                    <p className="text-xs text-amber-700 leading-relaxed">
                                        Ao resetar o link, o endereço anterior parará de funcionar. Use isso apenas se o link vazar publicamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Teachers List Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div className="flex items-center gap-2 font-bold text-gray-900">
                                    <Users size={20} className="text-purple-600" />
                                    <h2>Professores Cadastrados ({teachers.length})</h2>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Professor</th>
                                            <th className="px-6 py-4">Cadastro</th>
                                            <th className="px-6 py-4 text-right">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {teachers.length === 0 ? (
                                            <tr>
                                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                                    Nenhum professor cadastrado ainda. Compartilhe o link de convite!
                                                </td>
                                            </tr>
                                        ) : (
                                            teachers.map((teacher) => (
                                                <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs uppercase">
                                                                {teacher.name?.[0] || teacher.email[0]}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-gray-900">{teacher.name || 'Sem Nome'}</div>
                                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                    <Mail size={10} /> {teacher.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-xs text-gray-600 flex items-center gap-1">
                                                            <Calendar size={12} /> {new Date(teacher.createdAt).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-2">
                                                            <button 
                                                                onClick={() => handleResetPassword(teacher)}
                                                                disabled={!!loading}
                                                                title="Resetar Senha"
                                                                className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-all border border-transparent hover:border-amber-100"
                                                            >
                                                                <Key size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRemoveTeacher(teacher)}
                                                                disabled={!!loading}
                                                                title="Remover Acesso"
                                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
                                                            >
                                                                <UserMinus size={16} />
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

                        {successMsg && (
                            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-sm font-medium flex items-center gap-3">
                                <Check size={20} />
                                {successMsg}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
