'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  ArrowLeft,
  Landmark,
  Loader2,
  Building2,
  PiggyBank,
  TrendingUp,
  Wallet,
  Check,
  AlertCircle,
  Sparkles,
  Save,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { TipoConta, tipoContaLabels, formatCurrency, ContaBancaria } from '@/types/financeiro'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { useModulePermissions } from '@/hooks/use-permissions'
import { financeiroService } from '@/services/financeiro.service'

const tipoOptions: { tipo: TipoConta; icon: typeof Building2; descricao: string; cor: string }[] = [
  { tipo: 'CORRENTE', icon: Building2, descricao: 'Conta para movimentacoes do dia a dia', cor: '#3b82f6' },
  { tipo: 'POUPANCA', icon: PiggyBank, descricao: 'Conta para guardar dinheiro', cor: '#10b981' },
  { tipo: 'INVESTIMENTO', icon: TrendingUp, descricao: 'Conta de corretora ou investimentos', cor: '#8b5cf6' },
  { tipo: 'CAIXA', icon: Wallet, descricao: 'Caixa fisico da empresa', cor: '#f59e0b' },
]

const coresOptions = [
  { value: '#1a365d', label: 'Azul Escuro' },
  { value: '#ec7211', label: 'Laranja' },
  { value: '#0066cc', label: 'Azul' },
  { value: '#00875a', label: 'Verde' },
  { value: '#9333ea', label: 'Roxo' },
  { value: '#dc2626', label: 'Vermelho' },
  { value: '#0891b2', label: 'Cyan' },
  { value: '#be185d', label: 'Rosa' },
]

