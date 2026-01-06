'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  Plus,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
  ListTodo,
  Target,
  TrendingUp,
  Users,
  FileText,
  CalendarDays,
} from 'lucide-react'
import { Projeto, statusProjetoLabels, statusProjetoCores } from '@/types/consultoria'
import { cn } from '@/lib/utils'

// Dados mockados para demonstração
const projetosMock: Projeto[] = [
  {
    id: '1',
    tenantId: '1',
    nome: 'Implementação ERP',
    descricao: 'Implementação completa do sistema ERP na empresa ABC',
    cliente: { id: '1', nome: 'Empresa ABC Ltda', email: 'contato@abc.com.br' },
    dataInicio: new Date('2026-01-01'),
    dataFim: new Date('2026-06-30'),
    status: 'EM_ANDAMENTO',
    progresso: 45,
    criadoEm: new Date('2025-12-15'),
    atualizadoEm: new Date('2026-01-05'),
  },
  {
    id: '2',
    tenantId: '1',
    nome: 'Consultoria Financeira',
    descricao: 'Reestruturação do departamento financeiro',
    cliente: { id: '2', nome: 'Tech Solutions SA', email: 'financeiro@tech.com.br' },
    dataInicio: new Date('2025-11-01'),
    dataFim: new Date('2026-02-28'),
    status: 'EM_ANDAMENTO',
    progresso: 72,
    criadoEm: new Date('2025-10-20'),
    atualizadoEm: new Date('2026-01-03'),
  },
  {
    id: '3',
    tenantId: '1',
    nome: 'Diagnóstico Operacional',
    descricao: 'Análise e diagnóstico dos processos operacionais',
    cliente: { id: '3', nome: 'Indústria XYZ', email: 'contato@xyz.ind.br' },
    dataInicio: new Date('2025-12-01'),
    dataFim: new Date('2025-12-20'),
    status: 'CONCLUIDO',
    progresso: 100,
    criadoEm: new Date('2025-11-25'),
    atualizadoEm: new Date('2025-12-20'),
  },
]

// Dados mockados de entregas da semana
const entregasSemana = [
  { id: '1', nome: 'Relatório de Diagnóstico', projeto: 'Implementação ERP', data: new Date('2026-01-08'), status: 'pendente' },
  { id: '2', nome: 'Apresentação de Resultados', projeto: 'Consultoria Financeira', data: new Date('2026-01-09'), status: 'pendente' },
  { id: '3', nome: 'Documentação Técnica', projeto: 'Implementação ERP', data: new Date('2026-01-10'), status: 'pendente' },
]

// Ações rápidas
const acoesRapidas = [
  { titulo: 'Novo Projeto', descricao: 'Criar um novo projeto', icone: FolderKanban, href: '/consultoria/projetos/novo', cor: 'bg-orange-500' },
  { titulo: 'Ver Projetos', descricao: 'Lista de todos os projetos', icone: ListTodo, href: '/consultoria/projetos', cor: 'bg-amber-500' },
  { titulo: 'Relatórios', descricao: 'Gerar relatórios', icone: FileText, href: '#', cor: 'bg-orange-600', disabled: true },
  { titulo: 'Equipe', descricao: 'Gerenciar consultores', icone: Users, href: '#', cor: 'bg-amber-600', disabled: true },
]

