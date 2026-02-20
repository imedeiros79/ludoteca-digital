import Link from 'next/link';
import { Gamepad2, CalendarDays, Heart, BookOpen, Settings, LayoutDashboard, Plus, Trophy } from 'lucide-react';
import { SignOutButton } from '@/components/SignOutButton';
import { getWeeklyPlans } from '@/app/dashboard/planning-actions';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import WeeklyPlanner from './WeeklyPlanner';

export const dynamic = 'force-dynamic';

export default async function PlanejamentoPage() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
    const isVIP = dbUser?.subscriptionStatus === 'active' || dbUser?.email === 'imedeiros@outlook.com';

    if (!isVIP) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="text-5xl mb-4">🔒</div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Recurso VIP</h1>
                    <p className="text-gray-500 mb-6">O Planejamento Semanal está disponível apenas para assinantes VIP.</p>
                    <Link href="/#precos" className="inline-block bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                        Ver Planos
                    </Link>
                </div>
            </div>
        );
    }

    const plans = await getWeeklyPlans();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="flex items-center gap-2 text-purple-600 font-bold text-xl">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white">
                            <Gamepad2 size={20} />
                        </div>
                        <span className="hidden sm:inline">Ludoteca Digital</span>
                    </Link>
                    <div className="flex items-center gap-1">
                        <Link href="/dashboard" className="flex items-center gap-2 px-3 py-1.5 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                            <BookOpen size={15} /> Acervo
                        </Link>
                        <Link href="/dashboard/favoritos" className="flex items-center gap-2 px-3 py-1.5 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                            <Heart size={15} /> Favoritos
                        </Link>
                        <Link href="/dashboard/planejamento" className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-bold border border-purple-100">
                            <CalendarDays size={15} /> Planejamento
                        </Link>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-xs font-bold text-gray-900">{dbUser?.email}</div>
                            <div className="text-[10px] font-black uppercase tracking-tighter text-green-600">Assinatura VIP</div>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                            {dbUser?.email?.[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {dbUser?.email === 'imedeiros@outlook.com' && (
                            <Link href="/admin" className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">
                                <LayoutDashboard size={14} /> PAINEL ADM
                            </Link>
                        )}
                        <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            <Settings size={16} /> <span className="hidden sm:inline">Minha Conta</span>
                        </Link>
                        <SignOutButton />
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 sm:px-6 py-8 flex-1">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <CalendarDays size={20} className="text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Planejamento Semanal</h1>
                            <p className="text-gray-500 text-sm">
                                Grade recorrente — suas aulas ficam salvas e se repetem toda semana 🔁
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                        <Trophy size={14} className="text-amber-500" />
                        <span className="text-xs font-semibold text-amber-700">
                            {plans.length} {plans.length === 1 ? 'aula planejada' : 'aulas planejadas'} esta semana
                        </span>
                    </div>
                </div>

                {/* Dica */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <p className="text-sm font-semibold text-blue-800">Como funciona o planejamento recorrente?</p>
                        <p className="text-xs text-blue-600 mt-0.5">
                            Monte sua grade uma vez e ela se repete automaticamente toda semana. Clique em <strong>&quot;+&quot;</strong> em qualquer dia para adicionar uma aula, turma e horário. Para mudar, basta remover e adicionar novamente.
                        </p>
                    </div>
                </div>

                {/* Grade Semanal */}
                <WeeklyPlanner plans={plans} />
            </main>
        </div>
    );
}
