'use client'
import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import Link from 'next/link'

function NovoInsightForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tenantId = searchParams.get('tenantId') || ''
  const nomeEmpresa = searchParams.get('nome') || ''

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [categoria, setCategoria] = useState('INFO')
  const [criarAcao, setCriarAcao] = useState(false)
  const [tituloAcao, setTituloAcao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tenantId || !titulo || !conteudo) {
      setErro('Preencha todos os campos obrigatórios')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const resInsight = await fetch('/api/consultoria/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId, titulo, conteudo, categoria })
      })

      if (!resInsight.ok) throw new Error('Erro ao criar insight')

      const insight = await resInsight.json()

      if (criarAcao && tituloAcao) {
        await fetch('/api/consultoria/acoes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenantId, titulo: tituloAcao, insightId: insight.id })
        })
      }

      router.push('/master/consultoria')
    } catch (err) {
      setErro('Erro ao enviar insight')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/master/consultoria" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-2xl font-bold mb-2">Novo Insight</h1>
      {nomeEmpresa && <p className="text-gray-500 mb-6">Para: {nomeEmpresa}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{erro}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Ex: Atenção com a inadimplência"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Categoria *</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="INFO">ℹ️ Informativo</option>
            <option value="ATENCAO">⚠️ Atenção</option>
            <option value="URGENTE">🚨 Urgente</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Conteúdo *</label>
          <textarea
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg h-32"
            placeholder="Descreva o insight detalhadamente..."
          />
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={criarAcao}
              onChange={(e) => setCriarAcao(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Criar ação vinculada</span>
          </label>

          {criarAcao && (
            <input
              type="text"
              value={tituloAcao}
              onChange={(e) => setTituloAcao(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg mt-2"
              placeholder="Título da ação (ex: Cobrar cliente X)"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73] disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Enviando...' : 'Enviar Insight'}
        </button>
      </form>
    </div>
  )
}

export default function NovoInsightPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <NovoInsightForm />
    </Suspense>
  )
}
