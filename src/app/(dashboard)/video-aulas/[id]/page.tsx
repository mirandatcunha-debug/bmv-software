'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PlayCircle, Lock, Clock, CheckCircle, ArrowLeft, List } from 'lucide-react'
import Link from 'next/link'

export default function CursoPage() {
  const params = useParams()
  const [curso, setCurso] = useState<any>(null)
  const [aulaAtual, setAulaAtual] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/cursos/${params.id}`)
      .then(r => r.json())
      .then(data => {
        setCurso(data)
        if (data.aulas?.length > 0 && data.temAcesso) {
          carregarAula(data.aulas[0].id)
        }
      })
      .finally(() => setLoading(false))
  }, [params.id])

  const carregarAula = async (aulaId: string) => {
    const res = await fetch(`/api/aulas/${aulaId}`)
    const data = await res.json()
    setAulaAtual(data)
  }

  const formatDuracao = (segundos: number) => {
    const min = Math.floor(segundos / 60)
    const seg = segundos % 60
    return `${min}:${seg.toString().padStart(2, '0')}`
  }

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  if (!curso) {
    return <div className="p-6 text-center">Curso não encontrado</div>
  }

  return (
    <div className="p-6">
      <Link href="/video-aulas" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Player / Info principal */}
        <div className="lg:col-span-2">
          {curso.temAcesso && aulaAtual?.videoUrl ? (
            <div className="bg-black rounded-lg overflow-hidden aspect-video mb-4">
              {/* Player - adaptar conforme host do vídeo */}
              {aulaAtual.videoUrl.includes('youtube') ? (
                <iframe
                  src={aulaAtual.videoUrl.replace('watch?v=', 'embed/')}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : aulaAtual.videoUrl.includes('vimeo') ? (
                <iframe
                  src={aulaAtual.videoUrl.replace('vimeo.com', 'player.vimeo.com/video')}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video src={aulaAtual.videoUrl} controls className="w-full h-full" />
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-4">
              <div className="text-center">
                <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Adquira o curso para assistir as aulas</p>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Comprar por R$ {Number(curso.preco).toFixed(2)}
                </button>
              </div>
            </div>
          )}

          {/* Info da aula atual */}
          {aulaAtual && curso.temAcesso && (
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-xl font-bold mb-2">{aulaAtual.titulo}</h2>
              {aulaAtual.descricao && (
                <p className="text-gray-600">{aulaAtual.descricao}</p>
              )}
            </div>
          )}

          {/* Info do curso (se não tem acesso) */}
          {!curso.temAcesso && (
            <div className="bg-white rounded-lg border p-6">
              <h1 className="text-2xl font-bold mb-4">{curso.titulo}</h1>
              <p className="text-gray-600 mb-6">{curso.descricao}</p>

              <div className="flex items-center gap-6 mb-6">
                <span className="flex items-center gap-2 text-gray-500">
                  <List className="w-5 h-5" /> {curso.aulas?.length || 0} aulas
                </span>
              </div>

              <div className="border-t pt-4">
                <div className="text-3xl font-bold text-[#1E3A5F] mb-4">
                  R$ {Number(curso.preco).toFixed(2)}
                </div>
                <button className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium">
                  Comprar Agora
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de aulas */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold flex items-center gap-2">
              <List className="w-4 h-4" /> Conteúdo do Curso
            </h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {curso.aulas?.map((aula: any, index: number) => {
              const podeMostrar = curso.temAcesso || aula.gratuita
              const isAtual = aulaAtual?.id === aula.id

              return (
                <button
                  key={aula.id}
                  onClick={() => podeMostrar && carregarAula(aula.id)}
                  disabled={!podeMostrar}
                  className={`w-full p-4 text-left flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                    isAtual ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  } ${!podeMostrar ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
                    {podeMostrar ? (
                      <PlayCircle className="w-5 h-5 text-[#1E3A5F]" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isAtual ? 'text-[#1E3A5F]' : ''}`}>
                      {index + 1}. {aula.titulo}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      {aula.duracao && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {formatDuracao(aula.duracao)}
                        </span>
                      )}
                      {aula.gratuita && (
                        <span className="text-green-600">Grátis</span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
