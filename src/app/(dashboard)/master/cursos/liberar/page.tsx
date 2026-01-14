'use client'
import { useState, useEffect } from 'react'
import { ArrowLeft, Unlock, Building2, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function LiberarAcessoPage() {
  const [empresas, setEmpresas] = useState<any[]>([])
  const [cursos, setCursos] = useState<any[]>([])
  const [tenantId, setTenantId] = useState('')
  const [cursoId, setCursoId] = useState('')
  const [motivo, setMotivo] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [erro, setErro] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/master/empresas').then(r => r.json()),
      fetch('/api/cursos').then(r => r.json())
    ]).then(([emp, cur]) => {
      if (Array.isArray(emp)) setEmpresas(emp)
      if (Array.isArray(cur)) setCursos(cur)
    })
  }, [])

  const handleLiberar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId || !cursoId) {
      setErro('Selecione a empresa e o curso')
      return
    }

    setLoading(true)
    setErro('')
    setSucesso('')

    try {
      const res = await fetch('/api/cursos/liberar-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, cursoId, motivo })
      })

      if (!res.ok) throw new Error('Erro ao liberar acesso')

      const empresa = empresas.find(e => e.id === tenantId)
      const curso = cursos.find(c => c.id === cursoId)
      setSucesso(`Acesso ao curso "${curso?.titulo}" liberado para ${empresa?.nome}!`)
      setTenantId('')
      setCursoId('')
      setMotivo('')
    } catch (err) {
      setErro('Erro ao liberar acesso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/master/cursos" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-2xl font-bold mb-2">🔓 Liberar Acesso Manual</h1>
      <p className="text-gray-500 mb-6">Libere acesso a cursos para empresas sem cobrança</p>

      <form onSubmit={handleLiberar} className="space-y-4 bg-white rounded-lg border p-6">
        {erro && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{erro}</div>}
        {sucesso && <div className="p-3 bg-green-100 text-green-700 rounded-lg">{sucesso}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">
            <Building2 className="w-4 h-4 inline mr-1" /> Empresa *
          </label>
          <select
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Selecione a empresa...</option>
            {empresas.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.nome} ({emp.plano})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            <BookOpen className="w-4 h-4 inline mr-1" /> Curso *
          </label>
          <select
            value={cursoId}
            onChange={(e) => setCursoId(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Selecione o curso...</option>
            {cursos.map((curso) => (
              <option key={curso.id} value={curso.id}>
                {curso.titulo} - R$ {Number(curso.preco).toFixed(2)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Ex: Cortesia, Parceria, Bonificação..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          <Unlock className="w-4 h-4" />
          {loading ? 'Liberando...' : 'Liberar Acesso'}
        </button>
      </form>
    </div>
  )
}