export default function ConsultoriaPage() {
  const [projetos] = useState<Projeto[]>(projetosMock)

  // Cálculo dos cards de resumo
  const totalProjetos = projetos.length
  const emAndamento = projetos.filter((p) => p.status === 'EM_ANDAMENTO').length
  const concluidos = projetos.filter((p) => p.status === 'CONCLUIDO').length
  const tarefasPendentes = 12 // Mock
  const entregasSemanaCount = entregasSemana.length

  // Projetos recentes (últimos 5)
  const projetosRecentes = [...projetos]
    .sort((a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime())
    .slice(0, 5)

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatDateShort = (date: Date | string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    })
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header com Gradiente Laranja/Âmbar */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Briefcase className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Consultoria</h1>
              <p className="text-white/80">
                Gerencie seus projetos e clientes
              </p>
            </div>
          </div>
          <Link href="/consultoria/projetos/novo">
            <Button className="bg-white text-orange-600 hover:bg-white/90 shadow-md">
              <Plus className="h-4 w-4 mr-2" />
              Novo Projeto
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover border-l-4 border-l-orange-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projetos Ativos</p>
                <p className="text-3xl font-bold text-orange-600">{emAndamento}</p>
                <p className="text-xs text-muted-foreground mt-1">de {totalProjetos} total</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <FolderKanban className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-amber-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tarefas Pendentes</p>
                <p className="text-3xl font-bold text-amber-600">{tarefasPendentes}</p>
                <p className="text-xs text-muted-foreground mt-1">aguardando execução</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <ListTodo className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-orange-400">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entregas da Semana</p>
                <p className="text-3xl font-bold text-orange-500">{entregasSemanaCount}</p>
                <p className="text-xs text-muted-foreground mt-1">próximos 7 dias</p>
              </div>
              <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30">
                <CalendarDays className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Concluídos</p>
                <p className="text-3xl font-bold text-green-600">{concluidos}</p>
                <p className="text-xs text-muted-foreground mt-1">este mês</p>
              </div>
              <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal - Projetos e Entregas */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Projetos Recentes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Projetos Recentes
                </CardTitle>
                <CardDescription>
                  Últimos projetos atualizados
                </CardDescription>
              </div>
              <Link href="/consultoria/projetos">
                <Button variant="ghost" size="sm" className="text-orange-600 hover:text-orange-700 hover:bg-orange-50">
                  Ver Todos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {projetosRecentes.length > 0 ? (
                  projetosRecentes.map((projeto) => (
                    <Link
                      key={projeto.id}
                      href={`/consultoria/projetos/${projeto.id}`}
                      className="block"
                    >
                      <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-orange-50/50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-800 transition-all group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-orange-600 transition-colors">
                              {projeto.nome}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={cn(
                                'shrink-0',
                                statusProjetoCores[projeto.status]
                              )}
                            >
                              {statusProjetoLabels[projeto.status]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {projeto.cliente?.nome}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              {formatDateShort(projeto.dataInicio)}
                              {projeto.dataFim && ` - ${formatDateShort(projeto.dataFim)}`}
                            </span>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="flex items-center gap-4 ml-4">
                          <div className="w-28">
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-muted-foreground">Progresso</span>
                              <span className="font-semibold text-orange-600">{projeto.progresso}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                                style={{ width: `${projeto.progresso}%` }}
                              />
                            </div>
                          </div>
                          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mx-auto mb-4">
                      <FolderKanban className="h-8 w-8 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">Nenhum projeto encontrado</h3>
                    <p className="text-muted-foreground mb-4">Comece criando seu primeiro projeto</p>
                    <Link href="/consultoria/projetos/novo">
                      <Button className="bg-orange-500 hover:bg-orange-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Criar Primeiro Projeto
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entregas da Semana */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-5 w-5 text-amber-500" />
                Entregas da Semana
              </CardTitle>
              <CardDescription>
                Próximas entregas programadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {entregasSemana.map((entrega) => (
                  <div
                    key={entrega.id}
                    className="p-3 rounded-lg border bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-100 dark:border-amber-900/30"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{entrega.nome}</h4>
                        <p className="text-xs text-muted-foreground truncate">{entrega.projeto}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0 border-amber-200 text-amber-700 dark:border-amber-800 dark:text-amber-400">
                        {formatDateShort(entrega.data)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-orange-500" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {acoesRapidas.map((acao) => {
                  const Icone = acao.icone
                  const content = (
                    <div
                      className={cn(
                        "flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all",
                        acao.disabled
                          ? "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                          : "hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:border-orange-200 dark:hover:border-orange-800 cursor-pointer"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg mb-2", acao.cor)}>
                        <Icone className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-xs font-medium">{acao.titulo}</span>
                    </div>
                  )

                  if (acao.disabled) {
                    return <div key={acao.titulo}>{content}</div>
                  }

                  return (
                    <Link key={acao.titulo} href={acao.href}>
                      {content}
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
