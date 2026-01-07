'use client'

import { useState, useEffect, use } from 'react'
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
  Plus,
  Trash2,
  User,
  BarChart3,
  Edit,
  Save,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { PeriodoTipo, StatusOKR, statusLabels } from '@/types/okr'
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

const usuariosMock = [
  { id: '1', nome: 'Joao Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Pedro Costa' },
]

interface KeyResultForm {
  id: string
  titulo: string
  metrica: string
  baseline: string
  meta: string
  atual: string
  isNew?: boolean
}

interface EditarObjetivoPageProps {
  params: Promise<{ id: string }>
}

export default function EditarObjetivoPage({ params }: EditarObjetivoPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading: authLoading } = useAuth()
  const { tenant } = useTenant()

  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    status: 'NAO_INICIADO' as StatusOKR,
  })

  const [keyResults, setKeyResults] = useState<KeyResultForm[]>([])

  // Carregar dados do objetivo
  useEffect(() => {
    async function loadObjetivo() {
      try {
        setLoadingData(true)
        setError(null)

        // Simulando dados mockados por enquanto
        // Em produção, usar: const objetivo = await okrService.objetivos.getObjetivo(resolvedParams.id)
        await new Promise(resolve => setTimeout(resolve, 500))

        // Mock data
        setFormData({
          titulo: 'Aumentar receita recorrente em 30%',
          descricao: 'Expandir a base de clientes e aumentar o ticket medio atraves de upselling e cross-selling.',
          responsavelId: '1',
          periodoTipo: 'TRIMESTRE',
          trimestre: 'Q1',
          ano: '2026',
          dataInicio: '',
          dataFim: '',
          status: 'EM_ANDAMENTO',
        })

        setKeyResults([
          { id: 'kr1', titulo: 'Aumentar MRR para R$ 150k', metrica: 'MRR em reais', baseline: '100000', meta: '150000', atual: '132000' },
          { id: 'kr2', titulo: 'Conquistar 20 novos clientes', metrica: 'Numero de clientes', baseline: '0', meta: '20', atual: '14' },
        ])
      } catch (err) {
        console.error('Erro ao carregar objetivo:', err)
        setError('Erro ao carregar dados do objetivo')
      } finally {
        setLoadingData(false)
      }
    }

    if (user && tenant && resolvedParams.id) {
      loadObjetivo()
    }
  }, [user, tenant, resolvedParams.id])

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
      { id: `new-${Date.now()}`, titulo: '', metrica: '', baseline: '', meta: '', atual: '0', isNew: true },
    ])
  }

  const removeKeyResult = (id: string) => {
    setKeyResults((prev) => prev.filter((kr) => kr.id !== id))
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

    if (!formData.titulo.trim()) {
      toast({
        title: 'Erro',
        description: 'O titulo do objetivo e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      // Atualizar objetivo
      await okrService.objetivos.updateObjetivo(resolvedParams.id, {
        titulo: formData.titulo,
        descricao: formData.descricao,
        donoId: formData.responsavelId,
        periodoTipo: formData.periodoTipo,
        status: formData.status,
        ...(formData.periodoTipo === 'TRIMESTRE'
          ? {
              trimestre: formData.trimestre,
              ano: parseInt(formData.ano),
            }
          : {
              dataInicio: formData.dataInicio,
              dataFim: formData.dataFim,
            }),
      })

      // Criar novos KRs
      for (const kr of keyResults.filter(k => k.isNew && k.titulo.trim())) {
        await okrService.keyResults.createKeyResult({
          objetivoId: resolvedParams.id,
          titulo: kr.titulo,
          metrica: kr.metrica,
          baseline: parseFloat(kr.baseline) || 0,
          meta: parseFloat(kr.meta) || 0,
        })
      }

      // Atualizar KRs existentes
      for (const kr of keyResults.filter(k => !k.isNew && k.titulo.trim())) {
        await okrService.keyResults.updateKeyResult(kr.id, {
          titulo: kr.titulo,
          metrica: kr.metrica,
          baseline: parseFloat(kr.baseline) || 0,
          meta: parseFloat(kr.meta) || 0,
          atual: parseFloat(kr.atual) || 0,
        })
      }

      toast({
        title: 'Objetivo atualizado!',
        description: 'As alteracoes foram salvas com sucesso.',
      })

      router.push(`/processos/okr/${resolvedParams.id}`)
    } catch (err) {
      console.error('Erro ao atualizar objetivo:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(errorMessage)
      toast({
        title: 'Erro',
        description: 'Nao foi possivel atualizar o objetivo. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Loading de autenticacao ou dados
  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Usuario nao autenticado
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
        href={`/processos/okr/${resolvedParams.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Objetivo
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Edit className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Editar Objetivo</h1>
            <p className="text-white/80">
              Altere os dados do objetivo e Key Results
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados do Objetivo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Dados do Objetivo
            </CardTitle>
            <CardDescription>
              Altere o titulo e descricao do objetivo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Titulo *</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ex: Aumentar receita em 30%"
                value={formData.titulo}
                onChange={handleChange}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descricao</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva o objetivo e sua importancia..."
                value={formData.descricao}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: StatusOKR) =>
                    setFormData((prev) => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Responsavel</Label>
                <Select
                  value={formData.responsavelId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, responsavelId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {usuarios.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Periodo</Label>
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
                  <Label htmlFor="dataInicio">Data Inicio</Label>
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
                  <Label htmlFor="dataFim">Data Fim</Label>
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

        {/* Key Results */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Key Results
                </CardTitle>
                <CardDescription>
                  Gerencie os resultados-chave do objetivo
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
                className={cn(
                  "p-4 rounded-xl border space-y-4",
                  kr.isNew ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200" : "bg-slate-50 dark:bg-slate-800/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <span className="font-medium">
                      Key Result {index + 1}
                      {kr.isNew && <Badge className="ml-2 text-xs bg-blue-600">Novo</Badge>}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKeyResult(kr.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Titulo *</Label>
                    <Input
                      placeholder="Ex: Aumentar MRR para R$ 150k"
                      value={kr.titulo}
                      onChange={(e) => handleKRChange(kr.id, 'titulo', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Metrica *</Label>
                    <Input
                      placeholder="Ex: Receita mensal recorrente em reais"
                      value={kr.metrica}
                      onChange={(e) => handleKRChange(kr.id, 'metrica', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
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
                    <div className="space-y-2">
                      <Label>Atual</Label>
                      <Input
                        type="number"
                        placeholder="Ex: 132000"
                        value={kr.atual}
                        onChange={(e) => handleKRChange(kr.id, 'atual', e.target.value)}
                        disabled={kr.isNew}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {keyResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nenhum Key Result cadastrado</p>
                <Button type="button" variant="link" onClick={addKeyResult} className="text-blue-600">
                  Adicionar primeiro KR
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botoes */}
        <div className="flex justify-between">
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
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Salvar Alteracoes
          </Button>
        </div>
      </form>
    </div>
  )
}
