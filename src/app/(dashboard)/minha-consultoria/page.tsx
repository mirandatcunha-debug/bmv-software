'use client'
import { useState, useEffect } from 'react'
import { MessageSquare, CheckCircle, AlertTriangle, AlertCircle, Info, Clock } from 'lucide-react'

export default function MinhaConsultoriaPage() {
  const [insights, setInsights] = useState<any[]>([])
  const [acoes, setAcoes] = useState<any[]>([])
  const [mensagem, setMensagem] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/consultoria/insights').then(r => r.json()),
      fetch('/api/consultoria/acoes').then(r => r.json()),
      fetch('/api/consultoria/mensagens').then(r => r.json())
    ]).then(([ins, aco, msg]) => {
      if (Array.isArray(ins)) setInsights(ins)
      if (Array.isArray(aco)) setAcoes(aco)
      if (Array.isArray(msg) && msg.length > 0) setMensagem(msg[0])
    }).finally(() => setLoading(false))
  }, [])

  const marcarAcaoConcluida = async (id: string, concluida: boolean) => {
    await fetch(`/api/consultoria/acoes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concluida })
    })
    setAcoes(acoes.map(a => a.id === id ? { ...a, concluida } : a))
  }

  const marcarInsightLido = async (id: string) => {
    await fetch(`/api/consultoria/insights/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lido: true })
    })
    setInsights(insights.map(i => i.id === id ? { ...i, lido: true } : i))
  }

  const categoriaIcon = (cat: string) => {
    if (cat === 'URGENTE') return <AlertTriangle className="w-5 h-5 text-red-500" />
    if (cat === 'ATENCAO') return <AlertCircle className="w-5 h-5 text-yellow-500" />
    return <Info className="w-5 h-5 text-blue-500" />
  }

  const categoriaCor = (cat: string) => {
    if (cat === 'URGENTE') return 'border-l-red-500 bg-red-50'
    if (cat === 'ATENCAO') return 'border-l-yellow-500 bg-yellow-50'
    return 'border-l-blue-500 bg-blue-50'
  }

  const naoLidos = insights.filter(i => !i.lido).length
  const pendentes = acoes.filter(a => !a.concluida).length

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🎯 Consultoria Exclusiva
        </h1>
        <p className="text-gray-500">Insights e recomendações personalizadas para sua empresa</p>
      </div>

      <div className="space-y-6">
        {/* Cards resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Novos Insights</p>
                <p className="text-xl font-bold">{naoLidos}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ações Pendentes</p>
                <p className="text-xl font-bold">{pendentes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ações Concluídas</p>
                <p className="text-xl font-bold">{acoes.filter(a => a.concluida).length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mensagem do Consultor */}
        {mensagem && (
          <div className="bg-gradient-to-r from-[#1E3A5F] to-[#2a4a73] rounded-lg p-6 text-white">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              💬 Mensagem do Consultor
            </h3>
            <p className="text-white/90 mb-3">{mensagem.mensagem}</p>
            <p className="text-white/60 text-sm">— {mensagem.autor}, {new Date(mensagem.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        )}

        {/* Insights */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4">📋 Últimos Insights</h2>
          {insights.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhum insight ainda</p>
          ) : (
            <div className="space-y-3">
              {insights.slice(0, 5).map((insight) => (
                <div
                  key={insight.id}
                  onClick={() => !insight.lido && marcarInsightLido(insight.id)}
                  className={`border-l-4 rounded-r-lg p-4 cursor-pointer ${categoriaCor(insight.categoria)} ${!insight.lido ? 'ring-2 ring-blue-200' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {categoriaIcon(insight.categoria)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{insight.titulo}</h4>
                        {!insight.lido && <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">Novo</span>}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.conteudo.slice(0, 150)}...</p>
                      <p className="text-xs text-gray-400 mt-2">{new Date(insight.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4">⚡ Ações Recomendadas</h2>
          {acoes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma ação pendente</p>
          ) : (
            <div className="space-y-2">
              {acoes.map((acao) => (
                <div key={acao.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={acao.concluida}
                    onChange={(e) => marcarAcaoConcluida(acao.id, e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300"
                  />
                  <div className={acao.concluida ? 'line-through text-gray-400' : ''}>
                    <p className="font-medium">{acao.titulo}</p>
                    {acao.descricao && <p className="text-sm text-gray-500">{acao.descricao}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
