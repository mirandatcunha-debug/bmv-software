'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Activity,
  LogIn,
  LogOut,
  Key,
  Edit,
  Mail,
  Trash2,
  RefreshCw,
  FileText,
  Shield,
  ShieldOff,
  Download,
  Eye,
  Lock,
  Unlock,
  Clock,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus,
  FileDown,
  FileUp,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Atividade {
  id: string
  acao: string
  descricao: string | null
  ip: string | null
  userAgent: string | null
  criadoEm: string
}

interface PaginacaoInfo {
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

// Mapeamento de ícones para cada ação
const iconesAcao: Record<string, React.ElementType> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  LOGIN_FALHOU: AlertTriangle,
  CADASTRO: UserPlus,
  ALTEROU_DADOS: Edit,
  ALTEROU_SENHA: Key,
  ALTEROU_EMAIL: Mail,
  EXCLUIU_CONTA: Trash2,
  RECUPEROU_SENHA: RefreshCw,
  ACEITOU_TERMOS: FileText,
  ACEITOU_PRIVACIDADE: Shield,
  REVOGOU_CONSENTIMENTO: ShieldOff,
  EXPORTOU_DADOS: Download,
  SOLICITOU_EXCLUSAO: Trash2,
  VISUALIZOU_DADOS: Eye,
  ATIVOU_2FA: Lock,
  DESATIVOU_2FA: Unlock,
  SESSAO_ENCERRADA: Clock,
  PERMISSAO_CONCEDIDA: CheckCircle,
  PERMISSAO_REVOGADA: XCircle,
  CONVIDOU_USUARIO: UserPlus,
  REMOVEU_USUARIO: UserMinus,
  EXPORTOU_RELATORIO: FileDown,
  IMPORTOU_DADOS: FileUp,
}

// Cores para cada ação
const coresAcao: Record<string, string> = {
  LOGIN: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  LOGOUT: 'text-slate-600 bg-slate-100 dark:bg-slate-900/30',
  LOGIN_FALHOU: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  CADASTRO: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  ALTEROU_DADOS: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  ALTEROU_SENHA: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30',
  ALTEROU_EMAIL: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  EXCLUIU_CONTA: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  RECUPEROU_SENHA: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  ACEITOU_TERMOS: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  ACEITOU_PRIVACIDADE: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  REVOGOU_CONSENTIMENTO: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  EXPORTOU_DADOS: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  SOLICITOU_EXCLUSAO: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  VISUALIZOU_DADOS: 'text-slate-600 bg-slate-100 dark:bg-slate-900/30',
  ATIVOU_2FA: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  DESATIVOU_2FA: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
  SESSAO_ENCERRADA: 'text-slate-600 bg-slate-100 dark:bg-slate-900/30',
  PERMISSAO_CONCEDIDA: 'text-green-600 bg-green-100 dark:bg-green-900/30',
  PERMISSAO_REVOGADA: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  CONVIDOU_USUARIO: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  REMOVEU_USUARIO: 'text-red-600 bg-red-100 dark:bg-red-900/30',
  EXPORTOU_RELATORIO: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
  IMPORTOU_DADOS: 'text-green-600 bg-green-100 dark:bg-green-900/30',
}

// Labels amigáveis para as ações
const labelsAcao: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  LOGIN_FALHOU: 'Login falhou',
  CADASTRO: 'Cadastro',
  ALTEROU_DADOS: 'Alterou dados',
  ALTEROU_SENHA: 'Alterou senha',
  ALTEROU_EMAIL: 'Alterou e-mail',
  EXCLUIU_CONTA: 'Excluiu conta',
  RECUPEROU_SENHA: 'Recuperou senha',
  ACEITOU_TERMOS: 'Aceitou termos',
  ACEITOU_PRIVACIDADE: 'Aceitou privacidade',
  REVOGOU_CONSENTIMENTO: 'Revogou consentimento',
  EXPORTOU_DADOS: 'Exportou dados',
  SOLICITOU_EXCLUSAO: 'Solicitou exclusão',
  VISUALIZOU_DADOS: 'Visualizou dados',
  ATIVOU_2FA: 'Ativou 2FA',
  DESATIVOU_2FA: 'Desativou 2FA',
  SESSAO_ENCERRADA: 'Sessão encerrada',
  PERMISSAO_CONCEDIDA: 'Permissão concedida',
  PERMISSAO_REVOGADA: 'Permissão revogada',
  CONVIDOU_USUARIO: 'Convidou usuário',
  REMOVEU_USUARIO: 'Removeu usuário',
  EXPORTOU_RELATORIO: 'Exportou relatório',
  IMPORTOU_DADOS: 'Importou dados',
}

