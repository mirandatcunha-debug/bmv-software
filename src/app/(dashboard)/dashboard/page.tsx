'use client'

import { useState, useEffect } from 'react'
import {
  InsightsCard,
  ResumoFinanceiro,
  OKRsDestaque,
  ProjetoCard,
  AcoesRapidas,
} from '@/components/dashboard'
import { Insight } from '@/types/insights'

interface DashboardData {
  insights: Insight[]
  financeiro: {
    saldoTotal: number
    receitasMes: number
    receitasMesAnterior: number
    despesasMes: number
    despesasMesAnterior: number
    resultado: number
  }
  okrs: {
    id: string
    titulo: string
    progresso: number
    dataFim: Date | string
    status: 'EM_DIA' | 'ATENCAO' | 'ATRASADO' | 'CRITICO'
  }[]
  projeto: {
    id: string
    nome: string
    consultor: string
    status: string
    progresso: number
    proximaEntrega?: {
      data: Date | string
      descricao: string
    } | null
  } | null
  usuario: {
    nome: string
    perfil: string
  }
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else {
        // Se a API falhar, usar dados de demonstração
        setData(getDadosDemonstracao())
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      // Usar dados de demonstração em caso de erro
      setData(getDadosDemonstracao())
    } finally {
      setLoading(false)
    }
  }

  // Dados de demonstração para quando a API não estiver disponível
  const getDadosDemonstracao = (): DashboardData => ({
    insights: [
      {
        id: '1',
        tipo: 'ALERTA',
        categoria: 'FINANCEIRO',
        titulo: 'Despesas acima do normal',
        descricao: 'Suas despesas este mês estão 25% acima da média dos últimos 3 meses.',
        icone: '⚠️',
        prioridade: 2,
        acao: { texto: 'Ver despesas', link: '/financeiro/movimentacoes?tipo=DESPESA' },
        criadoEm: new Date(),
      },
      {
        id: '2',
        tipo: 'ALERTA',
        categoria: 'OKR',
        titulo: 'OKR em risco: Aumentar vendas',
        descricao: 'Progresso de 35% com 20 dias restantes. Considere acelerar as entregas.',
        icone: '⚠️',
        prioridade: 2,
        acao: { texto: 'Ver OKR', link: '/processos/okr' },
        criadoEm: new Date(),
      },
      {
        id: '3',
        tipo: 'POSITIVO',
        categoria: 'FINANCEIRO',
        titulo: 'Receitas acima da média! 🎉',
        descricao: 'Suas receitas este mês estão 15% acima da média. Continue assim!',
        icone: '✅',
        prioridade: 5,
        criadoEm: new Date(),
      },
    ],
    financeiro: {
      saldoTotal: 125750.00,
      receitasMes: 45320.00,
      receitasMesAnterior: 41500.00,
      despesasMes: 32180.00,
      despesasMesAnterior: 35200.00,
      resultado: 13140.00,
    },
    okrs: [
      {
        id: '1',
        titulo: 'Aumentar receita em 20%',
        progresso: 65,
        dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'EM_DIA',
      },
      {
        id: '2',
        titulo: 'Reduzir inadimplência para 3%',
        progresso: 35,
        dataFim: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'ATENCAO',
      },
      {
        id: '3',
        titulo: 'Implementar novo processo',
        progresso: 85,
        dataFim: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'EM_DIA',
      },
    ],
    projeto: {
      id: '1',
      nome: 'Implementação ERP Financeiro',
      consultor: 'João Silva',
      status: 'EM_ANDAMENTO',
      progresso: 45,
      proximaEntrega: {
        data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        descricao: 'Módulo de Contas a Pagar',
      },
    },
    usuario: {
      nome: 'Usuário',
      perfil: 'GESTOR',
    },
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const isCliente = data?.usuario?.perfil === 'CLIENTE'

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {getGreeting()}, {data?.usuario?.nome || 'Usuário'}!
        </h1>
        <p className="text-muted-foreground">
          Aqui está o resumo da sua empresa hoje.
        </p>
      </div>

      {/* SEÇÃO 1 - INSIGHTS DA IA */}
      <InsightsCard
        insights={data?.insights || []}
        loading={loading}
      />

      {/* SEÇÃO 2 - RESUMO FINANCEIRO */}
      {!isCliente && (
        <ResumoFinanceiro
          saldoTotal={data?.financeiro?.saldoTotal || 0}
          receitasMes={data?.financeiro?.receitasMes || 0}
          receitasMesAnterior={data?.financeiro?.receitasMesAnterior || 0}
          despesasMes={data?.financeiro?.despesasMes || 0}
          despesasMesAnterior={data?.financeiro?.despesasMesAnterior || 0}
          resultado={data?.financeiro?.resultado || 0}
          loading={loading}
        />
      )}

      {/* SEÇÃO 3 e 4 - OKRs e Projeto */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SEÇÃO 3 - OKRs EM DESTAQUE */}
        <OKRsDestaque
          okrs={data?.okrs || []}
          loading={loading}
        />

        {/* SEÇÃO 4 - SEU PROJETO (Consultoria) */}
        <ProjetoCard
          projeto={data?.projeto || null}
          loading={loading}
        />
      </div>

      {/* SEÇÃO 5 - AÇÕES RÁPIDAS */}
      <AcoesRapidas perfil={data?.usuario?.perfil} />
    </div>
  )
}
