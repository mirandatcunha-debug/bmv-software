'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Wallet,
  Loader2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Landmark,
} from 'lucide-react'
import { formatCurrency } from '@/types/financeiro'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

interface FluxoDiario {
  dia: number
  data: string
  saldoInicial: number
  entradas: number
  saidas: number
  saldoFinal: number
}

interface FluxoCaixaResponse {
  mes: number
  ano: number
  contaId: string | null
  saldoInicialMes: number
  saldoFinalMes: number
  totalEntradas: number
  totalSaidas: number
  variacaoPeriodo: number
  fluxoDiario: FluxoDiario[]
}

interface ContaBancaria {
  id: string
  nome: string
  banco: string | null
  saldoAtual: number
}

const meses = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Marco' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

const anos = ['2024', '2025', '2026', '2027']

export default function FluxoCaixaDiarioPage() {
  const [mesSelecionado, setMesSelecionado] = useState(String(new Date().getMonth() + 1))
  const [anoSelecionado, setAnoSelecionado] = useState(String(new Date().getFullYear()))
  const [contaSelecionada, setContaSelecionada] = useState('todas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dados, setDados] = useState<FluxoCaixaResponse | null>(null)
  const [contas, setContas] = useState<ContaBancaria[]>([])

  // Carregar contas bancarias
  useEffect(() => {
    async function carregarContas() {
      try {
        const response = await fetch('/api/financeiro/contas?ativas=true')
        if (response.ok) {
          const data = await response.json()
          setContas(data)
        }
      } catch (err) {
        console.error('Erro ao carregar contas:', err)
      }
    }
    carregarContas()
  }, [])

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      let url = `/api/financeiro/fluxo-caixa-diario?ano=${anoSelecionado}&mes=${mesSelecionado}`
      if (contaSelecionada !== 'todas') {
        url += `&contaId=${contaSelecionada}`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Erro ao carregar fluxo de caixa diario')
      }

      const data = await response.json()
      setDados(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [anoSelecionado, mesSelecionado, contaSelecionada])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const getNomeMes = (mes: number) => {
    return meses.find((m) => m.value === String(mes))?.label || ''
  }

  // Preparar dados para o grafico
  const dadosGrafico = dados?.fluxoDiario.map((d) => ({
    dia: d.dia,
    saldo: d.saldoFinal,
    entradas: d.entradas,
    saidas: d.saidas,
  })) || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/financeiro"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Financeiro
      </Link>

      {/* Header com gradiente azul-esverdeado */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Fluxo de Caixa Diario</h1>
                <p className="text-cyan-100 text-sm md:text-base">
                  Acompanhamento dia a dia do mes
                </p>
              </div>
            </div>
          </div>

          {/* Mini cards no header */}
          {dados && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-cyan-200" />
                  <span className="text-xs text-cyan-200">Total Entradas</span>
                </div>
                <p className="text-lg font-bold text-green-300">
                  {formatCurrency(dados.totalEntradas)}
                </p>
              </div>

              <div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-cyan-200" />
                  <span className="text-xs text-cyan-200">Total Saidas</span>
                </div>
                <p className="text-lg font-bold text-red-300">
                  {formatCurrency(dados.totalSaidas)}
                </p>
              </div>

              <div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-4 w-4 text-cyan-200" />
                  <span className="text-xs text-cyan-200">Variacao</span>
                </div>
                <p
                  className={cn(
                    'text-lg font-bold',
                    dados.variacaoPeriodo >= 0 ? 'text-green-300' : 'text-red-300'
                  )}
                >
                  {dados.variacaoPeriodo >= 0 ? '+' : ''}
                  {formatCurrency(dados.variacaoPeriodo)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-sm font-medium">Periodo:</span>
            </div>

            <Select value={mesSelecionado} onValueChange={setMesSelecionado}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={anoSelecionado} onValueChange={setAnoSelecionado}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano} value={ano}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-muted-foreground ml-4">
              <Landmark className="h-4 w-4" />
              <span className="text-sm font-medium">Conta:</span>
            </div>

            <Select value={contaSelecionada} onValueChange={setContaSelecionada}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Contas</SelectItem>
                {contas.map((conta) => (
                  <SelectItem key={conta.id} value={conta.id}>
                    {conta.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 dark:border-red-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Conteudo Principal */}
      {!loading && !error && dados && (
        <>
          {/* Grafico de Evolucao */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                Evolucao do Saldo - {getNomeMes(dados.mes)} {dados.ano}
              </CardTitle>
              <CardDescription>
                Grafico mostrando a variacao do saldo ao longo do mes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosGrafico}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="dia"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}`}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        new Intl.NumberFormat('pt-BR', {
                          notation: 'compact',
                          compactDisplay: 'short',
                        }).format(value)
                      }
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        formatCurrency(value),
                        name === 'saldo'
                          ? 'Saldo'
                          : name === 'entradas'
                            ? 'Entradas'
                            : 'Saidas',
                      ]}
                      labelFormatter={(label) => `Dia ${label}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" />
                    <Line
                      type="monotone"
                      dataKey="saldo"
                      stroke="#0d9488"
                      strokeWidth={2}
                      dot={{ fill: '#0d9488', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Tabela Diaria */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-teal-600" />
                Fluxo Diario - {getNomeMes(dados.mes)} {dados.ano}
              </CardTitle>
              <CardDescription>Movimentacao detalhada por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20">
                      <TableHead className="w-[80px]">Dia</TableHead>
                      <TableHead className="text-right">Saldo Inicial</TableHead>
                      <TableHead className="text-right">Entradas</TableHead>
                      <TableHead className="text-right">Saidas</TableHead>
                      <TableHead className="text-right">Saldo Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dados.fluxoDiario.map((dia, index) => {
                      const temMovimentacao = dia.entradas > 0 || dia.saidas > 0
                      const saldoPositivo = dia.saldoFinal >= 0

                      return (
                        <TableRow
                          key={dia.dia}
                          className={cn(
                            'group transition-all animate-fade-in-up',
                            temMovimentacao
                              ? 'hover:bg-teal-50/50 dark:hover:bg-teal-900/10'
                              : 'bg-muted/30',
                            !saldoPositivo && 'bg-red-50/50 dark:bg-red-900/10'
                          )}
                          style={{ animationDelay: `${0.02 * index}s` }}
                        >
                          <TableCell className="font-medium">
                            <span
                              className={cn(
                                'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm',
                                temMovimentacao
                                  ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {dia.dia}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(dia.saldoInicial)}
                          </TableCell>
                          <TableCell className="text-right">
                            {dia.entradas > 0 ? (
                              <span className="text-green-600 font-medium flex items-center justify-end gap-1">
                                <ArrowUpRight className="h-4 w-4" />
                                {formatCurrency(dia.entradas)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {dia.saidas > 0 ? (
                              <span className="text-red-600 font-medium flex items-center justify-end gap-1">
                                <ArrowDownRight className="h-4 w-4" />
                                {formatCurrency(dia.saidas)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <span
                              className={cn(
                                'font-semibold',
                                saldoPositivo ? 'text-green-600' : 'text-red-600'
                              )}
                            >
                              {formatCurrency(dia.saldoFinal)}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-gradient-to-r from-cyan-100 to-teal-100 dark:from-cyan-900/30 dark:to-teal-900/30 font-semibold">
                      <TableCell>TOTAIS</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(dados.saldoInicialMes)}
                      </TableCell>
                      <TableCell className="text-right text-green-600">
                        <span className="flex items-center justify-end gap-1">
                          <ArrowUpRight className="h-4 w-4" />
                          {formatCurrency(dados.totalEntradas)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-red-600">
                        <span className="flex items-center justify-end gap-1">
                          <ArrowDownRight className="h-4 w-4" />
                          {formatCurrency(dados.totalSaidas)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span
                          className={cn(
                            'font-bold',
                            dados.saldoFinalMes >= 0 ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {formatCurrency(dados.saldoFinalMes)}
                        </span>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Card de Variacao */}
          <Card
            className={cn(
              'animate-fade-in-up border-2',
              dados.variacaoPeriodo >= 0
                ? 'border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
                : 'border-red-500/20 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'
            )}
            style={{ animationDelay: '0.4s' }}
          >
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-xl',
                      dados.variacaoPeriodo >= 0
                        ? 'bg-green-100 dark:bg-green-900/50'
                        : 'bg-red-100 dark:bg-red-900/50'
                    )}
                  >
                    {dados.variacaoPeriodo >= 0 ? (
                      <ArrowUpRight className="h-6 w-6 text-green-600" />
                    ) : (
                      <ArrowDownRight className="h-6 w-6 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variacao do Periodo</p>
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        dados.variacaoPeriodo >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {dados.variacaoPeriodo >= 0 ? '+' : ''}
                      {formatCurrency(dados.variacaoPeriodo)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-8">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Saldo Inicial</p>
                    <p className="text-lg font-semibold">{formatCurrency(dados.saldoInicialMes)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Saldo Final</p>
                    <p
                      className={cn(
                        'text-lg font-semibold',
                        dados.saldoFinalMes >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {formatCurrency(dados.saldoFinalMes)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
