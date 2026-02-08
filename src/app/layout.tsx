import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ludoteca Digital - O Maior Acervo de Objetos de Aprendizagem',
  description: 'Acesse 1.431 recursos educativos interativos alinhados à BNCC.',
};

import SessionGuard from '@/components/SessionGuard';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
        <SessionGuard />
      </body>
    </html>
  );
}
