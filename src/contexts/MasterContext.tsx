'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface MasterContextType {
  viewingTenantId: string | null
  viewingTenantName: string | null
  setViewingTenant: (id: string | null, name: string | null) => void
  isViewingAsOther: boolean
  clearViewingTenant: () => void
}

const MasterContext = createContext<MasterContextType | undefined>(undefined)

export function MasterProvider({ children }: { children: ReactNode }) {
  const [viewingTenantId, setViewingTenantId] = useState<string | null>(null)
  const [viewingTenantName, setViewingTenantName] = useState<string | null>(null)

  useEffect(() => {
    const storedId = sessionStorage.getItem('viewingTenantId')
    const storedName = sessionStorage.getItem('viewingTenantName')
    if (storedId) {
      setViewingTenantId(storedId)
      setViewingTenantName(storedName)
    }
  }, [])

  const setViewingTenant = (id: string | null, name: string | null) => {
    setViewingTenantId(id)
    setViewingTenantName(name)
    if (id) {
      sessionStorage.setItem('viewingTenantId', id)
      sessionStorage.setItem('viewingTenantName', name || '')
    }
  }

  const clearViewingTenant = () => {
    setViewingTenantId(null)
    setViewingTenantName(null)
    sessionStorage.removeItem('viewingTenantId')
    sessionStorage.removeItem('viewingTenantName')
  }

  return (
    <MasterContext.Provider value={{
      viewingTenantId,
      viewingTenantName,
      setViewingTenant,
      isViewingAsOther: !!viewingTenantId,
      clearViewingTenant
    }}>
      {children}
    </MasterContext.Provider>
  )
}

export function useMaster() {
  const context = useContext(MasterContext)
  if (!context) throw new Error('useMaster must be used within MasterProvider')
  return context
}
