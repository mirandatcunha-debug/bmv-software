'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ArrowLeft,
  Target,
  Calendar,
  User,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  ListTodo,
  Zap,
  Loader2,
} from 'lucide-react'
import { StatusBadge } from '@/components/okr'
import { Objetivo, KeyResult, StatusOKR, statusLabels } from '@/types/okr'
import { cn } from '@/lib/utils'
import { useModulePermissions } from '@/hooks/use-permissions'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'

// Dados mockados completos
const objetivoMock: Objetivo = {
  id: '1',
  titulo: 'Aumentar receita recorrente em 30%',
  descricao:
    'Expandir a base de clientes e aumentar o ticket médio através de upselling e cross-selling. Este objetivo é fundamental para garantir a sustentabilidade financeira da empresa no longo prazo.',
  donoId: '1',
  dono: { id: '1', nome: 'João Silva', avatarUrl: undefined },
  periodoTipo: 'TRIMESTRE',
  trimestre: 'Q1',
  ano: 2026,
  status: 'EM_ANDAMENTO',
  progresso: 65,
  keyResults: [
    {
      id: 'kr1',
      objetivoId: '1',
      titulo: 'Aumentar MRR para R$ 150k',
      metrica: 'MRR (Monthly Recurring Revenue) em reais',
      baseline: 100000,
      meta: 150000,
      atual: 132000,
      peso: 2,
      progresso: 64,
      tarefas: [
        {
          id: 't1',
          keyResultId: 'kr1',
          titulo: 'Mapear clientes com potencial de upsell',
          descricao: 'Identificar clientes que podem aumentar plano',
          responsavelId: '1',
          responsavel: { id: '1', nome: 'João Silva' },
          peso: 1,
          concluida: true,
          subtarefas: [
            { id: 's1', tarefaId: 't1', titulo: 'Exportar lista de clientes', concluida: true },
            { id: 's2', tarefaId: 't1', titulo: 'Analisar uso por cliente', concluida: true },
          ],
        },
        {
          id: 't2',
          keyResultId: 'kr1',
          titulo: 'Criar campanha de upgrade',
          responsavelId: '2',
          responsavel: { id: '2', nome: 'Maria Santos' },
          peso: 2,
          concluida: false,
          subtarefas: [
            { id: 's3', tarefaId: 't2', titulo: 'Criar email marketing', concluida: true },
            { id: 's4', tarefaId: 't2', titulo: 'Configurar automação', concluida: false },
            { id: 's5', tarefaId: 't2', titulo: 'Treinar equipe de vendas', concluida: false },
          ],
        },
      ],
    },
    {
      id: 'kr2',
      objetivoId: '1',
      titulo: 'Conquistar 20 novos clientes',
      metrica: 'Número de novos clientes pagantes',
      baseline: 0,
      meta: 20,
      atual: 14,
      peso: 1,
      progresso: 70,
      tarefas: [
        {
          id: 't3',
          keyResultId: 'kr2',
          titulo: 'Implementar programa de indicação',
          responsavelId: '1',
          responsavel: { id: '1', nome: 'João Silva' },
          peso: 1,
          concluida: true,
          subtarefas: [],
        },
        {
          id: 't4',
          keyResultId: 'kr2',
          titulo: 'Participar de 3 eventos do setor',
          responsavelId: '2',
          responsavel: { id: '2', nome: 'Maria Santos' },
          peso: 1,
          concluida: false,
          subtarefas: [
            { id: 's6', tarefaId: 't4', titulo: 'Evento 1 - Tech Summit', concluida: true },
            { id: 's7', tarefaId: 't4', titulo: 'Evento 2 - SaaS Brasil', concluida: false },
            { id: 's8', tarefaId: 't4', titulo: 'Evento 3 - Startup Weekend', concluida: false },
          ],
        },
      ],
    },
    {
      id: 'kr3',
      objetivoId: '1',
      titulo: 'Reduzir churn para menos de 3%',
      metrica: 'Taxa de cancelamento mensal',
      baseline: 5,
      meta: 3,
      atual: 3.8,
      peso: 1,
      progresso: 60,
      tarefas: [
        {
          id: 't5',
          keyResultId: 'kr3',
          titulo: 'Implementar health score de clientes',
          responsavelId: '1',
          responsavel: { id: '1', nome: 'João Silva' },
          peso: 2,
          concluida: false,
          subtarefas: [],
        },
      ],
    },
  ],
  criadoEm: new Date('2026-01-01'),
  atualizadoEm: new Date('2026-01-15'),
}

// Histórico de progresso mockado para gráfico
const historicoProgresso = [
  { semana: 'Sem 1', progresso: 15 },
  { semana: 'Sem 2', progresso: 28 },
  { semana: 'Sem 3', progresso: 42 },
  { semana: 'Sem 4', progresso: 55 },
  { semana: 'Sem 5', progresso: 65 },
]

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value: value as StatusOKR,
  label,
}))

