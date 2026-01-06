'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
  Target,
  Plus,
  Filter,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BarChart3,
} from 'lucide-react'
import { Objetivo, StatusOKR, statusLabels, statusColors } from '@/types/okr'
import { cn } from '@/lib/utils'

// Dados mockados
const objetivosMock: Objetivo[] = [
  {
    id: '1',
    titulo: 'Aumentar receita recorrente em 30%',
    descricao: 'Expandir a base de clientes e aumentar o ticket médio através de upselling e cross-selling',
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
        metrica: 'MRR em reais',
        baseline: 100000,
        meta: 150000,
        atual: 132000,
        peso: 2,
        progresso: 64,
        tarefas: [],
      },
      {
        id: 'kr2',
        objetivoId: '1',
        titulo: 'Conquistar 20 novos clientes',
        metrica: 'Número de clientes',
        baseline: 0,
        meta: 20,
        atual: 14,
        peso: 1,
        progresso: 70,
        tarefas: [],
      },
    ],
    criadoEm: new Date('2026-01-01'),
    atualizadoEm: new Date('2026-01-15'),
  },
  {
    id: '2',
    titulo: 'Melhorar satisfação do cliente',
    descricao: 'Implementar melhorias no atendimento e produto baseado em feedback dos clientes',
    donoId: '2',
    dono: { id: '2', nome: 'Maria Santos', avatarUrl: undefined },
    periodoTipo: 'TRIMESTRE',
    trimestre: 'Q1',
    ano: 2026,
    status: 'ATRASADO',
    progresso: 35,
    keyResults: [
      {
        id: 'kr3',
        objetivoId: '2',
        titulo: 'Aumentar NPS para 70',
        metrica: 'NPS Score',
        baseline: 45,
        meta: 70,
        atual: 52,
        peso: 2,
        progresso: 28,
        tarefas: [],
      },
      {
        id: 'kr4',
        objetivoId: '2',
        titulo: 'Reduzir tempo de resposta para 2h',
        metrica: 'Horas',
        baseline: 8,
        meta: 2,
        atual: 4,
        peso: 1,
        progresso: 67,
        tarefas: [],
      },
    ],
    criadoEm: new Date('2026-01-01'),
    atualizadoEm: new Date('2026-01-10'),
  },
  {
    id: '3',
    titulo: 'Lançar nova funcionalidade de relatórios',
    descricao: 'Desenvolver e lançar módulo de relatórios avançados para os clientes',
    donoId: '1',
    dono: { id: '1', nome: 'João Silva', avatarUrl: undefined },
    periodoTipo: 'TRIMESTRE',
    trimestre: 'Q1',
    ano: 2026,
    status: 'CONCLUIDO',
    progresso: 100,
    keyResults: [
      {
        id: 'kr5',
        objetivoId: '3',
        titulo: 'Desenvolver 5 tipos de relatório',
        metrica: 'Relatórios desenvolvidos',
        baseline: 0,
        meta: 5,
        atual: 5,
        peso: 1,
        progresso: 100,
        tarefas: [],
      },
    ],
    criadoEm: new Date('2025-10-01'),
    atualizadoEm: new Date('2025-12-20'),
  },
  {
    id: '4',
    titulo: 'Expandir para novos mercados',
    descricao: 'Iniciar operações em 2 novas regiões do Brasil',
    donoId: '2',
    dono: { id: '2', nome: 'Maria Santos', avatarUrl: undefined },
    periodoTipo: 'TRIMESTRE',
    trimestre: 'Q1',
    ano: 2026,
    status: 'NAO_INICIADO',
    progresso: 0,
    keyResults: [
      {
        id: 'kr6',
        objetivoId: '4',
        titulo: 'Abrir escritório em SP',
        metrica: 'Escritório inaugurado',
        baseline: 0,
        meta: 1,
        atual: 0,
        peso: 1,
        progresso: 0,
        tarefas: [],
      },
    ],
    criadoEm: new Date('2026-01-05'),
    atualizadoEm: new Date('2026-01-05'),
  },
]

