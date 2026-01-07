'use client'

import { useAuth } from '@/contexts/auth-context'
import { ShieldAlert } from 'lucide-react'
import { perfilLabels } from '@/types/configuracoes'

export type UserRole = 'ADMIN_BMV' | 'CONSULTOR_BMV' | 'GESTOR' | 'COLABORADOR' | 'CLIENTE'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback
}: RoleGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return null
  }

  const userRole = user?.role as UserRole | undefined

  if (!userRole || !allowedRoles.includes(userRole)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4 text-center p-8 max-w-md">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900">Acesso Negado</h2>
          <p className="text-sm text-muted-foreground">
            Voce nao tem permissao para acessar este recurso.
            {userRole && (
              <span className="block mt-1">
                Seu perfil atual: <strong>{perfilLabels[userRole] || userRole}</strong>
              </span>
            )}
          </p>
          <p className="text-xs text-muted-foreground">
            Perfis permitidos: {allowedRoles.map(role => perfilLabels[role] || role).join(', ')}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
