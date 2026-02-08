import Link from 'next/link';
import { Gamepad2, ChevronLeft, ChevronRight, ArrowRight, Settings, LayoutDashboard, MessageCircle } from 'lucide-react';
import SearchInput from '@/components/SearchInput';
import { SignOutButton } from '@/components/SignOutButton';
import Filters from '@/components/Filters';
import GameCard from '@/components/GameCard';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';

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
    // 1. Verificar Usuário no Supabase
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    // 2. Garantir usuário no Prisma e pegar status
    const dbUser = authUser ? await prisma.user.upsert({
        where: { email: authUser.email! },
        update: {},
        create: {
            id: authUser.id,
            email: authUser.email!,
            subscriptionStatus: 'inactive',
        }
    }) : null;

    const isVIP = dbUser?.subscriptionStatus === 'active' || dbUser?.email === 'imedeiros@outlook.com';

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
    let games: any[] = [];
    let totalCount = 0;

    try {
        const [gamesRes, countRes] = await Promise.all([
            prisma.item.findMany({
                where: whereCondition,
                take: isVIP ? itemsPerPage : 3, // Somente 3 jogos se não for VIP
                skip: skip,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.item.count({ where: whereCondition })
        ]);
        games = gamesRes;
        // Se não for VIP, mostra o menor entre o total real e 3. 
        // Se countRes for 0, mostra 0. Se for 100, mostra 3.
        totalCount = isVIP ? countRes : Math.min(countRes, 3);
    } catch (error: any) {
        console.error('Erro ao carregar Dashboard:', error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
                    <div className="text-red-500 mb-4 text-5xl">⚠️</div>
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Erro de Conexão</h1>
                    <p className="text-gray-600 mb-4">
                        Não conseguimos conectar ao banco de dados. Verifique se todas as chaves (DATABASE_URL e DIRECT_URL) estão corretas na Vercel.
                    </p>
                    <code className="block bg-gray-100 p-2 rounded text-xs text-left overflow-auto mb-4">
                        {error.message || 'Erro desconhecido'}
                    </code>
                    <a href="/dashboard" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg font-medium">
                        Tentar Novamente
                    </a>
                </div>
            </div>
        );
    }

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
            <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-purple-600 font-bold text-xl">
                        <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white">
                            <Gamepad2 size={20} />
                        </div>
                        <span className="hidden sm:inline">Ludoteca Digital</span>
                    </div>

                    {/* Admin Shortcut */}
                    {dbUser?.email === 'imedeiros@outlook.com' && (
                        <Link href="/admin" className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-colors">
                            <LayoutDashboard size={14} /> PAINEL ADM
                        </Link>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden md:block">
                            <div className="text-xs font-bold text-gray-900">{dbUser?.email}</div>
                            <div className={`text-[10px] font-black uppercase tracking-tighter ${isVIP ? 'text-green-600' : 'text-amber-500'}`}>
                                {isVIP ? 'Assinatura VIP' : 'Acesso Limitado'}
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold">
                            {dbUser?.email?.[0].toUpperCase()}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/profile" className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                            <Settings size={16} /> <span className="hidden sm:inline">Minha Conta</span>
                        </Link>
                        <SignOutButton />
                    </div>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8 relative">
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

                    {/* Paywall Overlay para não-VIPs */}
                    {!isVIP && (
                        <div className="md:col-span-2 lg:col-span-4 mt-8">
                            <div className="bg-gradient-to-r from-purple-700 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div className="text-center md:text-left flex-1">
                                        <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
                                            Libere +1.400 Jogos Educativos! 🚀
                                        </h2>
                                        <p className="text-purple-100 text-lg mb-6 max-w-xl">
                                            Você está vendo apenas uma prévia. Assine agora e tenha acesso ilimitado ao maior acervo pedagógico do Brasil por menos de um lanche por mês.
                                        </p>
                                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                            <Link href="/#precos" className="px-8 py-4 bg-white text-purple-700 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg flex items-center gap-2">
                                                Assinar Agora
                                                <ArrowRight size={20} />
                                            </Link>
                                            <a href="https://wa.me/5531972198551" target="_blank" rel="noopener noreferrer" className="px-8 py-4 bg-purple-600/50 border border-purple-400 text-white rounded-xl font-bold text-lg hover:bg-purple-600/70 transition-all backdrop-blur-sm">
                                                Falar com Suporte
                                            </a>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block w-64 h-64 bg-white/10 rounded-full blur-3xl absolute -right-20 -top-20"></div>
                                </div>
                            </div>
                        </div>
                    )}
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

                {/* Paginação (Somente VIP) */}
                {isVIP && totalPages > 1 && (
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
