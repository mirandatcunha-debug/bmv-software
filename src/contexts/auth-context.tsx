'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthUser {
  id: string
  email: string | undefined
  name?: string
  role?: string
  tenantId?: string
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

  const mapSupabaseUser = useCallback((supabaseUser: User | null): AuthUser | null => {
    if (!supabaseUser) return null

    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.user_metadata?.full_name,
      role: supabaseUser.user_metadata?.role,
      tenantId: supabaseUser.user_metadata?.tenant_id,
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        setError(sessionError)
        setSession(null)
        setUser(null)
        return
      }

      setSession(currentSession)
      setUser(mapSupabaseUser(currentSession?.user ?? null))
    } catch (err) {
      console.error('Error refreshing user:', err)
      setSession(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [supabase, mapSupabaseUser])

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
        return { error: signInError }
      }

      setSession(data.session)
      setUser(mapSupabaseUser(data.user))
      return { error: null }
    } catch (err) {
      const authError = err as AuthError
      setError(authError)
      return { error: authError }
    } finally {
      setLoading(false)
    }
  }, [supabase, mapSupabaseUser])

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
    refreshUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession)
        setUser(mapSupabaseUser(currentSession?.user ?? null))
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, refreshUser, mapSupabaseUser])

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
