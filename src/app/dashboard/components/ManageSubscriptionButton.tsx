'use client'

import { createPortalSession } from '../actions';
import { Settings, Loader2 } from 'lucide-react';
import { useState } from 'react';

export function ManageSubscriptionButton() {
    const [loading, setLoading] = useState(false);

    const handleManage = async () => {
        setLoading(true);
        try {
            await createPortalSession();
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleManage}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : (
                <Settings size={16} />
            )}
            Minha Assinatura
        </button>
    );
}
