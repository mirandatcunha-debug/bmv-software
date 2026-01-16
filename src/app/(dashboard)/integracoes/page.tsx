'use client'
import { useState, useEffect } from 'react'
import { Plug, CheckCircle, XCircle, RefreshCw, Unplug, ExternalLink, AlertTriangle } from 'lucide-react'

export default function IntegracoesPage() {
  const [erps, setErps] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalERP, setModalERP] = useState<any>(null)
  const [credenciais, setCredenciais] = useState<Record<string, string>>({})
  const [conectando, setConectando] = useState(false)
  const [sincronizando, setSincronizando] = useState<string | null>(null)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')

  useEffect(() => {
    carregarERPs()
  }, [])

  const carregarERPs = async () => {
    const res = await fetch('/api/integracoes')
    const data = await res.json()
    if (Array.isArray(data)) setErps(data)
    setLoading(false)
  }

  const abrirModal = (erp: any) => {
    setModalERP(erp)
    setCredenciais({})
    setErro('')
    setSucesso('')
  }

  const conectar = async () => {
    setConectando(true)
    setErro('')

    try {
      const res = await fetch('/api/integracoes/conectar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: modalERP.tipo, credenciais })
      })
      const data = await res.json()

      if (res.ok) {
        setSucesso('Conectado com sucesso!')
        setTimeout(() => {
          setModalERP(null)
          carregarERPs()
        }, 1500)
      } else {
        setErro(data.error || 'Erro ao conectar')
      }
    } catch (err) {
      setErro('Erro ao conectar')
    } finally {
      setConectando(false)
    }
  }

  const sincronizar = async (tipo: string) => {
    setSincronizando(tipo)

    try {
      const res = await fetch(`/api/integracoes/${tipo}/sync`, { method: 'POST' })
      const data = await res.json()

      if (res.ok) {
        alert(`Sincronização concluída!\n\nClientes: ${data.resultados.clientes.criados} criados\nContas a Receber: ${data.resultados.contasReceber.criados} criadas`)
      } else {
        alert('Erro: ' + (data.error || 'Falha na sincronização'))
      }
    } catch (err) {
      alert('Erro ao sincronizar')
    } finally {
      setSincronizando(null)
      carregarERPs()
    }
  }

  const desconectar = async (tipo: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta integração?')) return

    await fetch(`/api/integracoes/${tipo}/desconectar`, { method: 'POST' })
    carregarERPs()
  }

  if (loading) {
    return <div className="p-6 text-center">Carregando...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🔌 Integrações com ERPs
        </h1>
        <p className="text-gray-500">Conecte seu ERP para sincronizar dados automaticamente</p>
      </div>

      {/* Lista de ERPs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {erps.map((erp) => (
          <div key={erp.tipo} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl font-bold text-gray-400">
                  {erp.nome[0]}
                </div>
                <div>
                  <h3 className="font-semibold">{erp.nome}</h3>
                  <p className="text-sm text-gray-500">{erp.descricao}</p>
                </div>
              </div>
              {erp.conectado && (
                <span className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                </span>
              )}
            </div>

            {/* Recursos */}
            <div className="mb-4">
              <p className="text-xs text-gray-400 mb-1">Sincroniza:</p>
              <div className="flex flex-wrap gap-1">
                {erp.recursos.slice(0, 4).map((recurso: string) => (
                  <span key={recurso} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                    {recurso}
                  </span>
                ))}
              </div>
            </div>

            {/* Status da última sync */}
            {erp.integracao && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`flex items-center gap-1 ${
                    erp.integracao.statusSync === 'SUCESSO' ? 'text-green-600' :
                    erp.integracao.statusSync === 'ERRO' ? 'text-red-600' :
                    erp.integracao.statusSync === 'SINCRONIZANDO' ? 'text-blue-600' :
                    'text-gray-500'
                  }`}>
                    {erp.integracao.statusSync === 'SUCESSO' && <CheckCircle className="w-4 h-4" />}
                    {erp.integracao.statusSync === 'ERRO' && <XCircle className="w-4 h-4" />}
                    {erp.integracao.statusSync === 'SINCRONIZANDO' && <RefreshCw className="w-4 h-4 animate-spin" />}
                    {erp.integracao.statusSync || 'Nunca sincronizado'}
                  </span>
                </div>
                {erp.integracao.ultimaSync && (
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-gray-500">Última sync:</span>
                    <span>{new Date(erp.integracao.ultimaSync).toLocaleString('pt-BR')}</span>
                  </div>
                )}
                {erp.integracao.erroSync && (
                  <div className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded">
                    {erp.integracao.erroSync}
                  </div>
                )}
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-2">
              {erp.conectado ? (
                <>
                  <button
                    onClick={() => sincronizar(erp.tipo)}
                    disabled={sincronizando === erp.tipo}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73] disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${sincronizando === erp.tipo ? 'animate-spin' : ''}`} />
                    {sincronizando === erp.tipo ? 'Sincronizando...' : 'Sincronizar'}
                  </button>
                  <button
                    onClick={() => desconectar(erp.tipo)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Desconectar"
                  >
                    <Unplug className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => abrirModal(erp)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-[#1E3A5F] text-[#1E3A5F] rounded-lg hover:bg-[#1E3A5F]/5"
                >
                  <Plug className="w-4 h-4" /> Conectar
                </button>
              )}
            </div>

            {/* Link documentação */}
            <a
              href={erp.documentacao}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 mt-3 text-sm text-gray-500 hover:text-gray-700"
            >
              <ExternalLink className="w-3 h-3" /> Documentação
            </a>
          </div>
        ))}
      </div>

      {/* Modal Conectar */}
      {modalERP && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Plug className="w-5 h-5" /> Conectar {modalERP.nome}
            </h2>

            {erro && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> {erro}
              </div>
            )}

            {sucesso && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> {sucesso}
              </div>
            )}

            <div className="space-y-4">
              {modalERP.campos.map((campo: any) => (
                <div key={campo.campo}>
                  <label className="block text-sm font-medium mb-1">
                    {campo.nome} {campo.obrigatorio && '*'}
                  </label>
                  <input
                    type={campo.tipo === 'password' ? 'password' : 'text'}
                    value={credenciais[campo.campo] || ''}
                    onChange={(e) => setCredenciais({ ...credenciais, [campo.campo]: e.target.value })}
                    placeholder={campo.placeholder}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                  {campo.ajuda && (
                    <p className="text-xs text-gray-500 mt-1">{campo.ajuda}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalERP(null)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={conectar}
                disabled={conectando}
                className="flex-1 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73] disabled:opacity-50"
              >
                {conectando ? 'Conectando...' : 'Conectar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
