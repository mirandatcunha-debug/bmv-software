'use client'
import { useMaster } from '@/contexts/MasterContext'
import { Eye, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ViewingBanner() {
  const { isViewingAsOther, viewingTenantName, clearViewingTenant } = useMaster()
  const router = useRouter()

  if (!isViewingAsOther) return null

  const handleExit = () => {
    clearViewingTenant()
    router.push('/master')
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Eye className="w-4 h-4" />
        <span className="font-medium">Visualizando: {viewingTenantName}</span>
      </div>
      <button
        onClick={handleExit}
        className="flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm"
      >
        <X className="w-4 h-4" /> Sair
      </button>
    </div>
  )
}
