'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Wallet,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Landmark,
  Tags,
  BarChart3,
} from 'lucide-react'
import { ResumoCards, GraficoFluxo, MovimentacaoItem } from '@/components/financeiro'
import { Movimentacao, ResumoFinanceiro } from '@/types/financeiro'

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

export default function FinanceiroPage() {
  const [resumo] = useState<ResumoFinanceiro>(resumoMock)
  const [movimentacoes] = useState<Movimentacao[]>(movimentacoesMock)

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="h-7 w-7 text-bmv-primary" />
            Financeiro
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas receitas, despesas e fluxo de caixa
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/financeiro/movimentacoes/nova?tipo=RECEITA">
            <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
              <TrendingUp className="h-4 w-4 mr-2" />
              Nova Receita
            </Button>
          </Link>
          <Link href="/financeiro/movimentacoes/nova?tipo=DESPESA">
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
              <TrendingDown className="h-4 w-4 mr-2" />
              Nova Despesa
            </Button>
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <ResumoCards resumo={resumo} />

      {/* Atalhos rápidos */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/financeiro/movimentacoes">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <BarChart3 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="font-medium">Movimentacoes</p>
                <p className="text-xs text-muted-foreground">Ver todas</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financeiro/contas">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Landmark className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="font-medium">Contas Bancarias</p>
                <p className="text-xs text-muted-foreground">Gerenciar</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financeiro/categorias">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Tags className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="font-medium">Categorias</p>
                <p className="text-xs text-muted-foreground">Configurar</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/financeiro/fluxo-caixa">
          <Card className="card-hover cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <BarChart3 className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="font-medium">Fluxo de Caixa</p>
                <p className="text-xs text-muted-foreground">Relatorio</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Gráfico e Últimas Movimentações */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico */}
        <GraficoFluxo dados={dadosGraficoMock} />

        {/* Últimas Movimentações */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Ultimas Movimentacoes</CardTitle>
              <CardDescription>
                Transacoes mais recentes
              </CardDescription>
            </div>
            <Link href="/financeiro/movimentacoes">
              <Button variant="outline" size="sm">
                Ver Todas
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {movimentacoes.slice(0, 5).map((mov) => (
                <MovimentacaoItem
                  key={mov.id}
                  movimentacao={mov}
                  onClick={() => {}}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
