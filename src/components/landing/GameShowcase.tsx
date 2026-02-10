import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, ArrowRight } from 'lucide-react';

interface Game {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    subject: string | null;
    year: string | null;
}

export default function GameShowcase({ games }: { games: Game[] }) {
    return (
        <section id="vitrine" className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Diversão que Ensina</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Nossa biblioteca cobre desde a Educação Infantil até o Ensino Médio,
                        com jogos de Matemática, Português, Ciências e muito mais.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {games.map((game) => (
                        <div key={game.id} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                            <div className="aspect-video bg-gray-200 group-hover:bg-purple-100 transition-colors flex items-center justify-center relative">
                                {game.imageUrl ? (
                                    <Image
                                        src={game.imageUrl}
                                        alt={game.title}
                                        fill
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                ) : (
                                    <Gamepad2 size={48} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                                )}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">{game.subject || 'Pedagógico'}</span>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">{game.year || 'EF'}</span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">
                                    {game.title}
                                </h3>
                                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                                    {game.description || 'Atividade interativa para trabalhar conceitos fundamentais de forma lúdica.'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <Link href="/login" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                        Ver biblioteca completa <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
