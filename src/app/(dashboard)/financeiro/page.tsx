'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Landmark,
  Tags,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Receipt,
} from 'lucide-react'
import { GraficoFluxo, MovimentacaoItem } from '@/components/financeiro'
import { Movimentacao, ResumoFinanceiro, formatCurrency } from '@/types/financeiro'
import { cn } from '@/lib/utils'

// Dados mockados
const resumoMock: ResumoFinanceiro = {
  saldoTotal: 125450.00,
  receitasMes: 45000.00,
  despesasMes: 32500.00,
  resultadoMes: 12500.00,
  contasPagar: 8500.00,
  contasReceber: 15000.00,
}

const dadosGraficoMock = [
  { mes: 'Ago', receitas: 38000, despesas: 28000 },
  { mes: 'Set', receitas: 42000, despesas: 31000 },
  { mes: 'Out', receitas: 39000, despesas: 35000 },
  { mes: 'Nov', receitas: 48000, despesas: 29000 },
  { mes: 'Dez', receitas: 52000, despesas: 38000 },
  { mes: 'Jan', receitas: 45000, despesas: 32500 },
]

const movimentacoesMock: Movimentacao[] = [
  {
    id: '1',
    tenantId: '1',
    contaId: '1',
    conta: { id: '1', tenantId: '1', nome: 'Banco do Brasil', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 50000, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'RECEITA',
    categoria: 'Vendas',
    descricao: 'Pagamento Cliente ABC',
    valor: 15000,
    dataMovimento: new Date('2026-01-05'),
    recorrente: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '2',
    tenantId: '1',
    contaId: '1',
    conta: { id: '1', tenantId: '1', nome: 'Banco do Brasil', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 50000, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'DESPESA',
    categoria: 'Pessoal',
    descricao: 'Folha de Pagamento',
    valor: 18500,
    dataMovimento: new Date('2026-01-05'),
    recorrente: true,
    frequencia: 'MENSAL',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '3',
    tenantId: '1',
    contaId: '2',
    conta: { id: '2', tenantId: '1', nome: 'Itau', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 75450, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'RECEITA',
    categoria: 'Servicos',
    descricao: 'Consultoria Tech Solutions',
    valor: 8500,
    dataMovimento: new Date('2026-01-04'),
    recorrente: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '4',
    tenantId: '1',
    contaId: '1',
    conta: { id: '1', tenantId: '1', nome: 'Banco do Brasil', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 50000, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'DESPESA',
    categoria: 'Aluguel',
    descricao: 'Aluguel Escritorio',
    valor: 4500,
    dataMovimento: new Date('2026-01-03'),
    recorrente: true,
    frequencia: 'MENSAL',
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '5',
    tenantId: '1',
    contaId: '2',
    conta: { id: '2', tenantId: '1', nome: 'Itau', tipo: 'CORRENTE', saldoInicial: 0, saldoAtual: 75450, ativo: true, criadoEm: new Date(), atualizadoEm: new Date() },
    tipo: 'RECEITA',
    categoria: 'Vendas',
    descricao: 'Licenca Software',
    valor: 3200,
    dataMovimento: new Date('2026-01-02'),
    recorrente: false,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
]

// Dados mockados para quantidades nos atalhos
const atalhosMock = {
  movimentacoes: 24,
  contas: 3,
  categorias: 12,
  fluxoCaixa: 6,
}

export default function FinanceiroPage() {
  const [resumo] = useState<ResumoFinanceiro>(resumoMock)
  const [movimentacoes] = useState<Movimentacao[]>(movimentacoesMock)

  // Calcular tendências (comparação com mês anterior - mockado)
  const tendenciaReceita = 12.5 // +12.5%
  const tendenciaDespesa = -8.3 // -8.3%
  const tendenciaResultado = 25.0 // +25%

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          {/* Data atual */}
          <div className="flex items-center gap-2 text-emerald-100 text-sm mb-3 animate-fade-in-up">
            <Calendar className="h-4 w-4" />
            <span>Janeiro 2026</span>
          </div>

          {/* Titulo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Wallet className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Financeiro</h1>
                <p className="text-emerald-100 text-sm md:text-base">
                  Gerencie suas receitas, despesas e fluxo de caixa
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/financeiro/movimentacoes/nova?tipo=RECEITA">
                <Button
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
                  variant="outline"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Nova Receita
                </Button>
              </Link>
              <Link href="/financeiro/movimentacoes/nova?tipo=DESPESA">
                <Button
                  className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
                  variant="outline"
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Nova Despesa
                </Button>
              </Link>
            </div>
          </div>

          {/* Mini cards de resumo no header */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-emerald-200" />
                <span className="text-xs text-emerald-200">Saldo Total</span>
              </div>
              <p className="text-lg font-bold">
                {formatCurrency(resumo.saldoTotal)}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-emerald-200" />
                <span className="text-xs text-emerald-200">Receitas</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-green-300">
                  {formatCurrency(resumo.receitasMes)}
                </p>
                <div className="flex items-center text-xs text-green-300">
                  <ArrowUpRight className="h-3 w-3" />
                  {tendenciaReceita}%
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-emerald-200" />
                <span className="text-xs text-emerald-200">Despesas</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-red-300">
                  {formatCurrency(resumo.despesasMes)}
                </p>
                <div className="flex items-center text-xs text-green-300">
                  <ArrowDownRight className="h-3 w-3" />
                  {Math.abs(tendenciaDespesa)}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atalhos rápidos com animação stagger */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/financeiro/movimentacoes" className="group">
          <Card className="relative overflow-hidden border-2 border-transparent hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-5 flex items-center gap-4 relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg group-hover:text-blue-600 transition-colors">Movimentacoes</p>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                    {atalhosMock.movimentacoes}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Ver todas as transacoes</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financeiro/contas" className="group">
          <Card className="relative overflow-hidden border-2 border-transparent hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-5 flex items-center gap-4 relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg shadow-purple-500/25 group-hover:scale-110 transition-transform">
                <Landmark className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg group-hover:text-purple-600 transition-colors">Contas Bancarias</p>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                    {atalhosMock.contas}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Gerenciar contas</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financeiro/categorias" className="group">
          <Card className="relative overflow-hidden border-2 border-transparent hover:border-amber-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-amber-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-5 flex items-center gap-4 relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 group-hover:scale-110 transition-transform">
                <Tags className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg group-hover:text-amber-600 transition-colors">Categorias</p>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300">
                    {atalhosMock.categorias}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Configurar categorias</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financeiro/fluxo-caixa" className="group">
          <Card className="relative overflow-hidden border-2 border-transparent hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <CardContent className="p-5 flex items-center gap-4 relative">
              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg group-hover:text-cyan-600 transition-colors">Fluxo de Caixa</p>
                  <Badge variant="secondary" className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300">
                    {atalhosMock.fluxoCaixa} meses
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">Relatorio detalhado</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Cards de Resumo com indicadores de tendência */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saldo Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(resumo.saldoTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/20">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receitas (Mes)</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(resumo.receitasMes)}
                  </p>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    {tendenciaReceita}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/10 to-red-600/20">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Despesas (Mes)</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(resumo.despesasMes)}
                  </p>
                  <Badge className="bg-green-100 text-green-700 text-xs">
                    <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    {Math.abs(tendenciaDespesa)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "relative overflow-hidden",
          resumo.resultadoMes >= 0 ? "ring-2 ring-green-500/20" : "ring-2 ring-red-500/20"
        )}>
          <div className={cn(
            "absolute top-0 right-0 w-20 h-20 rounded-full -translate-y-1/2 translate-x-1/2",
            resumo.resultadoMes >= 0 ? "bg-green-500/10" : "bg-red-500/10"
          )}></div>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "p-3 rounded-xl",
                resumo.resultadoMes >= 0
                  ? "bg-gradient-to-br from-green-500/10 to-green-600/20"
                  : "bg-gradient-to-br from-red-500/10 to-red-600/20"
              )}>
                {resumo.resultadoMes >= 0
                  ? <TrendingUp className="h-6 w-6 text-green-600" />
                  : <TrendingDown className="h-6 w-6 text-red-600" />
                }
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resultado (Mes)</p>
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "text-2xl font-bold",
                    resumo.resultadoMes >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {resumo.resultadoMes >= 0 ? '+' : ''}{formatCurrency(resumo.resultadoMes)}
                  </p>
                  <Badge className={cn(
                    "text-xs",
                    resumo.resultadoMes >= 0
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  )}>
                    <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    {tendenciaResultado}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico e Últimas Movimentações */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <GraficoFluxo dados={dadosGraficoMock} />
        </div>

        {/* Últimas Movimentações */}
        <Card className="animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-muted-foreground" />
                Ultimas Movimentacoes
              </CardTitle>
              <CardDescription>
                Transacoes mais recentes
              </CardDescription>
            </div>
            <Link href="/financeiro/movimentacoes">
              <Button variant="outline" size="sm" className="group">
                Ver Todas
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movimentacoes.slice(0, 5).map((mov, index) => (
                <div
                  key={mov.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <MovimentacaoItem
                    movimentacao={mov}
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
