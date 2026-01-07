'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { useToast } from '@/components/ui/use-toast'
import { useModulePermissions } from '@/hooks/use-permissions'
import { contabilService, type ContaContabil, type CentroCusto, type Lancamento } from '@/services/contabil.service'
import {
  FileText,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Edit2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react'

function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(valor)
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'CONFIRMADO':
      return {
        label: 'Confirmado',
        icon: CheckCircle2,
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
      }
    case 'PENDENTE':
      return {
        label: 'Pendente',
        icon: Clock,
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
      }
    case 'CANCELADO':
      return {
        label: 'Cancelado',
        icon: XCircle,
        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      }
    default:
      return {
        label: status,
        icon: Clock,
        color: 'bg-slate-100 text-slate-700',
      }
  }
}

export default function LancamentoPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string
  const isEditMode = searchParams.get('edit') === 'true'

  const { user } = useAuth()
  const { tenant } = useTenant()
  const { toast } = useToast()
  const { canEdit } = useModulePermissions('contabil.lancamentos')

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(isEditMode)

  const [lancamento, setLancamento] = useState<Lancamento | null>(null)
  const [contas, setContas] = useState<ContaContabil[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])

  const [formData, setFormData] = useState({
    data: '',
    contaDebitoId: '',
    contaCreditoId: '',
    valor: '',
    historico: '',
    documento: '',
    centroCustoId: ''
  })

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true)
        setError(null)

        const [lancamentoData, contasData, centrosData] = await Promise.all([
          contabilService.lancamentos.getLancamento(id),
          contabilService.getPlanoContas(),
          contabilService.getCentrosCusto()
        ])

        setLancamento(lancamentoData)
        setContas(contasData)
        setCentrosCusto(centrosData)

        setFormData({
          data: lancamentoData.data?.split('T')[0] || '',
          contaDebitoId: lancamentoData.contaDebitoId || '',
          contaCreditoId: lancamentoData.contaCreditoId || '',
          valor: lancamentoData.valor?.toString() || '',
          historico: lancamentoData.historico || '',
          documento: lancamentoData.documento || '',
          centroCustoId: lancamentoData.centroCustoId || ''
        })
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError('Erro ao carregar dados do lancamento')
      } finally {
        setLoadingData(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!canEdit) {
      setError('Voce nao tem permissao para editar lancamentos')
      return
    }

    if (!formData.data) {
      setError('Data e obrigatoria')
      return
    }
    if (!formData.contaDebitoId) {
      setError('Conta de debito e obrigatoria')
      return
    }
    if (!formData.contaCreditoId) {
      setError('Conta de credito e obrigatoria')
      return
    }
    if (formData.contaDebitoId === formData.contaCreditoId) {
      setError('As contas de debito e credito devem ser diferentes')
      return
    }
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }
    if (!formData.historico.trim()) {
      setError('Historico e obrigatorio')
      return
    }

    try {
      setLoading(true)

      await contabilService.lancamentos.updateLancamento(id, {
        data: formData.data,
        contaDebitoId: formData.contaDebitoId,
        contaCreditoId: formData.contaCreditoId,
        valor: parseFloat(formData.valor),
        historico: formData.historico.trim(),
        documento: formData.documento.trim() || undefined,
        centroCustoId: formData.centroCustoId || undefined
      })

      toast({
        title: 'Lancamento atualizado',
        description: 'O lancamento contabil foi atualizado com sucesso.',
      })

      setEditing(false)
      router.push('/contabil/lancamentos')
    } catch (err) {
      console.error('Erro ao atualizar lancamento:', err)
      setError('Erro ao atualizar lancamento. Tente novamente.')
      toast({
        title: 'Erro',
        description: 'Nao foi possivel atualizar o lancamento.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (error && !lancamento) {
    return (
      <div className="space-y-6">
        <Link href="/contabil/lancamentos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar para Lancamentos
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig = lancamento ? getStatusConfig(lancamento.status) : null
  const StatusIcon = statusConfig?.icon || Clock

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-800 via-violet-700 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <Link href="/contabil/lancamentos" className="inline-flex items-center gap-2 text-violet-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar para Lancamentos</span>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
                  <FileText className="h-6 w-6" />
                </div>
                {statusConfig && (
                  <Badge className={statusConfig.color}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {editing ? 'Editar Lancamento' : 'Detalhes do Lancamento'}
              </h1>
              <p className="text-violet-100">
                {lancamento?.historico?.substring(0, 100)}
                {(lancamento?.historico?.length || 0) > 100 ? '...' : ''}
              </p>
            </div>

            {!editing && canEdit && lancamento?.status === 'PENDENTE' && (
              <Button
                onClick={() => setEditing(true)}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" />
            {editing ? 'Editar Dados do Lancamento' : 'Dados do Lancamento'}
          </CardTitle>
          <CardDescription>
            {editing ? 'Altere os dados do lancamento contabil' : 'Visualize os dados do lancamento contabil'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleChange('data', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => handleChange('valor', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contaDebito">Conta Debito *</Label>
                  <Select
                    value={formData.contaDebitoId}
                    onValueChange={(value) => handleChange('contaDebitoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta de debito" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.codigo} - {conta.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contaCredito">Conta Credito *</Label>
                  <Select
                    value={formData.contaCreditoId}
                    onValueChange={(value) => handleChange('contaCreditoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta de credito" />
                    </SelectTrigger>
                    <SelectContent>
                      {contas.map((conta) => (
                        <SelectItem key={conta.id} value={conta.id}>
                          {conta.codigo} - {conta.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="centroCusto">Centro de Custo</Label>
                  <Select
                    value={formData.centroCustoId}
                    onValueChange={(value) => handleChange('centroCustoId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o centro de custo (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {centrosCusto.map((cc) => (
                        <SelectItem key={cc.id} value={cc.id}>
                          {cc.codigo} - {cc.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento">Documento</Label>
                  <Input
                    id="documento"
                    placeholder="NF, Recibo, etc."
                    value={formData.documento}
                    onChange={(e) => handleChange('documento', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="historico">Historico *</Label>
                <Textarea
                  id="historico"
                  placeholder="Descreva o lancamento..."
                  value={formData.historico}
                  onChange={(e) => handleChange('historico', e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-4 justify-end pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alteracoes
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {lancamento && (
                <>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Data</p>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-violet-600" />
                        <p className="font-medium">{new Date(lancamento.data).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="text-xl font-bold text-violet-600">{formatarMoeda(lancamento.valor)}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Conta Debito</p>
                      <div className="flex items-center gap-2">
                        <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                        <p className="font-medium">
                          {lancamento.contaDebito
                            ? `${lancamento.contaDebito.codigo} - ${lancamento.contaDebito.nome}`
                            : lancamento.contaDebitoId}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Conta Credito</p>
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                        <p className="font-medium">
                          {lancamento.contaCredito
                            ? `${lancamento.contaCredito.codigo} - ${lancamento.contaCredito.nome}`
                            : lancamento.contaCreditoId}
                        </p>
                      </div>
                    </div>

                    {lancamento.centroCusto && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Centro de Custo</p>
                        <p className="font-medium">{lancamento.centroCusto.codigo} - {lancamento.centroCusto.nome}</p>
                      </div>
                    )}

                    {lancamento.documento && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Documento</p>
                        <p className="font-medium">{lancamento.documento}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">Historico</p>
                    <p className="font-medium">{lancamento.historico}</p>
                  </div>

                  <div className="text-sm text-muted-foreground border-t pt-4">
                    <p>Criado em: {new Date(lancamento.criadoEm).toLocaleString('pt-BR')}</p>
                    <p>Atualizado em: {new Date(lancamento.atualizadoEm).toLocaleString('pt-BR')}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
