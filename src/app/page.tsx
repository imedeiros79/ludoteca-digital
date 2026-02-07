import Link from 'next/link';
import { Gamepad2, BookOpen, Star, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Home() {
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

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-sm font-medium mb-8 animate-fade-in-up">
            <Star size={16} className="fill-purple-700" />
            <span>O maior acervo do Brasil</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-gray-900">
            Transforme suas aulas com <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              1.442 Jogos Educativos
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Engaje seus alunos com objetos de aprendizagem interativos HTML5,
            totalmente alinhados à BNCC. A ferramenta definitiva para professores inovadores.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="#precos" className="w-full sm:w-auto px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold text-lg hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 flex items-center justify-center gap-2">
              Começar Agora <ArrowRight size={20} />
            </Link>
            <a href="#vitrine" className="w-full sm:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold text-lg hover:border-purple-200 hover:bg-purple-50 transition-all flex items-center justify-center">
              Ver Exemplos
            </a>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Recursos', value: '1.442+' },
              { label: 'Matérias', value: 'Todas' },
              { label: 'Alinhamento', value: 'BNCC' },
              { label: 'Uso', value: 'Ilimitado' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vitrine Preview */}
      <section id="vitrine" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Diversão que Ensina</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Nossa biblioteca cobre desde a Educação Infantil até o Ensino Médio,
              com jogos de Matemática, Português, Ciências e muito mais.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300">
                <div className="aspect-video bg-gray-200 group-hover:bg-purple-100 transition-colors flex items-center justify-center relative">
                  <Gamepad2 size={48} className="text-gray-400 group-hover:text-purple-500 transition-colors" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-medium">Matemática</span>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded font-medium">EF</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                    Jogo Educativo Exemplo {item}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Atividade interativa para trabalhar conceitos fundamentais de forma lúdica.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/login" className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors">
              Ver biblioteca completa <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Investimento Acessível</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Tenha acesso ilimitado a todo o acervo por um valor menor que um lanche.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Mensal */}
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 hover:border-purple-500 transition-all">
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Mensal</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">R$ 29,90</span>
                <span className="text-gray-400">/mês</span>
              </div>
              <ul className="space-y-4 mb-8 text-gray-300">
                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-400" /> Acesso a 1.442 Jogos</li>
                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-400" /> Filtros por BNCC</li>
                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-green-400" /> Cancele quando quiser</li>
              </ul>
              <button className="w-full py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors">
                Assinar Mensal
              </button>
            </div>

            {/* Anual */}
            <div className="bg-gradient-to-b from-purple-900 to-purple-950 rounded-2xl p-8 border border-purple-500 relative transform hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                MAIS POPULAR
              </div>
              <h3 className="text-xl font-semibold text-purple-200 mb-2">Anual</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">R$ 299,00</span>
                <span className="text-purple-200">/ano</span>
              </div>
              <p className="text-sm text-purple-200 mb-6 bg-purple-800/50 p-2 rounded">
                Economize R$ 59,80 (2 meses grátis)
              </p>
              <ul className="space-y-4 mb-8 text-purple-100">
                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-amber-400" /> Todos os benefícios do Mensal</li>
                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-amber-400" /> Suporte Prioritário</li>
                <li className="flex items-center gap-3"><CheckCircle size={20} className="text-amber-400" /> Acesso antecipado a novidades</li>
              </ul>
              <button className="w-full py-4 bg-white text-purple-900 hover:bg-gray-100 rounded-xl font-bold transition-colors shadow-lg">
                Assinar Anual
              </button>
            </div>
          </div>

          <div className="mt-12 text-center flex items-center justify-center gap-2 text-gray-400 text-sm">
            <ShieldCheck size={16} /> Pagamento 100% seguro via Stripe
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
            <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center text-white">
              <Gamepad2 size={14} />
            </div>
            <span className="font-bold text-gray-600">Ludoteca Digital</span>
          </div>
          <div className="flex justify-center gap-8 mb-8 text-sm text-gray-500">
            <Link href="/termos" className="hover:text-purple-600 transition-colors">Termos de Uso</Link>
            <Link href="/privacidade" className="hover:text-purple-600 transition-colors">Política de Privacidade</Link>
            <Link href="#" className="hover:text-purple-600 transition-colors">Contato</Link>
          </div>
          <p className="text-xs text-gray-400">
            &copy; {new Date().getFullYear()} Ludoteca Digital. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
