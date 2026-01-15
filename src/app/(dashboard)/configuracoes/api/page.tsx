'use client'
import { useState, useEffect } from 'react'
import { Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle, ExternalLink } from 'lucide-react'

export default function ConfiguracoesApiPage() {
  const [apiKeys, setApiKeys] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [novaChave, setNovaChave] = useState<any>(null)
  const [nome, setNome] = useState('')
  const [criando, setCriando] = useState(false)
  const [copiado, setCopiado] = useState<string | null>(null)

  useEffect(() => {
    carregarChaves()
  }, [])

  const carregarChaves = async () => {
    const res = await fetch('/api/configuracoes/api-keys')
    const data = await res.json()
    if (Array.isArray(data)) setApiKeys(data)
    setLoading(false)
  }

  const criarChave = async () => {
    if (!nome.trim()) return
    setCriando(true)

    const res = await fetch('/api/configuracoes/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome })
    })
    const data = await res.json()
    setNovaChave(data)
    setNome('')
    setCriando(false)
    carregarChaves()
  }

  const toggleAtiva = async (id: string, ativa: boolean) => {
    await fetch(`/api/configuracoes/api-keys/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativa: !ativa })
    })
    carregarChaves()
  }

  const excluir = async (id: string) => {
    if (!confirm('Tem certeza? Esta ação não pode ser desfeita.')) return
    await fetch(`/api/configuracoes/api-keys/${id}`, { method: 'DELETE' })
    carregarChaves()
  }

  const copiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto)
    setCopiado(id)
    setTimeout(() => setCopiado(null), 2000)
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🔑 API e Integrações
        </h1>
        <p className="text-gray-500">Conecte seu ERP ao BMV via API</p>
      </div>

      {/* Documentação rápida */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h2 className="font-semibold text-blue-900 mb-3">📖 Como usar a API</h2>
        <div className="space-y-2 text-sm text-blue-800">
          <p><strong>Base URL:</strong> {baseUrl}/api/v1</p>
          <p><strong>Autenticação:</strong> Header <code className="bg-blue-100 px-1 rounded">x-api-key: sua_chave</code></p>
          <p><strong>Endpoints disponíveis:</strong></p>
          <ul className="list-disc ml-6 space-y-1">
            <li><code>POST /api/v1/clientes</code> - Criar/atualizar clientes</li>
            <li><code>POST /api/v1/fornecedores</code> - Criar/atualizar fornecedores</li>
            <li><code>POST /api/v1/financeiro</code> - Criar lançamentos financeiros</li>
          </ul>
        </div>
      </div>

      {/* Criar nova chave */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Criar Nova Chave
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Nome da chave (ex: Integração Omie)"
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            onClick={criarChave}
            disabled={criando || !nome.trim()}
            className="px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73] disabled:opacity-50"
          >
            {criando ? 'Criando...' : 'Criar Chave'}
          </button>
        </div>
      </div>

      {/* Modal nova chave criada */}
      {novaChave && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <div className="text-center mb-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <h2 className="text-xl font-bold">Chave Criada!</h2>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 text-sm mb-2">⚠️ Guarde esta chave! Ela não será mostrada novamente.</p>
              <div className="flex items-center gap-2 bg-white rounded p-2">
                <code className="flex-1 text-sm break-all">{novaChave.chave}</code>
                <button
                  onClick={() => copiar(novaChave.chave, 'nova')}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {copiado === 'nova' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              onClick={() => setNovaChave(null)}
              className="w-full px-4 py-2 bg-[#1E3A5F] text-white rounded-lg"
            >
              Entendi, guardei a chave
            </button>
          </div>
        </div>
      )}

      {/* Lista de chaves */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="px-4 py-3 border-b bg-gray-50">
          <h2 className="font-semibold">Suas Chaves de API</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Carregando...</div>
        ) : apiKeys.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma chave de API criada</p>
          </div>
        ) : (
          <div className="divide-y">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${key.ativa ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <p className="font-medium">{key.nome}</p>
                  <p className="text-sm text-gray-500 font-mono">{key.chaveMascarada}</p>
                  <p className="text-xs text-gray-400">
                    Criada em {new Date(key.createdAt).toLocaleDateString('pt-BR')}
                    {key.ultimoUso && ` • Último uso: ${new Date(key.ultimoUso).toLocaleDateString('pt-BR')}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAtiva(key.id, key.ativa)}
                    className={`px-3 py-1 rounded text-sm ${
                      key.ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {key.ativa ? 'Ativa' : 'Inativa'}
                  </button>
                  <button
                    onClick={() => excluir(key.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Exemplo de uso */}
      <div className="mt-6 bg-gray-900 rounded-lg p-6 text-gray-100">
        <h3 className="font-semibold mb-3 text-white">💻 Exemplo de uso (cURL)</h3>
        <pre className="text-sm overflow-x-auto">
{`curl -X POST ${baseUrl}/api/v1/clientes \\
  -H "x-api-key: bmv_live_sua_chave_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{
    "nome": "Empresa ABC",
    "cpfCnpj": "12.345.678/0001-90",
    "email": "contato@empresa.com"
  }'`}
        </pre>
      </div>
    </div>
  )
}
