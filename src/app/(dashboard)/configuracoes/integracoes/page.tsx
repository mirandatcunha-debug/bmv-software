'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Plug,
  Upload,
  FileSpreadsheet,
  Building2,
  Key,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  ExternalLink,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  Landmark,
  Users,
  Truck,
  Receipt,
  CreditCard,
  ArrowRightLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { ImportModal } from '@/components/importacao/ImportModal'
import type { TipoImportacao } from '@/lib/importacao'

interface BancoIntegracao {
  id: string
  nome: string
  logo: string
  cor: string
  status: 'em_breve' | 'conectado' | 'disponivel'
}

interface ColunaImportacao {
  nome: string
  exemplo: string
  mapeamento: string
}

interface PreviewDados {
  colunas: string[]
  linhas: Record<string, string>[]
  totalLinhas: number
}

const bancosIntegracao: BancoIntegracao[] = [
  { id: 'itau', nome: 'Itaú', logo: '🏦', cor: 'from-orange-500/10 to-orange-600/10', status: 'em_breve' },
  { id: 'bradesco', nome: 'Bradesco', logo: '🏦', cor: 'from-red-500/10 to-red-600/10', status: 'em_breve' },
  { id: 'nubank', nome: 'Nubank', logo: '💜', cor: 'from-purple-500/10 to-purple-600/10', status: 'em_breve' },
  { id: 'inter', nome: 'Banco Inter', logo: '🧡', cor: 'from-orange-400/10 to-orange-500/10', status: 'em_breve' },
  { id: 'santander', nome: 'Santander', logo: '🏦', cor: 'from-red-600/10 to-red-700/10', status: 'em_breve' },
  { id: 'bb', nome: 'Banco do Brasil', logo: '🏦', cor: 'from-yellow-500/10 to-yellow-600/10', status: 'em_breve' },
  { id: 'caixa', nome: 'Caixa Econômica', logo: '🏦', cor: 'from-blue-500/10 to-blue-600/10', status: 'em_breve' },
  { id: 'sicoob', nome: 'Sicoob', logo: '🏦', cor: 'from-green-500/10 to-green-600/10', status: 'em_breve' },
]

const opcoesMapemento = [
  { value: '', label: 'Não importar' },
  { value: 'data', label: 'Data' },
  { value: 'descricao', label: 'Descrição' },
  { value: 'valor', label: 'Valor' },
  { value: 'tipo', label: 'Tipo (Receita/Despesa)' },
  { value: 'categoria', label: 'Categoria' },
  { value: 'conta', label: 'Conta' },
  { value: 'observacao', label: 'Observação' },
]

