'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Plus,
  Edit,
  Calendar,
  User,
  Building2,
  LayoutGrid,
  List,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Target,
  CalendarDays,
  TrendingUp,
  Milestone,
  ChevronRight,
  Trash2,
} from 'lucide-react'
import {
  Projeto,
  TarefaProjeto,
  StatusTarefa,
  statusProjetoLabels,
  statusTarefaLabels,
  statusTarefaCores,
  prioridadeLabels,
  prioridadeCores,
} from '@/types/consultoria'
import { cn } from '@/lib/utils'
import { KanbanBoard } from '@/components/consultoria/kanban-board'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/hooks/use-tenant'
import { usePermissions } from '@/hooks/use-permissions'

// Dados mockados
const projetoMock: Projeto = {
  id: '1',
  tenantId: '1',
  nome: 'Implementação ERP',
  descricao: 'Implementação completa do sistema ERP na empresa ABC. Inclui módulos financeiro, contábil, estoque e vendas.',
  cliente: { id: '1', nome: 'Empresa ABC Ltda', cnpj: '12.345.678/0001-00', email: 'contato@abc.com.br' },
  dataInicio: new Date('2026-01-01'),
  dataFim: new Date('2026-06-30'),
  status: 'EM_ANDAMENTO',
  progresso: 45,
  tarefas: [
    {
      id: 't1',
      projetoId: '1',
      responsavelId: '1',
      responsavel: { id: '1', nome: 'João Silva', email: 'joao@bmv.com.br' },
      titulo: 'Levantamento de requisitos',
      descricao: 'Realizar entrevistas com stakeholders',
      status: 'CONCLUIDO',
      prioridade: 'ALTA',
      prazo: new Date('2026-01-15'),
      requerEvidencia: true,
      ordem: 1,
      criadoEm: new Date('2026-01-01'),
      atualizadoEm: new Date('2026-01-15'),
    },
    {
      id: 't2',
      projetoId: '1',
      responsavelId: '2',
      responsavel: { id: '2', nome: 'Maria Santos', email: 'maria@bmv.com.br' },
      titulo: 'Configuração do ambiente',
      descricao: 'Configurar servidores e banco de dados',
      status: 'CONCLUIDO',
      prioridade: 'ALTA',
      prazo: new Date('2026-01-20'),
      requerEvidencia: false,
      ordem: 2,
      criadoEm: new Date('2026-01-05'),
      atualizadoEm: new Date('2026-01-18'),
    },
    {
      id: 't3',
      projetoId: '1',
      responsavelId: '1',
      responsavel: { id: '1', nome: 'João Silva', email: 'joao@bmv.com.br' },
      titulo: 'Implementar módulo financeiro',
      descricao: 'Desenvolver contas a pagar e receber',
      status: 'EM_ANDAMENTO',
      prioridade: 'ALTA',
      prazo: new Date('2026-02-15'),
      requerEvidencia: true,
      ordem: 3,
      criadoEm: new Date('2026-01-20'),
      atualizadoEm: new Date('2026-01-25'),
    },
    {
      id: 't4',
      projetoId: '1',
      responsavelId: '2',
      responsavel: { id: '2', nome: 'Maria Santos', email: 'maria@bmv.com.br' },
      titulo: 'Documentar processos',
      descricao: 'Criar documentação técnica',
      status: 'EM_ANDAMENTO',
      prioridade: 'MEDIA',
      prazo: new Date('2026-02-28'),
      requerEvidencia: false,
      ordem: 4,
      criadoEm: new Date('2026-01-22'),
      atualizadoEm: new Date('2026-01-22'),
    },
    {
      id: 't5',
      projetoId: '1',
      responsavelId: '1',
      responsavel: { id: '1', nome: 'João Silva', email: 'joao@bmv.com.br' },
      titulo: 'Revisar integração',
      descricao: 'Validar integração com sistemas externos',
      status: 'EM_VALIDACAO',
      prioridade: 'MEDIA',
      prazo: new Date('2026-02-10'),
      requerEvidencia: true,
      ordem: 5,
      criadoEm: new Date('2026-01-25'),
      atualizadoEm: new Date('2026-01-28'),
    },
    {
      id: 't6',
      projetoId: '1',
      responsavelId: '2',
      responsavel: { id: '2', nome: 'Maria Santos', email: 'maria@bmv.com.br' },
      titulo: 'Implementar módulo de estoque',
      descricao: 'Controle de inventário e movimentações',
      status: 'A_FAZER',
      prioridade: 'MEDIA',
      prazo: new Date('2026-03-15'),
      requerEvidencia: false,
      ordem: 6,
      criadoEm: new Date('2026-01-28'),
      atualizadoEm: new Date('2026-01-28'),
    },
    {
      id: 't7',
      projetoId: '1',
      responsavelId: '1',
      responsavel: { id: '1', nome: 'João Silva', email: 'joao@bmv.com.br' },
      titulo: 'Treinamento da equipe',
      descricao: 'Capacitar usuários no sistema',
      status: 'A_FAZER',
      prioridade: 'BAIXA',
      prazo: new Date('2026-04-30'),
      requerEvidencia: true,
      ordem: 7,
      criadoEm: new Date('2026-01-30'),
      atualizadoEm: new Date('2026-01-30'),
    },
  ],
  criadoEm: new Date('2025-12-15'),
  atualizadoEm: new Date('2026-01-05'),
}

