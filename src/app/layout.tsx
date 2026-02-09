import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Ludoteca Digital | 1.431 Jogos Educativos Interativos BNCC',
  description: 'Acesse o maior acervo de jogos educativos do Brasil. 1.431 recursos pedagógicos interativos em HTML5 totalmente alinhados à BNCC para aulas inovadoras.',
  keywords: ['jogos educativos', 'objetos de aprendizagem', 'BNCC', 'aulas interativas', 'recursos pedagógicos', 'educação infantil', 'ensino fundamental', 'ludoteca digital', 'professores'],
  authors: [{ name: 'Ludoteca Digital' }],
  creator: 'Ludoteca Digital',
  publisher: 'Ludoteca Digital',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://ludoteca-digital.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Ludoteca Digital | Transforme suas aulas com Jogos Interativos',
    description: '1.431 recursos pedagógicos alinhados à BNCC para engajar seus alunos.',
    url: 'https://ludoteca-digital.vercel.app',
    siteName: 'Ludoteca Digital',
    locale: 'pt_BR',
    type: 'website',
  },
  verification: {
    google: 'eg4EWRYu_y_1lwRF6im07bDLGlLhAtxqTg12NnLuSbs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ludoteca Digital | 1.431 Jogos Educativos BNCC',
    description: 'Engaje seus alunos com jogos interativos HTML5.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
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
