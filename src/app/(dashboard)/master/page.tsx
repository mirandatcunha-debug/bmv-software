'use client'
import { useState, useEffect } from 'react'
import { Building2, Users, DollarSign, AlertTriangle, Search, Eye } from 'lucide-react'
import { useMaster } from '@/contexts/MasterContext'
import { useRouter } from 'next/navigation'

export default function MasterPage() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const { setViewingTenant } = useMaster()
  const router = useRouter()

  useEffect(() => {
    fetch('/api/master/empresas')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setEmpresas(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const empresasFiltradas = empresas.filter(e =>
    e.nome?.toLowerCase().includes(busca.toLowerCase())
  )

  const entrarComoEmpresa = (empresa: any) => {
    setViewingTenant(empresa.id, empresa.nome)
    router.push('/dashboard')
  }

  const totalMRR = empresas.reduce((acc, e) => {
    const valores: Record<string, number> = { trial: 0, basico: 97, pro: 197, enterprise: 397 }
    return acc + (valores[e.plano] || 0)
  }, 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          👑 Painel Master
        </h1>
        <p className="text-gray-500">Acesso total a todas as empresas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Empresas</p>
              <p className="text-xl font-bold">{empresas.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">MRR</p>
              <p className="text-xl font-bold">R$ {totalMRR}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Usuários</p>
              <p className="text-xl font-bold">{empresas.reduce((a, e) => a + (e._count?.users || 0), 0)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Trial</p>
              <p className="text-xl font-bold">{empresas.filter(e => e.plano === 'trial').length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Empresa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Plano</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Usuários</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
            ) : empresasFiltradas.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhuma empresa encontrada</td></tr>
            ) : empresasFiltradas.map((empresa) => (
              <tr key={empresa.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{empresa.nome}</div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    empresa.plano === 'enterprise' ? 'bg-purple-100 text-purple-700' :
                    empresa.plano === 'pro' ? 'bg-blue-100 text-blue-700' :
                    empresa.plano === 'basico' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {empresa.plano}
                  </span>
                </td>
                <td className="px-4 py-3">{empresa._count?.users || 0}</td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Ativo
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => entrarComoEmpresa(empresa)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#1E3A5F] text-white rounded-lg text-sm hover:bg-[#2a4a73]"
                  >
                    <Eye className="w-4 h-4" /> Entrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
