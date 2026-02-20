'use client';

import { useState, useTransition, useEffect, useCallback } from 'react';
import { X, Search, Clock, Users, FileText, Loader2, ChevronLeft, Gamepad2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { addToPlan, getSubjectsWithCount, getYearsBySubject, getItemsBySubject } from '@/app/dashboard/planning-actions';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const SUBJECT_STYLE: Record<string, { emoji: string; color: string; bg: string }> = {
    'Língua Portuguesa': { emoji: '📖', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200 hover:bg-blue-100' },
    'Matemática': { emoji: '📐', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200 hover:bg-orange-100' },
    'Ciências': { emoji: '🔬', color: 'text-green-700', bg: 'bg-green-50 border-green-200 hover:bg-green-100' },
    'História': { emoji: '🏛️', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100' },
    'Geografia': { emoji: '🌍', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200 hover:bg-teal-100' },
    'Arte': { emoji: '🎨', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
    'Artes': { emoji: '🎨', color: 'text-pink-700', bg: 'bg-pink-50 border-pink-200 hover:bg-pink-100' },
    'Educação Física': { emoji: '🏃', color: 'text-red-700', bg: 'bg-red-50 border-red-200 hover:bg-red-100' },
    'Inglês': { emoji: '🌐', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100' },
    'Ensino Religioso': { emoji: '🕊️', color: 'text-violet-700', bg: 'bg-violet-50 border-violet-200 hover:bg-violet-100' },
    'default': { emoji: '📚', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200 hover:bg-purple-100' },
};

function getSubjectStyle(name: string) {
    return SUBJECT_STYLE[name] || SUBJECT_STYLE['default'];
}

// Extrai a parte curta do ano para exibição no botão
// Ex: "1º Ano – Ensino Fundamental I" → "1º Ano"  |  "Pré-escola" → "Pré-escola"
function shortYear(year: string): string {
    return year.split(/[–\-]/)[0].trim();
}

interface Item {
    id: string;
    title: string;
    subject: string | null;
    year: string | null;
    imageUrl: string | null;
}

interface Subject { name: string; count: number; }

interface AddToPlanModalProps {
    initialDay?: number;
    onClose: () => void;
}

// ─── STEP 1: Disciplina ───────────────────────────────────────────────────────
function Step1Subject({ onSelect }: { onSelect: (s: string) => void }) {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getSubjectsWithCount().then(d => { setSubjects(d); setLoading(false); });
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 size={28} className="text-purple-500 animate-spin" />
            <p className="text-sm text-gray-500">Carregando disciplinas...</p>
        </div>
    );

    return (
        <div>
            <p className="text-sm text-gray-500 mb-4">Qual é a disciplina da aula?</p>
            <div className="grid grid-cols-2 gap-3">
                {subjects.map(s => {
                    const style = getSubjectStyle(s.name);
                    return (
                        <button
                            key={s.name}
                            onClick={() => onSelect(s.name)}
                            className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all ${style.bg}`}
                        >
                            <span className="text-2xl leading-none">{style.emoji}</span>
                            <div className="min-w-0">
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

// ─── STEP 2: Ano / Série ─────────────────────────────────────────────────────
function Step2Year({ subject, onSelect, onBack }: {
    subject: string;
    onSelect: (y: string) => void;
    onBack: () => void;
}) {
    const [years, setYears] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const style = getSubjectStyle(subject);

    useEffect(() => {
        getYearsBySubject(subject).then(d => { setYears(d); setLoading(false); });
    }, [subject]);

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 mb-4 transition-colors">
                <ChevronLeft size={16} />
                <span className={`font-semibold ${style.color}`}>{style.emoji} {subject}</span>
                <span className="text-gray-300">· trocar</span>
            </button>

            <p className="text-sm text-gray-500 mb-4">Para qual ano / série?</p>

            {loading ? (
                <div className="flex justify-center py-10"><Loader2 size={24} className="text-purple-500 animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {years.map(year => (
                        <button
                            key={year}
                            onClick={() => onSelect(year)}
                            className="flex flex-col items-start p-4 border-2 border-gray-100 hover:border-purple-400 hover:bg-purple-50 rounded-xl text-left transition-all"
                        >
                            <span className="text-2xl mb-1">📅</span>
                            <span className="font-bold text-sm text-gray-800 leading-tight">{shortYear(year)}</span>
                            <span className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{year}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── STEP 3: Jogos ────────────────────────────────────────────────────────────
function Step3Items({ subject, year, onSelect, onBack }: {
    subject: string;
    year: string;
    onSelect: (item: Item) => void;
    onBack: () => void;
}) {
    const [items, setItems] = useState<Item[]>([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const style = getSubjectStyle(subject);

    useEffect(() => {
        getItemsBySubject(subject, year).then(d => { setItems(d); setLoading(false); });
    }, [subject, year]);

    const handleSearch = useCallback(async (value: string) => {
        setQuery(value);
        setLoading(true);
        const data = await getItemsBySubject(subject, year, value.length >= 2 ? value : undefined);
        setItems(data);
        setLoading(false);
    }, [subject, year]);

    return (
        <div>
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-purple-600 mb-1 transition-colors">
                <ChevronLeft size={16} />
                <span className={`font-semibold ${style.color}`}>{style.emoji} {subject}</span>
                <span className="text-gray-400 mx-1">›</span>
                <span className="font-semibold text-gray-600">{shortYear(year)}</span>
                <span className="text-gray-300">· trocar</span>
            </button>

            <div className="relative mb-4 mt-3">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="Filtrar por nome..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
            </div>

            {loading ? (
                <div className="flex justify-center py-8"><Loader2 size={24} className="text-purple-500 animate-spin" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-400">Nenhuma atividade encontrada</div>
            ) : (
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
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
                                        <img src={imgSrc} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Gamepad2 size={24} className="text-gray-300" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-2">
                                    <p className="text-xs font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-purple-700 transition-colors">
                                        {item.title}
                                    </p>
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

    // Navegação das 3 etapas de seleção + etapa de configuração
    type ModalStep = 'subject' | 'year' | 'items' | 'config';
    const [step, setStep] = useState<ModalStep>('subject');
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);

    // Formulário
    const [turma, setTurma] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState(initialDay);
    const [timeSlot, setTimeSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    // Número do passo atual para o stepper visual
    const stepNumber = { subject: 1, year: 2, items: 3, config: 4 };
    const currentStepNum = stepNumber[step];

    const handleSelectSubject = (s: string) => { setSelectedSubject(s); setStep('year'); };
    const handleSelectYear = (y: string) => { setSelectedYear(y); setStep('items'); };
    const handleSelectItem = (i: Item) => { setSelectedItem(i); setStep('config'); };

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

    const stepLabels = ['Disciplina', 'Ano', 'Atividade', 'Configurar'];

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col">

                {/* ── Header com stepper ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Stepper de 4 passos */}
                        <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4].map((n, i) => (
                                <div key={n} className="flex items-center gap-1.5">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${n < currentStepNum ? 'bg-green-500 text-white' :
                                            n === currentStepNum ? 'bg-purple-600 text-white ring-2 ring-purple-200' :
                                                'bg-gray-100 text-gray-400'
                                        }`}>
                                        {n < currentStepNum ? <CheckCircle2 size={12} /> : n}
                                    </div>
                                    {i < 3 && <div className={`h-0.5 w-5 transition-colors ${n < currentStepNum ? 'bg-purple-400' : 'bg-gray-200'}`} />}
                                </div>
                            ))}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-900">{stepLabels[currentStepNum - 1]}</h2>
                            <p className="text-xs text-gray-400">Passo {currentStepNum} de 4</p>
                        </div>
                    </div>
                    <button onClick={onClose} title="Fechar" aria-label="Fechar modal" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* ── Corpo scrollável ── */}
                <div className="overflow-y-auto flex-1 px-6 py-5">
                    {step === 'subject' && <Step1Subject onSelect={handleSelectSubject} />}

                    {step === 'year' && selectedSubject && (
                        <Step2Year
                            subject={selectedSubject}
                            onSelect={handleSelectYear}
                            onBack={() => setStep('subject')}
                        />
                    )}

                    {step === 'items' && selectedSubject && selectedYear && (
                        <Step3Items
                            subject={selectedSubject}
                            year={selectedYear}
                            onSelect={handleSelectItem}
                            onBack={() => setStep('year')}
                        />
                    )}

                    {step === 'config' && selectedItem && (
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
                                    <p className="text-xs text-purple-500">{selectedItem.subject} · {selectedItem.year ? shortYear(selectedItem.year) : ''}</p>
                                </div>
                                <button type="button" onClick={() => setStep('items')} className="text-xs text-purple-500 hover:text-purple-700 font-medium underline flex-shrink-0">
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

                {/* ── Footer ── */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
                    <button
                        type="button"
                        onClick={() => {
                            if (step === 'subject') onClose();
                            else if (step === 'year') setStep('subject');
                            else if (step === 'items') setStep('year');
                            else if (step === 'config') setStep('items');
                        }}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        {step === 'subject' ? 'Cancelar' : '← Voltar'}
                    </button>
                    {step === 'config' && (
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
