'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Target, Plus, Filter, ArrowLeft } from 'lucide-react'
import { ObjetivoCard } from '@/components/okr'
import { Objetivo, StatusOKR } from '@/types/okr'

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
]

const trimestres = ['Q1', 'Q2', 'Q3', 'Q4']
const anos = [2025, 2026, 2027]
const statusOptions: { value: StatusOKR | 'TODOS'; label: string }[] = [
  { value: 'TODOS', label: 'Todos os Status' },
  { value: 'NAO_INICIADO', label: 'Não Iniciado' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'ATRASADO', label: 'Atrasado' },
  { value: 'CONCLUIDO', label: 'Concluído' },
  { value: 'CANCELADO', label: 'Cancelado' },
]

export default function OKRPage() {
  const [periodoTrimestre, setPeriodoTrimestre] = useState('Q1')
  const [periodoAno, setPeriodoAno] = useState('2026')
  const [statusFiltro, setStatusFiltro] = useState<StatusOKR | 'TODOS'>('TODOS')

  // Filtrar objetivos
  const objetivosFiltrados = objetivosMock.filter((obj) => {
    const matchTrimestre = obj.trimestre === periodoTrimestre
    const matchAno = obj.ano === parseInt(periodoAno)
    const matchStatus = statusFiltro === 'TODOS' || obj.status === statusFiltro
    return matchTrimestre && matchAno && matchStatus
  })

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/processos"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Processos
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Target className="h-7 w-7 text-bmv-primary" />
            OKRs
          </h1>
          <p className="text-muted-foreground">
            Gerencie objetivos e resultados-chave
          </p>
        </div>
        <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Objetivo
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Filtros:</span>

        <Select value={periodoTrimestre} onValueChange={setPeriodoTrimestre}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Trimestre" />
          </SelectTrigger>
          <SelectContent>
            {trimestres.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={periodoAno} onValueChange={setPeriodoAno}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {anos.map((a) => (
              <SelectItem key={a} value={a.toString()}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={statusFiltro}
          onValueChange={(value) => setStatusFiltro(value as StatusOKR | 'TODOS')}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="text-sm text-muted-foreground">
        {objetivosFiltrados.length} objetivo(s) encontrado(s)
      </div>

      {/* Objectives List */}
      <div className="grid gap-4">
        {objetivosFiltrados.length > 0 ? (
          objetivosFiltrados.map((objetivo) => (
            <ObjetivoCard key={objetivo.id} objetivo={objetivo} />
          ))
        ) : (
          <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            <Target className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum objetivo encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Não há objetivos para os filtros selecionados.
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Objetivo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
