'use client'

import { useState, useEffect } from 'react'
import {
  InsightsCard,
  ResumoFinanceiro,
  OKRsDestaque,
  ProjetoCard,
  AcoesRapidas,
  GraficoMiniFluxo,
} from '@/components/dashboard'
import { Insight } from '@/types/insights'
import { cn } from '@/lib/utils'
import {
  Calendar,
  TrendingUp,
  Target,
  Wallet,
} from 'lucide-react'
import {
  empresa,
  resumoFinanceiro as demoResumoFinanceiro,
  objetivosOKR,
  projetoConsultoria,
  insightsIA,
  usuarios,
} from '@/data/demo-data'

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

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

function formatDate(date: Date): string {
  const diasSemana = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado']
  const meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

  const diaSemana = diasSemana[date.getDay()]
  const dia = date.getDate()
  const mes = meses[date.getMonth()]

  return `${diaSemana}, ${dia} de ${mes}`
}

function getGreetingEmoji(hour: number): string {
  if (hour < 6) return '🌙'
  if (hour < 12) return '☀️'
  if (hour < 18) return '🌤️'
  return '🌙'
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [currentDate] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else {
        setData(getDadosDemonstracao())
      }
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setData(getDadosDemonstracao())
    } finally {
      setLoading(false)
    }
  }

  // Função para mapear status do demo-data para o formato esperado
  const mapStatusOKR = (status: string): 'EM_DIA' | 'ATENCAO' | 'ATRASADO' | 'CRITICO' => {
    switch (status) {
      case 'em_andamento':
      case 'em_dia':
        return 'EM_DIA'
      case 'atrasado':
        return 'ATRASADO'
      case 'concluido':
        return 'EM_DIA'
      default:
        return 'ATENCAO'
    }
  }

  // Função para mapear tipo de insight do demo-data para o formato esperado
  const mapTipoInsight = (tipo: string): 'CRITICO' | 'ALERTA' | 'POSITIVO' | 'SUGESTAO' => {
    switch (tipo) {
      case 'critico':
        return 'CRITICO'
      case 'alerta':
        return 'ALERTA'
      case 'positivo':
        return 'POSITIVO'
      case 'sugestao':
        return 'SUGESTAO'
      default:
        return 'ALERTA'
    }
  }

  const getDadosDemonstracao = (): DashboardData => ({
    insights: insightsIA.map((insight) => ({
      id: insight.id,
      tipo: mapTipoInsight(insight.tipo),
      categoria: 'FINANCEIRO' as const,
      titulo: insight.titulo,
      descricao: insight.descricao,
      icone: insight.tipo === 'critico' ? '🚨' : insight.tipo === 'alerta' ? '⚠️' : insight.tipo === 'positivo' ? '✅' : '💡',
      prioridade: insight.tipo === 'critico' ? 1 : insight.tipo === 'alerta' ? 2 : 3,
      criadoEm: new Date(insight.dataGeracao),
    })),
    financeiro: {
      saldoTotal: demoResumoFinanceiro.saldoTotal,
      receitasMes: demoResumoFinanceiro.receitasMes,
      receitasMesAnterior: demoResumoFinanceiro.receitasMes * 0.9, // 10% menor
      despesasMes: demoResumoFinanceiro.despesasMes,
      despesasMesAnterior: demoResumoFinanceiro.despesasMes * 1.05, // 5% maior
      resultado: demoResumoFinanceiro.resultado,
    },
    okrs: objetivosOKR.map((okr) => ({
      id: okr.id,
      titulo: okr.titulo,
      progresso: okr.progresso,
      dataFim: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: mapStatusOKR(okr.status),
    })),
    projeto: {
      id: projetoConsultoria.id,
      nome: projetoConsultoria.nome,
      consultor: projetoConsultoria.consultor,
      status: 'EM_ANDAMENTO',
      progresso: projetoConsultoria.progresso,
      proximaEntrega: {
        data: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        descricao: 'Revisão de processos financeiros',
      },
    },
    usuario: {
      nome: usuarios[0]?.nome || 'Usuário',
      perfil: 'GESTOR',
    },
  })

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  const hour = new Date().getHours()
  const isCliente = data?.usuario?.perfil === 'CLIENTE'

  // Metricas rapidas
  const okrsEmDia = data?.okrs?.filter(o => o.status === 'EM_DIA').length || 0
  const okrsTotal = data?.okrs?.length || 0
  const progressoMedio = data?.okrs?.length
    ? Math.round(data.okrs.reduce((acc, o) => acc + o.progresso, 0) / data.okrs.length)
    : 0

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-bmv-primary via-blue-700 to-blue-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          {/* Data atual */}
          <div className="flex items-center gap-2 text-blue-100 text-sm mb-3 animate-fade-in-up">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(currentDate)}</span>
          </div>

          {/* Saudacao */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl animate-bounce-soft">{getGreetingEmoji(hour)}</span>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {getGreeting()}, {data?.usuario?.nome || 'Usuario'}!
              </h1>
              <p className="text-blue-100 text-sm md:text-base">
                Aqui esta o resumo da sua empresa hoje
              </p>
            </div>
          </div>

          {/* Mini cards de resumo rapido */}
          {!isCliente && (
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up animate-stagger-1">
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-blue-200" />
                  <span className="text-xs text-blue-200">Saldo</span>
                </div>
                <p className="text-lg font-bold animate-number">
                  {loading ? '...' : formatCurrency(data?.financeiro?.saldoTotal || 0)}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up animate-stagger-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-blue-200" />
                  <span className="text-xs text-blue-200">Resultado</span>
                </div>
                <p className={cn(
                  'text-lg font-bold animate-number',
                  (data?.financeiro?.resultado || 0) >= 0 ? 'text-green-300' : 'text-red-300'
                )}>
                  {loading ? '...' : (data?.financeiro?.resultado || 0) >= 0 ? '+' : ''}{formatCurrency(data?.financeiro?.resultado || 0)}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up animate-stagger-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-blue-200" />
                  <span className="text-xs text-blue-200">OKRs</span>
                </div>
                <p className="text-lg font-bold animate-number">
                  {loading ? '...' : `${okrsEmDia}/${okrsTotal}`}
                  <span className="text-xs font-normal text-blue-200 ml-1">em dia</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECAO 1 - INSIGHTS DA IA */}
      <div className="animate-fade-in-up animate-stagger-1">
        <InsightsCard
          insights={data?.insights || []}
          loading={loading}
        />
      </div>

      {/* SECAO 2 - RESUMO FINANCEIRO */}
      {!isCliente && (
        <div className="animate-fade-in-up animate-stagger-2">
          <ResumoFinanceiro
            saldoTotal={data?.financeiro?.saldoTotal || 0}
            receitasMes={data?.financeiro?.receitasMes || 0}
            receitasMesAnterior={data?.financeiro?.receitasMesAnterior || 0}
            despesasMes={data?.financeiro?.despesasMes || 0}
            despesasMesAnterior={data?.financeiro?.despesasMesAnterior || 0}
            resultado={data?.financeiro?.resultado || 0}
            loading={loading}
          />
        </div>
      )}

      {/* SECAO 2.1 - GRAFICO MINI FLUXO */}
      {!isCliente && (
        <div className="animate-fade-in-up animate-stagger-3">
          <GraficoMiniFluxo loading={loading} />
        </div>
      )}

      {/* SECAO 3 e 4 - OKRs e Projeto */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* SECAO 3 - OKRs EM DESTAQUE */}
        <div className="animate-fade-in-up animate-stagger-4">
          <OKRsDestaque
            okrs={data?.okrs || []}
            loading={loading}
          />
        </div>

        {/* SECAO 4 - SEU PROJETO (Consultoria) */}
        <div className="animate-fade-in-up animate-stagger-5">
          <ProjetoCard
            projeto={data?.projeto || null}
            loading={loading}
          />
        </div>
      </div>

      {/* SECAO 5 - ACOES RAPIDAS */}
      <div className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
        <AcoesRapidas perfil={data?.usuario?.perfil} />
      </div>
    </div>
  )
}