export default function EditarContaPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()
  const { canEdit } = useModulePermissions('financeiro.contas')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conta, setConta] = useState<ContaBancaria | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'CORRENTE' as TipoConta,
    saldoInicial: '',
    cor: '#1a365d',
    ativo: true,
  })

  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Carregar dados da conta
  useEffect(() => {
    async function loadConta() {
      try {
        setLoading(true)
        setError(null)
        const contaData = await financeiroService.contas.getConta(id)
        setConta(contaData)
        setFormData({
          nome: contaData.nome || '',
          banco: contaData.banco || '',
          agencia: contaData.agencia || '',
          conta: contaData.conta || '',
          tipo: contaData.tipo || 'CORRENTE',
          saldoInicial: contaData.saldoInicial?.toString() || '0',
          cor: contaData.cor || '#1a365d',
          ativo: contaData.ativo ?? true,
        })
      } catch (err) {
        console.error('Erro ao carregar conta:', err)
        setError('Erro ao carregar dados da conta')
      } finally {
        setLoading(false)
      }
    }

    if (user && tenant && id) {
      loadConta()
    }
  }, [user, tenant, id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isFieldValid = (field: string) => {
    if (field === 'nome') return formData.nome.trim().length >= 3
    return true
  }

  const getFieldError = (field: string) => {
    if (!touched[field]) return null
    if (field === 'nome' && formData.nome.trim().length < 3) {
      return 'Nome deve ter pelo menos 3 caracteres'
    }
    return null
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

    if (!canEdit) {
      toast({
        title: 'Erro',
        description: 'Voce nao tem permissao para editar contas',
        variant: 'destructive',
      })
      return
    }

    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da conta e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)

    try {
      await financeiroService.contas.updateConta(id, {
        nome: formData.nome,
        banco: formData.banco || undefined,
        agencia: formData.agencia || undefined,
        conta: formData.conta || undefined,
        tipo: formData.tipo,
        saldoInicial: parseFloat(formData.saldoInicial) || 0,
        cor: formData.cor,
      })

      toast({
        title: 'Conta atualizada!',
        description: 'A conta bancaria foi atualizada com sucesso.',
      })

      router.push('/financeiro/contas')
    } catch (err) {
      console.error('Erro ao atualizar conta:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel atualizar a conta. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const tipoSelecionado = tipoOptions.find(t => t.tipo === formData.tipo)

  // Loading de autenticação ou dados
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    router.push('/login')
    return null
  }

  // Sem permissão
  if (!canEdit) {
    return (
      <div className="space-y-6">
        <Link
          href="/financeiro/contas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Contas
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <p className="text-red-600">Voce nao tem permissao para editar contas bancarias.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (error && !conta) {
    return (
      <div className="space-y-6">
        <Link
          href="/financeiro/contas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Contas
        </Link>
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4"
              variant="outline"
            >
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Breadcrumb */}
      <Link
        href="/financeiro/contas"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar para Contas
      </Link>

      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 p-6 text-white animate-fade-in-up">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Landmark className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Editar Conta Bancaria</h1>
            <p className="text-purple-100 text-sm md:text-base">
              Altere as informacoes da conta
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Formulário */}
        <Card className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Dados da Conta
            </CardTitle>
            <CardDescription>
              Edite as informacoes da conta bancaria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tipo de Conta - Cards Visuais */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Tipo de Conta</Label>
                <div className="grid grid-cols-2 gap-3">
                  {tipoOptions.map((opcao) => {
                    const Icon = opcao.icon
                    const isSelected = formData.tipo === opcao.tipo
                    return (
                      <button
                        key={opcao.tipo}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, tipo: opcao.tipo }))}
                        className={cn(
                          "relative p-4 rounded-xl border-2 text-left transition-all duration-200",
                          isSelected
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30 shadow-lg shadow-purple-500/20"
                            : "border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div
                          className={cn(
                            "p-2 rounded-lg w-fit mb-2",
                            isSelected ? "bg-purple-500/20" : "bg-slate-100 dark:bg-slate-800"
                          )}
                        >
                          <Icon
                            className="h-5 w-5"
                            style={{ color: isSelected ? opcao.cor : undefined }}
                          />
                        </div>
                        <p className={cn(
                          "font-medium",
                          isSelected && "text-purple-700 dark:text-purple-300"
                        )}>
                          {tipoContaLabels[opcao.tipo]}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {opcao.descricao}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Nome da Conta */}
              <div className="space-y-2">
                <Label htmlFor="nome" className="flex items-center gap-1">
                  Nome da Conta
                  <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="nome"
                    name="nome"
                    placeholder="Ex: Conta Principal"
                    value={formData.nome}
                    onChange={handleChange}
                    onBlur={() => handleBlur('nome')}
                    className={cn(
                      "pr-10 transition-all",
                      touched.nome && (isFieldValid('nome')
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "border-red-500 focus-visible:ring-red-500")
                    )}
                    required
                  />
                  {touched.nome && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isFieldValid('nome') ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {getFieldError('nome') && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError('nome')}
                  </p>
                )}
              </div>

              {/* Banco */}
              <div className="space-y-2">
                <Label htmlFor="banco">Banco</Label>
                <Input
                  id="banco"
                  name="banco"
                  placeholder="Ex: Banco do Brasil, Itau, Nubank..."
                  value={formData.banco}
                  onChange={handleChange}
                  className="transition-all"
                />
              </div>

              {/* Agência e Conta */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="agencia">Agencia</Label>
                  <Input
                    id="agencia"
                    name="agencia"
                    placeholder="Ex: 1234"
                    value={formData.agencia}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conta">Numero da Conta</Label>
                  <Input
                    id="conta"
                    name="conta"
                    placeholder="Ex: 12345-6"
                    value={formData.conta}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Saldo Inicial */}
              <div className="space-y-2">
                <Label htmlFor="saldoInicial">Saldo Inicial</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    id="saldoInicial"
                    name="saldoInicial"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.saldoInicial}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Cor de Identificação */}
              <div className="space-y-3">
                <Label>Cor de Identificacao</Label>
                <div className="flex flex-wrap gap-2">
                  {coresOptions.map((cor) => (
                    <button
                      key={cor.value}
                      type="button"
                      className={cn(
                        "w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110",
                        formData.cor === cor.value
                          ? 'border-slate-900 dark:border-white scale-110 ring-2 ring-offset-2'
                          : 'border-transparent'
                      )}
                      style={{
                        backgroundColor: cor.value,
                      }}
                      onClick={() => setFormData((prev) => ({ ...prev, cor: cor.value }))}
                      title={cor.label}
                    >
                      {formData.cor === cor.value && (
                        <Check className="h-5 w-5 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Ativo */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50 dark:bg-slate-900">
                <div>
                  <Label htmlFor="ativo" className="font-semibold">Conta Ativa</Label>
                  <p className="text-sm text-muted-foreground">
                    Contas inativas nao aparecem nas movimentacoes
                  </p>
                </div>
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, ativo: checked }))}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={saving}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/25 transition-all"
                  disabled={saving || !formData.nome.trim()}
                >
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alteracoes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview do Card */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="sticky top-6">
            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Preview da Conta
            </p>
            <Card className="overflow-hidden border-2 shadow-lg">
              {/* Barra colorida */}
              <div
                className="h-2"
                style={{ backgroundColor: formData.cor }}
              />

              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Ícone */}
                  <div
                    className="p-4 rounded-xl shadow-lg"
                    style={{
                      backgroundColor: `${formData.cor}20`,
                      border: `2px solid ${formData.cor}40`
                    }}
                  >
                    {tipoSelecionado && (
                      <tipoSelecionado.icon
                        className="h-7 w-7"
                        style={{ color: formData.cor }}
                      />
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {formData.nome || 'Nome da Conta'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.banco || 'Banco'}
                    </p>
                    {(formData.agencia || formData.conta) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formData.agencia && `Ag: ${formData.agencia}`}
                        {formData.agencia && formData.conta && ' | '}
                        {formData.conta && `Cc: ${formData.conta}`}
                      </p>
                    )}
                    <Badge
                      variant="outline"
                      className="mt-2 text-xs"
                      style={{
                        borderColor: `${formData.cor}50`,
                        color: formData.cor
                      }}
                    >
                      {tipoContaLabels[formData.tipo]}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-sm text-muted-foreground">Saldo Atual</span>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(conta?.saldoAtual || parseFloat(formData.saldoInicial) || 0)}
                      </p>
                    </div>
                    <Badge className={cn(
                      formData.ativo
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {formData.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              Assim ficara o card da sua conta
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
