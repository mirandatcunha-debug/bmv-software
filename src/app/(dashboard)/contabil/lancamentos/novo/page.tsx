'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/hooks/use-tenant'
import { useToast } from '@/hooks/use-toast'
import { useModulePermissions } from '@/hooks/use-permissions'
import { contabilService, type ContaContabil, type CentroCusto } from '@/services/contabil.service'
import {
  FileText,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react'

export default function NovoLancamentoPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { tenant } = useTenant()
  const { toast } = useToast()
  const { canCreate } = useModulePermissions('contabil.lancamentos')

  // Estados do formulário
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dados auxiliares
  const [contas, setContas] = useState<ContaContabil[]>([])
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([])

  // Campos do formulário
  const [formData, setFormData] = useState({
    data: new Date().toISOString().split('T')[0],
    contaDebitoId: '',
    contaCreditoId: '',
    valor: '',
    historico: '',
    documento: '',
    centroCustoId: ''
  })

  // Carregar dados auxiliares
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true)
        const [contasData, centrosData] = await Promise.all([
          contabilService.getPlanoContas(),
          contabilService.getCentrosCusto()
        ])
        setContas(contasData)
        setCentrosCusto(centrosData)
      } catch (err) {
        console.error('Erro ao carregar dados:', err)
        setError('Erro ao carregar dados. Tente novamente.')
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [])

  // Verificar permissão
  if (!canCreate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-16 w-16 text-red-500" />
        <h2 className="text-xl font-semibold">Acesso Negado</h2>
        <p className="text-muted-foreground">Você não tem permissão para criar lançamentos contábeis.</p>
        <Link href="/contabil/lancamentos">
          <Button variant="outline">Voltar</Button>
        </Link>
      </div>
    )
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validações
    if (!formData.data) {
      setError('Data é obrigatória')
      return
    }
    if (!formData.contaDebitoId) {
      setError('Conta de débito é obrigatória')
      return
    }
    if (!formData.contaCreditoId) {
      setError('Conta de crédito é obrigatória')
      return
    }
    if (formData.contaDebitoId === formData.contaCreditoId) {
      setError('As contas de débito e crédito devem ser diferentes')
      return
    }
    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      setError('Valor deve ser maior que zero')
      return
    }
    if (!formData.historico.trim()) {
      setError('Histórico é obrigatório')
      return
    }

    try {
      setLoading(true)

      await contabilService.createLancamento({
        data: formData.data,
        contaDebitoId: formData.contaDebitoId,
        contaCreditoId: formData.contaCreditoId,
        valor: parseFloat(formData.valor),
        historico: formData.historico.trim(),
        documento: formData.documento.trim() || undefined,
        centroCustoId: formData.centroCustoId || undefined
      })

      toast({
        title: 'Lançamento criado',
        description: 'O lançamento contábil foi criado com sucesso.',
      })

      router.push('/contabil/lancamentos')
    } catch (err) {
      console.error('Erro ao criar lançamento:', err)
      setError('Erro ao criar lançamento. Tente novamente.')
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o lançamento.',
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

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-800 via-violet-700 to-purple-600 p-8 text-white">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />

        <div className="relative">
          <Link href="/contabil/lancamentos" className="inline-flex items-center gap-2 text-violet-200 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Voltar para Lançamentos</span>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-sm">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Novo Lançamento Contábil</h1>
          <p className="text-violet-100 max-w-2xl">
            Preencha os campos abaixo para criar um novo lançamento.
          </p>
        </div>
      </div>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-violet-600" />
            Dados do Lançamento
          </CardTitle>
          <CardDescription>
            Informe os dados do lançamento contábil (partida dobrada)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {/* Data */}
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

              {/* Valor */}
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

              {/* Conta Débito */}
              <div className="space-y-2">
                <Label htmlFor="contaDebito">Conta Débito *</Label>
                <Select
                  value={formData.contaDebitoId}
                  onValueChange={(value) => handleChange('contaDebitoId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de débito" />
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

              {/* Conta Crédito */}
              <div className="space-y-2">
                <Label htmlFor="contaCredito">Conta Crédito *</Label>
                <Select
                  value={formData.contaCreditoId}
                  onValueChange={(value) => handleChange('contaCreditoId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a conta de crédito" />
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

              {/* Centro de Custo */}
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

              {/* Documento */}
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

            {/* Histórico */}
            <div className="space-y-2">
              <Label htmlFor="historico">Histórico *</Label>
              <Textarea
                id="historico"
                placeholder="Descreva o lançamento..."
                value={formData.historico}
                onChange={(e) => handleChange('historico', e.target.value)}
                rows={3}
                required
              />
            </div>

            {/* Info do usuário/tenant */}
            <div className="text-sm text-muted-foreground border-t pt-4">
              <p>Usuário: {user?.name || user?.email || 'N/A'}</p>
              <p>Empresa: {tenant?.nome || 'N/A'}</p>
            </div>

            {/* Botões */}
            <div className="flex gap-4 justify-end pt-4 border-t">
              <Link href="/contabil/lancamentos">
                <Button type="button" variant="outline">
                  Cancelar
                </Button>
              </Link>
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
                    Salvar Lançamento
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
