'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { X, Search, Clock, Users, FileText, Loader2, ChevronLeft, Gamepad2, CheckCircle2, ArrowRight } from 'lucide-react';
import { addToPlan, getSubjectsWithCount, getItemsBySubject, searchItemsForPlan } from '@/app/dashboard/planning-actions';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Ícones e cores por disciplina
const SUBJECT_STYLE: Record<string, { emoji: string; color: string; bg: string }> = {
    'Língua Portuguesa': { emoji: '📖', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
    'Matemática': { emoji: '📐', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
    'Ciências': { emoji: '🔬', color: 'text-green-700', bg: 'bg-green-50 border-green-200 hover:bg-green-100' },
    'História': { emoji: '🏛️', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
    'Geografia': { emoji: '🌍', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200 hover:bg-teal-100' },
    'Artes': { emoji: '🎨', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
    'Educação Física': { emoji: '🏃', color: 'text-red-700', bg: 'bg-red-50 border-red-200 hover:bg-red-100' },
    'Inglês': { emoji: '🌐', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
    'default': { emoji: '📚', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
};

function getSubjectStyle(name: string) {
    return SUBJECT_STYLE[name] || SUBJECT_STYLE['default'];
}

interface Item {
    id: string;
    title: string;
    subject: string | null;
    year: string | null;
    imageUrl: string | null;
}

interface Subject {
    name: string;
    count: number;
}

interface AddToPlanModalProps {
    initialDay?: number;
    onClose: () => void;
}

// ─── ETAPA 1: Seleção do Jogo ─────────────────────────────────────────────────
function StepSelectGame({ onSelect }: { onSelect: (item: Item) => void }) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [items, setItems] = useState<Item[]>([]);
    const [query, setQuery] = useState('');
    const [loadingSubjects, setLoadingSubjects] = useState(true);
    const [loadingItems, setLoadingItems] = useState(false);

    // Carrega disciplinas ao montar
    useEffect(() => {
        getSubjectsWithCount().then(data => {
            setSubjects(data);
            setLoadingSubjects(false);
        });
    }, []);

    // Carrega jogos quando seleciona disciplina
    const handleSelectSubject = useCallback(async (name: string) => {
        setSelectedSubject(name);
        setQuery('');
        setLoadingItems(true);
        const data = await getItemsBySubject(name);
        setItems(data);
        setLoadingItems(false);
    }, []);

    // Busca dentro da disciplina selecionada
    const handleSearch = useCallback(async (value: string) => {
        setQuery(value);
        if (!selectedSubject) return;
        setLoadingItems(true);
        const data = value.length >= 2
            ? await getItemsBySubject(selectedSubject, value)
            : await getItemsBySubject(selectedSubject);
        setItems(data);
        setLoadingItems(false);
    }, [selectedSubject]);

    if (loadingSubjects) {
        return (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={28} className="text-purple-500 animate-spin" />
                <p className="text-sm text-gray-500">Carregando disciplinas...</p>
            </div>
        );
    }

    // Tela: grade de disciplinas
    if (!selectedSubject) {
        return (
            <div>
                <p className="text-sm text-gray-500 mb-4">Selecione a disciplina da aula:</p>
                <div className="grid grid-cols-2 gap-3">
                    {subjects.map(s => {
                        const style = getSubjectStyle(s.name);
                        return (
                            <button
                                key={s.name}
                                onClick={() => handleSelectSubject(s.name)}
                                className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${style.bg}`}
                            >
                                <span className="text-2xl">{style.emoji}</span>
                                <div>
                                    <p className={`font-bold text-sm leading-tight ${style.color}`}>{s.name}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{s.count} atividades</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }

    const style = getSubjectStyle(selectedSubject);

    // Tela: grade de jogos da disciplina
    return (
        <div>
            <button
                onClick={() => { setSelectedSubject(null); setItems([]); setQuery(''); }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-purple-600 mb-4 transition-colors"
            >
                <ChevronLeft size={16} />
                <span className={`font-semibold ${style.color}`}>{style.emoji} {selectedSubject}</span>
                <span className="text-gray-300">· trocar disciplina</span>
            </button>

            {/* Busca dentro da disciplina */}
            <div className="relative mb-4">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder={`Filtrar por nome em ${selectedSubject}...`}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {loadingItems && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
            </div>

            {loadingItems ? (
                <div className="flex justify-center py-8">
                    <Loader2 size={24} className="text-purple-500 animate-spin" />
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">Nenhuma atividade encontrada</div>
            ) : (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                    {items.map(item => {
                        const imgSrc = item.imageUrl
                            ? item.imageUrl.replace('https://dmrafr2igetxh.cloudfront.net', '/content')
                            : null;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item)}
                                className="group flex flex-col rounded-xl border-2 border-gray-100 hover:border-purple-400 overflow-hidden text-left transition-all hover:shadow-md bg-white"
                            >
                                <div className="h-24 bg-gray-100 relative overflow-hidden">
                                    {imgSrc ? (
                                        <img
                                            src={imgSrc}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Gamepad2 size={24} className="text-gray-300" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <div className="p-2">
                                    <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-purple-700 transition-colors">
                                        {item.title}
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{item.year || '—'}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ─── MODAL PRINCIPAL ──────────────────────────────────────────────────────────
export default function AddToPlanModal({ initialDay = 1, onClose }: AddToPlanModalProps) {
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [turma, setTurma] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState(initialDay);
    const [timeSlot, setTimeSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSelectItem = (item: Item) => {
        setSelectedItem(item);
        setStep(2);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedItem) { setError('Selecione uma atividade.'); return; }
        if (!turma.trim()) { setError('Informe a turma.'); return; }

        startTransition(async () => {
            try {
                await addToPlan({
                    turma: turma.trim(),
                    dayOfWeek,
                    timeSlot: timeSlot || undefined,
                    itemId: selectedItem.id,
                    notes: notes || undefined,
                });
                onClose();
            } catch {
                setError('Erro ao salvar. Tente novamente.');
            }
        });
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Stepper */}
                        <div className="flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 1 ? 'bg-purple-600 text-white' : 'bg-green-500 text-white'}`}>
                                {step === 1 ? '1' : <CheckCircle2 size={14} />}
                            </div>
                            <div className={`h-0.5 w-8 transition-colors ${step === 2 ? 'bg-purple-600' : 'bg-gray-200'}`} />
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step === 2 ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                2
                            </div>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">
                                {step === 1 ? 'Escolha a atividade' : 'Configure a aula'}
                            </h2>
                            <p className="text-xs text-gray-400">{step === 1 ? 'Passo 1 de 2' : 'Passo 2 de 2'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Fechar"
                        aria-label="Fechar modal"
                    >
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Corpo scrollável */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {step === 1 && (
                        <StepSelectGame onSelect={handleSelectItem} />
                    )}

                    {step === 2 && selectedItem && (
                        <form id="plan-form" onSubmit={handleSubmit} className="space-y-5">
                            {/* Resumo do jogo selecionado */}
                            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                                {selectedItem.imageUrl && (
                                    <img
                                        src={selectedItem.imageUrl.replace('https://dmrafr2igetxh.cloudfront.net', '/content')}
                                        alt={selectedItem.title}
                                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-purple-900 text-sm truncate">{selectedItem.title}</p>
                                    <p className="text-xs text-purple-500">{selectedItem.subject} · {selectedItem.year}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-xs text-purple-500 hover:text-purple-700 font-medium underline flex-shrink-0"
                                >
                                    Trocar
                                </button>
                            </div>

                            {/* Turma */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <span className="flex items-center gap-1.5"><Users size={14} /> Turma</span>
                                </label>
                                <input
                                    type="text"
                                    value={turma}
                                    onChange={e => setTurma(e.target.value)}
                                    placeholder="Ex: 3º Ano A, 5ª Turma B..."
                                    autoFocus
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Dia e Horário */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Dia da Semana</label>
                                    <select
                                        value={dayOfWeek}
                                        onChange={e => setDayOfWeek(Number(e.target.value))}
                                        title="Dia da semana"
                                        aria-label="Dia da semana"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                                    >
                                        {[1, 2, 3, 4, 5].map(d => (
                                            <option key={d} value={d}>{DIAS[d]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        <span className="flex items-center gap-1.5"><Clock size={14} /> Horário (opcional)</span>
                                    </label>
                                    <input
                                        type="time"
                                        value={timeSlot}
                                        onChange={e => setTimeSlot(e.target.value)}
                                        title="Horário da aula"
                                        aria-label="Horário da aula"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Observações */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    <span className="flex items-center gap-1.5"><FileText size={14} /> Observações (opcional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Objetivos da aula, material necessário..."
                                    rows={2}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                                />
                            </div>

                            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                        </form>
                    )}
                </div>

                {/* Footer com botões */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button
                        type="button"
                        onClick={step === 2 ? () => setStep(1) : onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {step === 2 ? '← Voltar' : 'Cancelar'}
                    </button>
                    {step === 2 && (
                        <button
                            type="submit"
                            form="plan-form"
                            disabled={isPending}
                            className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isPending
                                ? <><Loader2 size={14} className="animate-spin" /> Salvando...</>
                                : <><ArrowRight size={14} /> Salvar no Planejamento</>}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
