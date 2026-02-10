'use client';

import dynamic from 'next/dynamic';

const SessionGuard = dynamic(() => import('@/components/SessionGuard'), {
    ssr: false
});

export default function SessionGuardWrapper() {
    return <SessionGuard />;
}
