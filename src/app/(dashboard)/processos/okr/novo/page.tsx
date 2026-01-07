'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
import {
  ArrowLeft,
  Target,
  Loader2,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  Check,
  User,
  BarChart3,
  Eye,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { PeriodoTipo } from '@/types/okr'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useTenant } from '@/hooks/use-tenant'
import { okrService } from '@/services/okr.service'

const trimestres = [
  { value: 'Q1', label: 'Q1 - Jan a Mar' },
  { value: 'Q2', label: 'Q2 - Abr a Jun' },
  { value: 'Q3', label: 'Q3 - Jul a Set' },
  { value: 'Q4', label: 'Q4 - Out a Dez' },
]

const anos = [2024, 2025, 2026, 2027]

// Usuarios mockados
const usuariosMock = [
  { id: '1', nome: 'João Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Pedro Costa' },
]

interface KeyResultForm {
  id: string
  titulo: string
  metrica: string
  baseline: string
  meta: string
}

const steps = [
  { id: 1, title: 'Objetivo', description: 'Defina o objetivo' },
  { id: 2, title: 'Key Results', description: 'Adicione os KRs' },
  { id: 3, title: 'Responsáveis', description: 'Atribua responsáveis' },
]

export default function NovoObjetivoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [usuarios] = useState(usuariosMock)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    responsavelId: '',
    periodoTipo: 'TRIMESTRE' as PeriodoTipo,
    trimestre: 'Q1',
    ano: new Date().getFullYear().toString(),
    dataInicio: '',
    dataFim: '',
  })

  const [keyResults, setKeyResults] = useState<KeyResultForm[]>([
    { id: '1', titulo: '', metrica: '', baseline: '', meta: '' },
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleKRChange = (id: string, field: keyof KeyResultForm, value: string) => {
    setKeyResults((prev) =>
      prev.map((kr) => (kr.id === id ? { ...kr, [field]: value } : kr))
    )
  }

  const addKeyResult = () => {
    setKeyResults((prev) => [
      ...prev,
      { id: Date.now().toString(), titulo: '', metrica: '', baseline: '', meta: '' },
    ])
  }

  const removeKeyResult = (id: string) => {
    if (keyResults.length > 1) {
      setKeyResults((prev) => prev.filter((kr) => kr.id !== id))
    }
  }

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.titulo.trim()) {
        toast({
          title: 'Erro',
          description: 'O título do objetivo é obrigatório',
          variant: 'destructive',
        })
        return false
      }
    }

    if (step === 2) {
      const hasEmptyKR = keyResults.some((kr) => !kr.titulo.trim() || !kr.metrica.trim())
      if (hasEmptyKR) {
        toast({
          title: 'Erro',
          description: 'Preencha título e métrica de todos os KRs',
          variant: 'destructive',
        })
        return false
      }
    }

    if (step === 3) {
      if (!formData.responsavelId) {
        toast({
          title: 'Erro',
          description: 'Selecione um responsável',
          variant: 'destructive',
        })
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
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

    if (!validateStep(3)) return

    setLoading(true)

    try {
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        donoId: formData.responsavelId,
        periodoTipo: formData.periodoTipo,
        ...(formData.periodoTipo === 'TRIMESTRE'
          ? {
              trimestre: formData.trimestre,
              ano: parseInt(formData.ano),
            }
          : {
              dataInicio: formData.dataInicio,
              dataFim: formData.dataFim,
            }),
      }

      const objetivo = await okrService.objetivos.createObjetivo(payload)

      // Criar os Key Results para o objetivo criado
      for (const kr of keyResults) {
        if (kr.titulo.trim()) {
          await okrService.keyResults.createKeyResult({
            objetivoId: objetivo.id,
            titulo: kr.titulo,
            metrica: kr.metrica,
            baseline: parseFloat(kr.baseline) || 0,
            meta: parseFloat(kr.meta) || 0,
          })
        }
      }

      toast({
        title: 'Objetivo criado!',
        description: 'Seu objetivo foi criado com sucesso.',
      })

      router.push(`/processos/okr/${objetivo.id}`)
    } catch (err) {
      console.error('Erro ao criar objetivo:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar o objetivo. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getResponsavelNome = () => {
    return usuarios.find((u) => u.id === formData.responsavelId)?.nome || '-'
  }

  // Loading de autenticação
  if (authLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Usuário não autenticado
  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Breadcrumb */}
      <Link
        href="/processos/okr"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para OKRs
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Target className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Novo Objetivo</h1>
            <p className="text-white/80">
              Crie um novo objetivo para acompanhar resultados
            </p>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                  currentStep === step.id
                    ? "bg-blue-600 text-white"
                    : currentStep > step.id
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                )}
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    currentStep === step.id
                      ? "bg-white text-blue-600"
                      : currentStep > step.id
                      ? "bg-green-500 text-white"
                      : "bg-slate-300 dark:bg-slate-600"
                  )}
                >
                  {currentStep > step.id ? <Check className="h-3 w-3" /> : step.id}
                </div>
                <div className="hidden sm:block">
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
              </div>
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 text-muted-foreground mx-2" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Objetivo */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    Dados do Objetivo
                  </CardTitle>
                  <CardDescription>
                    Defina o título e descrição do seu objetivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      name="titulo"
                      placeholder="Ex: Aumentar receita em 30%"
                      value={formData.titulo}
                      onChange={handleChange}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      Seja claro e objetivo. Um bom objetivo é inspirador e desafiador.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      name="descricao"
                      placeholder="Descreva o objetivo e sua importância..."
                      value={formData.descricao}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de Período</Label>
                    <Select
                      value={formData.periodoTipo}
                      onValueChange={(value: PeriodoTipo) =>
                        setFormData((prev) => ({ ...prev, periodoTipo: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TRIMESTRE">Trimestre</SelectItem>
                        <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.periodoTipo === 'TRIMESTRE' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Trimestre</Label>
                        <Select
                          value={formData.trimestre}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, trimestre: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {trimestres.map((t) => (
                              <SelectItem key={t.value} value={t.value}>
                                {t.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Ano</Label>
                        <Select
                          value={formData.ano}
                          onValueChange={(value) =>
                            setFormData((prev) => ({ ...prev, ano: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {anos.map((a) => (
                              <SelectItem key={a} value={a.toString()}>
                                {a}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dataInicio">Data Início *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dataInicio"
                            name="dataInicio"
                            type="date"
                            value={formData.dataInicio}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dataFim">Data Fim *</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dataFim"
                            name="dataFim"
                            type="date"
                            value={formData.dataFim}
                            onChange={handleChange}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 2: Key Results */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-blue-500" />
                        Key Results
                      </CardTitle>
                      <CardDescription>
                        Defina os resultados-chave mensuráveis
                      </CardDescription>
                    </div>
                    <Button type="button" variant="outline" onClick={addKeyResult}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar KR
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {keyResults.map((kr, index) => (
                    <div
                      key={kr.id}
                      className="p-4 rounded-xl border bg-slate-50 dark:bg-slate-800/50 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <span className="font-medium">Key Result {index + 1}</span>
                        </div>
                        {keyResults.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeKeyResult(kr.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label>Título *</Label>
                          <Input
                            placeholder="Ex: Aumentar MRR para R$ 150k"
                            value={kr.titulo}
                            onChange={(e) => handleKRChange(kr.id, 'titulo', e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Métrica *</Label>
                          <Input
                            placeholder="Ex: Receita mensal recorrente em reais"
                            value={kr.metrica}
                            onChange={(e) => handleKRChange(kr.id, 'metrica', e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Valor Base</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 100000"
                              value={kr.baseline}
                              onChange={(e) => handleKRChange(kr.id, 'baseline', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Meta</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 150000"
                              value={kr.meta}
                              onChange={(e) => handleKRChange(kr.id, 'meta', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addKeyResult}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar mais um Key Result
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Responsáveis */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    Responsáveis
                  </CardTitle>
                  <CardDescription>
                    Defina quem será o dono deste objetivo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="responsavelId">Responsável Principal *</Label>
                    <Select
                      value={formData.responsavelId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, responsavelId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <User className="h-3 w-3 text-blue-600" />
                              </div>
                              {user.nome}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      O responsável será o dono do objetivo e receberá notificações sobre o progresso.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={currentStep === 1 ? () => router.back() : prevStep}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {currentStep === 1 ? 'Cancelar' : 'Voltar'}
              </Button>

              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                  Próximo
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Objetivo
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="h-4 w-4 text-blue-500" />
                Preview
              </CardTitle>
              <CardDescription>
                Visualize como ficará seu objetivo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Objetivo Preview */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-500 shrink-0">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                      {formData.titulo || 'Título do objetivo'}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {formData.descricao || 'Descrição do objetivo...'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formData.periodoTipo === 'TRIMESTRE'
                          ? `${formData.trimestre} ${formData.ano}`
                          : 'Período personalizado'}
                      </span>
                      {formData.responsavelId && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getResponsavelNome()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* KRs Preview */}
              <div className="space-y-2">
                <h5 className="font-medium text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Key Results ({keyResults.filter((kr) => kr.titulo).length})
                </h5>
                {keyResults.filter((kr) => kr.titulo).length > 0 ? (
                  keyResults
                    .filter((kr) => kr.titulo)
                    .map((kr, index) => (
                      <div
                        key={kr.id}
                        className="p-3 rounded-lg border bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex items-start gap-2">
                          <Badge variant="outline" className="shrink-0 bg-blue-50 text-blue-700 border-blue-200">
                            KR{index + 1}
                          </Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{kr.titulo}</p>
                            {kr.metrica && (
                              <p className="text-xs text-muted-foreground truncate">{kr.metrica}</p>
                            )}
                            {(kr.baseline || kr.meta) && (
                              <p className="text-xs text-blue-600 mt-1">
                                {kr.baseline || '0'} → {kr.meta || '0'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Adicione Key Results no passo 2
                  </p>
                )}
              </div>

              {/* Status Preview */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                    Não Iniciado
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold">0%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div className="h-full w-0 bg-blue-500 rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
