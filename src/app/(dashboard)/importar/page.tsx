'use client'
import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Upload, FileSpreadsheet, Users, Truck, ArrowDownCircle, ArrowUpCircle, Receipt, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

const TIPOS = [
  { id: 'clientes', nome: 'Clientes', icone: Users, cor: 'blue' },
  { id: 'fornecedores', nome: 'Fornecedores', icone: Truck, cor: 'purple' },
  { id: 'contasReceber', nome: 'Contas a Receber', icone: ArrowDownCircle, cor: 'green' },
  { id: 'contasPagar', nome: 'Contas a Pagar', icone: ArrowUpCircle, cor: 'red' },
  { id: 'movimentacoes', nome: 'Movimentações', icone: Receipt, cor: 'orange' }
]

export default function ImportarPage() {
  const [tipoSelecionado, setTipoSelecionado] = useState<string | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [resultado, setResultado] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [importando, setImportando] = useState(false)
  const [concluido, setConcluido] = useState<any>(null)
  const [dragOver, setDragOver] = useState(false)

  const validarArquivo = useCallback(async (file: File, tipo: string) => {
    setLoading(true)
    setResultado(null)
    setConcluido(null)

    const formData = new FormData()
    formData.append('arquivo', file)
    formData.append('tipo', tipo)

    try {
      const res = await fetch('/api/importacao/validar', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      setResultado(data)
    } catch (err) {
      console.error('Erro ao validar:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      setArquivo(file)
      if (tipoSelecionado) {
        validarArquivo(file, tipoSelecionado)
      }
    }
  }, [tipoSelecionado, validarArquivo])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && tipoSelecionado) {
      setArquivo(file)
      validarArquivo(file, tipoSelecionado)
    }
  }

  const executarImportacao = async () => {
    if (!resultado || !tipoSelecionado) return

    setImportando(true)

    try {
      const res = await fetch('/api/importacao/executar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoSelecionado,
          linhas: resultado.linhas
        })
      })
      const data = await res.json()
      setConcluido(data)
    } catch (err) {
      console.error('Erro ao importar:', err)
    } finally {
      setImportando(false)
    }
  }

  const resetar = () => {
    setArquivo(null)
    setResultado(null)
    setConcluido(null)
  }

  const downloadTemplate = (tipo: string) => {
    window.open(`/api/importacao/template/${tipo}`, '_blank')
  }

  const getLinkDestino = () => {
    switch (tipoSelecionado) {
      case 'clientes': return '/cadastros/clientes'
      case 'fornecedores': return '/cadastros/fornecedores'
      case 'contasReceber': return '/financeiro/contas-receber'
      case 'contasPagar': return '/financeiro/contas-pagar'
      default: return '/financeiro/movimentacoes'
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Upload className="w-6 h-6" /> Importar Dados
        </h1>
        <p className="text-gray-500">Importe dados do seu ERP ou planilhas</p>
      </div>

      {/* Passo 1: Selecionar tipo */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="font-semibold mb-4">1. O que deseja importar?</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {TIPOS.map((tipo) => {
            const Icon = tipo.icone
            const selecionado = tipoSelecionado === tipo.id
            return (
              <button
                key={tipo.id}
                onClick={() => { setTipoSelecionado(tipo.id); resetar() }}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selecionado
                    ? 'border-[#1E3A5F] bg-[#1E3A5F]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-8 h-8 mx-auto mb-2 ${selecionado ? 'text-[#1E3A5F]' : 'text-gray-400'}`} />
                <p className={`text-sm font-medium ${selecionado ? 'text-[#1E3A5F]' : 'text-gray-600'}`}>
                  {tipo.nome}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Passo 2: Template e Upload */}
      {tipoSelecionado && !concluido && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-4">2. Envie seu arquivo</h2>

          {/* Download template */}
          <div className="mb-4 p-4 bg-blue-50 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900">Baixe o template</p>
              <p className="text-sm text-blue-700">Use nosso modelo para garantir que os dados sejam importados corretamente</p>
            </div>
            <button
              onClick={() => downloadTemplate(tipoSelecionado)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" /> CSV
            </button>
          </div>

          {/* Drag and drop */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-[#1E3A5F] bg-[#1E3A5F]/5' : 'border-gray-300'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Arraste seu arquivo aqui ou{' '}
              <label className="text-[#1E3A5F] cursor-pointer hover:underline">
                clique para selecionar
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-sm text-gray-400">Formatos aceitos: CSV, Excel (.xlsx, .xls)</p>
          </div>

          {arquivo && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-green-600" />
              <div className="flex-1">
                <p className="font-medium">{arquivo.name}</p>
                <p className="text-sm text-gray-500">{(arquivo.size / 1024).toFixed(1)} KB</p>
              </div>
              <button onClick={resetar} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
          )}
        </div>
      )}

      {/* Passo 3: Validação */}
      {loading && (
        <div className="bg-white rounded-lg border p-6 mb-6 text-center">
          <div className="w-8 h-8 border-2 border-[#1E3A5F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validando arquivo...</p>
        </div>
      )}

      {resultado && !concluido && (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="font-semibold mb-4">3. Validação</h2>

          {/* Resumo */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg text-center">
              <p className="text-2xl font-bold">{resultado.total}</p>
              <p className="text-sm text-gray-500">Total de linhas</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{resultado.validos}</p>
              <p className="text-sm text-green-600">Válidos</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">{resultado.invalidos}</p>
              <p className="text-sm text-red-600">Com erros</p>
            </div>
          </div>

          {/* Prévia */}
          {resultado.linhas?.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Prévia dos dados:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Status</th>
                      <th className="px-3 py-2 text-left">Linha</th>
                      {Object.keys(resultado.linhas[0]?.dados || {}).slice(0, 4).map((col: string) => (
                        <th key={col} className="px-3 py-2 text-left capitalize">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {resultado.linhas.slice(0, 10).map((linha: any) => (
                      <tr key={linha.linha} className={linha.valido ? '' : 'bg-red-50'}>
                        <td className="px-3 py-2">
                          {linha.valido ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </td>
                        <td className="px-3 py-2">{linha.linha}</td>
                        {Object.values(linha.dados).slice(0, 4).map((val: any, i: number) => (
                          <td key={i} className="px-3 py-2 truncate max-w-[150px]">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val || '-')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {resultado.total > 10 && (
                <p className="text-sm text-gray-500 mt-2">Mostrando 10 de {resultado.total} linhas</p>
              )}
            </div>
          )}

          {/* Erros */}
          {resultado.invalidos > 0 && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg">
              <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Linhas com problemas
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {resultado.linhas.filter((l: any) => !l.valido).slice(0, 5).map((linha: any) => (
                  <div key={linha.linha} className="text-sm text-red-700">
                    <strong>Linha {linha.linha}:</strong> {linha.erros.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <button
              onClick={resetar}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={executarImportacao}
              disabled={resultado.validos === 0 || importando}
              className="flex-1 px-4 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73] disabled:opacity-50"
            >
              {importando ? 'Importando...' : `Importar ${resultado.validos} registros`}
            </button>
          </div>
        </div>
      )}

      {/* Passo 4: Conclusão */}
      {concluido && (
        <div className="bg-white rounded-lg border p-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Importação Concluída!</h2>
          <p className="text-gray-600 mb-6">
            {concluido.importados} de {concluido.total} registros importados com sucesso
            {concluido.erros > 0 && ` (${concluido.erros} erros)`}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => { setTipoSelecionado(null); resetar() }}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Nova Importação
            </button>
            <Link
              href={getLinkDestino()}
              className="px-6 py-2 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4a73]"
            >
              Ver Registros
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
