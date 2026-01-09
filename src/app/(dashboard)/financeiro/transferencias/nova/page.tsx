'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Calculator,
  Calendar,
  Loader2,
  Plus,
  Save,
  Wallet,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency } from '@/types/financeiro'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface ContaBancaria {
  id: string
  nome: string
  banco?: string
  saldoAtual: number
  tipo: string
}

export default function NovaTransferenciaPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()
  const { toast } = useToast()

  const [contas, setContas] = useState<ContaBancaria[]>([])
  const [loadingContas, setLoadingContas] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [contaOrigemId, setContaOrigemId] = useState('')
  const [contaDestinoId, setContaDestinoId] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [descricao, setDescricao] = useState('')

  // Buscar contas bancárias
  useEffect(() => {
    const fetchContas = async () => {
      try {
        const response = await fetch('/api/financeiro/contas')
        if (response.ok) {
          const data = await response.json()
          setContas(data)
        } else {
          // Mock data if API doesn't exist
          setContas([
            { id: '1', nome: 'Conta Corrente Bradesco', banco: 'Bradesco', saldoAtual: 50000, tipo: 'CORRENTE' },
            { id: '2', nome: 'Caixa', banco: undefined, saldoAtual: 5000, tipo: 'CAIXA' },
            { id: '3', nome: 'Conta Poupança Itaú', banco: 'Itaú', saldoAtual: 100000, tipo: 'POUPANCA' },
            { id: '4', nome: 'Conta Corrente Itaú', banco: 'Itaú', saldoAtual: 25000, tipo: 'CORRENTE' },
          ])
        }
      } catch (error) {
        console.error('Erro ao buscar contas:', error)
        // Mock data on error
        setContas([
          { id: '1', nome: 'Conta Corrente Bradesco', banco: 'Bradesco', saldoAtual: 50000, tipo: 'CORRENTE' },
          { id: '2', nome: 'Caixa', banco: undefined, saldoAtual: 5000, tipo: 'CAIXA' },
          { id: '3', nome: 'Conta Poupança Itaú', banco: 'Itaú', saldoAtual: 100000, tipo: 'POUPANCA' },
          { id: '4', nome: 'Conta Corrente Itaú', banco: 'Itaú', saldoAtual: 25000, tipo: 'CORRENTE' },
        ])
      } finally {
        setLoadingContas(false)
      }
    }

    if (user && tenant) {
      fetchContas()
    }
  }, [user, tenant])

  // Set default date to today
  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setData(formattedDate)
  }, [])

  // Get selected accounts
  const contaOrigem = contas.find(c => c.id === contaOrigemId)
  const contaDestino = contas.find(c => c.id === contaDestinoId)

  // Filter destination accounts (exclude selected origin)
  const contasDestinoDisponiveis = contas.filter(c => c.id !== contaOrigemId)

  // Parse valor
  const valorNumerico = parseFloat(valor.replace(/\D/g, '')) / 100 || 0

  // Check if has sufficient balance
  const saldoSuficiente = contaOrigem ? valorNumerico <= contaOrigem.saldoAtual : true
  const saldoAposTransferencia = contaOrigem ? contaOrigem.saldoAtual - valorNumerico : 0

  // Format currency input
  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '')
    if (value) {
      const numericValue = parseInt(value) / 100
      value = numericValue.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
    setValor(value)
  }

  // Reset destination when origin changes
  useEffect(() => {
    if (contaOrigemId && contaDestinoId === contaOrigemId) {
      setContaDestinoId('')
    }
  }, [contaOrigemId, contaDestinoId])

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!contaOrigemId) {
      toast({
        title: 'Erro',
        description: 'Selecione a conta de origem',
        variant: 'destructive',
      })
      return
    }

    if (!contaDestinoId) {
      toast({
        title: 'Erro',
        description: 'Selecione a conta de destino',
        variant: 'destructive',
      })
      return
    }

    if (contaOrigemId === contaDestinoId) {
      toast({
        title: 'Erro',
        description: 'A conta de origem e destino devem ser diferentes',
        variant: 'destructive',
      })
      return
    }

    if (!valorNumerico || valorNumerico <= 0) {
      toast({
        title: 'Erro',
        description: 'Informe um valor válido',
        variant: 'destructive',
      })
      return
    }

    if (!saldoSuficiente) {
      toast({
        title: 'Erro',
        description: 'Saldo insuficiente na conta de origem',
        variant: 'destructive',
      })
      return
    }

    if (!data) {
      toast({
        title: 'Erro',
        description: 'Informe a data da transferência',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/financeiro/transferencias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contaOrigemId,
          contaDestinoId,
          valor: valorNumerico,
          data,
          descricao,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao realizar transferência')
      }

      toast({
        title: 'Sucesso',
        description: 'Transferência realizada com sucesso!',
      })
      router.push('/financeiro/transferencias')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao realizar transferência',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/financeiro/transferencias"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Transferências
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white animate-fade-in-up">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Plus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Nova Transferência</h1>
              <p className="text-blue-100 text-sm md:text-base">
                Transfira valores entre suas contas bancárias
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulário */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                Dados da Transferência
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Conta Origem */}
              <div className="space-y-2">
                <Label htmlFor="contaOrigem" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Conta de Origem *
                </Label>
                <Select value={contaOrigemId} onValueChange={setContaOrigemId}>
                  <SelectTrigger id="contaOrigem">
                    <SelectValue placeholder={loadingContas ? 'Carregando...' : 'Selecione a conta de origem'} />
                  </SelectTrigger>
                  <SelectContent>
                    {contas.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{conta.nome}</span>
                          <span className="text-muted-foreground text-sm">
                            {formatCurrency(conta.saldoAtual)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {contaOrigem && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Saldo disponível:</span>
                      <span className={cn(
                        "font-semibold",
                        contaOrigem.saldoAtual >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(contaOrigem.saldoAtual)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Conta Destino */}
              <div className="space-y-2">
                <Label htmlFor="contaDestino" className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Conta de Destino *
                </Label>
                <Select
                  value={contaDestinoId}
                  onValueChange={setContaDestinoId}
                  disabled={!contaOrigemId}
                >
                  <SelectTrigger id="contaDestino">
                    <SelectValue placeholder={
                      !contaOrigemId
                        ? 'Selecione primeiro a conta de origem'
                        : 'Selecione a conta de destino'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {contasDestinoDisponiveis.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        <div className="flex items-center justify-between w-full gap-4">
                          <span>{conta.nome}</span>
                          <span className="text-muted-foreground text-sm">
                            {formatCurrency(conta.saldoAtual)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valor */}
              <div className="space-y-2">
                <Label htmlFor="valor" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Valor *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="valor"
                    placeholder="0,00"
                    value={valor}
                    onChange={handleValorChange}
                    className={cn(
                      "pl-10",
                      !saldoSuficiente && valorNumerico > 0 && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                </div>
                {!saldoSuficiente && valorNumerico > 0 && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Saldo insuficiente na conta de origem</span>
                  </div>
                )}
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label htmlFor="data" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data *
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o motivo da transferência..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview da Transferência */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                Resumo da Transferência
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contaOrigem && contaDestino && valorNumerico > 0 ? (
                <div className="space-y-6">
                  {/* Visual da transferência */}
                  <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex-1 text-center">
                      <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto mb-2">
                        <Wallet className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="font-medium text-sm">{contaOrigem.nome}</p>
                      <p className="text-xs text-muted-foreground mt-1">Origem</p>
                    </div>

                    <div className="flex flex-col items-center">
                      <ArrowRight className="h-6 w-6 text-blue-600" />
                      <span className="text-lg font-bold text-blue-600 mt-1">
                        {formatCurrency(valorNumerico)}
                      </span>
                    </div>

                    <div className="flex-1 text-center">
                      <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full w-fit mx-auto mb-2">
                        <Wallet className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="font-medium text-sm">{contaDestino.nome}</p>
                      <p className="text-xs text-muted-foreground mt-1">Destino</p>
                    </div>
                  </div>

                  {/* Detalhes */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Valor da Transferência</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(valorNumerico)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Saldo atual (origem)</span>
                      <span className="font-medium">{formatCurrency(contaOrigem.saldoAtual)}</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Saldo após transferência</span>
                      <span className={cn(
                        "font-semibold",
                        saldoAposTransferencia >= 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {formatCurrency(saldoAposTransferencia)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Novo saldo (destino)</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(contaDestino.saldoAtual + valorNumerico)}
                      </span>
                    </div>
                  </div>

                  {!saldoSuficiente && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">Atenção!</span>
                      </div>
                      <p className="text-sm text-red-600 mt-1">
                        O valor da transferência excede o saldo disponível na conta de origem.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione as contas e informe o valor para visualizar o resumo</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-4 mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/financeiro/transferencias')}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving || !contaOrigemId || !contaDestinoId || !valorNumerico || !saldoSuficiente}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Transferindo...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Realizar Transferência
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
