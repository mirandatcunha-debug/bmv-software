'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import {
  Target,
  Plus,
  Search,
  Filter,
  Download,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  Factory,
  ShoppingCart,
  Settings,
  PieChart,
  BarChart3,
  MoreHorizontal
} from 'lucide-react'

interface CentroCusto {
  id: string
  codigo: string
  nome: string
  tipo: 'producao' | 'administrativo' | 'comercial' | 'suporte'
  responsavel: string
  orcamento: number
  realizado: number
  status: 'dentro' | 'atencao' | 'excedido'
  funcionarios: number
  ultimaMovimentacao: string
}

const centrosCusto: CentroCusto[] = [
  {
    id: '1',
    codigo: 'CC001',
    nome: 'Produção Industrial',
    tipo: 'producao',
    responsavel: 'Carlos Silva',
    orcamento: 180000,
    realizado: 165000,
    status: 'dentro',
    funcionarios: 45,
    ultimaMovimentacao: '05/01/2025'
  },
  {
    id: '2',
    codigo: 'CC002',
    nome: 'Administrativo Geral',
    tipo: 'administrativo',
    responsavel: 'Maria Santos',
    orcamento: 85000,
    realizado: 82000,
    status: 'atencao',
    funcionarios: 12,
    ultimaMovimentacao: '05/01/2025'
  },
  {
    id: '3',
    codigo: 'CC003',
    nome: 'Comercial e Vendas',
    tipo: 'comercial',
    responsavel: 'João Oliveira',
    orcamento: 120000,
    realizado: 98000,
    status: 'dentro',
    funcionarios: 18,
    ultimaMovimentacao: '04/01/2025'
  },
  {
    id: '4',
    codigo: 'CC004',
    nome: 'Logística e Distribuição',
    tipo: 'producao',
    responsavel: 'Ana Costa',
    orcamento: 95000,
    realizado: 105000,
    status: 'excedido',
    funcionarios: 22,
    ultimaMovimentacao: '05/01/2025'
  },
  {
    id: '5',
    codigo: 'CC005',
    nome: 'TI e Sistemas',
    tipo: 'suporte',
    responsavel: 'Pedro Lima',
    orcamento: 65000,
    realizado: 58000,
    status: 'dentro',
    funcionarios: 8,
    ultimaMovimentacao: '03/01/2025'
  },
  {
    id: '6',
    codigo: 'CC006',
    nome: 'RH e Departamento Pessoal',
    tipo: 'administrativo',
    responsavel: 'Fernanda Souza',
    orcamento: 45000,
    realizado: 43500,
    status: 'atencao',
    funcionarios: 5,
    ultimaMovimentacao: '04/01/2025'
  },
  {
    id: '7',
    codigo: 'CC007',
    nome: 'Marketing e Comunicação',
    tipo: 'comercial',
    responsavel: 'Lucas Mendes',
    orcamento: 75000,
    realizado: 62000,
    status: 'dentro',
    funcionarios: 6,
    ultimaMovimentacao: '02/01/2025'
  },
  {
    id: '8',
    codigo: 'CC008',
    nome: 'Manutenção Industrial',
    tipo: 'producao',
    responsavel: 'Roberto Alves',
    orcamento: 55000,
    realizado: 48000,
    status: 'dentro',
    funcionarios: 10,
    ultimaMovimentacao: '05/01/2025'
  },
  {
    id: '9',
    codigo: 'CC009',
    nome: 'Qualidade e Processos',
    tipo: 'suporte',
    responsavel: 'Camila Ferreira',
    orcamento: 40000,
    realizado: 35000,
    status: 'dentro',
    funcionarios: 4,
    ultimaMovimentacao: '03/01/2025'
  },
  {
    id: '10',
    codigo: 'CC010',
    nome: 'Financeiro',
    tipo: 'administrativo',
    responsavel: 'Marcos Rodrigues',
    orcamento: 50000,
    realizado: 47500,
    status: 'atencao',
    funcionarios: 6,
    ultimaMovimentacao: '05/01/2025'
  },
  {
    id: '11',
    codigo: 'CC011',
    nome: 'Compras e Suprimentos',
    tipo: 'suporte',
    responsavel: 'Patricia Gomes',
    orcamento: 35000,
    realizado: 28000,
    status: 'dentro',
    funcionarios: 4,
    ultimaMovimentacao: '04/01/2025'
  },
  {
    id: '12',
    codigo: 'CC012',
    nome: 'Atendimento ao Cliente',
    tipo: 'comercial',
    responsavel: 'Rafael Barbosa',
    orcamento: 42000,
    realizado: 38500,
    status: 'dentro',
    funcionarios: 8,
    ultimaMovimentacao: '05/01/2025'
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

function getIconByTipo(tipo: string) {
  switch (tipo) {
    case 'producao': return Factory
    case 'administrativo': return Building2
    case 'comercial': return ShoppingCart
    case 'suporte': return Settings
    default: return Target
  }
}

function getTipoLabel(tipo: string) {
  switch (tipo) {
    case 'producao': return 'Produção'
    case 'administrativo': return 'Administrativo'
    case 'comercial': return 'Comercial'
    case 'suporte': return 'Suporte'
    default: return tipo
  }
}

function getTipoColor(tipo: string) {
  switch (tipo) {
    case 'producao': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
    case 'administrativo': return 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300'
    case 'comercial': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
    case 'suporte': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
    default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300'
  }
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'dentro':
      return { label: 'Dentro do orçamento', color: 'bg-emerald-500', textColor: 'text-emerald-600', bgLight: 'bg-emerald-50 dark:bg-emerald-950' }
    case 'atencao':
      return { label: 'Atenção', color: 'bg-amber-500', textColor: 'text-amber-600', bgLight: 'bg-amber-50 dark:bg-amber-950' }
    case 'excedido':
      return { label: 'Orçamento excedido', color: 'bg-red-500', textColor: 'text-red-600', bgLight: 'bg-red-50 dark:bg-red-950' }
    default:
      return { label: status, color: 'bg-slate-500', textColor: 'text-slate-600', bgLight: 'bg-slate-50 dark:bg-slate-950' }
  }
}

export default function CentrosCustoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  useState<'cards' | 'lista'>('cards')

  const totalOrcamento = centrosCusto.reduce((acc, cc) => acc + cc.orcamento, 0)
  const totalRealizado = centrosCusto.reduce((acc, cc) => acc + cc.realizado, 0)
  const totalFuncionarios = centrosCusto.reduce((acc, cc) => acc + cc.funcionarios, 0)

  const centrosDentro = centrosCusto.filter(cc => cc.status === 'dentro').length
  const centrosAtencao = centrosCusto.filter(cc => cc.status === 'atencao').length
  const centrosExcedidos = centrosCusto.filter(cc => cc.status === 'excedido').length

  const filteredCentros = centrosCusto.filter(cc =>
    cc.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cc.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cc.responsavel.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-800 via-blue-700 to-indigo-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <Link href="/contabil" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar para Contábil</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
              <Target className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              Gestão de Custos
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">Centros de Custo</h1>
          <p className="text-blue-100 max-w-2xl">
            Gerencie e monitore a alocação de custos por departamento e área da empresa.
          </p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-blue-200">Total de Centros</p>
                <p className="font-semibold">{centrosCusto.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <DollarSign className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-blue-200">Orçamento Total</p>
                <p className="font-semibold">{formatarMoeda(totalOrcamento)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-blue-200">Funcionários</p>
                <p className="font-semibold">{totalFuncionarios}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo de Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dentro do Orçamento</p>
                <p className="text-2xl font-bold text-emerald-600">{centrosDentro}</p>
              </div>
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atenção</p>
                <p className="text-2xl font-bold text-amber-600">{centrosAtencao}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900">
                <PieChart className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Orçamento Excedido</p>
                <p className="text-2xl font-bold text-red-600">{centrosExcedidos}</p>
              </div>
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Execução Total</p>
                <p className="text-2xl font-bold text-blue-600">{((totalRealizado / totalOrcamento) * 100).toFixed(1)}%</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nome ou responsável..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            Novo Centro
          </Button>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredCentros.map((centro) => {
          const Icon = getIconByTipo(centro.tipo)
          const statusConfig = getStatusConfig(centro.status)
          const percentual = (centro.realizado / centro.orcamento) * 100

          return (
            <Card key={centro.id} className="card-hover group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${getTipoColor(centro.tipo)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">{centro.codigo}</p>
                      <CardTitle className="text-base">{centro.nome}</CardTitle>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Responsável</span>
                  <span className="font-medium">{centro.responsavel}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Orçamento x Realizado</span>
                    <span className={`font-semibold ${statusConfig.textColor}`}>
                      {percentual.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={Math.min(percentual, 100)} className={`h-2 ${statusConfig.bgLight}`} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatarMoeda(centro.realizado)}</span>
                    <span>{formatarMoeda(centro.orcamento)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{centro.funcionarios}</span>
                    </div>
                    <Badge variant="outline" className={getTipoColor(centro.tipo)}>
                      {getTipoLabel(centro.tipo)}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={`${statusConfig.bgLight} ${statusConfig.textColor} border-0`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${statusConfig.color} mr-1.5`} />
                    {statusConfig.label}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