// Entregas/Milestones mockados
const entregasMock = [
  { id: '1', nome: 'Kick-off do Projeto', data: new Date('2026-01-05'), status: 'concluido' },
  { id: '2', nome: 'Documento de Requisitos', data: new Date('2026-01-20'), status: 'concluido' },
  { id: '3', nome: 'Módulo Financeiro', data: new Date('2026-02-28'), status: 'pendente' },
  { id: '4', nome: 'Módulo de Estoque', data: new Date('2026-04-15'), status: 'pendente' },
  { id: '5', nome: 'Treinamento', data: new Date('2026-05-30'), status: 'pendente' },
  { id: '6', nome: 'Go-Live', data: new Date('2026-06-30'), status: 'pendente' },
]

export default function ProjetoDetalhesPage() {
  const params = useParams()
  useAuth()
  useTenant()
  const { canCreate, canEdit, canDelete } = usePermissions()

  const [projeto] = useState<Projeto>(projetoMock)
  const [tarefas, setTarefas] = useState<TarefaProjeto[]>(projetoMock.tarefas || [])

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const handleTarefaMove = (tarefaId: string, novoStatus: StatusTarefa) => {
    setTarefas((prev) =>
      prev.map((t) => (t.id === tarefaId ? { ...t, status: novoStatus } : t))
    )
  }

  // Calcular estatísticas
  const totalTarefas = tarefas.length
  const tarefasConcluidas = tarefas.filter((t) => t.status === 'CONCLUIDO').length
  const tarefasEmAndamento = tarefas.filter((t) => t.status === 'EM_ANDAMENTO').length
  const tarefasAFazer = tarefas.filter((t) => t.status === 'A_FAZER').length
  const tarefasEmValidacao = tarefas.filter((t) => t.status === 'EM_VALIDACAO').length

  // Dias restantes
  const diasRestantes = projeto.dataFim
    ? Math.ceil((new Date(projeto.dataFim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  const isOverdue = (prazo: Date | string | undefined, status: string) => {
    if (!prazo || status === 'CONCLUIDO') return false
    return new Date(prazo) < new Date()
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/consultoria/projetos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Projetos
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold">{projeto.nome}</h1>
                <Badge className="bg-white/20 text-white border-white/30">
                  {statusProjetoLabels[projeto.status]}
                </Badge>
              </div>
              <p className="text-white/80 max-w-2xl">{projeto.descricao}</p>

              {/* Info do Projeto */}
              <div className="flex flex-wrap items-center gap-4 mt-4 text-white/90 text-sm">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {projeto.cliente?.nome}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(projeto.dataInicio)} - {formatDate(projeto.dataFim)}
                </div>
                {diasRestantes !== null && diasRestantes > 0 && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {diasRestantes} dias restantes
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              {canCreate('consultoria.tarefas') && (
                <Link href={`/consultoria/projetos/${params.id}/nova-tarefa`}>
                  <Button className="bg-white text-orange-600 hover:bg-white/90 shadow-md">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Tarefa
                  </Button>
                </Link>
              )}
              {canEdit('consultoria.projetos') && (
                <Link href={`/consultoria/projetos/${params.id}/editar`}>
                  <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-white/30">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </Link>
              )}
              {canDelete('consultoria.projetos') && (
                <Link href={`/consultoria/projetos/${params.id}/excluir`}>
                  <Button variant="secondary" className="bg-red-500/20 text-white hover:bg-red-500/40 border-red-300/30">
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
              <span className="text-sm font-medium">Progresso do Projeto</span>
              <span className="text-2xl font-bold">{projeto.progresso}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${projeto.progresso}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-l-4 border-l-slate-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Target className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{totalTarefas}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">A Fazer</p>
                <p className="text-xl font-bold">{tarefasAFazer}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Em Andamento</p>
                <p className="text-xl font-bold">{tarefasEmAndamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Em Validação</p>
                <p className="text-xl font-bold">{tarefasEmValidacao}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Concluídas</p>
                <p className="text-xl font-bold">{tarefasConcluidas}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="kanban" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="lista" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Milestone className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="arquivos" className="gap-2" disabled>
            <FileText className="h-4 w-4" />
            Arquivos
          </TabsTrigger>
        </TabsList>

        {/* Kanban View */}
        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard
            tarefas={tarefas}
            onTarefaMove={handleTarefaMove}
            projetoId={params.id as string}
          />
        </TabsContent>

        {/* Lista View */}
        <TabsContent value="lista" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <List className="h-5 w-5 text-orange-500" />
                    Lista de Tarefas
                  </CardTitle>
                  <CardDescription>
                    Todas as tarefas do projeto em formato de lista
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tarefas.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md",
                      isOverdue(tarefa.prazo, tarefa.status)
                        ? "border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10"
                        : "hover:border-orange-200 dark:hover:border-orange-800"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className="font-medium">{tarefa.titulo}</h4>
                        <Badge
                          variant="secondary"
                          className={cn('text-xs', statusTarefaCores[tarefa.status])}
                        >
                          {statusTarefaLabels[tarefa.status]}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', prioridadeCores[tarefa.prioridade])}
                        >
                          {prioridadeLabels[tarefa.prioridade]}
                        </Badge>
                        {isOverdue(tarefa.prazo, tarefa.status) && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Atrasado
                          </Badge>
                        )}
                      </div>
                      {tarefa.descricao && (
                        <p className="text-sm text-muted-foreground mt-1">{tarefa.descricao}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          {tarefa.responsavel?.nome}
                        </div>
                        {tarefa.prazo && (
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(tarefa.prazo)}
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="mt-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Milestone className="h-5 w-5 text-orange-500" />
                Timeline de Entregas
              </CardTitle>
              <CardDescription>
                Marcos e entregas importantes do projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Linha vertical */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-orange-500 via-amber-500 to-slate-200 dark:to-slate-700" />

                <div className="space-y-6">
                  {entregasMock.map((entrega, index) => {
                    const isConcluido = entrega.status === 'concluido'
                    const isProximo = !isConcluido && index === entregasMock.findIndex(e => e.status !== 'concluido')

                    return (
                      <div key={entrega.id} className="relative flex items-start gap-4 pl-10">
                        {/* Marcador */}
                        <div
                          className={cn(
                            "absolute left-0 w-8 h-8 rounded-full flex items-center justify-center border-2",
                            isConcluido
                              ? "bg-green-500 border-green-500 text-white"
                              : isProximo
                              ? "bg-orange-500 border-orange-500 text-white animate-pulse"
                              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600"
                          )}
                        >
                          {isConcluido ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>

                        {/* Conteúdo */}
                        <div
                          className={cn(
                            "flex-1 p-4 rounded-xl border transition-all",
                            isConcluido
                              ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
                              : isProximo
                              ? "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30 shadow-md"
                              : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className={cn(
                                "font-semibold",
                                isConcluido && "text-green-700 dark:text-green-400",
                                isProximo && "text-orange-700 dark:text-orange-400"
                              )}>
                                {entrega.nome}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatDate(entrega.data)}
                              </p>
                            </div>
                            <Badge
                              variant={isConcluido ? 'default' : 'secondary'}
                              className={cn(
                                isConcluido
                                  ? "bg-green-500"
                                  : isProximo
                                  ? "bg-orange-500 text-white"
                                  : ""
                              )}
                            >
                              {isConcluido ? 'Concluído' : isProximo ? 'Próximo' : 'Pendente'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Arquivos (Em desenvolvimento) */}
        <TabsContent value="arquivos" className="mt-6">
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Arquivos em Desenvolvimento</h3>
              <p className="text-muted-foreground">
                Em breve você poderá gerenciar arquivos e documentos do projeto aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
