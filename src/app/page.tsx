import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { Gamepad2, Star, ArrowRight } from 'lucide-react';
import prisma from '@/lib/prisma';

export const metadata = {
  alternates: {
    canonical: '/',
  },
};

// Importações Dinâmicas (Lazy Loading) para o Mobile voar
const Benefits = dynamic(() => import('@/components/landing/Benefits'));
const GameShowcase = dynamic(() => import('@/components/landing/GameShowcase'));
const Testimonials = dynamic(() => import('@/components/landing/Testimonials'));
const Pricing = dynamic(() => import('@/components/landing/Pricing'));
const FAQ = dynamic(() => import('@/components/landing/FAQ'));
const Footer = dynamic(() => import('@/components/landing/Footer'));

export default async function Home() {
  // Buscar 6 jogos reais para a vitrine
  const showcaseGames = await prisma.item.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-purple-500 selection:text-white">
      {/* Header / Nav */}
      <header className="fixed w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white">
              <Gamepad2 size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
              Ludoteca Digital
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#vitrine" className="hover:text-purple-600 transition-colors">Jogos</a>
            <Link href="/blog" className="hover:text-purple-600 transition-colors">Blog</Link>
            <a href="#precos" className="hover:text-purple-600 transition-colors">Planos</a>
            <Link href="/login" className="px-4 py-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors">
              Entrar
            </Link>
            <Link href="#precos" className="px-5 py-2.5 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">
              Assinar Agora
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section - MANTIDO NO ARQUIVO PARA LCP RÁPIDO */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-[80vh] flex items-center">
        {/* Imagem de Fundo (Banner) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/banner.png"
            alt="Banner Educativo"
            fill
            className="object-cover"
            priority
            sizes="100vw"
            quality={85}
          />
          {/* Overlay Refinado: Reduzido para 25% para máxima visibilidade da imagem, com gradiente suave */}
          <div className="absolute inset-0 bg-white/25 bg-gradient-to-b from-white/10 via-white/40 to-gray-50"></div>
        </div>

        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-600/10 text-purple-800 text-sm font-bold mb-8 backdrop-blur-md border border-purple-200/50">
            <Star size={16} className="fill-purple-700" />
            <span>O maior acervo do Brasil</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900 drop-shadow-[0_2px_10px_rgba(255,255,255,0.8)]">
            Transforme suas aulas com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-blue-600">
              1.431 Jogos Educativos
            </span>
          </h1>
          <p className="text-xl text-gray-800 mb-10 max-w-2xl mx-auto leading-relaxed font-bold drop-shadow-[0_1px_5px_rgba(255,255,255,0.5)]">
            Engaje seus alunos com objetos de aprendizagem interativos HTML5,
            totalmente alinhados à BNCC. A ferramenta definitiva para professores inovadores.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#precos" className="w-full sm:w-auto px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 flex items-center justify-center gap-2">
              Começar Agora <ArrowRight size={20} />
            </Link>
            <a href="#vitrine" className="w-full sm:w-auto px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-purple-200 hover:bg-white transition-all flex items-center justify-center">
              Ver Exemplos
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200/50 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Recursos', value: '1.431' },
              { label: 'Matérias', value: 'Todas' },
              { label: 'Alinhamento', value: 'BNCC' },
              { label: 'Uso', value: 'Ilimitado' },
            ].map((stat, i) => (
              <div key={i} className="backdrop-blur-sm bg-white/30 p-4 rounded-2xl border border-white/50">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seções Carregadas Dinamicamente (Lazy Loading) */}
      <Benefits />
      <GameShowcase games={showcaseGames} />
      <Testimonials />
      <Pricing />
      <FAQ />

      {/* Structured Data (SEO) - Otimizado como JSON estático onde possível */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Como recebo o acesso?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "O acesso é imediato após a confirmação do pagamento. Você receberá os dados por e-mail e poderá usar o sistema imediatamente."
                }
              },
              {
                "@type": "Question",
                "name": "Os jogos funcionam no celular?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sim! Todos os nossos jogos são desenvolvidos em HTML5, o que garante funcionamento perfeito em celulares, tablets e computadores."
                }
              },
              {
                "@type": "Question",
                "name": "Posso cancelar a assinatura?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Sim, você pode cancelar a qualquer momento diretamente pelo painel do usuário, sem burocracia ou taxas de cancelamento."
                }
              },
              {
                "@type": "Question",
                "name": "Preciso baixar os jogos?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Não, todo o nosso acervo é online. Isso garante que você sempre tenha a versão mais atualizada e não ocupe espaço no seu dispositivo."
                }
              }
            ]
          })
        }}
      />

      <Footer />
    </div>
  );
}
