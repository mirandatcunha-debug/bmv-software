'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  FileText,
  Calculator,
  BookOpen,
  PieChart,
  TrendingUp,
  TrendingDown,
  BarChart3,
  ArrowRight,
  DollarSign,
  Building2,
  Layers,
  FileSpreadsheet,
  ClipboardList,
  ChevronRight,
  Scale,
  Target,
  Wallet,
  CreditCard,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'

// Dados simulados para DRE
const dreResumo = {
  receitaBruta: 850000,
  deducoes: -42500,
  receitaLiquida: 807500,
  custos: -483000,
  lucroBruto: 324500,
  despesasOperacionais: -178000,
  resultadoOperacional: 146500,
  resultadoLiquido: 124525,
  margemBruta: 40.2,
  margemLiquida: 15.4
}

// Dados simulados para Balanço
const balancoSimplificado = {
  ativoCirculante: 420000,
  ativoNaoCirculante: 850000,
  totalAtivo: 1270000,
  passivoCirculante: 180000,
  passivoNaoCirculante: 340000,
  patrimonioLiquido: 750000,
  totalPassivo: 1270000
}

// Indicadores
const indicadores = [
  { nome: 'Liquidez Corrente', valor: 2.33, status: 'success', meta: '> 1.5' },
  { nome: 'Liquidez Seca', valor: 1.85, status: 'success', meta: '> 1.0' },
  { nome: 'Endividamento', valor: 41.0, status: 'warning', meta: '< 40%', suffix: '%' },
  { nome: 'ROE', valor: 16.6, status: 'success', meta: '> 15%', suffix: '%' }
]

// Dados para gráfico de evolução patrimonial
const evolucaoPatrimonial = [
  { mes: 'Jul', ativo: 1150, passivo: 480, pl: 670 },
  { mes: 'Ago', ativo: 1180, passivo: 490, pl: 690 },
  { mes: 'Set', ativo: 1200, passivo: 485, pl: 715 },
  { mes: 'Out', ativo: 1230, passivo: 495, pl: 735 },
  { mes: 'Nov', ativo: 1250, passivo: 510, pl: 740 },
  { mes: 'Dez', ativo: 1270, passivo: 520, pl: 750 }
]

// Atalhos para relatórios
const relatoriosContabeis = [
  { nome: 'DRE Completo', icon: FileSpreadsheet, href: '/contabil/relatorios/dre', cor: 'emerald' },
  { nome: 'Balanço Patrimonial', icon: Scale, href: '/contabil/relatorios/balanco', cor: 'blue' },
  { nome: 'Balancete', icon: ClipboardList, href: '/contabil/relatorios/balancete', cor: 'violet' },
  { nome: 'Razão Analítico', icon: FileText, href: '/contabil/relatorios/razao', cor: 'amber' },
  { nome: 'Diário Geral', icon: BookOpen, href: '/contabil/relatorios/diario', cor: 'rose' },
  { nome: 'Fluxo de Caixa', icon: Activity, href: '/contabil/relatorios/fluxo-caixa', cor: 'cyan' }
]

// Acesso rápido
const acessoRapido = [
  {
    titulo: 'Plano de Contas',
    descricao: 'Estrutura hierárquica de contas contábeis',
    icon: Layers,
    href: '/contabil/plano-contas',
    stats: '156 contas',
    cor: 'from-emerald-500 to-teal-600'
  },
  {
    titulo: 'Centros de Custo',
    descricao: 'Gestão de centros de custo e alocação',
    icon: Target,
    href: '/contabil/centros-custo',
    stats: '12 centros',
    cor: 'from-blue-500 to-indigo-600'
  },
  {
    titulo: 'Lançamentos',
    descricao: 'Lançamentos contábeis e conciliação',
    icon: FileText,
    href: '/contabil/lancamentos',
    stats: '1.248 lançamentos',
    cor: 'from-violet-500 to-purple-600'
  }
]

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(valor)
}

