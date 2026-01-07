'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, Edit } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useTenantContext } from '@/contexts/tenant-context'
import { financeiroService, UpdateMovimentacaoData } from '@/services/financeiro.service'
import {
  TipoTransacao,
  Frequencia,
  categoriasReceita,
  categoriasDespesa,
  frequenciaLabels,
  ContaBancaria,
  Movimentacao,
} from '@/types/financeiro'
import { cn } from '@/lib/utils'

const frequenciaOptions: Frequencia[] = ['DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'ANUAL']

interface EditarMovimentacaoPageProps {
  params: Promise<{ id: string }>
}

export default function EditarMovimentacaoPage({ params }: EditarMovimentacaoPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenantContext()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [contas, setContas] = useState<ContaBancaria[]>([])
  const [loadingContas, setLoadingContas] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movimentacao, setMovimentacao] = useState<Movimentacao | null>(null)
  const [formData, setFormData] = useState({
    tipo: 'RECEITA' as TipoTransacao,
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    contaId: '',
    observacoes: '',
    recorrente: false,
    frequencia: '' as Frequencia | '',
  })

  // Carregar movimentação pelo ID
  useEffect(() => {
    async function loadMovimentacao() {
      try {
        setLoadingData(true)
        const response = await fetch(`/api/financeiro/movimentacoes/${resolvedParams.id}`)
        if (!response.ok) {
          throw new Error('Movimentacao nao encontrada')
        }
        const data = await response.json()
        setMovimentacao(data)
        setFormData({
          tipo: data.tipo,
          descricao: data.descricao,
          valor: String(data.valor),
          data: new Date(data.dataMovimento).toISOString().split('T')[0],
          categoria: data.categoria,
          contaId: data.contaId,
          observacoes: data.observacoes || '',
          recorrente: data.recorrente || false,
          frequencia: data.frequencia || '',
        })
      } catch (err) {
        console.error('Erro ao carregar movimentacao:', err)
        setError('Movimentacao nao encontrada')
      } finally {
        setLoadingData(false)
      }
    }

    if (user && tenant && resolvedParams.id) {
      loadMovimentacao()
    }
  }, [user, tenant, resolvedParams.id])

  // Carregar contas bancárias
  useEffect(() => {
    async function loadContas() {
      try {
        setLoadingContas(true)
        const contasData = await financeiroService.contas.getContas()
        setContas(contasData)
      } catch (err) {
        console.error('Erro ao carregar contas:', err)
      } finally {
        setLoadingContas(false)
      }
    }

    if (user && tenant) {
      loadContas()
    }
  }, [user, tenant])

  const categorias = formData.tipo === 'RECEITA' ? categoriasReceita : categoriasDespesa

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      toast({
        title: 'Erro',
        description: 'Voce precisa estar autenticado',
        variant: 'destructive',
      })
      router.push('/login')
      return
    }

    if (!tenant) {
      toast({
        title: 'Erro',
        description: 'Nenhuma empresa selecionada',
        variant: 'destructive',
      })
      return
    }

    if (!formData.descricao.trim()) {
      toast({
        title: 'Erro',
        description: 'A descricao e obrigatoria',
        variant: 'destructive',
      })
      return
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      toast({
        title: 'Erro',
        description: 'O valor deve ser maior que zero',
        variant: 'destructive',
      })
      return
    }

    if (!formData.categoria) {
      toast({
        title: 'Erro',
        description: 'Selecione uma categoria',
        variant: 'destructive',
      })
      return
    }

    if (!formData.contaId) {
      toast({
        title: 'Erro',
        description: 'Selecione uma conta',
        variant: 'destructive',
      })
      return
    }

    if (formData.recorrente && !formData.frequencia) {
      toast({
        title: 'Erro',
        description: 'Selecione a frequencia da recorrencia',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const updateData: UpdateMovimentacaoData = {
        contaId: formData.contaId,
        tipo: formData.tipo,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: parseFloat(formData.valor),
        dataMovimento: formData.data,
        recorrente: formData.recorrente,
        frequencia: formData.frequencia || undefined,
        observacoes: formData.observacoes || undefined,
      }

      await financeiroService.movimentacoes.updateMovimentacao(resolvedParams.id, updateData)

      toast({
        title: 'Movimentacao atualizada!',
        description: 'As alteracoes foram salvas com sucesso.',
      })

      router.push('/financeiro/movimentacoes')
    } catch (err) {
      console.error('Erro ao atualizar movimentacao:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel atualizar a movimentacao. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading de autenticação
  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    router.push('/login')
    return null
  }

  // Movimentação não encontrada
  if (!movimentacao && !loadingData) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Link
          href="/financeiro/movimentacoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Movimentacoes
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Movimentacao nao encontrada</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/financeiro/movimentacoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Movimentacoes
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Edit className="h-7 w-7 text-blue-600" />
          Editar Movimentacao
        </h1>
        <p className="text-muted-foreground">
          Altere os dados da movimentacao financeira
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Movimentacao</CardTitle>
          <CardDescription>
            Altere as informacoes da movimentacao
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo */}
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formData.tipo === 'RECEITA' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    formData.tipo === 'RECEITA' && 'bg-green-600 hover:bg-green-700'
                  )}
                  onClick={() => setFormData((prev) => ({ ...prev, tipo: 'RECEITA', categoria: '' }))}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Receita
                </Button>
                <Button
                  type="button"
                  variant={formData.tipo === 'DESPESA' ? 'default' : 'outline'}
                  className={cn(
                    'flex-1',
                    formData.tipo === 'DESPESA' && 'bg-red-600 hover:bg-red-700'
                  )}
                  onClick={() => setFormData((prev) => ({ ...prev, tipo: 'DESPESA', categoria: '' }))}
                >
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Despesa
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descricao *</Label>
              <Input
                id="descricao"
                name="descricao"
                placeholder="Ex: Pagamento Cliente ABC"
                value={formData.descricao}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                <Input
                  id="valor"
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  value={formData.data}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoria: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contaId">Conta Bancaria *</Label>
                <Select
                  value={formData.contaId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, contaId: value }))
                  }
                  disabled={loadingContas}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingContas ? "Carregando..." : "Selecione a conta"} />
                  </SelectTrigger>
                  <SelectContent>
                    {contas.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observacoes</Label>
              <Textarea
                id="observacoes"
                name="observacoes"
                placeholder="Observacoes adicionais..."
                value={formData.observacoes}
                onChange={handleChange}
                rows={2}
              />
            </div>

            {/* Recorrência */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recorrente"
                  checked={formData.recorrente}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      recorrente: checked as boolean,
                      frequencia: checked ? prev.frequencia : '',
                    }))
                  }
                />
                <Label htmlFor="recorrente" className="cursor-pointer">
                  Esta e uma movimentacao recorrente
                </Label>
              </div>

              {formData.recorrente && (
                <div className="space-y-2">
                  <Label htmlFor="frequencia">Frequencia</Label>
                  <Select
                    value={formData.frequencia}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, frequencia: value as Frequencia }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequencia" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequenciaOptions.map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {frequenciaLabels[freq]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={loading || loadingContas}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar Alteracoes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
