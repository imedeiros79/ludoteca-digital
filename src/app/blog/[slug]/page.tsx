import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await prisma.post.findUnique({
        where: { slug: params.slug },
    });

    if (!post) return { title: 'Post não encontrado' };

    return {
        title: `${post.title} | Blog Ludoteca Digital`,
        description: post.description,
        openGraph: {
            title: post.title,
            description: post.description,
            type: 'article',
            images: post.imageUrl ? [{ url: post.imageUrl }] : [],
        },
    };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await prisma.post.findUnique({
        where: { slug: params.slug },
    });

    if (!post) notFound();

    return (
        <article className="min-h-screen bg-white">
            <div className="bg-gray-50 py-8 border-b border-gray-100">
                <div className="container mx-auto px-4 max-w-3xl">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-purple-600 font-medium mb-8 hover:text-purple-700 transition-colors">
                        <ArrowLeft size={16} /> Voltar para o Blog
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold text-xs uppercase">Educação Digital</span>
                        <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                        <span className="flex items-center gap-1.5"><Clock size={14} /> 5 min</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-8">
                        {post.title}
                    </h1>
                    <div className="flex items-center gap-3 py-6 border-t border-gray-200">
                        <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">L</div>
                        <div>
                            <div className="font-bold text-gray-900">Ludoteca Digital</div>
                            <div className="text-xs text-gray-500">Especialista em Gamificação</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 max-w-3xl">
                {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="w-full aspect-video object-cover rounded-3xl mb-12 shadow-lg" />
                )}

                <div className="prose prose-purple prose-lg max-w-none text-gray-700 leading-relaxed">
                    {post.content.split('\n').map((para: string, i: number) => (
                        <p key={i} className="mb-6">{para}</p>
                    ))}
                </div>

                <div className="mt-20 p-8 bg-purple-50 rounded-3xl border border-purple-100">
                    <h3 className="text-xl font-bold text-purple-900 mb-2">Gostou deste recurso?</h3>
                    <p className="text-purple-700 mb-6">Nossa Ludoteca tem mais de 1.400 jogos como este esperando por você.</p>
                    <Link href="/#precos" className="inline-flex px-8 py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200">
                        Assinar Agora e Testar
                    </Link>
                </div>
            </div>
        </article>
    );
}
