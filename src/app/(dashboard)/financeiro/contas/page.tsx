'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Landmark,
  Plus,
  ArrowLeft,
  MoreHorizontal,
  Edit,
  Power,
  Building2,
  Wallet,
  PiggyBank,
  TrendingUp,
} from 'lucide-react'
import {
  ContaBancaria,
  TipoConta,
  formatCurrency,
  tipoContaLabels,
} from '@/types/financeiro'
import { cn } from '@/lib/utils'

// Dados mockados
const contasMock: ContaBancaria[] = [
  {
    id: '1',
    tenantId: '1',
    nome: 'Conta Principal',
    banco: 'Banco do Brasil',
    agencia: '1234',
    conta: '12345-6',
    tipo: 'CORRENTE',
    saldoInicial: 10000,
    saldoAtual: 50000,
    cor: '#1a365d',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '2',
    tenantId: '1',
    nome: 'Conta Empresarial',
    banco: 'Itau',
    agencia: '5678',
    conta: '67890-1',
    tipo: 'CORRENTE',
    saldoInicial: 5000,
    saldoAtual: 75450,
    cor: '#ec7211',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '3',
    tenantId: '1',
    nome: 'Reserva',
    banco: 'Caixa',
    agencia: '9012',
    conta: '34567-8',
    tipo: 'POUPANCA',
    saldoInicial: 20000,
    saldoAtual: 25000,
    cor: '#0066cc',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
  {
    id: '4',
    tenantId: '1',
    nome: 'Investimentos',
    banco: 'XP',
    agencia: '',
    conta: '',
    tipo: 'INVESTIMENTO',
    saldoInicial: 50000,
    saldoAtual: 68000,
    cor: '#00875a',
    ativo: true,
    criadoEm: new Date(),
    atualizadoEm: new Date(),
  },
]

const getIconByTipo = (tipo: TipoConta) => {
  switch (tipo) {
    case 'CORRENTE':
      return Building2
    case 'POUPANCA':
      return PiggyBank
    case 'INVESTIMENTO':
      return TrendingUp
    case 'CAIXA':
      return Wallet
    default:
      return Landmark
  }
}

export default function ContasPage() {
  const [contas] = useState<ContaBancaria[]>(contasMock)

  // Calcular saldo total
  const saldoTotal = contas
    .filter((c) => c.ativo)
    .reduce((acc, c) => acc + c.saldoAtual, 0)

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
            <Landmark className="h-7 w-7 text-bmv-primary" />
            Contas Bancarias
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas contas bancarias
          </p>
        </div>
        <Link href="/financeiro/contas/nova">
          <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </Link>
      </div>

      {/* Saldo Total */}
      <Card className="bg-bmv-primary text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">Saldo Total</p>
              <p className="text-3xl font-bold">{formatCurrency(saldoTotal)}</p>
            </div>
            <Wallet className="h-12 w-12 text-white/30" />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      <div className="grid gap-4 md:grid-cols-2">
        {contas.map((conta) => {
          const Icon = getIconByTipo(conta.tipo)
          return (
            <Card
              key={conta.id}
              className={cn(
                'overflow-hidden',
                !conta.ativo && 'opacity-60'
              )}
            >
              <div
                className="h-2"
                style={{ backgroundColor: conta.cor || '#1a365d' }}
              />
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div
                      className="p-3 rounded-lg"
                      style={{ backgroundColor: `${conta.cor}20` || '#1a365d20' }}
                    >
                      <Icon
                        className="h-6 w-6"
                        style={{ color: conta.cor || '#1a365d' }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{conta.nome}</h3>
                        {!conta.ativo && (
                          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
                            Inativa
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {conta.banco}
                        {conta.agencia && ` | Ag: ${conta.agencia}`}
                        {conta.conta && ` | Cc: ${conta.conta}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tipoContaLabels[conta.tipo]}
                      </p>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className={conta.ativo ? 'text-amber-600' : 'text-green-600'}>
                        <Power className="h-4 w-4 mr-2" />
                        {conta.ativo ? 'Desativar' : 'Ativar'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Saldo Atual</span>
                    <span
                      className={cn(
                        'text-xl font-bold',
                        conta.saldoAtual >= 0 ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      {formatCurrency(conta.saldoAtual)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {contas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Landmark className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma conta cadastrada</h3>
            <p className="text-muted-foreground mb-4">
              Adicione sua primeira conta bancaria
            </p>
            <Link href="/financeiro/contas/nova">
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
