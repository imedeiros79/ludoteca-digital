'use client';

import Link from 'next/link';
import { Gamepad2, GraduationCap, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import FavoriteButton from '@/components/FavoriteButton';
import { simplifyYear, cleanDescription, getSubjectColor } from '@/utils/formatters';

interface GameCardProps {
    id: string;
    title: string;
    imageUrl: string | null;
    subject: string | null;
    year: string | null;
    description: string | null;
    isFavorite?: boolean;
}

export default function GameCard({ id, title, imageUrl, subject, year, description, isFavorite }: GameCardProps) {
    const imgSrc = imageUrl ? imageUrl.replace('https://dmrafr2igetxh.cloudfront.net', '/content') : null;
    const [imgError, setImgError] = useState(false);

    // Formatação amigável
    const shortYear = simplifyYear(year);
    const cleanDesc = cleanDescription(description);
    const badgeStyle = getSubjectColor(subject);

    return (
        <Link href={`/jogar/${id}`} className="group block h-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                {/* Thumbnail Section */}
                <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                    {imgSrc && !imgError ? (
                        <img
                            src={imgSrc}
                            alt={title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={() => setImgError(true)}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Gamepad2 size={40} strokeWidth={1.5} />
                        </div>
                    )}

                    {/* Floating Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-md ${badgeStyle}`}>
                            {subject || 'Geral'}
                        </span>
                    </div>

                    {isFavorite !== undefined && (
                        <div className="absolute top-3 right-3">
                            <FavoriteButton itemId={id} initialIsFavorite={isFavorite} />
                        </div>
                    )}

                    {/* Play Overlay */}
                    <div className="absolute inset-0 bg-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-600 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                            <ArrowRight size={24} />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-5 flex-1 flex flex-col">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 mb-2 uppercase tracking-wider">
                        <GraduationCap size={14} className="text-purple-500" />
                        {shortYear}
                    </div>

                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2 group-hover:text-purple-700 transition-colors line-clamp-2">
                        {title}
                    </h3>

                    <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
                        {cleanDesc}
                    </p>

                    {/* Bottom Action */}
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-600 group-hover:underline">Acessar Jogo</span>
                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-purple-50 group-hover:text-purple-500 transition-colors">
                            <ArrowRight size={14} />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
