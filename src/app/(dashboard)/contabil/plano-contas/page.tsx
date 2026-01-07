'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Layers,
  FolderTree,
  FileText,
  ArrowLeft,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Eye,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator
} from 'lucide-react'

// Estrutura hierárquica do plano de contas
interface ContaContabil {
  codigo: string
  nome: string
  tipo: 'sintetica' | 'analitica'
  natureza: 'devedora' | 'credora'
  nivel: number
  saldo: number
  filhos?: ContaContabil[]
  expanded?: boolean
}

const planoContasData: ContaContabil[] = [
  {
    codigo: '1',
    nome: 'ATIVO',
    tipo: 'sintetica',
    natureza: 'devedora',
    nivel: 1,
    saldo: 1270000,
    filhos: [
      {
        codigo: '1.1',
        nome: 'ATIVO CIRCULANTE',
        tipo: 'sintetica',
        natureza: 'devedora',
        nivel: 2,
        saldo: 420000,
        filhos: [
          {
            codigo: '1.1.1',
            nome: 'Disponibilidades',
            tipo: 'sintetica',
            natureza: 'devedora',
            nivel: 3,
            saldo: 185000,
            filhos: [
              { codigo: '1.1.1.01', nome: 'Caixa Geral', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 15000 },
              { codigo: '1.1.1.02', nome: 'Banco Conta Movimento', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 85000 },
              { codigo: '1.1.1.03', nome: 'Aplicações Financeiras', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 85000 }
            ]
          },
          {
            codigo: '1.1.2',
            nome: 'Créditos',
            tipo: 'sintetica',
            natureza: 'devedora',
            nivel: 3,
            saldo: 180000,
            filhos: [
              { codigo: '1.1.2.01', nome: 'Clientes', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 145000 },
              { codigo: '1.1.2.02', nome: 'Duplicatas a Receber', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 35000 }
            ]
          },
          {
            codigo: '1.1.3',
            nome: 'Estoques',
            tipo: 'sintetica',
            natureza: 'devedora',
            nivel: 3,
            saldo: 55000,
            filhos: [
              { codigo: '1.1.3.01', nome: 'Mercadorias para Revenda', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 40000 },
              { codigo: '1.1.3.02', nome: 'Matéria-Prima', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 15000 }
            ]
          }
        ]
      },
      {
        codigo: '1.2',
        nome: 'ATIVO NÃO CIRCULANTE',
        tipo: 'sintetica',
        natureza: 'devedora',
        nivel: 2,
        saldo: 850000,
        filhos: [
          {
            codigo: '1.2.1',
            nome: 'Imobilizado',
            tipo: 'sintetica',
            natureza: 'devedora',
            nivel: 3,
            saldo: 650000,
            filhos: [
              { codigo: '1.2.1.01', nome: 'Terrenos', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 250000 },
              { codigo: '1.2.1.02', nome: 'Edificações', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 300000 },
              { codigo: '1.2.1.03', nome: 'Veículos', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 80000 },
              { codigo: '1.2.1.04', nome: 'Móveis e Utensílios', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 20000 }
            ]
          },
          {
            codigo: '1.2.2',
            nome: 'Intangível',
            tipo: 'sintetica',
            natureza: 'devedora',
            nivel: 3,
            saldo: 200000,
            filhos: [
              { codigo: '1.2.2.01', nome: 'Softwares', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 80000 },
              { codigo: '1.2.2.02', nome: 'Marcas e Patentes', tipo: 'analitica', natureza: 'devedora', nivel: 4, saldo: 120000 }
            ]
          }
        ]
      }
    ]
  },
  {
    codigo: '2',
    nome: 'PASSIVO',
    tipo: 'sintetica',
    natureza: 'credora',
    nivel: 1,
    saldo: 520000,
    filhos: [
      {
        codigo: '2.1',
        nome: 'PASSIVO CIRCULANTE',
        tipo: 'sintetica',
        natureza: 'credora',
        nivel: 2,
        saldo: 180000,
        filhos: [
          {
            codigo: '2.1.1',
            nome: 'Fornecedores',
            tipo: 'sintetica',
            natureza: 'credora',
            nivel: 3,
            saldo: 95000,
            filhos: [
              { codigo: '2.1.1.01', nome: 'Fornecedores Nacionais', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 80000 },
              { codigo: '2.1.1.02', nome: 'Fornecedores Estrangeiros', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 15000 }
            ]
          },
          {
            codigo: '2.1.2',
            nome: 'Obrigações Trabalhistas',
            tipo: 'sintetica',
            natureza: 'credora',
            nivel: 3,
            saldo: 45000,
            filhos: [
              { codigo: '2.1.2.01', nome: 'Salários a Pagar', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 35000 },
              { codigo: '2.1.2.02', nome: 'FGTS a Recolher', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 10000 }
            ]
          },
          {
            codigo: '2.1.3',
            nome: 'Obrigações Tributárias',
            tipo: 'sintetica',
            natureza: 'credora',
            nivel: 3,
            saldo: 40000,
            filhos: [
              { codigo: '2.1.3.01', nome: 'ICMS a Recolher', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 18000 },
              { codigo: '2.1.3.02', nome: 'PIS/COFINS a Recolher', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 12000 },
              { codigo: '2.1.3.03', nome: 'IRPJ/CSLL a Recolher', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 10000 }
            ]
          }
        ]
      },
      {
        codigo: '2.2',
        nome: 'PASSIVO NÃO CIRCULANTE',
        tipo: 'sintetica',
        natureza: 'credora',
        nivel: 2,
        saldo: 340000,
        filhos: [
          {
            codigo: '2.2.1',
            nome: 'Empréstimos e Financiamentos',
            tipo: 'sintetica',
            natureza: 'credora',
            nivel: 3,
            saldo: 340000,
            filhos: [
              { codigo: '2.2.1.01', nome: 'Financiamentos Bancários', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 280000 },
              { codigo: '2.2.1.02', nome: 'Parcelamentos Fiscais', tipo: 'analitica', natureza: 'credora', nivel: 4, saldo: 60000 }
            ]
          }
        ]
      }
    ]
  },
  {
    codigo: '3',
    nome: 'PATRIMÔNIO LÍQUIDO',
    tipo: 'sintetica',
    natureza: 'credora',
    nivel: 1,
    saldo: 750000,
    filhos: [
      {
        codigo: '3.1',
        nome: 'Capital Social',
        tipo: 'sintetica',
        natureza: 'credora',
        nivel: 2,
        saldo: 500000,
        filhos: [
          { codigo: '3.1.1', nome: 'Capital Subscrito', tipo: 'analitica', natureza: 'credora', nivel: 3, saldo: 500000 }
        ]
      },
      {
        codigo: '3.2',
        nome: 'Reservas',
        tipo: 'sintetica',
        natureza: 'credora',
        nivel: 2,
        saldo: 125475,
        filhos: [
          { codigo: '3.2.1', nome: 'Reserva Legal', tipo: 'analitica', natureza: 'credora', nivel: 3, saldo: 75000 },
          { codigo: '3.2.2', nome: 'Reserva de Lucros', tipo: 'analitica', natureza: 'credora', nivel: 3, saldo: 50475 }
        ]
      },
      {
        codigo: '3.3',
        nome: 'Lucros/Prejuízos Acumulados',
        tipo: 'sintetica',
        natureza: 'credora',
        nivel: 2,
        saldo: 124525,
        filhos: [
          { codigo: '3.3.1', nome: 'Lucros Acumulados', tipo: 'analitica', natureza: 'credora', nivel: 3, saldo: 124525 }
        ]
      }
    ]
  },
  {
    codigo: '4',
    nome: 'RECEITAS',
    tipo: 'sintetica',
    natureza: 'credora',
    nivel: 1,
    saldo: 850000,
    filhos: [
      {
        codigo: '4.1',
        nome: 'Receita Operacional',
        tipo: 'sintetica',
        natureza: 'credora',
        nivel: 2,
        saldo: 850000,
        filhos: [
          { codigo: '4.1.1', nome: 'Receita de Vendas', tipo: 'analitica', natureza: 'credora', nivel: 3, saldo: 750000 },
          { codigo: '4.1.2', nome: 'Receita de Serviços', tipo: 'analitica', natureza: 'credora', nivel: 3, saldo: 100000 }
        ]
      }
    ]
  },
  {
    codigo: '5',
    nome: 'CUSTOS E DESPESAS',
    tipo: 'sintetica',
    natureza: 'devedora',
    nivel: 1,
    saldo: 703500,
    filhos: [
      {
        codigo: '5.1',
        nome: 'Custos',
        tipo: 'sintetica',
        natureza: 'devedora',
        nivel: 2,
        saldo: 483000,
        filhos: [
          { codigo: '5.1.1', nome: 'Custo das Mercadorias Vendidas', tipo: 'analitica', natureza: 'devedora', nivel: 3, saldo: 350000 },
          { codigo: '5.1.2', nome: 'Custo dos Serviços Prestados', tipo: 'analitica', natureza: 'devedora', nivel: 3, saldo: 133000 }
        ]
      },
      {
        codigo: '5.2',
        nome: 'Despesas Operacionais',
        tipo: 'sintetica',
        natureza: 'devedora',
        nivel: 2,
        saldo: 220500,
        filhos: [
          { codigo: '5.2.1', nome: 'Despesas com Pessoal', tipo: 'analitica', natureza: 'devedora', nivel: 3, saldo: 120000 },
          { codigo: '5.2.2', nome: 'Despesas Administrativas', tipo: 'analitica', natureza: 'devedora', nivel: 3, saldo: 55000 },
          { codigo: '5.2.3', nome: 'Despesas Financeiras', tipo: 'analitica', natureza: 'devedora', nivel: 3, saldo: 45500 }
        ]
      }
    ]
  }
]

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valor)
}

