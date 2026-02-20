import Link from 'next/link';
import { Gamepad2, Heart, BookOpen, Trophy, Star } from 'lucide-react';
import { SignOutButton } from '@/components/SignOutButton';
import GameCard from '@/components/GameCard';
import { getFavoriteItems, getUserFavoriteIds } from '@/app/dashboard/favorites-actions';
import { createClient } from '@/utils/supabase/server';
import prisma from '@/lib/prisma';
import { Settings, LayoutDashboard, CalendarDays } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function FavoritosPage() {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) return null;

    const dbUser = await prisma.user.findUnique({ where: { email: authUser.email! } });
    const isVIP = dbUser?.subscriptionStatus === 'active' || dbUser?.email === 'imedeiros@outlook.com';

    const [items, favoriteIds] = await Promise.all([
        getFavoriteItems(),
        getUserFavoriteIds(),
    ]);

    const favoriteSet = new Set(favoriteIds);

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
                        <Link href="/dashboard/favoritos" className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold border border-red-100">
                            <Heart size={15} className="fill-red-500" /> Favoritos
                        </Link>
                        {isVIP && (
                            <Link href="/dashboard/planejamento" className="flex items-center gap-2 px-3 py-1.5 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
                                <CalendarDays size={15} /> Planejamento
                            </Link>
                        )}
                    </div>
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
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                        <Heart size={20} className="text-red-500 fill-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Meus Favoritos</h1>
                        <p className="text-gray-500 text-sm">
                            {items.length === 0 ? 'Nenhum favorito ainda' : `${items.length} ${items.length === 1 ? 'jogo favoritado' : 'jogos favoritados'}`}
                        </p>
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="inline-flex bg-red-50 p-5 rounded-full mb-4">
                            <Heart size={36} className="text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum favorito ainda</h3>
                        <p className="text-gray-500 mb-6 max-w-xs mx-auto">
                            Explore o acervo e clique no ❤️ nos jogos que quiser guardar aqui.
                        </p>
                        <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors">
                            <Star size={16} /> Explorar Acervo
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {items.map((game) => (
                            <GameCard
                                key={game.id}
                                id={game.id}
                                title={game.title}
                                imageUrl={game.imageUrl}
                                subject={game.subject}
                                year={game.year}
                                description={game.description}
                                isFavorite={favoriteSet.has(game.id)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