const trimestres = ['Q1', 'Q2', 'Q3', 'Q4']
const anos = [2025, 2026, 2027]
const statusOptions: { value: StatusOKR | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos' },
  { value: 'NAO_INICIADO', label: 'Não Iniciado' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'ATRASADO', label: 'Atrasado' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

const responsaveis = [
  { id: 'TODOS', nome: 'Todos' },
  { id: '1', nome: 'João Silva' },
  { id: '2', nome: 'Maria Santos' },
]

// Cores dos status para pills
const statusPillColors: Record<StatusOKR | 'TODOS', string> = {
  TODOS: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
  NAO_INICIADO: 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400',
  ATRASADO: 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400',
  CONCLUIDO: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400',
  CANCELADO: 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400',
}

const statusPillColorsActive: Record<StatusOKR | 'TODOS', string> = {
  TODOS: 'bg-slate-600 text-white dark:bg-slate-500',
  NAO_INICIADO: 'bg-slate-600 text-white dark:bg-slate-500',
  EM_ANDAMENTO: 'bg-blue-600 text-white dark:bg-blue-500',
  ATRASADO: 'bg-amber-600 text-white dark:bg-amber-500',
  CONCLUIDO: 'bg-green-600 text-white dark:bg-green-500',
  CANCELADO: 'bg-red-600 text-white dark:bg-red-500',
}

// Indicador de prazo
function getPrazoIndicador(status: StatusOKR, progresso: number) {
  if (status === 'CONCLUIDO') return { label: 'Concluído', color: 'text-green-600', icon: CheckCircle2 }
  if (status === 'ATRASADO') return { label: 'Atrasado', color: 'text-amber-600', icon: AlertTriangle }
  if (progresso >= 70) return { label: 'Em dia', color: 'text-green-600', icon: CheckCircle2 }
  if (progresso >= 40) return { label: 'Atenção', color: 'text-amber-600', icon: Clock }
  return { label: 'Risco', color: 'text-red-600', icon: AlertTriangle }
}

export default function OKRPage() {
  const [periodoTrimestre, setPeriodoTrimestre] = useState('Q1')
  const [periodoAno, setPeriodoAno] = useState('2026')
  const [statusFiltro, setStatusFiltro] = useState<StatusOKR | 'TODOS'>('TODOS')
  const [responsavelFiltro, setResponsavelFiltro] = useState('TODOS')
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedIds, setExpandedIds] = useState<string[]>(['1', '2'])

  // Filtrar objetivos
  const objetivosFiltrados = objetivosMock.filter((obj) => {
    const matchTrimestre = obj.trimestre === periodoTrimestre
    const matchAno = obj.ano === parseInt(periodoAno)
    const matchStatus = statusFiltro === 'TODOS' || obj.status === statusFiltro
    const matchResponsavel = responsavelFiltro === 'TODOS' || obj.donoId === responsavelFiltro
    const matchSearch = obj.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    return matchTrimestre && matchAno && matchStatus && matchResponsavel && matchSearch
  })

  // Estatísticas
  const stats = {
    total: objetivosFiltrados.length,
    emAndamento: objetivosFiltrados.filter(o => o.status === 'EM_ANDAMENTO').length,
    atrasados: objetivosFiltrados.filter(o => o.status === 'ATRASADO').length,
    concluidos: objetivosFiltrados.filter(o => o.status === 'CONCLUIDO').length,
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const countByStatus = (status: StatusOKR | 'TODOS') => {
    if (status === 'TODOS') return objetivosMock.filter(o => o.trimestre === periodoTrimestre && o.ano === parseInt(periodoAno)).length
    return objetivosMock.filter(o => o.status === status && o.trimestre === periodoTrimestre && o.ano === parseInt(periodoAno)).length
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/processos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Processos
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Target className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">OKRs</h1>
              <p className="text-white/80">
                Objetivos e Resultados-Chave
              </p>
            </div>
          </div>
          <Link href="/processos/okr/novo">
            <Button className="bg-white text-blue-600 hover:bg-white/90 shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Novo Objetivo
            </Button>
          </Link>
        </div>
      </div>

      {/* Mini Cards de Estatísticas */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold">{stats.total}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Em Andamento</p>
            <p className="text-lg font-bold">{stats.emAndamento}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Atrasados</p>
            <p className="text-lg font-bold">{stats.atrasados}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Concluídos</p>
            <p className="text-lg font-bold">{stats.concluidos}</p>
          </div>
        </div>
      </div>

      {/* Filtros por Status (Pills) */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFiltro(opt.value)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              statusFiltro === opt.value
                ? statusPillColorsActive[opt.value]
                : statusPillColors[opt.value]
            )}
          >
            {opt.label}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
              {countByStatus(opt.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Barra de Filtros */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
        <div className="flex items-center gap-3 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar objetivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-900"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={periodoTrimestre} onValueChange={setPeriodoTrimestre}>
            <SelectTrigger className="w-[100px] bg-white dark:bg-slate-900">
              <SelectValue placeholder="Trimestre" />
            </SelectTrigger>
            <SelectContent>
              {trimestres.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={periodoAno} onValueChange={setPeriodoAno}>
            <SelectTrigger className="w-[100px] bg-white dark:bg-slate-900">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {anos.map((a) => (
                <SelectItem key={a} value={a.toString()}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={responsavelFiltro} onValueChange={setResponsavelFiltro}>
            <SelectTrigger className="w-[150px] bg-white dark:bg-slate-900">
              <SelectValue placeholder="Responsável" />
            </SelectTrigger>
            <SelectContent>
              {responsaveis.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        {objetivosFiltrados.length} objetivo(s) encontrado(s)
      </div>

      {/* Lista de Objetivos com Cards Expandíveis */}
      <div className="space-y-4">
        {objetivosFiltrados.length > 0 ? (
          objetivosFiltrados.map((objetivo) => {
            const isExpanded = expandedIds.includes(objetivo.id)
            const prazoIndicador = getPrazoIndicador(objetivo.status, objetivo.progresso)
            const PrazoIcon = prazoIndicador.icon

            return (
              <Card key={objetivo.id} className={cn(
                "transition-all",
                objetivo.status === 'ATRASADO' && "border-amber-200 dark:border-amber-900/50"
              )}>
                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(objetivo.id)}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors rounded-t-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={cn(
                            "p-2 rounded-lg shrink-0",
                            objetivo.status === 'CONCLUIDO' ? 'bg-green-100 dark:bg-green-900/30' :
                            objetivo.status === 'ATRASADO' ? 'bg-amber-100 dark:bg-amber-900/30' :
                            'bg-blue-100 dark:bg-blue-900/30'
                          )}>
                            <Target className={cn(
                              "h-5 w-5",
                              objetivo.status === 'CONCLUIDO' ? 'text-green-600' :
                              objetivo.status === 'ATRASADO' ? 'text-amber-600' :
                              'text-blue-600'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <Link
                                href={`/processos/okr/${objetivo.id}`}
                                className="font-semibold text-lg hover:text-blue-600 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {objetivo.titulo}
                              </Link>
                              <Badge
                                variant="secondary"
                                className={cn(statusColors[objetivo.status].bg, statusColors[objetivo.status].text)}
                              >
                                {statusLabels[objetivo.status]}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{objetivo.descricao}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {objetivo.dono.nome}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {objetivo.trimestre} {objetivo.ano}
                              </span>
                              <span className={cn("flex items-center gap-1", prazoIndicador.color)}>
                                <PrazoIcon className="h-3.5 w-3.5" />
                                {prazoIndicador.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Barra de Progresso */}
                          <div className="w-32 hidden sm:block">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className={cn(
                                "font-semibold",
                                objetivo.status === 'CONCLUIDO' ? 'text-green-600' :
                                objetivo.status === 'ATRASADO' ? 'text-amber-600' : 'text-blue-600'
                              )}>{objetivo.progresso}%</span>
                            </div>
                            <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  objetivo.status === 'CONCLUIDO' ? 'bg-green-500' :
                                  objetivo.status === 'ATRASADO' ? 'bg-amber-500' : 'bg-blue-500'
                                )}
                                style={{ width: `${objetivo.progresso}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {objetivo.keyResults.length} KRs
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
                      <div className="border-t pt-4 space-y-3">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-blue-500" />
                          Key Results
                        </h4>
                        {objetivo.keyResults.map((kr) => (
                          <div
                            key={kr.id}
                            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium">{kr.titulo}</h5>
                                <p className="text-sm text-muted-foreground">{kr.metrica}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>Base: {kr.baseline.toLocaleString()}</span>
                                  <span>Meta: {kr.meta.toLocaleString()}</span>
                                  <span className="font-medium text-blue-600">Atual: {kr.atual.toLocaleString()}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className={cn(
                                  "text-2xl font-bold",
                                  kr.progresso >= 100 ? 'text-green-600' :
                                  kr.progresso >= 70 ? 'text-blue-600' :
                                  kr.progresso >= 40 ? 'text-amber-600' : 'text-red-600'
                                )}>{kr.progresso}%</span>
                                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      kr.progresso >= 100 ? 'bg-green-500' :
                                      kr.progresso >= 70 ? 'bg-blue-500' :
                                      kr.progresso >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                    )}
                                    style={{ width: `${Math.min(kr.progresso, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-end pt-2">
                          <Link href={`/processos/okr/${objetivo.id}`}>
                            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:border-blue-300">
                              Ver Detalhes
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            )
          })
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum objetivo encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Não há objetivos para os filtros selecionados.
              </p>
              <Link href="/processos/okr/novo">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Primeiro Objetivo
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
