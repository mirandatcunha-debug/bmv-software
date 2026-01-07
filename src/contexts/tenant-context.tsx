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
  ativo: boolean
  criadoEm?: string
}

interface TenantContextType {
  tenant: Tenant | null
  tenants: Tenant[]
  loading: boolean
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

  // Carregar tenant do localStorage na inicialização
  useEffect(() => {
    const loadSavedTenant = () => {
      try {
        const saved = localStorage.getItem(TENANT_STORAGE_KEY)
        if (saved) {
          const parsedTenant = JSON.parse(saved) as Tenant
          setTenantState(parsedTenant)
        }
      } catch (error) {
        console.error('Erro ao carregar tenant do localStorage:', error)
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

  // Buscar lista de tenants da API
  const refreshTenants = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/tenants')
      if (response.ok) {
        const data = await response.json()
        setTenants(data)

        // Se não há tenant selecionado e há tenants disponíveis, seleciona o primeiro
        if (!tenant && data.length > 0) {
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
    } catch (error) {
      console.error('Erro ao carregar tenants:', error)
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
