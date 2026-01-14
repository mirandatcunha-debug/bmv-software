'use client'
import { useState, useEffect } from 'react'
import { PlayCircle, Lock, Clock, BookOpen, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function VideoAulasPage() {
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

  const formatDuracao = (segundos: number) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    if (horas > 0) return `${horas}h ${minutos}min`
    return `${minutos}min`
  }

  const duracaoTotal = (aulas: any[]) => {
    const total = aulas.reduce((acc, a) => acc + (a.duracao || 0), 0)
    return formatDuracao(total)
  }

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🎓 Vídeo Aulas
        </h1>
        <p className="text-gray-500">Aprenda com nossos cursos exclusivos</p>
      </div>

      {cursos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum curso disponível no momento</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cursos.map((curso) => (
            <div key={curso.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-lg transition-shadow">
              {/* Thumbnail */}
              <div className="aspect-video bg-gray-100 relative">
                {curso.thumbnail ? (
                  <img src={curso.thumbnail} alt={curso.titulo} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PlayCircle className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                {curso.temAcesso && (
                  <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white text-xs rounded-full flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Liberado
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{curso.titulo}</h3>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{curso.descricao}</p>

                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" /> {curso._count?.aulas || curso.aulas?.length || 0} aulas
                  </span>
                  {curso.aulas?.length > 0 && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {duracaoTotal(curso.aulas)}
                    </span>
                  )}
                </div>

                {curso.temAcesso ? (
                  <Link
                    href={`/video-aulas/${curso.id}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73]"
                  >
                    <PlayCircle className="w-4 h-4" /> Assistir
                  </Link>
                ) : (
                  <div>
                    <div className="text-center mb-2">
                      <span className="text-2xl font-bold text-[#1E3A5F]">
                        R$ {Number(curso.preco).toFixed(2)}
                      </span>
                    </div>
                    <Link
                      href={`/video-aulas/${curso.id}`}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Lock className="w-4 h-4" /> Ver Detalhes
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Banner Enterprise */}
      <div className="mt-8 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-2">🎁 Plano Enterprise</h3>
        <p className="text-white/80">Acesso completo a todos os cursos incluído no plano Enterprise!</p>
      </div>
    </div>
  )
}
