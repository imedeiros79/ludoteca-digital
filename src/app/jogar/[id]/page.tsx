import { PrismaClient } from '@prisma/client';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MonitorPlay, Maximize2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

const prisma = new PrismaClient();

interface Props {
    params: {
        id: string;
    };
}

// O componente deve ser assíncrono para Server Components
export default async function PlayerPage({ params }: Props) {
    // Acesso seguro aos params (em Next 15+ espera-se await, mas no 14/standard ainda é direto ou via prop. Vamos usar direto pois params é prop).
    // Nota: Next.js 15 pode exigir await params. Por garantia em versões recentes:
    const { id } = await Promise.resolve(params);

    // Verificar Auth
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const game = await prisma.item.findUnique({
        where: { id },
    });

    if (!game) {
        notFound();
    }

    // Converter URL do CloudFront para URL interna segura
    // Original: https://dmrafr2igetxh.cloudfront.net/todas/...
    // Rewrite: /content/todas/...
    const safeUrl = game.gameUrl.replace('https://dmrafr2igetxh.cloudfront.net', '/content');

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header Escuro */}
            <header className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className="p-2 hover:bg-gray-700 rounded-full transition-colors">
                        <ArrowLeft />
                    </Link>
                    <div>
                        <h1 className="font-bold text-lg leading-tight">{game.title}</h1>
                        <span className="text-xs text-gray-400">{game.subject} • {game.year}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Placeholder para controles futuros */}
                    <div className="text-sm text-gray-400 hidden md:block">
                        Modo Sala de Aula
                    </div>
                </div>
            </header>

            {/* Área do Jogo */}
            <main className="flex-1 relative overflow-hidden flex items-center justify-center bg-black">
                <iframe
                    src={safeUrl}
                    title={`Jogo educativo: ${game.title}`}
                    className="w-full h-full border-0 absolute inset-0"
                    allowFullScreen
                    allow="autoplay; fullscreen; accelerometer; gyroscope; encrypted-media" // Permissões comuns para jogos
                />
            </main>

            {/* Footer com Descrição (Opcional, estilo 'YouTube') */}
            <div className="bg-gray-800 text-gray-300 px-6 py-4 text-sm border-t border-gray-700">
                <p><strong>Objetivo Pedagógico:</strong> {game.description}</p>
                {game.bncc && <p className="mt-1 text-xs text-gray-500">BNCC: {game.bncc}</p>}
            </div>
        </div>
    );
}
