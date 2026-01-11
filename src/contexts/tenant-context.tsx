'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// Tipos para o Tenant
export interface Tenant {
  id: string
  nome: string
  cnpj?: string
  email?: string
  telefone?: string
  logoUrl?: string
  ativo?: boolean
  criadoEm?: string
  plano?: string
  trialExpira?: string
  assinaturaAtiva?: boolean
}

interface TenantContextType {
  tenant: Tenant | null
  tenants: Tenant[]
  loading: boolean
  error: string | null
  setTenant: (tenant: Tenant | null) => void
  switchTenant: (tenantId: string) => Promise<void>
  refreshTenants: () => Promise<void>
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

const TENANT_STORAGE_KEY = 'bmv_selected_tenant'

interface TenantProviderProps {
  children: ReactNode
}

export function TenantProvider({ children }: TenantProviderProps) {
  const [tenant, setTenantState] = useState<Tenant | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar tenant do localStorage na inicialização
  useEffect(() => {
    const loadSavedTenant = () => {
      try {
        const saved = localStorage.getItem(TENANT_STORAGE_KEY)
        if (saved) {
          const parsedTenant = JSON.parse(saved) as Tenant
          setTenantState(parsedTenant)
        }
      } catch (err) {
        console.error('Erro ao carregar tenant do localStorage:', err)
        localStorage.removeItem(TENANT_STORAGE_KEY)
      }
    }

    loadSavedTenant()
  }, [])

  // Carregar lista de tenants na inicialização
  useEffect(() => {
    refreshTenants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persistir tenant no localStorage quando mudar
  const setTenant = useCallback((newTenant: Tenant | null) => {
    setTenantState(newTenant)
    if (newTenant) {
      localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(newTenant))
    } else {
      localStorage.removeItem(TENANT_STORAGE_KEY)
    }
  }, [])

  // Buscar tenant do usuario logado via /api/auth/me
  const refreshTenants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Primeiro, buscar o tenant do usuario logado via /api/auth/me
      const meResponse = await fetch('/api/auth/me')
      if (meResponse.ok) {
        const meData = await meResponse.json()
        if (meData.user?.tenant) {
          const userTenant: Tenant = {
            id: meData.user.tenant.id,
            nome: meData.user.tenant.nome,
            plano: meData.user.tenant.plano,
            trialExpira: meData.user.tenant.trialExpira,
            assinaturaAtiva: meData.user.tenant.assinaturaAtiva,
            ativo: true,
          }
          setTenantState(userTenant)
          setTenants([userTenant])
          localStorage.setItem(TENANT_STORAGE_KEY, JSON.stringify(userTenant))
          return
        }
      } else if (meResponse.status === 404) {
        // Usuario nao encontrado - pode precisar vincular
        setError('Usuario nao configurado. Faca login novamente.')
        return
      }

      // Se nao conseguiu via /api/auth/me, tenta /api/tenants (para admins)
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          setTenants(data)
          // Se nao ha tenant selecionado, seleciona o primeiro
          if (!tenant) {
            const savedTenantId = localStorage.getItem(TENANT_STORAGE_KEY)
            if (savedTenantId) {
              try {
                const savedTenant = JSON.parse(savedTenantId) as Tenant
                const foundTenant = data.find((t: Tenant) => t.id === savedTenant.id)
                if (foundTenant) {
                  setTenantState(foundTenant)
                } else {
                  setTenant(data[0])
                }
              } catch {
                setTenant(data[0])
              }
            } else {
              setTenant(data[0])
            }
          }
        }
      } else if (response.status === 403) {
        // Usuario nao tem permissao para listar tenants - normal para GESTOR/COLABORADOR
        // O tenant ja deveria ter sido carregado via /api/auth/me
        if (!tenant) {
          setError('Empresa nao configurada. Entre em contato com o suporte.')
        }
      }
    } catch (err) {
      console.error('Erro ao carregar tenants:', err)
      setError('Erro ao carregar dados da empresa.')
    } finally {
      setLoading(false)
    }
  }, [tenant, setTenant])

  // Trocar de tenant por ID
  const switchTenant = useCallback(async (tenantId: string) => {
    const newTenant = tenants.find(t => t.id === tenantId)
    if (newTenant) {
      setTenant(newTenant)
    } else {
      // Se não encontrou na lista atual, busca da API
      try {
        const response = await fetch(`/api/tenants/${tenantId}`)
        if (response.ok) {
          const data = await response.json()
          setTenant(data)
        }
      } catch (error) {
        console.error('Erro ao buscar tenant:', error)
      }
    }
  }, [tenants, setTenant])

  const value: TenantContextType = {
    tenant,
    tenants,
    loading,
    error,
    setTenant,
    switchTenant,
    refreshTenants,
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

export function useTenantContext(): TenantContextType {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error('useTenantContext deve ser usado dentro de um TenantProvider')
  }
  return context
}

export { TenantContext }