export default function ObjetivoDetailPage() {
  const params = useParams()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()
  const { canCreate, canEdit, canDelete } = useModulePermissions('okr.objetivos')
  const { canCreate: canCreateKR } = useModulePermissions('okr.key-results')

  const [objetivo, setObjetivo] = useState<Objetivo>(objetivoMock)
  const [expandedKRs, setExpandedKRs] = useState<string[]>(['kr1', 'kr2'])
  const [loading, setLoading] = useState(true)

  // Simular loading inicial
  useEffect(() => {
    if (user && tenant) {
      setLoading(false)
    }
  }, [user, tenant])

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const handleStatusChange = (newStatus: StatusOKR) => {
    setObjetivo((prev) => ({ ...prev, status: newStatus }))
  }

  const handleTarefaToggle = (tarefaId: string, concluida: boolean) => {
    setObjetivo((prev) => ({
      ...prev,
      keyResults: prev.keyResults.map((kr) => ({
        ...kr,
        tarefas: kr.tarefas.map((t) =>
          t.id === tarefaId ? { ...t, concluida } : t
        ),
      })),
    }))
  }

  const handleSubtarefaToggle = (subtarefaId: string, concluida: boolean) => {
    setObjetivo((prev) => ({
      ...prev,
      keyResults: prev.keyResults.map((kr) => ({
        ...kr,
        tarefas: kr.tarefas.map((t) => ({
          ...t,
          subtarefas: t.subtarefas.map((s) =>
            s.id === subtarefaId ? { ...s, concluida } : s
          ),
        })),
      })),
    }))
  }

  const toggleKRExpanded = (krId: string) => {
    setExpandedKRs(prev =>
      prev.includes(krId) ? prev.filter(id => id !== krId) : [...prev, krId]
    )
  }

  const getPeriodoLabel = () => {
    if (objetivo.periodoTipo === 'TRIMESTRE') {
      return `${objetivo.trimestre} ${objetivo.ano}`
    }
    return ''
  }

  // Estatísticas
  const totalTarefas = objetivo.keyResults.reduce((acc, kr) => acc + kr.tarefas.length, 0)
  const tarefasConcluidas = objetivo.keyResults.reduce((acc, kr) =>
    acc + kr.tarefas.filter(t => t.concluida).length, 0)

  // Dias restantes no trimestre
  const getDiasRestantes = () => {
    const hoje = new Date()
    const fimTrimestre = new Date(2026, 2, 31) // Q1 termina em março
    const diff = fimTrimestre.getTime() - hoje.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getKRProgressColor = (progresso: number) => {
    if (progresso >= 100) return 'text-green-600'
    if (progresso >= 70) return 'text-blue-600'
    if (progresso >= 40) return 'text-amber-600'
    return 'text-red-600'
  }

  const getKRBarColor = (progresso: number) => {
    if (progresso >= 100) return 'bg-green-500'
    if (progresso >= 70) return 'bg-blue-500'
    if (progresso >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/processos/okr"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para OKRs
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{objetivo.titulo}</h1>
                <Badge className="bg-white/20 text-white border-white/30">
                  {statusLabels[objetivo.status]}
                </Badge>
              </div>
              <p className="text-white/80 max-w-2xl">{objetivo.descricao}</p>

              {/* Info do Objetivo */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {objetivo.dono.nome}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {getPeriodoLabel()}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {getDiasRestantes()} dias restantes
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {canCreateKR && (
                <Link href={`/processos/okr/${params.id}/novo-kr`}>
                  <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo KR
                  </Button>
                </Link>
              )}
              {canEdit && (
                <Link href={`/processos/okr/${params.id}/editar`}>
                  <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              )}
              {canDelete && (
                <Link href={`/processos/okr/${params.id}/excluir`}>
                  <Button variant="secondary" className="bg-red-500/20 text-white hover:bg-red-500/30 border-red-300/30">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Barra de Progresso Grande */}
          <div className="mt-6 bg-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso do Objetivo</span>
              <span className="text-2xl font-bold">{objetivo.progresso}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${objetivo.progresso}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Key Results</p>
                <p className="text-xl font-bold">{objetivo.keyResults.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                <ListTodo className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tarefas</p>
                <p className="text-xl font-bold">{tarefasConcluidas}/{totalTarefas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dias Restantes</p>
                <p className="text-xl font-bold">{getDiasRestantes()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Velocidade</p>
                <p className="text-xl font-bold">+10%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-500" />
            Evolução do Progresso
          </CardTitle>
          <CardDescription>
            Acompanhamento semanal do progresso do objetivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2">
            {historicoProgresso.map((item, index) => (
              <div key={item.semana} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className={cn(
                    "text-sm font-semibold mb-1",
                    index === historicoProgresso.length - 1 ? 'text-blue-600' : 'text-muted-foreground'
                  )}>
                    {item.progresso}%
                  </span>
                  <div
                    className={cn(
                      "w-full rounded-t-lg transition-all",
                      index === historicoProgresso.length - 1
                        ? 'bg-gradient-to-t from-blue-600 to-indigo-500'
                        : 'bg-slate-200 dark:bg-slate-700'
                    )}
                    style={{ height: `${(item.progresso / 100) * 140}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{item.semana}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            Key Results ({objetivo.keyResults.length})
          </h2>
          {canCreateKR && (
            <Link href={`/processos/okr/${params.id}/novo-kr`}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo KR
              </Button>
            </Link>
          )}
        </div>

        <div className="space-y-4">
          {objetivo.keyResults.map((kr, index) => {
            const isExpanded = expandedKRs.includes(kr.id)
            const tarefasKR = kr.tarefas.length
            const tarefasConcluidasKR = kr.tarefas.filter(t => t.concluida).length

            return (
              <Card key={kr.id} className="overflow-hidden">
                <Collapsible open={isExpanded} onOpenChange={() => toggleKRExpanded(kr.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0",
                            kr.progresso >= 100 ? 'bg-green-500' :
                            kr.progresso >= 70 ? 'bg-blue-500' :
                            kr.progresso >= 40 ? 'bg-amber-500' : 'bg-red-500'
                          )}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg">{kr.titulo}</h3>
                            <p className="text-sm text-muted-foreground">{kr.metrica}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm">
                              <span className="text-muted-foreground">
                                Base: <span className="font-medium">{kr.baseline.toLocaleString()}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Meta: <span className="font-medium">{kr.meta.toLocaleString()}</span>
                              </span>
                              <span className="text-blue-600 font-semibold">
                                Atual: {kr.atual.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Progresso circular visual */}
                          <div className="text-center">
                            <div className={cn("text-3xl font-bold", getKRProgressColor(kr.progresso))}>
                              {kr.progresso}%
                            </div>
                            <div className="w-24 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                              <div
                                className={cn("h-full rounded-full transition-all", getKRBarColor(kr.progresso))}
                                style={{ width: `${Math.min(kr.progresso, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {tarefasConcluidasKR}/{tarefasKR} tarefas
                            </Badge>
                            {isExpanded ? (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t pt-4">
                        {/* Header das Tarefas */}
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium flex items-center gap-2">
                            <ListTodo className="h-4 w-4 text-blue-500" />
                            Tarefas Vinculadas
                          </h4>
                          <Link href={`/processos/okr/${params.id}/nova-tarefa?kr=${kr.id}`}>
                            <Button variant="outline" size="sm">
                              <Plus className="h-3 w-3 mr-1" />
                              Tarefa
                            </Button>
                          </Link>
                        </div>

                        {/* Lista de Tarefas */}
                        <div className="space-y-3">
                          {kr.tarefas.map((tarefa) => (
                            <div
                              key={tarefa.id}
                              className={cn(
                                "p-4 rounded-xl border transition-all",
                                tarefa.concluida
                                  ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
                                  : "bg-slate-50 dark:bg-slate-800/50"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={tarefa.concluida}
                                  onCheckedChange={(checked) => handleTarefaToggle(tarefa.id, checked as boolean)}
                                  className="mt-1"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={cn(
                                      "font-medium",
                                      tarefa.concluida && "line-through text-muted-foreground"
                                    )}>
                                      {tarefa.titulo}
                                    </span>
                                    {tarefa.concluida && (
                                      <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs">
                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                        Concluída
                                      </Badge>
                                    )}
                                  </div>
                                  {tarefa.descricao && (
                                    <p className="text-sm text-muted-foreground mt-1">{tarefa.descricao}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {tarefa.responsavel.nome}
                                    </span>
                                    {tarefa.subtarefas.length > 0 && (
                                      <span>
                                        {tarefa.subtarefas.filter(s => s.concluida).length}/{tarefa.subtarefas.length} subtarefas
                                      </span>
                                    )}
                                  </div>

                                  {/* Subtarefas */}
                                  {tarefa.subtarefas.length > 0 && (
                                    <div className="mt-3 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-2">
                                      {tarefa.subtarefas.map((sub) => (
                                        <div key={sub.id} className="flex items-center gap-2">
                                          <Checkbox
                                            checked={sub.concluida}
                                            onCheckedChange={(checked) => handleSubtarefaToggle(sub.id, checked as boolean)}
                                            className="h-4 w-4"
                                          />
                                          <span className={cn(
                                            "text-sm",
                                            sub.concluida && "line-through text-muted-foreground"
                                          )}>
                                            {sub.titulo}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          {kr.tarefas.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p>Nenhuma tarefa vinculada a este KR</p>
                              <Link href={`/processos/okr/${params.id}/nova-tarefa?kr=${kr.id}`}>
                                <Button variant="link" className="text-blue-600 mt-2">
                                  Adicionar primeira tarefa
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
