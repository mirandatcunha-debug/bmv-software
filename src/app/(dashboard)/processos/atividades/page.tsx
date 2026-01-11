'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  ClipboardList,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ListTodo,
  Eye,
  Calendar,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { IAAnaliseTask } from '@/components/processos/IAAnaliseTask'
import { cn } from '@/lib/utils'
import { format, parseISO, isBefore, isAfter, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Colaborador {
  id: string
  nome: string
}

interface Tarefa {
  id: string
  titulo: string
  descricao?: string
  status: 'A_FAZER' | 'EM_ANDAMENTO' | 'EM_REVISAO' | 'CONCLUIDA' | 'CANCELADA'
  prioridade: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE'
  dataFim?: string
  responsavel: {
    id: string
    nome: string
  }
  keyResult?: {
    id: string
    titulo: string
    objetivo?: {
      id: string
      titulo: string
    }
  }
}

const statusLabels: Record<string, string> = {
  A_FAZER: 'Pendente',
  EM_ANDAMENTO: 'Em Andamento',
  EM_REVISAO: 'Em Revisão',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

const statusCores: Record<string, string> = {
  A_FAZER: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  EM_REVISAO: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  CONCLUIDA: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CANCELADA: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const prioridadeLabels: Record<string, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
}

const prioridadeCores: Record<string, string> = {
  BAIXA: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  MEDIA: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  ALTA: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  URGENTE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

function getIniciais(nome: string): string {
  const partes = nome.split(' ')
  if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function isAtrasada(tarefa: Tarefa): boolean {
  if (!tarefa.dataFim) return false
  if (tarefa.status === 'CONCLUIDA' || tarefa.status === 'CANCELADA') return false
  const prazo = parseISO(tarefa.dataFim)
  return isBefore(prazo, startOfDay(new Date()))
}

export default function AtividadesEquipePage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros
  const [colaboradorId, setColaboradorId] = useState('todos')
  const [status, setStatus] = useState('todos')
  const [prioridade, setPrioridade] = useState('todos')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  useEffect(() => {
    fetchColaboradores()
  }, [])

  useEffect(() => {
    fetchTarefas()
  }, [colaboradorId, status, prioridade, dataInicio, dataFim])

  const fetchColaboradores = async () => {
    try {
      const response = await fetch('/api/cadastros/colaboradores')
      if (response.ok) {
        const data = await response.json()
        setColaboradores(data.colaboradores || [])
      }
    } catch (error) {
      console.error('Erro ao buscar colaboradores:', error)
    }
  }

  const fetchTarefas = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (colaboradorId !== 'todos') params.append('colaboradorId', colaboradorId)
      if (status !== 'todos') params.append('status', status)
      if (prioridade !== 'todos') params.append('prioridade', prioridade)
      if (dataInicio) params.append('dataInicio', dataInicio)
      if (dataFim) params.append('dataFim', dataFim)

      const response = await fetch(`/api/processos/atividades?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setTarefas(data.tarefas || [])
      }
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    } finally {
      setLoading(false)
    }
  }

  // Cálculo dos indicadores
  const totalTarefas = tarefas.length
  const tarefasConcluidas = tarefas.filter(t => t.status === 'CONCLUIDA').length
  const tarefasEmAndamento = tarefas.filter(t => t.status === 'EM_ANDAMENTO' || t.status === 'EM_REVISAO').length
  const tarefasAtrasadas = tarefas.filter(t => isAtrasada(t)).length

  const limparFiltros = () => {
    setColaboradorId('todos')
    setStatus('todos')
    setPrioridade('todos')
    setDataInicio('')
    setDataFim('')
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <ClipboardList className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Atividades da Equipe</h1>
              <p className="text-white/80">
                Acompanhe as tarefas de todos os colaboradores
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Tarefas</p>
                <p className="text-3xl font-bold text-blue-600">{totalTarefas}</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <ListTodo className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídas</p>
                <p className="text-3xl font-bold text-green-600">{tarefasConcluidas}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Andamento</p>
                <p className="text-3xl font-bold text-amber-600">{tarefasEmAndamento}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-red-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Atrasadas</p>
                <p className="text-3xl font-bold text-red-600">{tarefasAtrasadas}</p>
              </div>
              <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="h-5 w-5 text-teal-500" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Colaborador */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Colaborador</label>
              <Select value={colaboradorId} onValueChange={setColaboradorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {colaboradores.map((colab) => (
                    <SelectItem key={colab.id} value={colab.id}>
                      {colab.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="A_FAZER">Pendente</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="EM_REVISAO">Em Revisão</SelectItem>
                  <SelectItem value="CONCLUIDA">Concluída</SelectItem>
                  <SelectItem value="ATRASADA">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Prioridade */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Prioridade</label>
              <Select value={prioridade} onValueChange={setPrioridade}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                  <SelectItem value="MEDIA">Média</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="URGENTE">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data Início */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Data Início</label>
              <Input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Data Fim */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Data Fim</label>
              <Input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={limparFiltros}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Tarefas */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : tarefas.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
              <p className="text-muted-foreground">
                Não há tarefas que correspondam aos filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Tarefa</TableHead>
                    <TableHead>Projeto/Objetivo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prazo</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tarefas.map((tarefa) => {
                    const atrasada = isAtrasada(tarefa)
                    return (
                      <TableRow key={tarefa.id} className={cn(atrasada && 'bg-red-50/50 dark:bg-red-900/10')}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                                {getIniciais(tarefa.responsavel.nome)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {tarefa.responsavel.nome}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="font-medium text-sm truncate">{tarefa.titulo}</p>
                            {tarefa.descricao && (
                              <p className="text-xs text-muted-foreground truncate">
                                {tarefa.descricao}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tarefa.keyResult?.objetivo ? (
                            <div className="max-w-[180px]">
                              <p className="text-sm truncate">{tarefa.keyResult.objetivo.titulo}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {tarefa.keyResult.titulo}
                              </p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', statusCores[tarefa.status])}
                          >
                            {statusLabels[tarefa.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {tarefa.dataFim ? (
                            <div className={cn(
                              'flex items-center gap-1.5 text-sm',
                              atrasada && 'text-red-600 font-medium'
                            )}>
                              <Calendar className={cn('h-4 w-4', atrasada && 'text-red-500')} />
                              {format(parseISO(tarefa.dataFim), "dd/MM/yyyy", { locale: ptBR })}
                              {atrasada && (
                                <AlertTriangle className="h-4 w-4 text-red-500 ml-1" />
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={cn('text-xs', prioridadeCores[tarefa.prioridade])}
                          >
                            {prioridadeLabels[tarefa.prioridade]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <IAAnaliseTask tarefa={tarefa} />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => {
                                if (tarefa.keyResult?.objetivo) {
                                  window.location.href = `/processos/okr/${tarefa.keyResult.objetivo.id}`
                                }
                              }}
                              disabled={!tarefa.keyResult?.objetivo}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
