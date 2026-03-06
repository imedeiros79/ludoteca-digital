/**
 * Simplifica strings de anos/séries para exibição em cards.
 * Ex: "1º Ano - Ensino Fundamental I, 2º Ano - Ensino Fundamental I" -> "1º e 2º Ano"
 */
export function simplifyYear(year: string | null): string {
    if (!year) return 'Educação Básica';

    // Remove termos repetitivos e excessivos
    const cleanYear = year
        .replace(/-?\s?Ensino Fundamental\s?(I|II)?/gi, '')
        .replace(/Educação Infantil/gi, 'Infantil')
        .trim();

    const parts = cleanYear.split(/[,;]/).map(p => p.trim()).filter(Boolean);

    if (parts.length === 0) return 'Fundamental';

    // Se tiver muitos anos, tenta simplificar para um intervalo
    if (parts.length > 2) {
        const nums = parts.map(p => parseInt(p.match(/\d+/)?.[0] || '0')).filter(n => n > 0).sort((a, b) => a - b);
        if (nums.length > 0 && nums[nums.length - 1] - nums[0] === nums.length - 1) {
            return `${nums[0]}º ao ${nums[nums.length - 1]}º Ano`;
        }
    }

    // Retorna os dois primeiros ou o único
    if (parts.length <= 2) return parts.join(' e ');

    return `${parts[0]} e outros`;
}

/**
 * Retorna uma cor de badge baseada na matéria
 */
export function getSubjectColor(subject: string | null): string {
    const s = (subject || '').toLowerCase();
    if (s.includes('português')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('matemática')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('ciências')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s.includes('geografia')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s.includes('história')) return 'bg-red-100 text-red-700 border-red-200';
    if (s.includes('inglês')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (s.includes('artes')) return 'bg-pink-100 text-pink-700 border-pink-200';

    return 'bg-purple-100 text-purple-700 border-purple-200';
}
