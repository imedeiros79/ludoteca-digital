'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Gamepad2, Loader2, Mail, Lock, ArrowRight, User, Phone, FileText } from 'lucide-react'
import { signUpAction, updateSessionAction } from './actions'

function LoginContent() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    // Campos novos para cadastro
    const [name, setName] = useState('')
    const [cpf, setCpf] = useState('')
    const [phone, setPhone] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [view, setView] = useState<'signin' | 'signup'>('signin')
    const router = useRouter()
    const supabase = createClient()
    const searchParams = useSearchParams()
    const next = searchParams.get('next')

    // Formatters
    const formatCPF = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const formatPhone = (value: string) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const registerSession = async () => {
        const sessionId = crypto.randomUUID();
        localStorage.setItem('ludoteca_session_id', sessionId);
        await updateSessionAction(sessionId);
    }

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (view === 'signup') {
                // Usar Server Action para cadastro completo
                const result = await signUpAction({
                    email,
                    password,
                    name,
                    cpfCnpj: cpf,
                    phone,
                    next
                })

                if (result && result.error) {
                    throw new Error(result.error)
                }

                alert('Cadastro realizado com sucesso! Se necessário, verifique seu email para confirmar.')

                // Tenta logar automaticamente
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
                if (!signInError) {
                    await registerSession();
                    router.push(next || '/dashboard')
                    router.refresh()
                } else {
                    // Se falhar (ex: e-mail não confirmado), muda pra login
                    setView('signin')
                }
            } else {
                // Login continua via Client por enquanto
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                await registerSession();

                router.push(next || '/dashboard')
                router.refresh()
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row">
            {/* Lado Esquerdo - Branding */}
            <div className={`w-full md:w-1/2 bg-purple-600 p-12 flex flex-col justify-between text-white relative overflow-hidden transition-all duration-500 ${view === 'signup' ? 'bg-indigo-700' : 'bg-purple-600'}`}>
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
                        <Gamepad2 size={32} />
                        Ludoteca Digital
                    </Link>
                </div>

                <div className="relative z-10 mt-12 md:mt-0">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                        {view === 'signin' ? 'Transforme suas aulas com gamificação.' : 'Junte-se a milhares de professores.'}
                    </h1>
                    <p className="text-purple-100 text-lg max-w-md">
                        {view === 'signin'
                            ? 'Acesse mais de 1.400 jogos educativos alinhados à BNCC e engaje seus alunos como nunca antes.'
                            : 'Crie sua conta em segundos e tenha acesso imediato ao maior acervo de jogos educativos do Brasil.'}
                    </p>
                </div>

                <div className="relative z-10 text-sm opacity-60">
                    © {new Date().getFullYear()} Ludoteca Digital. Todos os direitos reservados.
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-white opacity-10 blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-black opacity-10 blur-3xl"></div>
            </div>

            {/* Lado Direito - Form (Centralizado) */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex items-center justify-center bg-gray-50 overflow-y-auto">
                <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 my-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {view === 'signin' ? 'Bem-vindo de volta!' : 'Crie sua conta Grátis'}
                        </h2>
                        <p className="text-gray-500 mt-2">
                            {view === 'signin'
                                ? 'Entre para acessar o acervo de jogos.'
                                : 'Preencha seus dados para começar.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        {/* Campos de Cadastro */}
                        {view === 'signup' && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Nome Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                            placeholder="Seu nome completo"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">CPF</label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={cpf}
                                                onChange={(e) => setCpf(formatCPF(e.target.value))}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                                placeholder="000.000.000-00"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Celular</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={phone}
                                                onChange={(e) => setPhone(formatPhone(e.target.value))}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md hover:shadow-lg mt-2"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    {view === 'signin' ? 'Entrar na Plataforma' : 'Criar Conta Grátis'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        {view === 'signin' ? (
                            <>
                                Ainda não tem uma conta?{' '}
                                <button
                                    onClick={() => setView('signup')}
                                    className="text-purple-600 font-semibold hover:underline"
                                >
                                    Cadastre-se agora
                                </button>
                            </>
                        ) : (
                            <>
                                Já tem uma conta?{' '}
                                <button
                                    onClick={() => setView('signin')}
                                    className="text-purple-600 font-semibold hover:underline"
                                >
                                    Fazer Login
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-purple-600" /></div>}>
            <LoginContent />
        </Suspense>
    )
}
