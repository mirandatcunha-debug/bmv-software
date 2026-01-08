'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowLeft,
  Calculator,
  Calendar,
  FileText,
  Loader2,
  Plus,
  Save,
  Building2,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/types/financeiro'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { useToast } from '@/components/ui/use-toast'

interface Fornecedor {
  id: string
  nome: string
  cpfCnpj?: string
}

interface ParcelaPreview {
  parcela: number
  valor: number
  dataVencimento: Date
}

export default function NovaContaPagarPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()
  const { toast } = useToast()

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  const [loadingFornecedores, setLoadingFornecedores] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [fornecedorId, setFornecedorId] = useState('')
  const [documento, setDocumento] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [quantidadeParcelas, setQuantidadeParcelas] = useState('1')
  const [primeiroVencimento, setPrimeiroVencimento] = useState('')
  const [observacoes, setObservacoes] = useState('')

  // Buscar fornecedores
  useEffect(() => {
    const fetchFornecedores = async () => {
      try {
        const response = await fetch('/api/cadastros/fornecedores?status=ativos')
        if (response.ok) {
          const data = await response.json()
          setFornecedores(data)
        }
      } catch (error) {
        console.error('Erro ao buscar fornecedores:', error)
        toast({
          title: 'Erro',
          description: 'Erro ao carregar lista de fornecedores',
          variant: 'destructive',
        })
      } finally {
        setLoadingFornecedores(false)
      }
    }

    if (user && tenant) {
      fetchFornecedores()
    }
  }, [user, tenant, toast])

  // Set default first due date to today
  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toISOString().split('T')[0]
    setPrimeiroVencimento(formattedDate)
  }, [])

  // Gerar preview das parcelas
  const parcelas = useMemo((): ParcelaPreview[] => {
    const valor = parseFloat(valorTotal.replace(/\D/g, '')) / 100
    const qtd = parseInt(quantidadeParcelas)

    if (!valor || valor <= 0 || !qtd || qtd <= 0 || !primeiroVencimento) {
      return []
    }

    const valorParcela = valor / qtd
    const parcelasArray: ParcelaPreview[] = []

    for (let i = 0; i < qtd; i++) {
      const dataVencimento = new Date(primeiroVencimento + 'T12:00:00')
      dataVencimento.setMonth(dataVencimento.getMonth() + i)

      parcelasArray.push({
        parcela: i + 1,
        valor: valorParcela,
        dataVencimento,
      })
    }

    return parcelasArray
  }, [valorTotal, quantidadeParcelas, primeiroVencimento])

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
    setValorTotal(value)
  }

  // Get selected fornecedor name
  const fornecedorSelecionado = fornecedores.find(f => f.id === fornecedorId)

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validations
    if (!fornecedorId) {
      toast({
        title: 'Erro',
        description: 'Selecione um fornecedor',
        variant: 'destructive',
      })
      return
    }

    if (!descricao.trim()) {
      toast({
        title: 'Erro',
        description: 'Informe a descricao',
        variant: 'destructive',
      })
      return
    }

    const valor = parseFloat(valorTotal.replace(/\D/g, '')) / 100
    if (!valor || valor <= 0) {
      toast({
        title: 'Erro',
        description: 'Informe um valor valido',
        variant: 'destructive',
      })
      return
    }

    if (!primeiroVencimento) {
      toast({
        title: 'Erro',
        description: 'Informe a data do primeiro vencimento',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    try {
      const response = await fetch('/api/financeiro/contas-pagar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fornecedorId,
          fornecedor: fornecedorSelecionado?.nome || '',
          documento,
          descricao,
          valorTotal: valor,
          quantidadeParcelas: parseInt(quantidadeParcelas),
          primeiroVencimento,
          observacoes,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao salvar conta a pagar')
      }

      toast({
        title: 'Sucesso',
        description: `${quantidadeParcelas} parcela(s) criada(s) com sucesso!`,
      })
      router.push('/financeiro/contas-pagar')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar conta a pagar',
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
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/financeiro/contas-pagar"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Contas a Pagar
      </Link>

      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 text-white animate-fade-in-up">
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
              <h1 className="text-2xl md:text-3xl font-bold">Nova Conta a Pagar</h1>
              <p className="text-red-100 text-sm md:text-base">
                Cadastre uma nova conta a pagar com parcelamento
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Formulario */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-red-600" />
                Dados da Conta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Fornecedor */}
              <div className="space-y-2">
                <Label htmlFor="fornecedor" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Fornecedor *
                </Label>
                <Select value={fornecedorId} onValueChange={setFornecedorId}>
                  <SelectTrigger id="fornecedor">
                    <SelectValue placeholder={loadingFornecedores ? 'Carregando...' : 'Selecione um fornecedor'} />
                  </SelectTrigger>
                  <SelectContent>
                    {fornecedores.map((fornecedor) => (
                      <SelectItem key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.nome}
                        {fornecedor.cpfCnpj && (
                          <span className="text-muted-foreground ml-2">
                            ({fornecedor.cpfCnpj})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Documento */}
              <div className="space-y-2">
                <Label htmlFor="documento" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Numero do Documento
                </Label>
                <Input
                  id="documento"
                  placeholder="Ex: NF-2024001"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                />
              </div>

              {/* Descricao */}
              <div className="space-y-2">
                <Label htmlFor="descricao">Descricao *</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva a conta a pagar..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Valor Total */}
              <div className="space-y-2">
                <Label htmlFor="valor" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Valor Total *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    R$
                  </span>
                  <Input
                    id="valor"
                    placeholder="0,00"
                    value={valorTotal}
                    onChange={handleValorChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Parcelas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parcelas" className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Parcelas
                  </Label>
                  <Select value={quantidadeParcelas} onValueChange={setQuantidadeParcelas}>
                    <SelectTrigger id="parcelas">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 48 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vencimento" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    1o Vencimento *
                  </Label>
                  <Input
                    id="vencimento"
                    type="date"
                    value={primeiroVencimento}
                    onChange={(e) => setPrimeiroVencimento(e.target.value)}
                  />
                </div>
              </div>

              {/* Observacoes */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observacoes</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observacoes adicionais..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview das Parcelas */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-600" />
                Preview das Parcelas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parcelas.length > 0 ? (
                <div className="space-y-4">
                  <div className="rounded-lg border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                          <TableHead className="font-semibold">Parcela</TableHead>
                          <TableHead className="font-semibold">Vencimento</TableHead>
                          <TableHead className="font-semibold text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parcelas.map((parcela) => (
                          <TableRow key={parcela.parcela}>
                            <TableCell className="font-medium">
                              {parcela.parcela}/{quantidadeParcelas}
                            </TableCell>
                            <TableCell>
                              {formatDate(parcela.dataVencimento)}
                            </TableCell>
                            <TableCell className="text-right font-semibold text-red-600">
                              {formatCurrency(parcela.valor)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <span className="font-medium">Total</span>
                    <span className="text-xl font-bold text-red-600">
                      {formatCurrency(parcelas.reduce((acc, p) => acc + p.valor, 0))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Preencha o valor e data de vencimento para visualizar as parcelas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Botoes de acao */}
        <div className="flex justify-end gap-4 mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/financeiro/contas-pagar')}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving || parcelas.length === 0}
            className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/25"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar {parseInt(quantidadeParcelas) > 1 ? `${quantidadeParcelas} Parcelas` : 'Conta'}
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