function ContaItem({ conta, nivel = 0 }: { conta: ContaContabil; nivel?: number }) {
  const [expanded, setExpanded] = useState(nivel < 2)
  const hasChildren = conta.filhos && conta.filhos.length > 0

  const getIconByCodigo = (codigo: string) => {
    if (codigo.startsWith('1')) return <TrendingUp className="h-4 w-4 text-emerald-600" />
    if (codigo.startsWith('2')) return <TrendingDown className="h-4 w-4 text-red-500" />
    if (codigo.startsWith('3')) return <Building2 className="h-4 w-4 text-blue-600" />
    if (codigo.startsWith('4')) return <DollarSign className="h-4 w-4 text-green-600" />
    if (codigo.startsWith('5')) return <Wallet className="h-4 w-4 text-orange-500" />
    return <FileText className="h-4 w-4 text-slate-500" />
  }

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer group ${
          conta.tipo === 'sintetica' ? 'font-medium' : ''
        }`}
        style={{ paddingLeft: `${nivel * 20 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <button className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
            {expanded ? (
              <ChevronDown className="h-4 w-4 text-slate-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {getIconByCodigo(conta.codigo)}

        <span className="text-sm font-mono text-emerald-700 dark:text-emerald-400 min-w-[80px]">
          {conta.codigo}
        </span>

        <span className={`flex-1 text-sm ${conta.tipo === 'sintetica' ? 'font-semibold' : ''}`}>
          {conta.nome}
        </span>

        <Badge variant="outline" className={`text-xs ${
          conta.tipo === 'sintetica'
            ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
            : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900 dark:text-slate-400'
        }`}>
          {conta.tipo === 'sintetica' ? 'S' : 'A'}
        </Badge>

        <Badge variant="outline" className={`text-xs ${
          conta.natureza === 'devedora'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
            : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300'
        }`}>
          {conta.natureza === 'devedora' ? 'D' : 'C'}
        </Badge>

        <span className={`text-sm font-medium min-w-[120px] text-right ${
          conta.saldo >= 0 ? 'text-slate-900 dark:text-slate-100' : 'text-red-600'
        }`}>
          {formatarMoeda(conta.saldo)}
        </span>

        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
            <Eye className="h-3.5 w-3.5 text-slate-500" />
          </button>
          <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div>
          {conta.filhos!.map((filho) => (
            <ContaItem key={filho.codigo} conta={filho} nivel={nivel + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function PlanoContasPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const totalContas = planoContasData.reduce((acc, conta) => {
    const countFilhos = (c: ContaContabil): number => {
      if (!c.filhos) return 1
      return 1 + c.filhos.reduce((sum, f) => sum + countFilhos(f), 0)
    }
    return acc + countFilhos(conta)
  }, 0)

  const contasSinteticas = planoContasData.reduce((acc, conta) => {
    const countSinteticas = (c: ContaContabil): number => {
      const count = c.tipo === 'sintetica' ? 1 : 0
      if (!c.filhos) return count
      return count + c.filhos.reduce((sum, f) => sum + countSinteticas(f), 0)
    }
    return acc + countSinteticas(conta)
  }, 0)

  const contasAnaliticas = totalContas - contasSinteticas

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <Link href="/contabil" className="inline-flex items-center gap-2 text-emerald-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar para Contábil</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
              <Layers className="h-6 w-6" />
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              Estrutura Hierárquica
            </Badge>
          </div>
          <h1 className="text-3xl font-bold mb-2">Plano de Contas</h1>
          <p className="text-emerald-100 max-w-2xl">
            Visualize e gerencie a estrutura hierárquica completa do plano de contas contábil.
          </p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <FolderTree className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-emerald-200">Total de Contas</p>
                <p className="font-semibold">{totalContas}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-emerald-200">Sintéticas</p>
                <p className="font-semibold">{contasSinteticas}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10">
                <FileText className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-emerald-200">Analíticas</p>
                <p className="font-semibold">{contasAnaliticas}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ações e Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou nome..."
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
            <Upload className="h-4 w-4" />
            Importar
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Nova Conta
          </Button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-4 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">S</Badge>
          <span className="text-muted-foreground">Sintética</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">A</Badge>
          <span className="text-muted-foreground">Analítica</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">D</Badge>
          <span className="text-muted-foreground">Devedora</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">C</Badge>
          <span className="text-muted-foreground">Credora</span>
        </div>
      </div>

      {/* Árvore do Plano de Contas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5 text-emerald-600" />
            Estrutura do Plano de Contas
          </CardTitle>
          <CardDescription>
            Clique nas contas sintéticas para expandir ou recolher
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-t divide-y">
            {planoContasData.map((conta) => (
              <ContaItem key={conta.codigo} conta={conta} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
