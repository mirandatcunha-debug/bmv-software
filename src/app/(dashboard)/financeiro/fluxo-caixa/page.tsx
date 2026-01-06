'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

export default function FluxoCaixaPage() {
  const [fluxo] = useState<FluxoCaixaItem[]>(fluxoMock)
  const [mesSelecionado, setMesSelecionado] = useState('01')
  const [anoSelecionado, setAnoSelecionado] = useState('2026')

  // Calcular totais
  const totalEntradas = fluxo.reduce((acc, item) => acc + item.entrada, 0)
  const totalSaidas = fluxo.reduce((acc, item) => acc + item.saida, 0)
  const saldoFinal = fluxo.length > 0 ? fluxo[fluxo.length - 1].saldo : 0

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/financeiro"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Financeiro
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-7 w-7 text-bmv-primary" />
            Fluxo de Caixa
          </h1>
          <p className="text-muted-foreground">
            Visao mensal das entradas e saidas
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Periodo:</span>

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

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700 dark:text-green-400">Total Entradas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalEntradas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-400">Total Saidas</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={cn(
          'border-2',
          saldoFinal >= 0
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className={cn(
                'h-8 w-8',
                saldoFinal >= 0 ? 'text-blue-600' : 'text-red-600'
              )} />
              <div>
                <p className={cn(
                  'text-sm',
                  saldoFinal >= 0
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-red-700 dark:text-red-400'
                )}>
                  Saldo Final
                </p>
                <p className={cn(
                  'text-2xl font-bold',
                  saldoFinal >= 0 ? 'text-blue-600' : 'text-red-600'
                )}>
                  {formatCurrency(saldoFinal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle>Movimentacoes do Mes</CardTitle>
          <CardDescription>
            {meses.find((m) => m.value === mesSelecionado)?.label} de {anoSelecionado}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead className="text-right text-green-600">Entrada</TableHead>
                  <TableHead className="text-right text-red-600">Saida</TableHead>
                  <TableHead className="text-right">Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fluxo.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
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
                        {item.descricao}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {item.entrada > 0 ? (
                        <span className="text-green-600 font-medium">
                          {formatCurrency(item.entrada)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.saida > 0 ? (
                        <span className="text-red-600 font-medium">
                          {formatCurrency(item.saida)}
                        </span>
                      ) : (
                        '-'
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
                <TableRow className="bg-slate-100 dark:bg-slate-800">
                  <TableCell colSpan={2} className="font-semibold">
                    TOTAIS
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">
                    {formatCurrency(totalEntradas)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-red-600">
                    {formatCurrency(totalSaidas)}
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(saldoFinal)}
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
