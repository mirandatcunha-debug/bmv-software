'use client'
import { useState, useEffect } from 'react'
import { Building2, Plus, Send } from 'lucide-react'
import Link from 'next/link'

export default function MasterConsultoriaPage() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/master/empresas')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEmpresas(data.filter(e => e.plano === 'pro' || e.plano === 'enterprise'))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            📨 Gerenciar Consultoria
          </h1>
          <p className="text-gray-500">Envie insights e mensagens para clientes Pro/Enterprise</p>
        </div>
        <Link
          href="/master/consultoria/novo"
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73]"
        >
          <Plus className="w-4 h-4" /> Novo Insight
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Empresa</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Plano</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
            ) : empresas.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">Nenhuma empresa Pro/Enterprise</td></tr>
            ) : empresas.map((empresa) => (
              <tr key={empresa.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{empresa.nome}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    empresa.plano === 'enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {empresa.plano}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/master/consultoria/novo?tenantId=${empresa.id}&nome=${encodeURIComponent(empresa.nome)}`}
                    className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 w-fit"
                  >
                    <Send className="w-4 h-4" /> Enviar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
