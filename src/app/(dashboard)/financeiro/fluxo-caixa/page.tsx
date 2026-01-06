'use client'

import { useState, useMemo } from 'react'
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
  BarChart3,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { FluxoCaixaItem, formatCurrency, formatDate } from '@/types/financeiro'
import { cn } from '@/lib/utils'

// Dados mockados
const fluxoMock: FluxoCaixaItem[] = [
  { data: '2026-01-01', descricao: 'Saldo Inicial', tipo: 'RECEITA', entrada: 100000, saida: 0, saldo: 100000 },
  { data: '2026-01-02', descricao: 'Licenca Software', tipo: 'RECEITA', entrada: 3200, saida: 0, saldo: 103200 },
  { data: '2026-01-02', descricao: 'Google Ads', tipo: 'DESPESA', entrada: 0, saida: 2800, saldo: 100400 },
  { data: '2026-01-03', descricao: 'Aluguel Escritorio', tipo: 'DESPESA', entrada: 0, saida: 4500, saldo: 95900 },
  { data: '2026-01-04', descricao: 'Consultoria Tech Solutions', tipo: 'RECEITA', entrada: 8500, saida: 0, saldo: 104400 },
  { data: '2026-01-05', descricao: 'Pagamento Cliente ABC', tipo: 'RECEITA', entrada: 15000, saida: 0, saldo: 119400 },
  { data: '2026-01-05', descricao: 'Folha de Pagamento', tipo: 'DESPESA', entrada: 0, saida: 18500, saldo: 100900 },
  { data: '2026-01-06', descricao: 'Material de Escritorio', tipo: 'DESPESA', entrada: 0, saida: 450, saldo: 100450 },
  { data: '2026-01-08', descricao: 'Projeto XYZ', tipo: 'RECEITA', entrada: 12000, saida: 0, saldo: 112450 },
  { data: '2026-01-10', descricao: 'Internet', tipo: 'DESPESA', entrada: 0, saida: 300, saldo: 112150 },
  { data: '2026-01-12', descricao: 'Energia', tipo: 'DESPESA', entrada: 0, saida: 850, saldo: 111300 },
  { data: '2026-01-15', descricao: 'Consultoria Mensal', tipo: 'RECEITA', entrada: 25000, saida: 0, saldo: 136300 },
]

// Resumo mensal mockado
const resumoMensalMock = [
  { mes: 'Jan/2026', entradas: 163700, saidas: 27400, saldo: 136300, variacao: 12.5 },
  { mes: 'Fev/2026', entradas: 145000, saidas: 32000, saldo: 113000, variacao: -5.2 },
  { mes: 'Mar/2026', entradas: 158000, saidas: 28500, saldo: 129500, variacao: 8.3 },
  { mes: 'Abr/2026', entradas: 172000, saidas: 35000, saldo: 137000, variacao: 15.1 },
  { mes: 'Mai/2026', entradas: 180000, saidas: 42000, saldo: 138000, variacao: 18.5 },
  { mes: 'Jun/2026', entradas: 165000, saidas: 38000, saldo: 127000, variacao: 10.2 },
]

// Projecao futura mockada
const projecaoMock = {
  proximoMes: { entradas: 175000, saidas: 40000, saldo: 135000 },
  trimestre: { entradas: 520000, saidas: 115000, saldo: 405000 },
}

const meses = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Marco' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
]

const anos = ['2024', '2025', '2026', '2027']

const periodoOptions = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'semestral', label: 'Semestral' },
  { value: 'anual', label: 'Anual' },
]

