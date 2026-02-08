// ... imports
import Link from 'next/link';
import { Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import { SignOutButton } from '@/components/SignOutButton';
import Filters from '@/components/Filters';
import GameCard from '@/components/GameCard';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Dashboard({
    searchParams,
}: {
    searchParams?: Promise<{
        q?: string;
        year?: string;
        subject?: string;
        page?: string;
    }>;
}) {
    // Await params in case of Next.js 15+
    const params = await searchParams;

    const query = params?.q || '';
    const yearFilter = params?.year;
    const subjectFilter = params?.subject;
    const page = Number(params?.page) || 1;
    const itemsPerPage = 40;
    const skip = (page - 1) * itemsPerPage;

    // Conditions
    const whereCondition: any = {
        AND: [
            // Search query
            query ? {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                ]
            } : {},
            // Filters
            yearFilter ? { year: { contains: yearFilter } } : {}, // Changed to contains for smart filtering
            subjectFilter ? { subject: subjectFilter } : {},
        ]
    };

    // Get Data and Count
    const [games, totalCount] = await Promise.all([
        prisma.item.findMany({
            where: whereCondition,
            take: itemsPerPage,
            skip: skip,
            orderBy: { createdAt: 'desc' },
        }),
        prisma.item.count({ where: whereCondition })
    ]);

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Get distinct subjects only
    const allSubjects = await prisma.item.findMany({
        select: { subject: true },
        distinct: ['subject'],
        orderBy: { subject: 'asc' }
    });

    const validSubjects = allSubjects
        .map(i => i.subject)
        .filter((s): s is string => !!s && s.length > 0);

    // Construct plain object for query params to avoid symbol error
    const getQueryParams = (newPage: number) => {
        const qParams: Record<string, string> = { page: newPage.toString() };
        if (query) qParams.q = query;
        if (yearFilter) qParams.year = yearFilter;
        if (subjectFilter) qParams.subject = subjectFilter;
        return qParams;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-2 text-purple-600 font-bold text-xl">
                    <Gamepad2 />
                    <span className="hidden sm:inline">Ludoteca Digital</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                            P
                        </div>
                        <span className="text-sm text-gray-600 hidden md:inline">Professor(a)</span>
                    </div>
                    <SignOutButton />
                </div>
            </nav>

            <main className="container mx-auto px-4 sm:px-6 py-8 flex-1">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Acervo de Jogos ({totalCount})</h1>
                        <p className="text-gray-600">Explore os recursos pedagógicos disponíveis.</p>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <SearchInput />
                        <Filters subjects={validSubjects} />
                    </div>
                </div>

                {/* Grid de Jogos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
                    {games.map((game) => (
                        <GameCard
                            key={game.id}
                            id={game.id}
                            title={game.title}
                            imageUrl={game.imageUrl}
                            subject={game.subject}
                            year={game.year}
                            description={game.description}
                        />
                    ))}
                </div>

                {games.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="inline-flex bg-gray-50 p-4 rounded-full mb-4">
                            <Gamepad2 size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Nenhum jogo encontrado</h3>
                        <p className="text-gray-500">Tente ajustar seus filtros ou busca.</p>
                    </div>
                )}

                {/* Paginação */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8 pb-8">
                        <Link
                            href={{ query: getQueryParams(page > 1 ? page - 1 : 1) }}
                            className={`p-2 rounded-lg border ${page <= 1 ? 'pointer-events-none opacity-50 border-gray-200' : 'hover:bg-white border-gray-300 bg-white'}`}
                        >
                            <ChevronLeft size={20} />
                        </Link>

                        <span className="text-sm font-medium text-gray-600">
                            Página {page} de {totalPages}
                        </span>

                        <Link
                            href={{ query: getQueryParams(page < totalPages ? page + 1 : totalPages) }}
                            className={`p-2 rounded-lg border ${page >= totalPages ? 'pointer-events-none opacity-50 border-gray-200' : 'hover:bg-white border-gray-300 bg-white'}`}
                        >
                            <ChevronRight size={20} />
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
