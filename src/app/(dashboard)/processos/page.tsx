'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Target,
  Clock,
  GitBranch,
  ChevronRight,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  BarChart3,
  Users,
  Calendar,
  Zap,
  FileText,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Dados mockados de OKRs para estatísticas
const okrStats = {
  objetivosAtivos: 5,
  emDia: 3,
  atrasados: 1,
  concluidos: 2,
  taxaConclusao: 67,
}

// Objetivos recentes mockados
const objetivosRecentes = [
  {
    id: '1',
    titulo: 'Aumentar receita recorrente em 30%',
    responsavel: 'João Silva',
    progresso: 65,
    status: 'EM_ANDAMENTO',
    trimestre: 'Q1 2026',
  },
  {
    id: '2',
    titulo: 'Melhorar satisfação do cliente',
    responsavel: 'Maria Santos',
    progresso: 35,
    status: 'ATRASADO',
    trimestre: 'Q1 2026',
  },
  {
    id: '3',
    titulo: 'Lançar nova funcionalidade de relatórios',
    responsavel: 'João Silva',
    progresso: 100,
    status: 'CONCLUIDO',
    trimestre: 'Q1 2026',
  },
]

const processos = [
  {
    titulo: 'OKRs',
    descricao: 'Objetivos e Resultados-Chave',
    icone: Target,
    href: '/processos/okr',
    cor: 'bg-blue-500',
    disponivel: true,
  },
  {
    titulo: 'Projetos',
    descricao: 'Gerencie projetos e tarefas',
    icone: FileText,
    href: '#',
    cor: 'bg-indigo-500',
    disponivel: false,
  },
  {
    titulo: 'Reuniões',
    descricao: 'Acompanhe reuniões e ações',
    icone: Users,
    href: '#',
    cor: 'bg-purple-500',
    disponivel: false,
  },
]

// Ações rápidas
const acoesRapidas = [
  { titulo: 'Novo Objetivo', descricao: 'Criar OKR', icone: Target, href: '/processos/okr/novo', cor: 'bg-blue-500' },
  { titulo: 'Ver OKRs', descricao: 'Lista de objetivos', icone: BarChart3, href: '/processos/okr', cor: 'bg-indigo-500' },
  { titulo: 'Relatórios', descricao: 'Análises', icone: TrendingUp, href: '#', cor: 'bg-purple-500', disabled: true },
  { titulo: 'Configurar', descricao: 'Preferências', icone: Settings, href: '#', cor: 'bg-slate-500', disabled: true },
]

const statusColors: Record<string, string> = {
  EM_ANDAMENTO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ATRASADO: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CONCLUIDO: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  NAO_INICIADO: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
}

const statusLabels: Record<string, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  ATRASADO: 'Atrasado',
  CONCLUIDO: 'Concluído',
  NAO_INICIADO: 'Não Iniciado',
}

export default function ProcessosPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header com Gradiente Azul/Índigo */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <GitBranch className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Processos</h1>
              <p className="text-white/80">
                Gerencie os processos da sua empresa
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

      {/* Cards de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover border-l-4 border-l-blue-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Objetivos Ativos</p>
                <p className="text-3xl font-bold text-blue-600">{okrStats.objetivosAtivos}</p>
                <p className="text-xs text-muted-foreground mt-1">neste trimestre</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-green-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Em Dia</p>
                <p className="text-3xl font-bold text-green-600">{okrStats.emDia}</p>
                <p className="text-xs text-muted-foreground mt-1">dentro do prazo</p>
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
                <p className="text-sm font-medium text-muted-foreground">Atrasados</p>
                <p className="text-3xl font-bold text-amber-600">{okrStats.atrasados}</p>
                <p className="text-xs text-muted-foreground mt-1">precisam de atenção</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover border-l-4 border-l-indigo-500">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-indigo-600">{okrStats.taxaConclusao}%</p>
                <p className="text-xs text-muted-foreground mt-1">média geral</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Principal */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Objetivos Recentes */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Objetivos Recentes
                </CardTitle>
                <CardDescription>
                  Últimos objetivos atualizados
                </CardDescription>
              </div>
              <Link href="/processos/okr">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  Ver Todos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {objetivosRecentes.map((objetivo) => (
                  <Link
                    key={objetivo.id}
                    href={`/processos/okr/${objetivo.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-blue-50/50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                            {objetivo.titulo}
                          </h4>
                          <Badge
                            variant="secondary"
                            className={cn('shrink-0', statusColors[objetivo.status])}
                          >
                            {statusLabels[objetivo.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {objetivo.responsavel}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {objetivo.trimestre}
                          </span>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="flex items-center gap-4 ml-4">
                        <div className="w-28">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-muted-foreground">Progresso</span>
                            <span className={cn(
                              "font-semibold",
                              objetivo.status === 'CONCLUIDO' ? 'text-green-600' :
                              objetivo.status === 'ATRASADO' ? 'text-amber-600' : 'text-blue-600'
                            )}>{objetivo.progresso}%</span>
                          </div>
                          <div className="h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                objetivo.status === 'CONCLUIDO' ? 'bg-green-500' :
                                objetivo.status === 'ATRASADO' ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                              )}
                              style={{ width: `${objetivo.progresso}%` }}
                            />
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Processos Disponíveis */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5 text-indigo-500" />
                Processos
              </CardTitle>
              <CardDescription>
                Ferramentas disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {processos.map((processo) => {
                  const Icone = processo.icone
                  const content = (
                    <div
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl border transition-all",
                        processo.disponivel
                          ? "hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer"
                          : "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50"
                      )}
                    >
                      <div className={cn("p-2 rounded-lg", processo.cor)}>
                        <Icone className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{processo.titulo}</h4>
                        <p className="text-xs text-muted-foreground truncate">{processo.descricao}</p>
                      </div>
                      {processo.disponivel && (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      {!processo.disponivel && (
                        <Badge variant="outline" className="text-xs">Em breve</Badge>
                      )}
                    </div>
                  )

                  if (!processo.disponivel) {
                    return <div key={processo.titulo}>{content}</div>
                  }

                  return (
                    <Link key={processo.titulo} href={processo.href}>
                      {content}
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-5 w-5 text-blue-500" />
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
                          : "hover:bg-blue-50 dark:hover:bg-blue-900/10 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer"
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
