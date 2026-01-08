import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas públicas que não precisam de autenticação
const publicRoutes = [
  '/',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/verificar-email',
]

// Rotas que começam com estes prefixos são públicas
const publicPrefixes = [
  '/convite/',
  '/api/auth/',
  '/api/convite/',
]

// Rotas protegidas que requerem autenticação
const protectedPrefixes = [
  '/dashboard',
  '/financeiro',
  '/admin',
  '/configuracoes',
  '/consultoria',
  '/contabil',
  '/processos',
]

function isPublicRoute(pathname: string): boolean {
  // Verifica rotas exatas
  if (publicRoutes.includes(pathname)) {
    return true
  }

  // Verifica prefixos públicos
  for (const prefix of publicPrefixes) {
    if (pathname.startsWith(prefix)) {
      return true
    }
  }

  return false
}

function isProtectedRoute(pathname: string): boolean {
  for (const prefix of protectedPrefixes) {
    if (pathname.startsWith(prefix)) {
      return true
    }
  }
  return false
}

export async function middleware(req: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: req,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const pathname = req.nextUrl.pathname

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isPublic = isPublicRoute(pathname)
  const isProtected = isProtectedRoute(pathname)

  // Se não está autenticado e tenta acessar rota protegida
  if (!session && isProtected) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se está autenticado e tenta acessar login/cadastro
  if (session && (pathname === '/login' || pathname === '/cadastro')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
}
