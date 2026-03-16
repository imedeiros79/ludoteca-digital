'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, Loader2, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { validateInviteToken, signUpTeacher } from '../actions';
import Link from 'next/link';

export default function InvitePage({ params }: { params: { token: string } }) {
    const [token, setToken] = useState('');
    const [orgName, setOrgName] = useState('');
    const [orgId, setOrgId] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const router = useRouter();

    useEffect(() => {
        const checkToken = async () => {
            const unwrappedParams = await (params as any); // Next.js 15+ needs await on params
            const t = unwrappedParams.token;
            setToken(t);
            
            const result = await validateInviteToken(t);
            if (result.error) {
                setError(result.error);
            } else {
                setOrgName(result.orgName!);
                setOrgId(result.orgId!);
            }
            setLoading(false);
        };
        checkToken();
    }, [params]);

    const handleInviteAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            await signUpTeacher({
                email,
                password,
                name,
                orgId,
                token
            });
            
            alert('Cadastro realizado! Você já pode entrar com seu e-mail e senha.');
            router.push('/login');
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar cadastro');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-purple-600 w-10 h-10" />
            </div>
        );
    }

    if (error && !orgId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-red-100">
                    <div className="text-5xl">❌</div>
                    <h1 className="text-2xl font-bold text-gray-900">Link Inválido</h1>
                    <p className="text-gray-600">{error}</p>
                    <Link href="/" className="block w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 transition-all">
                        Voltar para Início
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4 text-purple-600">
                        <Gamepad2 size={48} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Convite Aceito!</h1>
                    <p className="text-gray-500 mt-2">
                        Você foi convidado para a equipe de <span className="font-bold text-purple-600">{orgName}</span>.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <form onSubmit={handleInviteAuth} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-lg flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Seu Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Como quer ser chamado?"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">E-mail</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Crie sua Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="No mínimo 6 caracteres"
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-md"
                        >
                            {submitting ? <Loader2 className="animate-spin" /> : <>Finalizar Cadastro <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>

                <p className="text-center text-xs text-gray-400">
                    Ao se cadastrar, você concorda com nossos Termos de Uso.
                </p>
            </div>
        </div>
    );
}
