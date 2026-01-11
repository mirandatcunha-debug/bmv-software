'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Upload,
  FileSpreadsheet,
  ChevronRight,
  ChevronLeft,
  Check,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  ArrowRight,
  Download,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  parseExcel,
  parseCSV,
  mapearColunas,
  camposPorTipo,
  gerarTemplateImportacao,
  type DadosImportacao,
  type TipoImportacao,
  type MapeamentoSugerido,
} from '@/lib/importacao'

interface ImportModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tipoImportacao?: TipoImportacao
}

type Passo = 'upload' | 'preview' | 'mapeamento' | 'importando' | 'resultado'

interface ResultadoImportacao {
  total: number
  importados: number
  erros: number
  detalhesErros: string[]
}

export function ImportModal({ open, onOpenChange, tipoImportacao: tipoInicial }: ImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Estado do wizard
  const [passo, setPasso] = useState<Passo>('upload')
  const [tipoImportacao, setTipoImportacao] = useState<TipoImportacao>(tipoInicial || 'lancamentos')

  // Estado do arquivo
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [dados, setDados] = useState<DadosImportacao | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Estado do mapeamento
  const [mapeamentoSugerido, setMapeamentoSugerido] = useState<MapeamentoSugerido | null>(null)
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({})

  // Estado da importação
  const [progresso, setProgresso] = useState(0)
  const [resultado, setResultado] = useState<ResultadoImportacao | null>(null)

  // Reset ao fechar
  const handleClose = useCallback(() => {
    setPasso('upload')
    setArquivo(null)
    setDados(null)
    setErro(null)
    setMapeamentoSugerido(null)
    setMapeamento({})
    setProgresso(0)
    setResultado(null)
    onOpenChange(false)
  }, [onOpenChange])

  // Upload de arquivo
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]

    const isValidType = allowedTypes.includes(file.type) ||
      file.name.endsWith('.csv') ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')

    if (!isValidType) {
      setErro('Tipo de arquivo inválido. Apenas .xlsx, .xls ou .csv são aceitos.')
      return
    }

    setArquivo(file)
    setErro(null)
    setLoading(true)

    try {
      let dadosImportados: DadosImportacao

      if (file.name.endsWith('.csv')) {
        dadosImportados = await parseCSV(file)
      } else {
        dadosImportados = await parseExcel(file)
      }

      if (dadosImportados.linhas.length === 0) {
        throw new Error('O arquivo não contém dados para importar')
      }

      setDados(dadosImportados)
      setPasso('preview')
    } catch (err: any) {
      setErro(err.message || 'Erro ao processar arquivo')
      setArquivo(null)
    } finally {
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Avançar para mapeamento
  const avancarParaMapeamento = () => {
    if (!dados) return

    const sugestao = mapearColunas(dados.colunas, tipoImportacao, dados.tiposColunas)
    setMapeamentoSugerido(sugestao)

    // Inicializar mapeamento com sugestões
    const mapeamentoInicial: Record<string, string> = {}
    sugestao.mapeamentos.forEach(m => {
      mapeamentoInicial[m.colunaArquivo] = m.campoSistema
    })
    setMapeamento(mapeamentoInicial)

    setPasso('mapeamento')
  }

  // Atualizar mapeamento
  const atualizarMapeamento = (coluna: string, campo: string) => {
    setMapeamento(prev => ({ ...prev, [coluna]: campo }))
  }

  // Verificar se campos obrigatórios estão mapeados
  const camposObrigatoriosMapeados = () => {
    const obrigatorios = camposPorTipo[tipoImportacao].filter(c => c.obrigatorio).map(c => c.campo)
    const mapeados = Object.values(mapeamento).filter(v => v !== '')
    return obrigatorios.every(o => mapeados.includes(o))
  }

  // Iniciar importação
  const iniciarImportacao = async () => {
    if (!dados || !arquivo) return

    setPasso('importando')
    setProgresso(0)

    try {
      const formData = new FormData()
      formData.append('file', arquivo)
      formData.append('tipoImportacao', tipoImportacao)
      formData.append('mapeamento', JSON.stringify(mapeamento))

      // Simular progresso durante a importação
      const progressInterval = setInterval(() => {
        setProgresso(prev => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch('/api/importacao/processar', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)
      setProgresso(100)

      if (response.ok) {
        const result = await response.json()
        setResultado({
          total: result.total || dados.linhas.length,
          importados: result.importados || 0,
          erros: result.erros || 0,
          detalhesErros: result.detalhesErros || [],
        })
      } else {
        const error = await response.json()
        setResultado({
          total: dados.linhas.length,
          importados: 0,
          erros: dados.linhas.length,
          detalhesErros: [error.message || 'Erro ao processar importação'],
        })
      }

      setPasso('resultado')
    } catch (err: any) {
      setResultado({
        total: dados?.linhas.length || 0,
        importados: 0,
        erros: dados?.linhas.length || 0,
        detalhesErros: [err.message || 'Erro de conexão'],
      })
      setPasso('resultado')
    }
  }

  // Baixar template
  const handleDownloadTemplate = async () => {
    try {
      const buffer = await gerarTemplateImportacao(tipoImportacao)
      const uint8Array = new Uint8Array(buffer)
      const blob = new Blob([uint8Array], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template_${tipoImportacao}.xlsx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao gerar template:', err)
    }
  }

  // Labels dos tipos de importação
  const labelsTipo: Record<TipoImportacao, string> = {
    clientes: 'Clientes',
    fornecedores: 'Fornecedores',
    contas_receber: 'Contas a Receber',
    contas_pagar: 'Contas a Pagar',
    lancamentos: 'Lançamentos',
  }

  // Labels dos passos
  const labelsPassos: Record<Passo, string> = {
    upload: 'Upload',
    preview: 'Preview',
    mapeamento: 'Mapeamento',
    importando: 'Importando',
    resultado: 'Resultado',
  }

  const passosOrdem: Passo[] = ['upload', 'preview', 'mapeamento', 'importando', 'resultado']
  const passoAtualIndex = passosOrdem.indexOf(passo)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-green-600" />
            Importar Dados
          </DialogTitle>
          <DialogDescription>
            Importe dados de planilhas Excel ou arquivos CSV para o sistema
          </DialogDescription>
        </DialogHeader>

        {/* Indicador de Passos */}
        <div className="flex items-center justify-center gap-2 py-4 border-b">
          {passosOrdem.slice(0, 4).map((p, index) => (
            <div key={p} className="flex items-center">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                index < passoAtualIndex && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                index === passoAtualIndex && "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
                index > passoAtualIndex && "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              )}>
                {index < passoAtualIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                    {index + 1}
                  </span>
                )}
                {labelsPassos[p]}
              </div>
              {index < 3 && (
                <ChevronRight className="h-4 w-4 text-slate-300 mx-1" />
              )}
            </div>
          ))}
        </div>

        {/* Conteúdo do Passo */}
        <div className="flex-1 overflow-y-auto py-4">
          {/* PASSO 1: Upload */}
          {passo === 'upload' && (
            <div className="space-y-6">
              {/* Seleção do tipo de importação */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Importação</label>
                <Select value={tipoImportacao} onValueChange={(v) => setTipoImportacao(v as TipoImportacao)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(labelsTipo).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Área de upload */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer",
                  "hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10",
                  loading && "pointer-events-none opacity-50"
                )}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileSelect}
                />

                {loading ? (
                  <div className="space-y-3">
                    <Loader2 className="h-12 w-12 mx-auto text-cyan-600 animate-spin" />
                    <p className="text-sm text-muted-foreground">Processando arquivo...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="h-12 w-12 mx-auto text-slate-400" />
                    <div>
                      <p className="font-medium">Clique para selecionar ou arraste o arquivo</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Formatos aceitos: .xlsx, .xls, .csv
                      </p>
                    </div>
                    <div className="flex justify-center gap-2">
                      <Badge variant="secondary">.xlsx</Badge>
                      <Badge variant="secondary">.xls</Badge>
                      <Badge variant="secondary">.csv</Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Erro */}
              {erro && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 rounded-lg text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{erro}</p>
                </div>
              )}

              {/* Baixar template */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">Não tem um arquivo preparado?</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Baixe nosso template com os campos corretos
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Template
                </Button>
              </div>
            </div>
          )}

          {/* PASSO 2: Preview */}
          {passo === 'preview' && dados && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Preview dos Dados</p>
                  <p className="text-sm text-muted-foreground">
                    {dados.totalLinhas} registros encontrados em {dados.colunas.length} colunas
                  </p>
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {arquivo?.name}
                </Badge>
              </div>

              {/* Tabela de preview */}
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50 dark:bg-slate-800">
                      <TableRow>
                        <TableHead className="w-12 text-center">#</TableHead>
                        {dados.colunas.map(col => (
                          <TableHead key={col} className="min-w-[120px]">
                            <div className="flex items-center gap-1">
                              {col}
                              <Badge variant="outline" className="text-[10px] ml-1">
                                {dados.tiposColunas[col]}
                              </Badge>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dados.linhas.slice(0, 10).map((linha, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-center text-muted-foreground text-xs">
                            {idx + 1}
                          </TableCell>
                          {dados.colunas.map(col => (
                            <TableCell key={col} className="text-sm">
                              {formatarValorPreview(linha[col])}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {dados.totalLinhas > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  Mostrando 10 de {dados.totalLinhas} registros
                </p>
              )}
            </div>
          )}

          {/* PASSO 3: Mapeamento */}
          {passo === 'mapeamento' && dados && mapeamentoSugerido && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">Mapeamento de Colunas</p>
                <p className="text-sm text-muted-foreground">
                  Associe cada coluna do arquivo ao campo correspondente no sistema
                </p>
              </div>

              {/* Alerta de campos obrigatórios */}
              {!camposObrigatoriosMapeados() && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30 rounded-lg text-amber-700 dark:text-amber-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">
                    Campos obrigatórios não mapeados: {
                      camposPorTipo[tipoImportacao]
                        .filter(c => c.obrigatorio && !Object.values(mapeamento).includes(c.campo))
                        .map(c => c.label)
                        .join(', ')
                    }
                  </p>
                </div>
              )}

              {/* Grid de mapeamento */}
              <div className="grid gap-3 md:grid-cols-2">
                {dados.colunas.map(coluna => {
                  const sugestao = mapeamentoSugerido.mapeamentos.find(m => m.colunaArquivo === coluna)
                  const campoAtual = mapeamento[coluna] || ''
                  const campoInfo = camposPorTipo[tipoImportacao].find(c => c.campo === campoAtual)

                  return (
                    <div
                      key={coluna}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                        campoAtual ? "bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30" : "bg-slate-50 dark:bg-slate-800/50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{coluna}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Ex: {formatarValorPreview(dados.linhas[0]?.[coluna])}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

                      <Select
                        value={campoAtual}
                        onValueChange={(v) => atualizarMapeamento(coluna, v)}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="Não importar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Não importar</SelectItem>
                          {camposPorTipo[tipoImportacao].map(campo => (
                            <SelectItem
                              key={campo.campo}
                              value={campo.campo}
                              disabled={
                                campo.campo !== campoAtual &&
                                Object.values(mapeamento).includes(campo.campo)
                              }
                            >
                              {campo.label}
                              {campo.obrigatorio && ' *'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {sugestao && sugestao.confianca > 0.7 && campoAtual === sugestao.campoSistema && (
                        <Badge variant="secondary" className="text-[10px]">
                          Auto
                        </Badge>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legenda */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <span>* Campos obrigatórios</span>
                <span className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-[10px]">Auto</Badge>
                  Mapeado automaticamente
                </span>
              </div>
            </div>
          )}

          {/* PASSO 4: Importando */}
          {passo === 'importando' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <Loader2 className="h-16 w-16 text-cyan-600 animate-spin" />
              <div className="text-center">
                <p className="font-medium text-lg">Importando dados...</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Por favor, aguarde enquanto processamos seus dados
                </p>
              </div>
              <div className="w-full max-w-md space-y-2">
                <Progress value={progresso} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">{progresso}%</p>
              </div>
            </div>
          )}

          {/* PASSO 5: Resultado */}
          {passo === 'resultado' && resultado && (
            <div className="space-y-6">
              {/* Resumo */}
              <div className={cn(
                "p-6 rounded-xl text-center",
                resultado.erros === 0
                  ? "bg-green-50 dark:bg-green-900/20"
                  : resultado.importados === 0
                    ? "bg-red-50 dark:bg-red-900/20"
                    : "bg-amber-50 dark:bg-amber-900/20"
              )}>
                {resultado.erros === 0 ? (
                  <CheckCircle2 className="h-16 w-16 mx-auto text-green-600" />
                ) : resultado.importados === 0 ? (
                  <XCircle className="h-16 w-16 mx-auto text-red-600" />
                ) : (
                  <AlertCircle className="h-16 w-16 mx-auto text-amber-600" />
                )}

                <h3 className="text-xl font-semibold mt-4">
                  {resultado.erros === 0
                    ? 'Importação Concluída!'
                    : resultado.importados === 0
                      ? 'Falha na Importação'
                      : 'Importação Parcial'}
                </h3>
              </div>

              {/* Estatísticas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <p className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                    {resultado.total}
                  </p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {resultado.importados}
                  </p>
                  <p className="text-sm text-muted-foreground">Importados</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">
                    {resultado.erros}
                  </p>
                  <p className="text-sm text-muted-foreground">Erros</p>
                </div>
              </div>

              {/* Detalhes de erros */}
              {resultado.detalhesErros.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-sm">Detalhes dos erros:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    {resultado.detalhesErros.slice(0, 10).map((erro, idx) => (
                      <p key={idx} className="text-xs text-red-600 dark:text-red-400">
                        {erro}
                      </p>
                    ))}
                    {resultado.detalhesErros.length > 10 && (
                      <p className="text-xs text-muted-foreground">
                        ... e mais {resultado.detalhesErros.length - 10} erros
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botões de navegação */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {(passo === 'preview' || passo === 'mapeamento') && (
              <Button
                variant="ghost"
                onClick={() => setPasso(passo === 'mapeamento' ? 'preview' : 'upload')}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {passo !== 'resultado' && passo !== 'importando' && (
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            )}

            {passo === 'preview' && (
              <Button onClick={avancarParaMapeamento} className="bg-cyan-600 hover:bg-cyan-700">
                Continuar
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {passo === 'mapeamento' && (
              <Button
                onClick={iniciarImportacao}
                disabled={!camposObrigatoriosMapeados()}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Importar Dados
              </Button>
            )}

            {passo === 'resultado' && (
              <Button onClick={handleClose} className="bg-cyan-600 hover:bg-cyan-700">
                Concluir
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Função auxiliar para formatar valores no preview
function formatarValorPreview(valor: string | number | Date | null | undefined): string {
  if (valor === null || valor === undefined) {
    return '-'
  }

  if (valor instanceof Date) {
    return valor.toLocaleDateString('pt-BR')
  }

  if (typeof valor === 'number') {
    return valor.toLocaleString('pt-BR')
  }

  const str = String(valor)
  return str.length > 50 ? str.substring(0, 47) + '...' : str
}