function formatarMoedaK(valor: number): string {
  if (valor >= 1000000) {
    return `R$ ${(valor / 1000000).toFixed(1)}M`
  }
  return `R$ ${(valor / 1000).toFixed(0)}K`
}

export default function ContabilPage() {
  const maxPatrimonial = Math.max(...evolucaoPatrimonial.map(d => d.ativo))

  return (
    <div className="space-y-6 animate-in">
      {/* Header com gradiente verde escuro/esmeralda */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-400/20 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
              <Calculator className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              Módulo Contábil
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Contabilidade
          </h1>
          <p className="text-emerald-100 max-w-2xl">
            Gerencie o plano de contas, lançamentos contábeis, centros de custo e
            gere relatórios financeiros completos para sua empresa.
          </p>

          {/* Mini stats no header */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <TrendingUp className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-emerald-200">Patrimônio Líquido</p>
                <p className="font-semibold">{formatarMoeda(balancoSimplificado.patrimonioLiquido)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-emerald-200">Resultado Líquido</p>
                <p className="font-semibold">{formatarMoeda(dreResumo.resultadoLiquido)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-emerald-200">Margem Líquida</p>
                <p className="font-semibold">{dreResumo.margemLiquida}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Acesso Rápido */}
      <div className="grid gap-4 md:grid-cols-3">
        {acessoRapido.map((item) => (
          <Link key={item.titulo} href={item.href}>
            <Card className="card-hover group cursor-pointer h-full border-2 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.cor} text-white shadow-lg`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{item.titulo}</h3>
                <p className="text-sm text-muted-foreground mb-3">{item.descricao}</p>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {item.stats}
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Grid principal: DRE, Balanço e Indicadores */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* DRE Resumido */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
                DRE Resumido
              </CardTitle>
              <Badge variant="outline" className="text-xs">Dezembro/2024</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Receita Bruta</span>
              <span className="font-medium">{formatarMoedaK(dreResumo.receitaBruta)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">(-) Deduções</span>
              <span className="font-medium text-red-600">{formatarMoedaK(dreResumo.deducoes)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b bg-slate-50 dark:bg-slate-900 -mx-6 px-6">
              <span className="text-sm font-medium">Receita Líquida</span>
              <span className="font-semibold">{formatarMoedaK(dreResumo.receitaLiquida)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">(-) Custos</span>
              <span className="font-medium text-red-600">{formatarMoedaK(dreResumo.custos)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">(-) Despesas Oper.</span>
              <span className="font-medium text-red-600">{formatarMoedaK(dreResumo.despesasOperacionais)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-emerald-50 dark:bg-emerald-950 -mx-6 px-6 rounded-b-lg mt-2">
              <span className="font-semibold text-emerald-800 dark:text-emerald-200">Resultado Líquido</span>
              <span className="font-bold text-emerald-600 text-lg">{formatarMoedaK(dreResumo.resultadoLiquido)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <p className="text-xs text-muted-foreground">Margem Bruta</p>
                <p className="font-semibold text-emerald-600">{dreResumo.margemBruta}%</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                <p className="text-xs text-muted-foreground">Margem Líquida</p>
                <p className="font-semibold text-emerald-600">{dreResumo.margemLiquida}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Balanço Simplificado */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-600" />
                Balanço Patrimonial
              </CardTitle>
              <Badge variant="outline" className="text-xs">31/12/2024</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Ativo */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-sm">ATIVO</span>
              </div>
              <div className="space-y-2 pl-6">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Circulante</span>
                  <span className="text-sm font-medium">{formatarMoedaK(balancoSimplificado.ativoCirculante)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Não Circulante</span>
                  <span className="text-sm font-medium">{formatarMoedaK(balancoSimplificado.ativoNaoCirculante)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Total Ativo</span>
                  <span className="font-bold text-emerald-600">{formatarMoedaK(balancoSimplificado.totalAtivo)}</span>
                </div>
              </div>
            </div>

            {/* Passivo + PL */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-sm">PASSIVO + PL</span>
              </div>
              <div className="space-y-2 pl-6">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Passivo Circulante</span>
                  <span className="text-sm font-medium">{formatarMoedaK(balancoSimplificado.passivoCirculante)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Passivo Não Circ.</span>
                  <span className="text-sm font-medium">{formatarMoedaK(balancoSimplificado.passivoNaoCirculante)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Patrimônio Líquido</span>
                  <span className="text-sm font-medium text-blue-600">{formatarMoedaK(balancoSimplificado.patrimonioLiquido)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-sm font-semibold">Total Passivo</span>
                  <span className="font-bold text-blue-600">{formatarMoedaK(balancoSimplificado.totalPassivo)}</span>
                </div>
              </div>
            </div>

            {/* Indicador visual de equilíbrio */}
            <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium text-green-700 dark:text-green-300">Balanço equilibrado</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicadores */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-violet-600" />
              Indicadores Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {indicadores.map((ind) => (
              <div key={ind.nome} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{ind.nome}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${
                      ind.status === 'success' ? 'text-emerald-600' :
                      ind.status === 'warning' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {ind.valor}{ind.suffix || ''}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {ind.meta}
                    </Badge>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      ind.status === 'success' ? 'bg-emerald-500' :
                      ind.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min((ind.valor / (ind.suffix === '%' ? 100 : 3)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}

            {/* Resumo */}
            <div className="pt-4 border-t mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950">
                  <p className="text-xs text-muted-foreground">Indicadores OK</p>
                  <p className="font-bold text-emerald-600 text-xl">3</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950">
                  <p className="text-xs text-muted-foreground">Atenção</p>
                  <p className="font-bold text-amber-600 text-xl">1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução Patrimonial */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-600" />
                Evolução Patrimonial
              </CardTitle>
              <CardDescription>Acompanhamento mensal do patrimônio da empresa</CardDescription>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-muted-foreground">Ativo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-muted-foreground">Passivo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-muted-foreground">PL</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end gap-4">
            {evolucaoPatrimonial.map((data, index) => (
              <div key={data.mes} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex gap-1 items-end h-48">
                  {/* Barra Ativo */}
                  <div
                    className="flex-1 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-md transition-all hover:opacity-80"
                    style={{ height: `${(data.ativo / maxPatrimonial) * 100}%` }}
                    title={`Ativo: R$ ${data.ativo}K`}
                  />
                  {/* Barra Passivo */}
                  <div
                    className="flex-1 bg-gradient-to-t from-red-500 to-red-300 rounded-t-md transition-all hover:opacity-80"
                    style={{ height: `${(data.passivo / maxPatrimonial) * 100}%` }}
                    title={`Passivo: R$ ${data.passivo}K`}
                  />
                  {/* Barra PL */}
                  <div
                    className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all hover:opacity-80"
                    style={{ height: `${(data.pl / maxPatrimonial) * 100}%` }}
                    title={`PL: R$ ${data.pl}K`}
                  />
                </div>
                <span className="text-xs text-muted-foreground font-medium">{data.mes}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Atalhos para Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" />
            Relatórios Contábeis
          </CardTitle>
          <CardDescription>Acesse rapidamente os principais relatórios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatoriosContabeis.map((relatorio) => (
              <Link key={relatorio.nome} href={relatorio.href}>
                <div className={`group flex items-center gap-3 p-4 rounded-xl border-2 border-transparent hover:border-${relatorio.cor}-200 dark:hover:border-${relatorio.cor}-800 bg-slate-50 dark:bg-slate-900 hover:bg-white dark:hover:bg-slate-800 transition-all cursor-pointer`}>
                  <div className={`p-2 rounded-lg bg-${relatorio.cor}-100 dark:bg-${relatorio.cor}-900 text-${relatorio.cor}-600`}>
                    <relatorio.icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-sm group-hover:text-emerald-600 transition-colors">
                    {relatorio.nome}
                  </span>
                  <ArrowRight className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
