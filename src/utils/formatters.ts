/**
 * Mapa de normalização de anos/séries para nomes canônicos.
 * Isso garante que "Nível 1 – Infantil", "1º Nível – Educação Infantil", etc.
 * sejam todos convertidos para "Educação Infantil".
 */
const YEAR_ORDER = [
    'Educação Infantil',
    'Maternal',
    '1º Ano',
    '2º Ano',
    '3º Ano',
    '4º Ano',
    '5º Ano',
    '6º Ano',
    '7º Ano',
    '8º Ano',
    '9º Ano',
];

/**
 * Extrai e normaliza os anos/séries de uma string bruta do banco de dados.
 * Retorna um array de nomes canônicos únicos, ordenados pedagogicamente.
 */
function extractYears(raw: string): string[] {
    const found = new Set<string>();

    // Detecta "Educação Infantil", "Nível Infantil", "Maternal"
    if (/educação infantil|infantil|maternal/i.test(raw)) {
        // Distingue maternal
        if (/maternal/i.test(raw)) found.add('Maternal');
        else found.add('Educação Infantil');
    }

    // Detecta "Xº Ano" — ex: "1º Ano", "2º Ano", etc.
    const anoRegex = /(\d+)[°º]\s*Ano/gi;
    let match;
    while ((match = anoRegex.exec(raw)) !== null) {
        const n = parseInt(match[1]);
        if (n >= 1 && n <= 9) found.add(`${n}º Ano`);
    }

    // Detecta "Xº Nível" mapeado para ano equivalente (Nível 1 = 1º Ano EF)
    const nivelRegex = /(\d+)[°º]\s*N[íi]vel/gi;
    while ((match = nivelRegex.exec(raw)) !== null) {
        const n = parseInt(match[1]);
        if (n >= 1 && n <= 9) found.add(`${n}º Ano`);
    }

    // Ordena pedagogicamente conforme YEAR_ORDER
    return YEAR_ORDER.filter(y => found.has(y));
}

/**
 * Formata o array de anos em uma string amigável.
 * Ex: ["1º Ano", "2º Ano", "3º Ano"] → "1º ao 3º Ano"
 * Ex: ["1º Ano", "3º Ano"] → "1º e 3º Ano"
 * Ex: ["Educação Infantil"] → "Educação Infantil"
 */
function formatYearsArray(years: string[]): string {
    if (years.length === 0) return 'Educação Básica';
    if (years.length === 1) return years[0];

    // Verifica se são todos anos numerados para agrupar em intervalo
    const numericYears = years.filter(y => /\d/.test(y));
    if (numericYears.length === years.length && numericYears.length > 2) {
        const nums = numericYears.map(y => parseInt(y));
        const isSequential = nums.every((n, i) => i === 0 || n === nums[i - 1] + 1);
        if (isSequential) return `${nums[0]}º ao ${nums[nums.length - 1]}º Ano`;
    }

    if (years.length === 2) return `${years[0]} e ${years[1]}`;
    return `${years[0]} ao ${years[years.length - 1]}`;
}

/**
 * Converte uma string bruta de ano do banco de dados em um rótulo limpo e elegante.
 * Ex: "1º Ano - Ensino Fundamental I, 2º Ano - Ensino Fundamental I" → "1º e 2º Ano"
 */
export function simplifyYear(year: string | null): string {
    if (!year) return 'Educação Básica';
    const years = extractYears(year);
    return formatYearsArray(years);
}

/**
 * Limpa a descrição do jogo removendo informações de ano/série redundantes
 * que já estão visíveis em outros campos do card.
 * Ex: "Jogo educativo de Língua Portuguesa para 1º Ano – Ensino Fundamental I, ..."
 * → "Jogo educativo de Língua Portuguesa"
 */
export function cleanDescription(description: string | null): string {
    if (!description) return 'Recurso pedagógico interativo para engajar seus alunos.';

    // Remove o sufixo "para X Ano - Ensino Fundamental..." e variações
    let clean = description
        .replace(/\s+para\s+(\d+[°º]\s*N[íi]vel|Educação Infantil|Maternal)[\w\s,º°–\-–]+/gi, '.')
        .replace(/,?\s*\d+[°º]\s*(Ano|N[íi]vel)[\w\s,º°–\-–]*/gi, '')
        .replace(/\s+(–|-)\s+Ensino\s+Fundamental\s*(I|II)?/gi, '')
        .replace(/\s+(–|-)\s+Educação\s+Infantil/gi, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

    // Garante que termina com ponto
    if (clean && !clean.endsWith('.')) clean += '.';

    return clean || 'Recurso pedagógico interativo para engajar seus alunos.';
}

/**
 * Retorna o peso pedagógico de um campo "year" para ordenação.
 * Menor número = mais cedo na ordem educacional.
 */
export function getYearSortWeight(year: string | null): number {
    if (!year) return 99;
    const years = extractYears(year);
    if (years.length === 0) return 99;
    const first = years[0];
    const idx = YEAR_ORDER.indexOf(first);
    return idx >= 0 ? idx : 99;
}

/**
 * Retorna uma cor de badge baseada na matéria.
 */
export function getSubjectColor(subject: string | null): string {
    const s = (subject || '').toLowerCase();
    if (s.includes('português') || s.includes('linguagem') || s.includes('língua')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s.includes('matemática')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (s.includes('ciências') || s.includes('natureza')) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (s.includes('geografia')) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (s.includes('história')) return 'bg-red-100 text-red-700 border-red-200';
    if (s.includes('inglês')) return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    if (s.includes('artes') || s.includes('arte')) return 'bg-pink-100 text-pink-700 border-pink-200';
    if (s.includes('educação física') || s.includes('corpo') || s.includes('movimento')) return 'bg-cyan-100 text-cyan-700 border-cyan-200';
    return 'bg-purple-100 text-purple-700 border-purple-200';
}
