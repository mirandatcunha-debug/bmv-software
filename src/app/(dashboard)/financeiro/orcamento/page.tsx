'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Target,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency } from '@/types/financeiro'
import { cn } from '@/lib/utils'

interface ComparativoCategoria {
  categoria: string
  tipo: string
  valorOrcado: number
  valorRealizado: number
  diferenca: number
  percentualExecucao: number
}

interface ResumoTipo {
  orcado: number
  realizado: number
  diferenca: number
  percentualExecucao: number
}

interface ComparativoResponse {
  periodo: {
    ano: number
    mes: number | null
    dataInicio: string
    dataFim: string
  }
  resumo: {
    receitas: ResumoTipo
    despesas: ResumoTipo
    saldo: {
      orcado: number
      realizado: number
      diferenca: number
    }
  }
  detalhes: ComparativoCategoria[]
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

export default function OrcamentoPage() {
  const [mesSelecionado, setMesSelecionado] = useState(String(new Date().getMonth() + 1))
  const [anoSelecionado, setAnoSelecionado] = useState(String(new Date().getFullYear()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dados, setDados] = useState<ComparativoResponse | null>(null)

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/financeiro/orcamento/comparativo?ano=${anoSelecionado}&mes=${mesSelecionado}`
      )

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do orcamento')
      }

      const data = await response.json()
      setDados(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
    } finally {
      setLoading(false)
    }
  }, [anoSelecionado, mesSelecionado])

  useEffect(() => {
    carregarDados()
  }, [carregarDados])

  const receitasDetalhes = dados?.detalhes.filter((d) => d.tipo === 'RECEITA') || []
  const despesasDetalhes = dados?.detalhes.filter((d) => d.tipo === 'DESPESA') || []

  const renderDiferenca = (diferenca: number, tipo: 'RECEITA' | 'DESPESA') => {
    // Para receitas: positivo e bom (verde), negativo e ruim (vermelho)
    // Para despesas: positivo e ruim (vermelho), negativo e bom (verde)
    const isPositivo = diferenca >= 0
    const isBom = tipo === 'RECEITA' ? isPositivo : !isPositivo

    return (
      <span className={cn('font-medium', isBom ? 'text-green-600' : 'text-red-600')}>
        {isPositivo ? '+' : ''}
        {formatCurrency(diferenca)}
      </span>
    )
  }

  const renderPercentual = (percentual: number, tipo: 'RECEITA' | 'DESPESA') => {
    // Para receitas: acima de 100% e bom
    // Para despesas: abaixo de 100% e bom
    const isBom = tipo === 'RECEITA' ? percentual >= 100 : percentual <= 100
    const diferenca = percentual - 100

    return (
      <div className="flex items-center gap-1">
        <span className={cn('font-medium', isBom ? 'text-green-600' : 'text-red-600')}>
          {percentual.toFixed(1)}%
        </span>
        {diferenca !== 0 && (
          <Badge
            variant="outline"
            className={cn(
              'text-xs',
              isBom
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            )}
          >
            {diferenca >= 0 ? (
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
            )}
            {diferenca >= 0 ? '+' : ''}
            {diferenca.toFixed(1)}%
          </Badge>
        )}
      </div>
    )
  }

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

      {/* Header com gradiente amarelo/laranja */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Orcamento</h1>
                <p className="text-amber-100 text-sm md:text-base">
                  Comparativo Orcado x Realizado
                </p>
              </div>
            </div>
            <Link href="/financeiro/orcamento/definir">
              <Button
                variant="outline"
                className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
              >
                <Settings className="h-4 w-4 mr-2" />
                Definir Orcamento
              </Button>
            </Link>
          </div>

          {/* Mini cards no header */}
          {dados && (
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
                style={{ animationDelay: '0.1s' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-amber-200" />
                  <span className="text-xs text-amber-200">Receitas</span>
                </div>
                <p className="text-lg font-bold text-green-300">
                  {formatCurrency(dados.resumo.receitas.realizado)}
                </p>
                <p className="text-xs text-amber-200/70">
                  de {formatCurrency(dados.resumo.receitas.orcado)} orcado
                </p>
              </div>

              <div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
                style={{ animationDelay: '0.2s' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="h-4 w-4 text-amber-200" />
                  <span className="text-xs text-amber-200">Despesas</span>
                </div>
                <p className="text-lg font-bold text-red-300">
                  {formatCurrency(dados.resumo.despesas.realizado)}
                </p>
                <p className="text-xs text-amber-200/70">
                  de {formatCurrency(dados.resumo.despesas.orcado)} orcado
                </p>
              </div>

              <div
                className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up"
                style={{ animationDelay: '0.3s' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <PiggyBank className="h-4 w-4 text-amber-200" />
                  <span className="text-xs text-amber-200">Saldo</span>
                </div>
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      'text-lg font-bold',
                      dados.resumo.saldo.realizado >= 0 ? 'text-green-300' : 'text-red-300'
                    )}
                  >
                    {formatCurrency(dados.resumo.saldo.realizado)}
                  </p>
                </div>
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
          {/* Cards de Resumo */}
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in-up"
            style={{ animationDelay: '0.2s' }}
          >
            <Card className="relative overflow-hidden border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      Receitas Orcadas
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatCurrency(dados.resumo.receitas.orcado)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                      <span>{dados.resumo.receitas.percentualExecucao.toFixed(1)}% executado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-2 border-red-500/20 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      Despesas Orcadas
                    </p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatCurrency(dados.resumo.despesas.orcado)}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-red-600 mt-1">
                      <span>{dados.resumo.despesas.percentualExecucao.toFixed(1)}% executado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                'relative overflow-hidden border-2',
                dados.resumo.saldo.orcado >= 0
                  ? 'border-blue-500/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20'
                  : 'border-orange-500/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20'
              )}
            >
              <div
                className={cn(
                  'absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2',
                  dados.resumo.saldo.orcado >= 0 ? 'bg-blue-500/10' : 'bg-orange-500/10'
                )}
              ></div>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Saldo Orcado
                    </p>
                    <p
                      className={cn(
                        'text-2xl font-bold mt-1',
                        dados.resumo.saldo.orcado >= 0 ? 'text-blue-600' : 'text-orange-600'
                      )}
                    >
                      {formatCurrency(dados.resumo.saldo.orcado)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card
              className={cn(
                'relative overflow-hidden border-2',
                dados.resumo.saldo.diferenca >= 0
                  ? 'border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20'
                  : 'border-red-500/20 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20'
              )}
            >
              <div
                className={cn(
                  'absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2',
                  dados.resumo.saldo.diferenca >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'
                )}
              ></div>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      {dados.resumo.saldo.diferenca >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                      )}
                      Variacao
                    </p>
                    <p
                      className={cn(
                        'text-2xl font-bold mt-1',
                        dados.resumo.saldo.diferenca >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {dados.resumo.saldo.diferenca >= 0 ? '+' : ''}
                      {formatCurrency(dados.resumo.saldo.diferenca)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">vs orcado</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Receitas */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Receitas
              </CardTitle>
              <CardDescription>Comparativo orcado x realizado por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-50 dark:bg-green-900/20">
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Orcado</TableHead>
                      <TableHead className="text-right">Realizado</TableHead>
                      <TableHead className="text-right">Diferenca (R$)</TableHead>
                      <TableHead className="text-right">Diferenca (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receitasDetalhes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum orcamento de receita definido para este periodo
                        </TableCell>
                      </TableRow>
                    ) : (
                      receitasDetalhes.map((item, index) => (
                        <TableRow
                          key={`receita-${item.categoria}`}
                          className="group hover:bg-green-50/50 dark:hover:bg-green-900/10 transition-all animate-fade-in-up"
                          style={{ animationDelay: `${0.03 * index}s` }}
                        >
                          <TableCell className="font-medium">{item.categoria}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.valorOrcado)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.valorRealizado)}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderDiferenca(item.diferenca, 'RECEITA')}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderPercentual(item.percentualExecucao, 'RECEITA')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-green-100 dark:bg-green-900/30 font-semibold">
                      <TableCell>TOTAL RECEITAS</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(dados.resumo.receitas.orcado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(dados.resumo.receitas.realizado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderDiferenca(dados.resumo.receitas.diferenca, 'RECEITA')}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderPercentual(dados.resumo.receitas.percentualExecucao, 'RECEITA')}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Despesas */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                Despesas
              </CardTitle>
              <CardDescription>Comparativo orcado x realizado por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-50 dark:bg-red-900/20">
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Orcado</TableHead>
                      <TableHead className="text-right">Realizado</TableHead>
                      <TableHead className="text-right">Diferenca (R$)</TableHead>
                      <TableHead className="text-right">Diferenca (%)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {despesasDetalhes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum orcamento de despesa definido para este periodo
                        </TableCell>
                      </TableRow>
                    ) : (
                      despesasDetalhes.map((item, index) => (
                        <TableRow
                          key={`despesa-${item.categoria}`}
                          className="group hover:bg-red-50/50 dark:hover:bg-red-900/10 transition-all animate-fade-in-up"
                          style={{ animationDelay: `${0.03 * index}s` }}
                        >
                          <TableCell className="font-medium">{item.categoria}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.valorOrcado)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.valorRealizado)}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderDiferenca(item.diferenca, 'DESPESA')}
                          </TableCell>
                          <TableCell className="text-right">
                            {renderPercentual(item.percentualExecucao, 'DESPESA')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="bg-red-100 dark:bg-red-900/30 font-semibold">
                      <TableCell>TOTAL DESPESAS</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(dados.resumo.despesas.orcado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(dados.resumo.despesas.realizado)}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderDiferenca(dados.resumo.despesas.diferenca, 'DESPESA')}
                      </TableCell>
                      <TableCell className="text-right">
                        {renderPercentual(dados.resumo.despesas.percentualExecucao, 'DESPESA')}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
