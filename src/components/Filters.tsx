'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';
import { useState } from 'react';

interface FiltersProps {
    subjects: string[];
}

export default function Filters({ subjects }: FiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isOpen, setIsOpen] = useState(false);

    // Get current values
    const currentYear = searchParams.get('year') || '';
    const currentSubject = searchParams.get('subject') || '';

    const applyFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset page on filter change
        params.delete('page');
        router.push(`/dashboard?${params.toString()}`);
    };

    const clearFilters = () => {
        router.push('/dashboard');
    };

    // Hardcoded standard filters for neatness
    // DB uses degree symbol '°' (U+00B0) based on debug, but standard is 'º' (U+00BA).
    // We will use the DB format for value to ensure matching.
    const PREDEFINED_YEARS = [
        { label: "Educação Infantil", value: "Educação Infantil" },
        { label: "1º Ano", value: "1° Ano" },
        { label: "2º Ano", value: "2° Ano" },
        { label: "3º Ano", value: "3° Ano" },
        { label: "4º Ano", value: "4° Ano" },
        { label: "5º Ano", value: "5° Ano" },
        { label: "6º Ano", value: "6° Ano" },
        { label: "7º Ano", value: "7° Ano" },
        { label: "8º Ano", value: "8° Ano" },
        { label: "9º Ano", value: "9° Ano" }
    ];

    const sortedSubjects = [...subjects].sort();

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Fechar filtros" : "Abrir filtros"}
                title="Filtrar jogos"
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm ${currentYear || currentSubject ? 'border-purple-500 text-purple-700 bg-purple-50' : 'border-gray-300 text-gray-700 bg-white'
                    }`}
            >
                <Filter size={18} />
                <span className="hidden sm:inline">Filtros</span>
                <span className="sr-only">Abrir menu de filtros</span>
                {(currentYear || currentSubject) && (
                    <span className="flex h-2 w-2 rounded-full bg-purple-600"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-12 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-5 z-20 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">Filtrar Jogos</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                            aria-label="Fechar filtros"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Ano / Etapa */}
                        <div>
                            <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-1">Ano / Etapa</label>
                            <select
                                id="year-select"
                                value={currentYear}
                                onChange={(e) => applyFilter('year', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                            >
                                <option value="">Todos os anos</option>
                                {PREDEFINED_YEARS.map((item) => (
                                    <option key={item.value} value={item.value}>{item.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Componente Curricular */}
                        <div>
                            <label htmlFor="subject-select" className="block text-sm font-medium text-gray-700 mb-1">Matéria</label>
                            <select
                                id="subject-select"
                                value={currentSubject}
                                onChange={(e) => applyFilter('subject', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                            >
                                <option value="">Todas as matérias</option>
                                {sortedSubjects.map((subj) => (
                                    <option key={subj} value={subj}>{subj}</option>
                                ))}
                            </select>
                        </div>

                        {(currentYear || currentSubject) && (
                            <button
                                onClick={clearFilters}
                                aria-label="Limpar todos os filtros"
                                className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Limpar Filtros
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
