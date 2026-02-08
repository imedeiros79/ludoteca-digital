'use client';

import { LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export function SignOutButton() {
    const router = useRouter();
    const supabase = createClient();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            className="text-gray-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
            title="Sair"
        >
            <LogOut size={20} />
        </button>
    );
}
