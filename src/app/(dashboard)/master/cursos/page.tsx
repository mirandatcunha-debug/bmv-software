'use client'
import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, PlayCircle, Eye } from 'lucide-react'
import Link from 'next/link'

export default function MasterCursosPage() {
  const [cursos, setCursos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/cursos')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCursos(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const excluirCurso = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return

    await fetch(`/api/cursos/${id}`, { method: 'DELETE' })
    setCursos(cursos.filter(c => c.id !== id))
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🎬 Gerenciar Cursos</h1>
          <p className="text-gray-500">Crie e gerencie os cursos da plataforma</p>
        </div>
        <Link
          href="/master/cursos/novo"
          className="flex items-center gap-2 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73]"
        >
          <Plus className="w-4 h-4" /> Novo Curso
        </Link>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Curso</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Aulas</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Preço</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Carregando...</td></tr>
            ) : cursos.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Nenhum curso cadastrado</td></tr>
            ) : cursos.map((curso) => (
              <tr key={curso.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <PlayCircle className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium">{curso.titulo}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{curso.descricao}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">{curso._count?.aulas || curso.aulas?.length || 0}</td>
                <td className="px-4 py-3">R$ {Number(curso.preco).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    curso.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {curso.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/master/cursos/${curso.id}`}
                      className="p-2 text-gray-500 hover:text-[#1E3A5F] hover:bg-gray-100 rounded"
                      title="Ver/Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <Link
                      href={`/master/cursos/${curso.id}/aulas`}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded"
                      title="Gerenciar Aulas"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => excluirCurso(curso.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
