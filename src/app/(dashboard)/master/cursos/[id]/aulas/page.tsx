'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Edit, Trash2, ArrowLeft, GripVertical, PlayCircle } from 'lucide-react'
import Link from 'next/link'

export default function GerenciarAulasPage() {
  const params = useParams()
  const [curso, setCurso] = useState<any>(null)
  const [aulas, setAulas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [aulaEditando, setAulaEditando] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/cursos/${params.id}`).then(r => r.json()),
      fetch(`/api/cursos/${params.id}/aulas`).then(r => r.json())
    ]).then(([cursoData, aulasData]) => {
      setCurso(cursoData)
      if (Array.isArray(aulasData)) setAulas(aulasData)
    }).finally(() => setLoading(false))
  }, [params.id])

  const excluirAula = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta aula?')) return
    await fetch(`/api/aulas/${id}`, { method: 'DELETE' })
    setAulas(aulas.filter(a => a.id !== id))
  }

  const salvarAula = async (dados: any) => {
    if (aulaEditando?.id) {
      await fetch(`/api/aulas/${aulaEditando.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })
      setAulas(aulas.map(a => a.id === aulaEditando.id ? { ...a, ...dados } : a))
    } else {
      const res = await fetch(`/api/cursos/${params.id}/aulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      })
      const novaAula = await res.json()
      setAulas([...aulas, novaAula])
    }
    setShowModal(false)
    setAulaEditando(null)
  }

  if (loading) return <div className="p-6 text-center">Carregando...</div>

  return (
    <div className="p-6">
      <Link href="/master/cursos" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{curso?.titulo}</h1>
          <p className="text-gray-500">Gerenciar aulas do curso</p>
        </div>
        <button
          onClick={() => { setAulaEditando(null); setShowModal(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73]"
        >
          <Plus className="w-4 h-4" /> Nova Aula
        </button>
      </div>

      <div className="bg-white rounded-lg border">
        {aulas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma aula cadastrada. Clique em &quot;Nova Aula&quot; para começar.
          </div>
        ) : (
          <div className="divide-y">
            {aulas.map((aula, index) => (
              <div key={aula.id} className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <GripVertical className="w-5 h-5 text-gray-300 cursor-move" />
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{aula.titulo}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    {aula.duracao && <span>{Math.floor(aula.duracao / 60)}:{(aula.duracao % 60).toString().padStart(2, '0')}</span>}
                    {aula.gratuita && <span className="text-green-600">Grátis</span>}
                    {aula.videoUrl ? (
                      <span className="text-blue-600">✓ Vídeo configurado</span>
                    ) : (
                      <span className="text-orange-500">⚠ Sem vídeo</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setAulaEditando(aula); setShowModal(true) }}
                    className="p-2 text-gray-500 hover:text-[#1E3A5F] hover:bg-gray-100 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => excluirAula(aula.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Criar/Editar Aula */}
      {showModal && (
        <ModalAula
          aula={aulaEditando}
          onSave={salvarAula}
          onClose={() => { setShowModal(false); setAulaEditando(null) }}
        />
      )}
    </div>
  )
}

function ModalAula({ aula, onSave, onClose }: { aula: any; onSave: (dados: any) => void; onClose: () => void }) {
  const [titulo, setTitulo] = useState(aula?.titulo || '')
  const [descricao, setDescricao] = useState(aula?.descricao || '')
  const [videoUrl, setVideoUrl] = useState(aula?.videoUrl || '')
  const [duracao, setDuracao] = useState(aula?.duracao ? Math.floor(aula.duracao / 60).toString() : '')
  const [gratuita, setGratuita] = useState(aula?.gratuita || false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      titulo,
      descricao,
      videoUrl,
      duracao: parseInt(duracao) * 60 || null,
      gratuita
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">{aula ? 'Editar Aula' : 'Nova Aula'}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg h-20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL do Vídeo</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="YouTube, Vimeo ou URL direta"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duração (minutos)</label>
            <input
              type="number"
              value={duracao}
              onChange={(e) => setDuracao(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Ex: 15"
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={gratuita}
              onChange={(e) => setGratuita(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Aula gratuita (preview)</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73]"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
