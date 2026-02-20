'use client';

import { useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleFavorite } from '@/app/dashboard/favorites-actions';

interface FavoriteButtonProps {
    itemId: string;
    initialIsFavorite?: boolean;
}

export default function FavoriteButton({ itemId, initialIsFavorite = false }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isPending, startTransition] = useTransition();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Otimista: atualiza imediatamente na UI
        setIsFavorite(prev => !prev);

        startTransition(async () => {
            try {
                const result = await toggleFavorite(itemId);
                setIsFavorite(result.isFavorite);
            } catch {
                // Reverte se falhar
                setIsFavorite(prev => !prev);
            }
        });
    };

    return (
        <button
            onClick={handleClick}
            disabled={isPending}
            aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            className={`
                absolute top-2 left-2 z-10 p-1.5 rounded-full backdrop-blur-sm transition-all duration-200
                ${isFavorite
                    ? 'bg-red-500/90 text-white scale-110'
                    : 'bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 hover:bg-red-500/80 hover:text-white'
                }
                ${isPending ? 'scale-90' : ''}
            `}
        >
            <Heart
                size={14}
                className={`transition-all ${isFavorite ? 'fill-white' : ''}`}
            />
        </button>
    );
}