export default function IntegracoesPage() {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const ofxInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [hasPermission, setHasPermission] = useState(false)

  // API Key
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [showApiKey, setShowApiKey] = useState(false)
  const [regeneratingKey, setRegeneratingKey] = useState(false)
  const [limiteRequisicoes, setLimiteRequisicoes] = useState(1000)
  const [plano, setPlano] = useState('Gratuito')

  // Import Excel/CSV
  const [uploadingFile, setUploadingFile] = useState(false)
  const [previewDados, setPreviewDados] = useState<PreviewDados | null>(null)
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({})
  const [showMapeamentoDialog, setShowMapeamentoDialog] = useState(false)
  const [arquivoSelecionado, setArquivoSelecionado] = useState<File | null>(null)
  const [processando, setProcessando] = useState(false)

  // OFX
  const [uploadingOfx, setUploadingOfx] = useState(false)
  const [previewOfx, setPreviewOfx] = useState<any[] | null>(null)
  const [showOfxDialog, setShowOfxDialog] = useState(false)

  // Import Modal
  const [showImportModal, setShowImportModal] = useState(false)
  const [tipoImportacao, setTipoImportacao] = useState<TipoImportacao>('lancamentos')

  useEffect(() => {
    checkPermissionAndFetch()
  }, [])

  const checkPermissionAndFetch = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.perfil)
        const canManage = ['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(data.perfil)
        setHasPermission(canManage)

        if (canManage) {
          await fetchApiKey()
          await fetchPlanoInfo()
        }
      }
    } catch (error) {
      console.error('Erro ao verificar permissão:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApiKey = async () => {
    try {
      const response = await fetch('/api/configuracoes/api-key')
      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
      }
    } catch (error) {
      console.error('Erro ao buscar API Key:', error)
    }
  }

  const fetchPlanoInfo = async () => {
    try {
      const response = await fetch('/api/tenant/plano')
      if (response.ok) {
        const data = await response.json()
        setPlano(data.nome || 'Gratuito')
        setLimiteRequisicoes(data.limiteRequisicoes || 1000)
      }
    } catch (error) {
      console.error('Erro ao buscar plano:', error)
    }
  }

  const handleGerarNovaChave = async () => {
    if (!confirm('Tem certeza que deseja gerar uma nova chave? A chave anterior será invalidada.')) {
      return
    }

    setRegeneratingKey(true)
    try {
      const response = await fetch('/api/configuracoes/api-key', {
        method: 'POST',
      })

      if (response.ok) {
        const data = await response.json()
        setApiKey(data.apiKey)
        setShowApiKey(true)
        toast({
          title: 'Sucesso',
          description: 'Nova chave API gerada com sucesso',
        })
      } else {
        throw new Error('Erro ao gerar chave')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar nova chave API',
        variant: 'destructive',
      })
    } finally {
      setRegeneratingKey(false)
    }
  }

  const handleCopyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      toast({
        title: 'Copiado',
        description: 'Chave API copiada para a área de transferência',
      })
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ]

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv')) {
      toast({
        title: 'Tipo inválido',
        description: 'Apenas arquivos .xlsx, .xls ou .csv são aceitos',
        variant: 'destructive',
      })
      return
    }

    setUploadingFile(true)
    setArquivoSelecionado(file)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/importacao/excel', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewDados(data)

        // Inicializar mapeamento automático
        const mapeamentoInicial: Record<string, string> = {}
        data.colunas.forEach((col: string) => {
          const colLower = col.toLowerCase()
          if (colLower.includes('data')) mapeamentoInicial[col] = 'data'
          else if (colLower.includes('descri') || colLower.includes('histor')) mapeamentoInicial[col] = 'descricao'
          else if (colLower.includes('valor') || colLower.includes('quantia')) mapeamentoInicial[col] = 'valor'
          else if (colLower.includes('tipo') || colLower.includes('natureza')) mapeamentoInicial[col] = 'tipo'
          else if (colLower.includes('categ')) mapeamentoInicial[col] = 'categoria'
          else mapeamentoInicial[col] = ''
        })
        setMapeamento(mapeamentoInicial)
        setShowMapeamentoDialog(true)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao processar arquivo')
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao processar arquivo',
        variant: 'destructive',
      })
    } finally {
      setUploadingFile(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleProcessarImportacao = async () => {
    if (!previewDados || !arquivoSelecionado) return

    setProcessando(true)
    try {
      const formData = new FormData()
      formData.append('file', arquivoSelecionado)
      formData.append('mapeamento', JSON.stringify(mapeamento))

      const response = await fetch('/api/importacao/processar', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'Sucesso',
          description: `${result.importados} registros importados com sucesso`,
        })
        setShowMapeamentoDialog(false)
        setPreviewDados(null)
        setArquivoSelecionado(null)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao importar dados')
      }
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao importar dados',
        variant: 'destructive',
      })
    } finally {
      setProcessando(false)
    }
  }

  const handleOfxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.ofx')) {
      toast({
        title: 'Tipo inválido',
        description: 'Apenas arquivos .ofx são aceitos',
        variant: 'destructive',
      })
      return
    }

    setUploadingOfx(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/importacao/ofx', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewOfx(data.transacoes)
        setShowOfxDialog(true)
      } else {
        throw new Error('Erro ao processar arquivo OFX')
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao processar arquivo OFX',
        variant: 'destructive',
      })
    } finally {
      setUploadingOfx(false)
      if (ofxInputRef.current) {
        ofxInputRef.current.value = ''
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="space-y-6 animate-in">
        <Link
          href="/configuracoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Configurações
        </Link>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Acesso Restrito
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  Você não tem permissão para acessar as configurações de API e Integrações.
                  Entre em contato com o administrador da sua conta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Configurações
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Plug className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">API e Integrações</h1>
            <p className="text-white/80">
              Importe dados, conecte bancos e acesse a API do sistema
            </p>
          </div>
        </div>
      </div>

      {/* Seção: Importação de Dados */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5 text-cyan-600" />
          <h2 className="text-lg font-semibold">Importação de Dados</h2>
        </div>

        {/* Cards de tipos de importação */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Clientes */}
          <Card
            className="group hover:shadow-md transition-all cursor-pointer hover:border-cyan-300"
            onClick={() => {
              setTipoImportacao('clientes')
              setShowImportModal(true)
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Clientes</p>
                  <p className="text-xs text-muted-foreground">Importar lista de clientes</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Fornecedores */}
          <Card
            className="group hover:shadow-md transition-all cursor-pointer hover:border-cyan-300"
            onClick={() => {
              setTipoImportacao('fornecedores')
              setShowImportModal(true)
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Fornecedores</p>
                  <p className="text-xs text-muted-foreground">Importar lista de fornecedores</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Contas a Receber */}
          <Card
            className="group hover:shadow-md transition-all cursor-pointer hover:border-cyan-300"
            onClick={() => {
              setTipoImportacao('contas_receber')
              setShowImportModal(true)
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Receipt className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Contas a Receber</p>
                  <p className="text-xs text-muted-foreground">Importar receitas pendentes</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Contas a Pagar */}
          <Card
            className="group hover:shadow-md transition-all cursor-pointer hover:border-cyan-300"
            onClick={() => {
              setTipoImportacao('contas_pagar')
              setShowImportModal(true)
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <CreditCard className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Contas a Pagar</p>
                  <p className="text-xs text-muted-foreground">Importar despesas pendentes</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Lançamentos */}
          <Card
            className="group hover:shadow-md transition-all cursor-pointer hover:border-cyan-300"
            onClick={() => {
              setTipoImportacao('lancamentos')
              setShowImportModal(true)
            }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ArrowRightLeft className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Lançamentos</p>
                  <p className="text-xs text-muted-foreground">Importar movimentações</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-cyan-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Card: Importar OFX */}
          <Card className="group hover:shadow-md transition-all">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                  <Landmark className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Extrato OFX</p>
                  <p className="text-xs text-muted-foreground">Importar extrato bancário</p>
                </div>
                <input
                  type="file"
                  ref={ofxInputRef}
                  className="hidden"
                  accept=".ofx"
                  onChange={handleOfxUpload}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => ofxInputRef.current?.click()}
                  disabled={uploadingOfx}
                >
                  {uploadingOfx ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info sobre formatos */}
        <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <FileText className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Formatos suportados: <Badge variant="secondary" className="mx-1">.xlsx</Badge>
            <Badge variant="secondary" className="mx-1">.xls</Badge>
            <Badge variant="secondary" className="mx-1">.csv</Badge>
            <Badge variant="secondary" className="mx-1">.ofx</Badge>
          </p>
        </div>
      </div>

      <Separator />

      {/* Seção: Integrações Bancárias */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-cyan-600" />
          <h2 className="text-lg font-semibold">Integrações Bancárias</h2>
          <Badge variant="outline" className="text-xs">Em desenvolvimento</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {bancosIntegracao.map((banco) => (
            <Card key={banco.id} className={cn(
              "group cursor-not-allowed opacity-75 hover:opacity-100 transition-all",
              "bg-gradient-to-br",
              banco.cor
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{banco.logo}</span>
                    <div>
                      <p className="font-medium">{banco.nome}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[10px] mt-1",
                          banco.status === 'conectado' && "bg-green-100 text-green-700",
                          banco.status === 'em_breve' && "bg-slate-100 text-slate-600"
                        )}
                      >
                        {banco.status === 'conectado' ? 'Conectado' : 'Em breve'}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="opacity-50"
                  >
                    Conectar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed bg-slate-50 dark:bg-slate-900/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Integrações bancárias em desenvolvimento</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Em breve você poderá conectar suas contas bancárias para sincronização automática de extratos.
                  Enquanto isso, utilize a importação de arquivos OFX disponível acima.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Seção: API para Desenvolvedores */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-cyan-600" />
          <h2 className="text-lg font-semibold">API para Desenvolvedores</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Key className="h-5 w-5 text-amber-600" />
              Chave de API
            </CardTitle>
            <CardDescription>
              Use esta chave para autenticar suas requisições à API do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey || 'Nenhuma chave gerada'}
                    readOnly
                    className="pr-20 font-mono text-sm bg-slate-50 dark:bg-slate-800"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    {apiKey && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={handleCopyApiKey}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleGerarNovaChave}
                  disabled={regeneratingKey}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  {regeneratingKey ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {apiKey ? 'Regenerar Chave' : 'Gerar Chave'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Mantenha sua chave segura. Não a compartilhe publicamente.
              </p>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm font-medium">Plano Atual</p>
                <p className="text-2xl font-bold text-cyan-600 mt-1">{plano}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-sm font-medium">Limite de Requisições</p>
                <p className="text-2xl font-bold text-cyan-600 mt-1">
                  {limiteRequisicoes.toLocaleString('pt-BR')}/mês
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30">
              <FileText className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Documentação da API
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Acesse a documentação completa com exemplos de uso
                </p>
              </div>
              <Button variant="outline" size="sm" className="border-blue-300">
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Docs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog: Mapeamento de Colunas Excel/CSV */}
      <Dialog open={showMapeamentoDialog} onOpenChange={setShowMapeamentoDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mapeamento de Colunas</DialogTitle>
            <DialogDescription>
              Selecione qual campo do sistema corresponde a cada coluna do seu arquivo.
              {previewDados && (
                <span className="block mt-1">
                  Total de linhas encontradas: <strong>{previewDados.totalLinhas}</strong>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {previewDados && (
            <div className="space-y-4">
              {/* Mapeamento */}
              <div className="grid gap-3 md:grid-cols-2">
                {previewDados.colunas.map((coluna) => (
                  <div key={coluna} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{coluna}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        Ex: {previewDados.linhas[0]?.[coluna] || '-'}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    <Select
                      value={mapeamento[coluna] || ''}
                      onValueChange={(value) => setMapeamento({ ...mapeamento, [coluna]: value })}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {opcoesMapemento.map((opcao) => (
                          <SelectItem key={opcao.value} value={opcao.value}>
                            {opcao.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Preview dos dados */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {previewDados.colunas.map((col) => (
                        <TableHead key={col} className="text-xs">
                          {col}
                          {mapeamento[col] && (
                            <Badge variant="secondary" className="ml-2 text-[10px]">
                              → {opcoesMapemento.find(o => o.value === mapeamento[col])?.label}
                            </Badge>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewDados.linhas.slice(0, 5).map((linha, idx) => (
                      <TableRow key={idx}>
                        {previewDados.colunas.map((col) => (
                          <TableCell key={col} className="text-xs">
                            {linha[col] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Mostrando as primeiras 5 linhas de {previewDados.totalLinhas} encontradas
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMapeamentoDialog(false)
                setPreviewDados(null)
                setArquivoSelecionado(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcessarImportacao}
              disabled={processando || !Object.values(mapeamento).some(v => v)}
              className="bg-green-600 hover:bg-green-700"
            >
              {processando ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar Importação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Preview OFX */}
      <Dialog open={showOfxDialog} onOpenChange={setShowOfxDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview do Extrato OFX</DialogTitle>
            <DialogDescription>
              Verifique os lançamentos antes de importar
            </DialogDescription>
          </DialogHeader>

          {previewOfx && previewOfx.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewOfx.slice(0, 20).map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm">{item.data}</TableCell>
                      <TableCell className="text-sm">{item.descricao}</TableCell>
                      <TableCell className={cn(
                        "text-sm text-right font-medium",
                        item.valor >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.valor >= 0 ? "default" : "destructive"}>
                          {item.valor >= 0 ? 'Receita' : 'Despesa'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lançamento encontrado no arquivo
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowOfxDialog(false)
                setPreviewOfx(null)
              }}
            >
              Cancelar
            </Button>
            <Button
              disabled={!previewOfx || previewOfx.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Importar Lançamentos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Importação Excel/CSV */}
      <ImportModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        tipoImportacao={tipoImportacao}
      />
    </div>
  )
}
