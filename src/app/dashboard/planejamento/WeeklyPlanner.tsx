'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Plus, X, Clock, Users, Gamepad2, BookOpen, FileText, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import AddToPlanModal from './AddToPlanModal';
import { removeFromPlan } from '@/app/dashboard/planning-actions';
import { useRouter } from 'next/navigation';

const DIAS_LABEL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_FULL = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const WEEK_DAYS = [1, 2, 3, 4, 5]; // Seg a Sex

interface PlanItem {
    id: string;
    dayOfWeek: number;
    turma: string;
    timeSlot: string | null;
    notes: string | null;
    item?: {
        id: string;
        title: string;
        subject: string | null;
        year: string | null;
        imageUrl: string | null;
    };
}

interface WeeklyPlannerProps {
    plans: PlanItem[];
}

export default function WeeklyPlanner({ plans }: WeeklyPlannerProps) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [modalDay, setModalDay] = useState(1);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const plansByDay = WEEK_DAYS.reduce((acc, day) => {
        acc[day] = plans.filter(p => p.dayOfWeek === day).sort((a, b) => {
            if (!a.timeSlot && !b.timeSlot) return 0;
            if (!a.timeSlot) return 1;
            if (!b.timeSlot) return -1;
            return a.timeSlot.localeCompare(b.timeSlot);
        });
        return acc;
    }, {} as Record<number, PlanItem[]>);

    const openModal = (day: number) => {
        setModalDay(day);
        setShowModal(true);
    };

    const handleClose = () => {
        setShowModal(false);
        router.refresh();
    };

    const handleRemove = async (planId: string) => {
        setDeletingId(planId);
        try {
            await removeFromPlan(planId);
            router.refresh();
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <>
            {/* Grade semanal desktop */}
            <div className="hidden lg:grid grid-cols-5 gap-4">
                {WEEK_DAYS.map(day => (
                    <div key={day} className="flex flex-col gap-3">
                        {/* Cabeçalho do dia */}
                        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                            <div>
                                <div className="text-xs font-bold text-purple-600 uppercase tracking-wider">{DIAS_LABEL[day]}</div>
                                <div className="text-sm font-semibold text-gray-800">{DIAS_FULL[day]}</div>
                            </div>
                            <button
                                onClick={() => openModal(day)}
                                className="w-7 h-7 bg-purple-100 hover:bg-purple-600 text-purple-600 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                                title={`Adicionar aula na ${DIAS_FULL[day]}`}
                            >
                                <Plus size={14} />
                            </button>
                        </div>

                        {/* Cards de aula */}
                        {plansByDay[day].length === 0 ? (
                            <button
                                onClick={() => openModal(day)}
                                className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-purple-300 hover:text-purple-400 hover:bg-purple-50 transition-all text-center"
                            >
                                <CalendarDays size={24} />
                                <span className="text-xs">Adicionar aula</span>
                            </button>
                        ) : (
                            plansByDay[day].map(plan => (
                                <PlanCard
                                    key={plan.id}
                                    plan={plan}
                                    onRemove={() => handleRemove(plan.id)}
                                    isDeleting={deletingId === plan.id}
                                />
                            ))
                        )}

                        {plansByDay[day].length > 0 && (
                            <button
                                onClick={() => openModal(day)}
                                className="flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-200 rounded-xl text-xs text-gray-400 hover:border-purple-300 hover:text-purple-500 hover:bg-purple-50 transition-all"
                            >
                                <Plus size={12} /> Adicionar
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Vista mobile: lista por dia */}
            <div className="lg:hidden space-y-4">
                {WEEK_DAYS.map(day => (
                    <div key={day} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 bg-purple-600 rounded-md flex items-center justify-center text-white text-xs font-bold">{DIAS_LABEL[day]}</span>
                                <span className="font-semibold text-gray-800 text-sm">{DIAS_FULL[day]}</span>
                            </div>
                            <button onClick={() => openModal(day)} className="flex items-center gap-1.5 px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors">
                                <Plus size={12} /> Adicionar
                            </button>
                        </div>
                        {plansByDay[day].length === 0 ? (
                            <div className="p-6 text-center text-sm text-gray-400">Nenhuma aula planejada</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {plansByDay[day].map(plan => (
                                    <div key={plan.id} className="flex items-center gap-3 p-3">
                                        <div className="flex-1 min-w-0">
                                            {plan.timeSlot && <div className="text-xs font-bold text-purple-600 mb-0.5 flex items-center gap-1"><Clock size={10} /> {plan.timeSlot}</div>}
                                            <div className="text-sm font-semibold text-gray-900 truncate">{plan.item?.title || 'Jogo'}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1"><Users size={10} /> {plan.turma}</div>
                                        </div>
                                        <button onClick={() => handleRemove(plan.id)} disabled={deletingId === plan.id} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors rounded-lg">
                                            <Trash2 size={14} />
                                        </button>
                                        <Link href={`/jogar/${plan.item?.id}`} className="p-1.5 text-gray-300 hover:text-purple-500 transition-colors rounded-lg">
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {showModal && <AddToPlanModal initialDay={modalDay} onClose={handleClose} />}
        </>
    );
}

function PlanCard({ plan, onRemove, isDeleting }: { plan: PlanItem; onRemove: () => void; isDeleting: boolean }) {
    const imgSrc = plan.item?.imageUrl
        ? plan.item.imageUrl.replace('https://dmrafr2igetxh.cloudfront.net', '/content')
        : null;

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            {/* Imagem com botão remover sempre visível no canto */}
            <div className="h-24 bg-gray-100 relative overflow-hidden flex-shrink-0">
                {imgSrc ? (
                    <img src={imgSrc} alt={plan.item?.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Gamepad2 size={24} className="text-gray-300" />
                    </div>
                )}
                {/* Botão remover — sempre visível, canto superior direito */}
                <button
                    onClick={onRemove}
                    disabled={isDeleting}
                    title="Remover do planejamento"
                    aria-label="Remover aula do planejamento"
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/50 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                >
                    {isDeleting
                        ? <Loader2 size={10} className="animate-spin" />
                        : <X size={10} />
                    }
                </button>
                {/* Horário sobre a imagem */}
                {plan.timeSlot && (
                    <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <Clock size={9} /> {plan.timeSlot}
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3 flex-1 flex flex-col gap-1">
                <p className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">
                    {plan.item?.title || 'Atividade'}
                </p>
                <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Users size={9} /> {plan.turma}
                </p>
                {plan.item?.subject && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                        <BookOpen size={9} /> {plan.item.subject}
                    </p>
                )}
                {plan.notes && (
                    <p className="text-[11px] text-gray-400 flex items-start gap-1 line-clamp-2 mt-1">
                        <FileText size={9} className="flex-shrink-0 mt-0.5" /> {plan.notes}
                    </p>
                )}
            </div>

            {/* ✅ Botão Iniciar Aula — SEMPRE visível, nunca escondido */}
            {plan.item && (
                <Link
                    href={`/jogar/${plan.item.id}`}
                    className="flex items-center justify-center gap-2 mx-3 mb-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                >
                    <Gamepad2 size={13} />
                    Iniciar Aula
                </Link>
            )}
        </div>
    );
}

