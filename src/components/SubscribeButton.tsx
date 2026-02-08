'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface SubscribeButtonProps {
    priceId: string;
    children: React.ReactNode;
    className?: string;
}

export default function SubscribeButton({ priceId, children, className }: SubscribeButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubscribe = () => {
        setLoading(true);
        // Redireciona para a página intermediária de checkout
        // O Middleware ou a própria página vai cuidar de verificar o login
        // e redirecionar de volta para cá (preservando a intenção de compra)
        router.push(`/checkout?priceId=${priceId}`);
    };

    return (
        <button
            onClick={handleSubscribe}
            disabled={loading}
            className={className}
        >
            {loading ? <Loader2 className="animate-spin" /> : children}
        </button>
    );
}
