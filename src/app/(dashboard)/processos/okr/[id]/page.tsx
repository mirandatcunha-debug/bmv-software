'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Target,
  Calendar,
  User,
  Edit,
  Trash2,
  Plus,
} from 'lucide-react'
import { KRCard, ProgressoBar, StatusBadge } from '@/components/okr'
import { Objetivo, StatusOKR, statusLabels } from '@/types/okr'

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

const statusOptions = Object.entries(statusLabels).map(([value, label]) => ({
  value: value as StatusOKR,
  label,
}))

export default function ObjetivoDetailPage() {
  const params = useParams()
  const [objetivo, setObjetivo] = useState<Objetivo>(objetivoMock)

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

  const getPeriodoLabel = () => {
    if (objetivo.periodoTipo === 'TRIMESTRE') {
      return `${objetivo.trimestre} ${objetivo.ano}`
    }
    return ''
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/processos/okr"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para OKRs
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-bmv-primary/10 shrink-0">
              <Target className="h-8 w-8 text-bmv-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {objetivo.titulo}
              </h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">
                {objetivo.descricao}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select value={objetivo.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="text-danger hover:text-danger">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <User className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Responsável</p>
                <p className="font-semibold">{objetivo.dono.nome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Período</p>
                <p className="font-semibold">{getPeriodoLabel()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Target className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <StatusBadge status={objetivo.status} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressoBar
            progresso={objetivo.progresso}
            status={objetivo.status}
            size="lg"
          />
        </CardContent>
      </Card>

      {/* Key Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Key Results ({objetivo.keyResults.length})
          </h2>
          <Link href={`/processos/okr/${params.id}/novo-kr`}>
            <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo KR
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {objetivo.keyResults.map((kr, index) => (
            <KRCard
              key={kr.id}
              kr={kr}
              index={index}
              onTarefaToggle={handleTarefaToggle}
              onSubtarefaToggle={handleSubtarefaToggle}
              onAddTarefa={(krId) => console.log('Add tarefa to', krId)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
