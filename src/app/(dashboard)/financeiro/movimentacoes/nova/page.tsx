'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { ArrowLeft, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  TipoTransacao,
  Frequencia,
  categoriasReceita,
  categoriasDespesa,
  frequenciaLabels,
} from '@/types/financeiro'
import { cn } from '@/lib/utils'

// Dados mockados
const contasMock = [
  { id: '1', nome: 'Banco do Brasil' },
  { id: '2', nome: 'Itau' },
  { id: '3', nome: 'Caixa' },
]

const frequenciaOptions: Frequencia[] = ['DIARIA', 'SEMANAL', 'QUINZENAL', 'MENSAL', 'ANUAL']

function NovaMovimentacaoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const tipoInicial = (searchParams.get('tipo') as TipoTransacao) || 'RECEITA'

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    tipo: tipoInicial,
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    categoria: '',
    contaId: '',
    observacoes: '',
    recorrente: false,
    frequencia: '' as Frequencia | '',
  })

  const categorias = formData.tipo === 'RECEITA' ? categoriasReceita : categoriasDespesa

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

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

    if (!formData.data) {
      toast({
        title: 'Erro',
        description: 'A data e obrigatoria',
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
      const response = await fetch('/api/financeiro/movimentacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          valor: parseFloat(formData.valor),
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar movimentacao')
      }

      toast({
        title: 'Movimentacao criada!',
        description: `${formData.tipo === 'RECEITA' ? 'Receita' : 'Despesa'} registrada com sucesso.`,
      })

      router.push('/financeiro/movimentacoes')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar a movimentacao. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
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
          {formData.tipo === 'RECEITA' ? (
            <TrendingUp className="h-7 w-7 text-green-600" />
          ) : (
            <TrendingDown className="h-7 w-7 text-red-600" />
          )}
          Nova {formData.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}
        </h1>
        <p className="text-muted-foreground">
          Registre uma nova movimentacao financeira
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Movimentacao</CardTitle>
          <CardDescription>
            Preencha as informacoes da movimentacao
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
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {contasMock.map((conta) => (
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
                className={cn(
                  formData.tipo === 'RECEITA'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                )}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar {formData.tipo === 'RECEITA' ? 'Receita' : 'Despesa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function NovaMovimentacaoPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <NovaMovimentacaoContent />
    </Suspense>
  )
}
