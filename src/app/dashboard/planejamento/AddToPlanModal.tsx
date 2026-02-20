'use client';

import { useState, useTransition, useCallback } from 'react';
import { X, Search, Clock, Users, FileText, Plus, Loader2, Gamepad2 } from 'lucide-react';
import { addToPlan, searchItemsForPlan } from '@/app/dashboard/planning-actions';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

interface Item {
    id: string;
    title: string;
    subject: string | null;
    year: string | null;
    imageUrl: string | null;
}

interface AddToPlanModalProps {
    initialDay?: number;
    onClose: () => void;
}

export default function AddToPlanModal({ initialDay = 1, onClose }: AddToPlanModalProps) {
    const [isPending, startTransition] = useTransition();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Item[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [turma, setTurma] = useState('');
    const [dayOfWeek, setDayOfWeek] = useState(initialDay);
    const [timeSlot, setTimeSlot] = useState('');
    const [notes, setNotes] = useState('');
    const [error, setError] = useState('');

    const handleSearch = useCallback(async (value: string) => {
        setQuery(value);
        if (value.length < 2) { setResults([]); return; }
        setSearching(true);
        try {
            const items = await searchItemsForPlan(value);
            setResults(items);
        } finally {
            setSearching(false);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!selectedItem) { setError('Selecione um jogo.'); return; }
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Plus size={18} className="text-purple-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Adicionar ao Planejamento</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Busca de Jogo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center gap-1.5"><Gamepad2 size={14} /> Jogo / Atividade</span>
                        </label>
                        {selectedItem ? (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                                <div className="flex-1">
                                    <p className="font-semibold text-purple-900 text-sm">{selectedItem.title}</p>
                                    <p className="text-xs text-purple-600">{selectedItem.subject} · {selectedItem.year}</p>
                                </div>
                                <button type="button" onClick={() => { setSelectedItem(null); setQuery(''); setResults([]); }} className="p-1 hover:bg-purple-100 rounded-lg transition-colors">
                                    <X size={14} className="text-purple-500" />
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    placeholder="Buscar por nome ou disciplina..."
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    autoFocus
                                />
                                {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
                                {results.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                        {results.map(item => (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => { setSelectedItem(item); setResults([]); setQuery(''); }}
                                                className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                                                <p className="text-xs text-gray-500">{item.subject} · {item.year}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {query.length >= 2 && !searching && results.length === 0 && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 p-4 text-center text-sm text-gray-500">
                                        Nenhum jogo encontrado
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Turma */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <span className="flex items-center gap-1.5"><Users size={14} /> Turma</span>
                        </label>
                        <input
                            type="text"
                            value={turma}
                            onChange={(e) => setTurma(e.target.value)}
                            placeholder="Ex: 3º Ano A, 5ª Turma B..."
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    {/* Dia e Horário */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Dia da Semana</label>
                            <select
                                value={dayOfWeek}
                                onChange={(e) => setDayOfWeek(Number(e.target.value))}
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
                                onChange={(e) => setTimeSlot(e.target.value)}
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
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Objetivos da aula, material necessário..."
                            rows={2}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isPending ? <><Loader2 size={14} className="animate-spin" /> Salvando...</> : 'Salvar no Planejamento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
