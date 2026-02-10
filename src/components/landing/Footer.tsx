import Link from 'next/link';
import { Gamepad2, MessageCircle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-200 py-12">
            <div className="container mx-auto px-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-6 opacity-50">
                    <div className="w-6 h-6 bg-gray-500 rounded flex items-center justify-center text-white">
                        <Gamepad2 size={14} />
                    </div>
                    <span className="font-bold text-gray-800">Ludoteca Digital</span>
                </div>
                <div className="flex flex-wrap justify-center gap-6 md:gap-8 mb-8 text-sm text-gray-700">
                    <Link href="/termos" className="hover:text-purple-600 transition-colors">Termos de Uso</Link>
                    <Link href="/privacidade" className="hover:text-purple-600 transition-colors">Política de Privacidade</Link>
                    <a
                        href="https://wa.me/5531972198551"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-purple-600 font-medium hover:text-purple-700 transition-colors"
                    >
                        <MessageCircle size={16} /> Contato WhatsApp
                    </a>
                </div>
                <p className="text-xs text-gray-600">
                    &copy; {new Date().getFullYear()} Ludoteca Digital. Todos os direitos reservados.
                </p>
            </div>
        </footer>
    );
}
