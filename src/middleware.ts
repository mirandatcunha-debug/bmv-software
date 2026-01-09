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
  '/trial-expirado',
  '/acesso-negado',
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
  '/cadastros',
]

// Módulos bloqueados durante o período de trial
const trialBlockedPrefixes = [
  '/admin',
  '/consultoria',
  '/contabil',
  '/processos',
]

// Módulos permitidos durante o período de trial
const trialAllowedPrefixes = [
  '/dashboard',
  '/financeiro',
  '/cadastros',
  '/configuracoes',
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

function isTrialBlockedRoute(pathname: string): boolean {
  for (const prefix of trialBlockedPrefixes) {
    if (pathname.startsWith(prefix)) {
      return true
    }
  }
  return false
}

interface TenantInfo {
  plano: string
  trialExpira: string | null
  assinaturaAtiva: boolean
}

async function getTenantInfo(authId: string, baseUrl: string): Promise<TenantInfo | null> {
  try {
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'x-auth-id': authId,
        'x-internal-request': 'true',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.user?.tenant) {
      return {
        plano: data.user.tenant.plano,
        trialExpira: data.user.tenant.trialExpira,
        assinaturaAtiva: data.user.tenant.assinaturaAtiva,
      }
    }

    return null
  } catch (error) {
    console.error('Erro ao buscar informações do tenant:', error)
    return null
  }
}

function isTrialExpired(trialExpira: string | null): boolean {
  if (!trialExpira) return true
  const expirationDate = new Date(trialExpira)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return expirationDate < today
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

  // Verificação de trial e permissões para rotas protegidas
  if (session && isProtected) {
    const baseUrl = req.nextUrl.origin
    const tenantInfo = await getTenantInfo(session.user.id, baseUrl)

    if (tenantInfo) {
      // Se assinatura ativa, permitir acesso a tudo
      if (tenantInfo.assinaturaAtiva) {
        return supabaseResponse
      }

      // Verificar se é plano TRIAL
      if (tenantInfo.plano === 'TRIAL') {
        // Verificar se o trial expirou
        if (isTrialExpired(tenantInfo.trialExpira)) {
          // Trial expirado - redirecionar para página de trial expirado
          if (pathname !== '/trial-expirado') {
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = '/trial-expirado'
            return NextResponse.redirect(redirectUrl)
          }
        } else {
          // Trial ainda válido - verificar se está tentando acessar módulo bloqueado
          if (isTrialBlockedRoute(pathname)) {
            const redirectUrl = req.nextUrl.clone()
            redirectUrl.pathname = '/acesso-negado'
            redirectUrl.searchParams.set('motivo', 'trial')
            redirectUrl.searchParams.set('modulo', pathname.split('/')[1])
            return NextResponse.redirect(redirectUrl)
          }
        }
      }
    }
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
