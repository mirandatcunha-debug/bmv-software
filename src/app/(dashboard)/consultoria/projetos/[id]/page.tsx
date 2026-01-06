'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  FolderKanban,
  Plus,
  Edit,
  Calendar,
  User,
  Building2,
  LayoutGrid,
  List,
  FileText,
  History,
} from 'lucide-react'
import {
  Projeto,
  TarefaProjeto,
  StatusTarefa,
  statusProjetoLabels,
  statusProjetoCores,
  statusTarefaLabels,
  statusTarefaCores,
  prioridadeLabels,
  prioridadeCores,
} from '@/types/consultoria'
import { cn } from '@/lib/utils'
import { KanbanBoard } from '@/components/consultoria/kanban-board'

// Dados mockados
const projetoMock: Projeto = {
  id: '1',
  tenantId: '1',
  nome: 'Implementacao ERP',
  descricao: 'Implementacao completa do sistema ERP na empresa ABC. Inclui modulos financeiro, contabil, estoque e vendas.',
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
      responsavel: { id: '1', nome: 'Joao Silva', email: 'joao@bmv.com.br' },
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
      titulo: 'Configuracao do ambiente',
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
      responsavel: { id: '1', nome: 'Joao Silva', email: 'joao@bmv.com.br' },
      titulo: 'Implementar modulo financeiro',
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
      descricao: 'Criar documentacao tecnica',
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
      responsavel: { id: '1', nome: 'Joao Silva', email: 'joao@bmv.com.br' },
      titulo: 'Revisar integracao',
      descricao: 'Validar integracao com sistemas externos',
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
      titulo: 'Implementar modulo de estoque',
      descricao: 'Controle de inventario e movimentacoes',
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
      responsavel: { id: '1', nome: 'Joao Silva', email: 'joao@bmv.com.br' },
      titulo: 'Treinamento da equipe',
      descricao: 'Capacitar usuarios no sistema',
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

export default function ProjetoDetalhesPage() {
  const params = useParams()
  const [projeto] = useState<Projeto>(projetoMock)
  const [tarefas, setTarefas] = useState<TarefaProjeto[]>(projetoMock.tarefas || [])
  const [viewMode, setViewMode] = useState<'kanban' | 'lista'>('kanban')

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const handleTarefaMove = (tarefaId: string, novoStatus: StatusTarefa) => {
    setTarefas((prev) =>
      prev.map((t) => (t.id === tarefaId ? { ...t, status: novoStatus } : t))
    )
    // Aqui faria a chamada API para persistir
  }

  // Calcular estatisticas
  const totalTarefas = tarefas.length
  const tarefasConcluidas = tarefas.filter((t) => t.status === 'CONCLUIDO').length
  const tarefasEmAndamento = tarefas.filter((t) => t.status === 'EM_ANDAMENTO').length

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/consultoria/projetos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Projetos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {projeto.nome}
            </h1>
            <span
              className={cn(
                'text-xs font-medium px-2 py-1 rounded',
                statusProjetoCores[projeto.status]
              )}
            >
              {statusProjetoLabels[projeto.status]}
            </span>
          </div>
          <p className="text-muted-foreground">{projeto.descricao}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/consultoria/projetos/${params.id}/nova-tarefa`}>
            <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </Link>
          <Link href={`/consultoria/projetos/${params.id}/editar`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="font-medium">{projeto.cliente?.nome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Periodo</p>
                <p className="font-medium">
                  {formatDate(projeto.dataInicio)} - {formatDate(projeto.dataFim)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FolderKanban className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Tarefas</p>
                <p className="font-medium">
                  {tarefasConcluidas}/{totalTarefas} concluidas
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">{projeto.progresso}%</span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-bmv-primary rounded-full transition-all"
                  style={{ width: `${projeto.progresso}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="kanban" className="w-full">
        <TabsList>
          <TabsTrigger value="kanban" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="lista" className="gap-2">
            <List className="h-4 w-4" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="arquivos" className="gap-2" disabled>
            <FileText className="h-4 w-4" />
            Arquivos
          </TabsTrigger>
          <TabsTrigger value="historico" className="gap-2" disabled>
            <History className="h-4 w-4" />
            Historico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <KanbanBoard
            tarefas={tarefas}
            onTarefaMove={handleTarefaMove}
            projetoId={params.id as string}
          />
        </TabsContent>

        <TabsContent value="lista" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas</CardTitle>
              <CardDescription>
                Lista de todas as tarefas do projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tarefas.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{tarefa.titulo}</h4>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded',
                            statusTarefaCores[tarefa.status]
                          )}
                        >
                          {statusTarefaLabels[tarefa.status]}
                        </span>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-0.5 rounded',
                            prioridadeCores[tarefa.prioridade]
                          )}
                        >
                          {prioridadeLabels[tarefa.prioridade]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {tarefa.responsavel?.nome}
                        </div>
                        {tarefa.prazo && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(tarefa.prazo)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="arquivos" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          <Card>
            <CardContent className="py-12 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
