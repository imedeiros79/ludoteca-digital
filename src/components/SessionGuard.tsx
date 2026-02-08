'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import SessionConflictModal from './SessionConflictModal';

export default function SessionGuard() {
    const supabase = createClient();
    const [conflict, setConflict] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const checkInitialSession = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                // Escutar mudanças na tabela User em tempo real
                const channel = supabase
                    .channel('user-sessions')
                    .on(
                        'postgres_changes',
                        {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'User',
                            filter: `id=eq.${user.id}`
                        },
                        (payload: any) => {
                            const newSessionId = payload.new.currentSessionId;
                            const mySessionId = localStorage.getItem('ludoteca_session_id');

                            if (newSessionId && mySessionId && newSessionId !== mySessionId) {
                                console.log('CONFLITO DE SESSÃO DETECTADO!');
                                setConflict(true);
                                // Forçar logout no Supabase Auth também para este dispositivo
                                supabase.auth.signOut();
                            }
                        }
                    )
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        };

        checkInitialSession();
    }, []);

    if (conflict) {
        return <SessionConflictModal />;
    }

    return null;
}
