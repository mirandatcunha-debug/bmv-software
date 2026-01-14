'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'

export default function NovoCursoPage() {
  const router = useRouter()
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [preco, setPreco] = useState('')
  const [thumbnail, setThumbnail] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo || !descricao) {
      setErro('Título e descrição são obrigatórios')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const res = await fetch('/api/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo,
          descricao,
          preco: parseFloat(preco) || 0,
          thumbnail
        })
      })

      if (!res.ok) throw new Error('Erro ao criar curso')

      router.push('/master/cursos')
    } catch (err) {
      setErro('Erro ao criar curso')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/master/cursos" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <h1 className="text-2xl font-bold mb-6">Novo Curso</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {erro && <div className="p-3 bg-red-100 text-red-700 rounded-lg">{erro}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Título *</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Ex: Gestão Financeira para PMEs"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Descrição *</label>
          <textarea
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg h-32"
            placeholder="Descreva o conteúdo do curso..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Preço (R$)</label>
          <input
            type="number"
            step="0.01"
            value={preco}
            onChange={(e) => setPreco(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="197.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">URL da Thumbnail</label>
          <input
            type="text"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="https://..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73] disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Salvando...' : 'Criar Curso'}
        </button>
      </form>
    </div>
  )
}
