'use client';

import Link from 'next/link';
import { Gamepad2 } from 'lucide-react';
import { useState } from 'react';

interface GameCardProps {
    id: string;
    title: string;
    imageUrl: string | null;
    subject: string | null;
    year: string | null;
    description: string | null;
}

export default function GameCard({ id, title, imageUrl, subject, year, description }: GameCardProps) {
    const imgSrc = imageUrl ? imageUrl.replace('https://dmrafr2igetxh.cloudfront.net', '/content') : null;
    const [imgError, setImgError] = useState(false);

    return (
        <Link href={`/jogar/${id}`} className="group block h-full">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                    {imgSrc && !imgError ? (
                        <div className="w-full h-full relative">
                            <img
                                src={imgSrc}
                                alt={title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                                onError={() => setImgError(true)}
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                            <Gamepad2 size={32} />
                        </div>
                    )}
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm max-w-[80%] truncate">
                        {subject || 'Geral'}
                    </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors line-clamp-2">
                        {title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{year || 'Ensino Fundamental'}</p>
                    <p className="text-sm text-gray-600 line-clamp-3 mt-auto">
                        {description || 'Sem descrição disponível.'}
                    </p>
                </div>
            </div>
        </Link>
    );
}