export default function FluxoCaixaPage() {
  const [fluxo] = useState<FluxoCaixaItem[]>(fluxoMock)
  const [mesSelecionado, setMesSelecionado] = useState('01')
  const [anoSelecionado, setAnoSelecionado] = useState('2026')
  const [periodoVisao, setPeriodoVisao] = useState('mensal')

  // Calcular totais
  const totalEntradas = fluxo.reduce((acc, item) => acc + item.entrada, 0)
  const totalSaidas = fluxo.reduce((acc, item) => acc + item.saida, 0)
  const saldoFinal = fluxo.length > 0 ? fluxo[fluxo.length - 1].saldo : 0
  const resultado = totalEntradas - totalSaidas

  // Calcular valor máximo para a barra do gráfico
  const maxValor = useMemo(() => {
    return Math.max(...resumoMensalMock.map(m => Math.max(m.entradas, m.saidas)))
  }, [])

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

      {/* Header com gradiente cyan */}
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
                <Receipt className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Fluxo de Caixa</h1>
                <p className="text-cyan-100 text-sm md:text-base">
                  Visao completa das entradas e saidas
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Relatorio
            </Button>
          </div>

          {/* Mini cards no header */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-cyan-200" />
                <span className="text-xs text-cyan-200">Entradas</span>
              </div>
              <p className="text-lg font-bold text-green-300">
                {formatCurrency(totalEntradas)}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-cyan-200" />
                <span className="text-xs text-cyan-200">Saidas</span>
              </div>
              <p className="text-lg font-bold text-red-300">
                {formatCurrency(totalSaidas)}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-cyan-200" />
                <span className="text-xs text-cyan-200">Resultado</span>
              </div>
              <div className="flex items-center gap-2">
                <p className={cn(
                  "text-lg font-bold",
                  resultado >= 0 ? "text-green-300" : "text-red-300"
                )}>
                  {resultado >= 0 ? '+' : ''}{formatCurrency(resultado)}
                </p>
              </div>
            </div>
          </div>
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

            <Select value={periodoVisao} onValueChange={setPeriodoVisao}>
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {periodoOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Badge variant="outline" className="ml-auto">
              {fluxo.length} movimentacoes
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo Melhorados */}
      <div className="grid gap-4 md:grid-cols-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <Card className="relative overflow-hidden border-2 border-green-500/20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  Total Entradas
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {formatCurrency(totalEntradas)}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <ArrowUpRight className="h-3 w-3" />
                  +12.5% vs mes anterior
                </div>
              </div>
              <div className="p-3 rounded-xl bg-green-500/10">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
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
                  Total Saidas
                </p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {formatCurrency(totalSaidas)}
                </p>
                <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                  <ArrowDownRight className="h-3 w-3" />
                  -8.3% vs mes anterior
                </div>
              </div>
              <div className="p-3 rounded-xl bg-red-500/10">
                <ArrowDownRight className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          "relative overflow-hidden border-2",
          saldoFinal >= 0
            ? "border-blue-500/20 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
            : "border-orange-500/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20"
        )}>
          <div className={cn(
            "absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-1/2 translate-x-1/2",
            saldoFinal >= 0 ? "bg-blue-500/10" : "bg-orange-500/10"
          )}></div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Saldo Final
                </p>
                <p className={cn(
                  "text-2xl font-bold mt-1",
                  saldoFinal >= 0 ? "text-blue-600" : "text-orange-600"
                )}>
                  {formatCurrency(saldoFinal)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Atualizado hoje
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-xl",
                saldoFinal >= 0 ? "bg-blue-500/10" : "bg-orange-500/10"
              )}>
                <DollarSign className={cn(
                  "h-6 w-6",
                  saldoFinal >= 0 ? "text-blue-600" : "text-orange-600"
                )} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Projeção */}
        <Card className="relative overflow-hidden border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Target className="h-4 w-4 text-purple-600" />
                  Projecao Proximo Mes
                </p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {formatCurrency(projecaoMock.proximoMes.saldo)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Baseado em historico
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Barras Visual */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-600" />
            Evolucao do Fluxo de Caixa
          </CardTitle>
          <CardDescription>
            Comparativo de entradas e saidas por mes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resumoMensalMock.map((item, index) => (
              <div
                key={item.mes}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium w-20">{item.mes}</span>
                    <Badge
                      className={cn(
                        "text-xs",
                        item.variacao >= 0
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      )}
                    >
                      {item.variacao >= 0 ? (
                        <ArrowUpRight className="h-3 w-3 mr-0.5" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-0.5" />
                      )}
                      {item.variacao >= 0 ? '+' : ''}{item.variacao}%
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {formatCurrency(item.saldo)}
                  </span>
                </div>
                <div className="flex gap-2 h-6">
                  {/* Barra de Entradas */}
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all hover:opacity-80"
                    style={{ width: `${(item.entradas / maxValor) * 50}%` }}
                    title={`Entradas: ${formatCurrency(item.entradas)}`}
                  />
                  {/* Barra de Saídas */}
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full transition-all hover:opacity-80"
                    style={{ width: `${(item.saidas / maxValor) * 50}%` }}
                    title={`Saidas: ${formatCurrency(item.saidas)}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span className="text-green-600">{formatCurrency(item.entradas)}</span>
                  <span className="text-red-600">{formatCurrency(item.saidas)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Entradas</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-rose-500 rounded"></div>
              <span className="text-sm text-muted-foreground">Saidas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Projeção Futura */}
      <div className="grid gap-4 md:grid-cols-2 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
        <Card className="border-2 border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Projecao Proximo Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Entradas</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(projecaoMock.proximoMes.entradas)}</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Saidas</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(projecaoMock.proximoMes.saidas)}</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Saldo</p>
                <p className="text-lg font-bold text-purple-600">{formatCurrency(projecaoMock.proximoMes.saldo)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-dashed border-cyan-300 dark:border-cyan-800 bg-cyan-50/50 dark:bg-cyan-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cyan-600" />
              Projecao Trimestre
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Entradas</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(projecaoMock.trimestre.entradas)}</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Saidas</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(projecaoMock.trimestre.saidas)}</p>
              </div>
              <div className="text-center p-3 bg-white dark:bg-slate-900 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Saldo</p>
                <p className="text-lg font-bold text-cyan-600">{formatCurrency(projecaoMock.trimestre.saldo)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Movimentações */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-muted-foreground" />
            Movimentacoes do Mes
          </CardTitle>
          <CardDescription>
            {meses.find((m) => m.value === mesSelecionado)?.label} de {anoSelecionado}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                  <TableHead>Data</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead className="text-right text-green-600">Entrada</TableHead>
                  <TableHead className="text-right text-red-600">Saida</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fluxo.map((item, index) => (
                  <TableRow
                    key={index}
                    className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all animate-fade-in-up"
                    style={{ animationDelay: `${0.03 * index}s` }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                          "p-1.5 rounded-lg",
                          item.tipo === 'RECEITA'
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                        )}>
                          <Calendar className={cn(
                            "h-3.5 w-3.5",
                            item.tipo === 'RECEITA' ? "text-green-600" : "text-red-600"
                          )} />
                        </div>
                        {formatDate(item.data)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {item.tipo === 'RECEITA' ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                        <span className="group-hover:text-cyan-600 transition-colors">
                          {item.descricao}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.entrada > 0 ? (
                        <span className="text-green-600 font-medium">
                          {formatCurrency(item.entrada)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.saida > 0 ? (
                        <span className="text-red-600 font-medium">
                          {formatCurrency(item.saida)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn(
                        'font-semibold',
                        item.saldo >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-600'
                      )}>
                        {formatCurrency(item.saldo)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow className="bg-slate-100 dark:bg-slate-800 font-semibold">
                  <TableCell colSpan={2}>
                    <span className="flex items-center gap-2">
                      TOTAIS DO PERIODO
                      <ChevronRight className="h-4 w-4" />
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-green-600 text-lg">
                    {formatCurrency(totalEntradas)}
                  </TableCell>
                  <TableCell className="text-right text-red-600 text-lg">
                    {formatCurrency(totalSaidas)}
                  </TableCell>
                  <TableCell className="text-right text-lg">
                    <span className={saldoFinal >= 0 ? 'text-blue-600' : 'text-red-600'}>
                      {formatCurrency(saldoFinal)}
                    </span>
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
