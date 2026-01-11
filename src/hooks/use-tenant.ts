'use client'

import { useTenantContext, Tenant } from '@/contexts/tenant-context'

interface UseTenantReturn {
  tenant: Tenant | null
  tenants: Tenant[]
  loading: boolean
  error: string | null
  switchTenant: (tenantId: string) => Promise<void>
  refreshTenants: () => Promise<void>
}

/**
 * Hook para acessar e gerenciar o tenant (empresa) atual
 *
 * @example
 * ```tsx
 * const { tenant, tenants, switchTenant, error } = useTenant()
 *
 * // Acessar tenant atual
 * console.log(tenant?.nome)
 *
 * // Listar tenants disponíveis
 * tenants.map(t => <option key={t.id}>{t.nome}</option>)
 *
 * // Trocar de empresa
 * await switchTenant('tenant-id')
 * ```
 */
export function useTenant(): UseTenantReturn {
  const { tenant, tenants, loading, error, switchTenant, refreshTenants } = useTenantContext()

  return {
    tenant,
    tenants,
    loading,
    error,
    switchTenant,
    refreshTenants,
  }
}

export type { Tenant }
