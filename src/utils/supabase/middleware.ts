import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    // Evitar cache para garantir que logout funcione imediatamente (back button)
    supabaseResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    supabaseResponse.headers.set('Pragma', 'no-cache');
    supabaseResponse.headers.set('Expires', '0');
    supabaseResponse.headers.set('Surrogate-Control', 'no-store');

    // Proteção de rotas: dashboard, jogar, content, checkout e admin
    if (
        request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/jogar') ||
        request.nextUrl.pathname.startsWith('/content') ||
        request.nextUrl.pathname.startsWith('/checkout') ||
        request.nextUrl.pathname.startsWith('/admin')
    ) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        const {
            data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
            if (request.nextUrl.pathname.startsWith('/content')) {
                return new NextResponse(
                    JSON.stringify({ success: false, message: 'authentication failed' }),
                    { status: 401, headers: { 'content-type': 'application/json' } }
                )
            }
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }

        // Bloqueio extra para /admin (Apenas o proprietário)
        if (request.nextUrl.pathname.startsWith('/admin') && user.email !== 'imedeiros@outlook.com') {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    // Redirecionar se estiver logado e tentar acessar login
    if (request.nextUrl.pathname.startsWith('/login')) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll() {
                        // Just reading here usually
                    },
                },
            }
        )
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const url = request.nextUrl.clone()
            url.pathname = '/dashboard'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
