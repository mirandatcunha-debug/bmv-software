'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface Tenant {
  id: string
  nome: string
  cnpj?: string
  email?: string
}

interface AuthUser {
  id: string
  email: string | undefined
  nome?: string
  name?: string
  perfil?: string
  role?: string
  tenantId?: string
  tenant?: Tenant
  primeiroAcesso?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  loading: boolean
  error: AuthError | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  const supabase = createClient()

  // Vincular usuario do Supabase com o Prisma
  const vincularUsuario = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const response = await fetch('/api/auth/vincular', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        console.error('Erro ao vincular usuario:', response.status)
        return null
      }

      const data = await response.json()

      if (data.user) {
        return {
          id: data.user.id,
          email: data.user.email,
          nome: data.user.nome,
          name: data.user.nome,
          perfil: data.user.perfil,
          role: data.user.perfil,
          tenantId: data.user.tenantId,
          tenant: data.user.tenant,
          primeiroAcesso: data.user.primeiroAcesso,
        }
      }

      return null
    } catch (err) {
      console.error('Erro ao vincular usuario:', err)
      return null
    }
  }, [])

  // Inicializar usuario apos sessao do Supabase
  const initializeUser = useCallback(async (currentSession: Session | null) => {
    if (!currentSession) {
      setUser(null)
      setSession(null)
      setLoading(false)
      return
    }

    setSession(currentSession)

    // Tentar vincular/buscar usuario do Prisma
    const prismaUser = await vincularUsuario()

    if (prismaUser) {
      setUser(prismaUser)
    } else {
      // Fallback: usar dados basicos do Supabase
      setUser({
        id: currentSession.user.id,
        email: currentSession.user.email,
        name: currentSession.user.user_metadata?.name || currentSession.user.user_metadata?.full_name,
        role: currentSession.user.user_metadata?.role,
        tenantId: currentSession.user.user_metadata?.tenant_id,
      })
    }

    setLoading(false)
  }, [vincularUsuario])

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        setError(sessionError)
        setSession(null)
        setUser(null)
        setLoading(false)
        return
      }

      await initializeUser(currentSession)
    } catch (err) {
      console.error('Error refreshing user:', err)
      setSession(null)
      setUser(null)
      setLoading(false)
    }
  }, [supabase, initializeUser])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError)
        setLoading(false)
        return { error: signInError }
      }

      // Apos login bem-sucedido, vincular usuario
      await initializeUser(data.session)

      return { error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      setLoading(false)
      return { error: authError }
    }
  }, [supabase, initializeUser])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      await supabase.auth.signOut()
      setSession(null)
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Error signing out:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // Inicializar na montagem
    refreshUser()

    // Escutar mudancas de estado de autenticacao
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        if (event === 'SIGNED_OUT') {
          setSession(null)
          setUser(null)
          setLoading(false)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await initializeUser(currentSession)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, refreshUser, initializeUser])

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signIn,
    signOut,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}

export { AuthContext }