function formatarDataAtividade(data: string): string {
  const dataObj = new Date(data)
  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatarTempoRelativo(data: string): string {
  const dataObj = new Date(data)
  const agora = new Date()
  const diff = agora.getTime() - dataObj.getTime()
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return 'Agora mesmo'
  if (minutos < 60) return `Há ${minutos} min`
  if (horas < 24) return `Há ${horas}h`
  if (dias < 7) return `Há ${dias} dia${dias > 1 ? 's' : ''}`

  return formatarDataAtividade(data)
}

export default function AtividadesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [paginacao, setPaginacao] = useState<PaginacaoInfo | null>(null)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const [filtroAcao, setFiltroAcao] = useState<string>('todas')

  useEffect(() => {
    fetchAtividades()
  }, [paginaAtual])

  const fetchAtividades = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/usuario/atividades?limite=20&pagina=${paginaAtual}`)
      if (response.ok) {
        const data = await response.json()
        setAtividades(data.atividades || [])
        setPaginacao(data.paginacao || null)
      }
    } catch (error) {
      console.error('Erro ao buscar atividades:', error)
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico de atividades',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const atividadesFiltradas = filtroAcao === 'todas'
    ? atividades
    : atividades.filter(a => a.acao === filtroAcao)

  const acoesUnicas = Array.from(new Set(atividades.map(a => a.acao)))

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/configuracoes/meus-dados"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Meus Dados
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Activity className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Histórico de Atividades</h1>
            <p className="text-white/80">
              Registro completo de ações realizadas na sua conta (Auditoria LGPD)
            </p>
          </div>
        </div>
      </div>

      {/* Filtros e Estatísticas */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filtroAcao} onValueChange={setFiltroAcao}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as ações</SelectItem>
              {acoesUnicas.map(acao => (
                <SelectItem key={acao} value={acao}>
                  {labelsAcao[acao] || acao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {paginacao && (
          <p className="text-sm text-muted-foreground">
            Mostrando {atividadesFiltradas.length} de {paginacao.total} atividades
          </p>
        )}
      </div>

      {/* Lista de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            Atividades Recentes
          </CardTitle>
          <CardDescription>
            Todas as ações realizadas na sua conta são registradas para fins de auditoria e segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            </div>
          ) : atividadesFiltradas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Nenhuma atividade encontrada</p>
              <p className="text-sm">Não há registros de atividades para exibir.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {atividadesFiltradas.map((atividade) => {
                const IconeAcao = iconesAcao[atividade.acao] || Activity
                const corAcao = coresAcao[atividade.acao] || 'text-slate-600 bg-slate-100'

                return (
                  <div
                    key={atividade.id}
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className={cn('p-2.5 rounded-lg shrink-0', corAcao)}>
                      <IconeAcao className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium">
                            {atividade.descricao || labelsAcao[atividade.acao] || atividade.acao}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{formatarTempoRelativo(atividade.criadoEm)}</span>
                            {atividade.ip && (
                              <>
                                <span>•</span>
                                <span>IP: {atividade.ip}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {labelsAcao[atividade.acao] || atividade.acao}
                        </Badge>
                      </div>
                      {atividade.userAgent && (
                        <p className="mt-2 text-xs text-muted-foreground truncate max-w-xl">
                          {atividade.userAgent}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatarDataAtividade(atividade.criadoEm)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Paginação */}
          {paginacao && paginacao.totalPaginas > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={paginaAtual === 1}
                onClick={() => setPaginaAtual(p => p - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {paginaAtual} de {paginacao.totalPaginas}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={paginaAtual === paginacao.totalPaginas}
                onClick={() => setPaginaAtual(p => p + 1)}
              >
                Próxima
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações LGPD */}
      <Card className="bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h3 className="font-semibold">Sobre o Registro de Atividades (LGPD)</h3>
              <p className="text-sm text-muted-foreground">
                Em conformidade com a Lei Geral de Proteção de Dados (LGPD), mantemos um registro
                de todas as atividades realizadas em sua conta. Este log é mantido para garantir
                a segurança, transparência e o direito de acesso aos seus dados.
              </p>
              <p className="text-sm text-muted-foreground">
                Os registros são mantidos por um período de 5 anos para fins de auditoria e
                conformidade legal. Você pode solicitar a exportação completa destes dados
                a qualquer momento através da página &quot;Meus Dados&quot;.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
