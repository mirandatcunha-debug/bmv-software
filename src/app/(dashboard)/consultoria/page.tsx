'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Briefcase,
  Plus,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Calendar,
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

export default function ConsultoriaPage() {
  const [projetos, setProjetos] = useState<Projeto[]>(projetosMock)

  // Cálculo dos cards de resumo
  const totalProjetos = projetos.length
  const emAndamento = projetos.filter((p) => p.status === 'EM_ANDAMENTO').length
  const concluidos = projetos.filter((p) => p.status === 'CONCLUIDO').length
  const atrasados = projetos.filter((p) => {
    if (!p.dataFim) return false
    const dataFim = new Date(p.dataFim)
    return dataFim < new Date() && p.status !== 'CONCLUIDO' && p.status !== 'CANCELADO'
  }).length

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

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="h-7 w-7 text-bmv-primary" />
            Consultoria
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus projetos e clientes
          </p>
        </div>
        <Link href="/consultoria/projetos/novo">
          <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Projeto
          </Button>
        </Link>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-bmv-primary/10">
                <FolderKanban className="h-5 w-5 text-bmv-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Projetos</p>
                <p className="text-2xl font-bold">{totalProjetos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
                <p className="text-2xl font-bold">{emAndamento}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <p className="text-2xl font-bold">{concluidos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Atrasados</p>
                <p className="text-2xl font-bold">{atrasados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projetos Recentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Projetos Recentes</CardTitle>
            <CardDescription>
              Últimos projetos atualizados
            </CardDescription>
          </div>
          <Link href="/consultoria/projetos">
            <Button variant="outline" size="sm">
              Ver Todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {projetosRecentes.length > 0 ? (
              projetosRecentes.map((projeto) => (
                <Link
                  key={projeto.id}
                  href={`/consultoria/projetos/${projeto.id}`}
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 rounded-lg border hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {projeto.nome}
                        </h4>
                        <span
                          className={cn(
                            'text-xs font-medium px-2 py-1 rounded shrink-0',
                            statusProjetoCores[projeto.status]
                          )}
                        >
                          {statusProjetoLabels[projeto.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-sm text-muted-foreground">
                          {projeto.cliente?.nome}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(projeto.dataInicio)}
                          {projeto.dataFim && ` - ${formatDate(projeto.dataFim)}`}
                        </div>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-4 ml-4">
                      <div className="w-24">
                        <div className="flex justify-between text-xs mb-1">
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
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <FolderKanban className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum projeto encontrado</p>
                <Link href="/consultoria/projetos/novo">
                  <Button variant="outline" className="mt-4">
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
  )
}
