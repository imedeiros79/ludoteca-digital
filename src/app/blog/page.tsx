import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import prisma from '@/lib/prisma';

export const metadata = {
    title: 'Blog Ludoteca Digital | Dicas e Recursos Educativos',
    description: 'Artigos sobre como usar tecnologia na educação, BNCC e muito mais.',
};

export default async function BlogPage() {
    const posts = await prisma.post.findMany({
        where: { published: true },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-white">
            <header className="bg-gray-50 border-b border-gray-100 py-12">
                <div className="container mx-auto px-4 max-w-4xl">
                    <Link href="/" className="inline-flex items-center gap-2 text-purple-600 font-medium mb-8 hover:text-purple-700 transition-colors">
                        <ArrowLeft size={16} /> Voltar para Home
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Blog Ludoteca Digital</h1>
                    <p className="text-xl text-gray-600">Compartilhando conhecimento para transformar a educação brasileira.</p>
                </div>
            </header>

            <main className="container mx-auto px-4 py-16 max-w-4xl">
                {posts.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-400">Em breve, novos conteúdos!</h2>
                        <p className="text-gray-500 mt-2">Estamos preparando os melhores artigos para você.</p>
                    </div>
                ) : (
                    <div className="grid gap-12">
                        {posts.map((post: any) => (
                            <article key={post.id} className="group">
                                <Link href={`/blog/${post.slug}`} className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                        {post.imageUrl ? (
                                            <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">Sem imagem</div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                            <span className="flex items-center gap-1.5"><Calendar size={14} /> {new Date(post.createdAt).toLocaleDateString('pt-BR')}</span>
                                            <span className="flex items-center gap-1.5"><Clock size={14} /> 5 min de leitura</span>
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">{post.title}</h2>
                                        <p className="text-gray-600 mb-4 line-clamp-3">{post.description}</p>
                                        <span className="text-purple-600 font-bold inline-flex items-center gap-1">Ler mais <ArrowLeft className="rotate-180" size={16} /></span>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
