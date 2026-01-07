'use client'

import { useAuth as useAuthContext } from '@/contexts/auth-context'

export function useAuth() {
  const { user, loading, error, signIn, signOut, refreshUser, session } = useAuthContext()

  const isAuthenticated = !!user && !!session

  const login = async (email: string, password: string) => {
    return signIn(email, password)
  }

  const logout = async () => {
    await signOut()
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    refreshUser,
    session,
  }
}

export type { useAuth as UseAuthReturn }
