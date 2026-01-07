'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Palette,
  Sun,
  Moon,
  Monitor,
  Save,
  Check,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Sparkles,
} from 'lucide-react'
import {
  ConfiguracoesAparencia,
  Tema,
  Densidade,
  temaLabels,
  densidadeLabels,
  coresPrimarias,
} from '@/types/configuracoes'

export default function AparenciaPage() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  const [config, setConfig] = useState<ConfiguracoesAparencia>({
    tema: 'system',
    corPrimaria: '#1a365d',
    densidade: 'normal',
  })

  useEffect(() => {
    setMounted(true)
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/configuracoes/aparencia')
      if (response.ok) {
        const data = await response.json()
        setConfig(data)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTemaChange = (value: Tema) => {
    setConfig({ ...config, tema: value })
    setTheme(value)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/configuracoes/aparencia', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Preferências de aparência salvas com sucesso',
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao salvar preferências',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar preferências',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-pink-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Configurações
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Palette className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Aparência</h1>
                <Badge className="bg-white/20 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Novo
                </Badge>
              </div>
              <p className="text-white/80">
                Personalize o tema e visual do sistema
              </p>
            </div>
          </div>
          <Button onClick={handleSave} disabled={saving} className="bg-white text-pink-600 hover:bg-white/90">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Preview em tempo real */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-pink-600" />
            Preview em Tempo Real
          </CardTitle>
          <CardDescription>
            Veja como suas alterações aparecerão no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className={cn(
            "rounded-xl border overflow-hidden shadow-lg",
            theme === 'dark' ? 'bg-slate-900' : 'bg-white'
          )}>
            {/* Barra lateral simulada */}
            <div className="flex">
              <div
                className="w-16 p-3 flex flex-col items-center gap-4"
                style={{ backgroundColor: config.corPrimaria }}
              >
                <div className="w-8 h-8 rounded-lg bg-white/20" />
                <div className="w-6 h-6 rounded bg-white/20" />
                <div className="w-6 h-6 rounded bg-white/30" />
                <div className="w-6 h-6 rounded bg-white/20" />
              </div>
              {/* Conteúdo simulado */}
              <div className={cn(
                "flex-1 p-4",
                config.densidade === 'compact' ? 'space-y-2' :
                config.densidade === 'comfortable' ? 'space-y-6' : 'space-y-4'
              )}>
                <div className={cn(
                  "rounded-lg",
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100',
                  config.densidade === 'compact' ? 'h-6' :
                  config.densidade === 'comfortable' ? 'h-10' : 'h-8'
                )} />
                <div className="grid grid-cols-3 gap-3">
                  <div className={cn(
                    "rounded-lg",
                    theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100',
                    config.densidade === 'compact' ? 'h-12' :
                    config.densidade === 'comfortable' ? 'h-20' : 'h-16'
                  )} />
                  <div className={cn(
                    "rounded-lg",
                    theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100',
                    config.densidade === 'compact' ? 'h-12' :
                    config.densidade === 'comfortable' ? 'h-20' : 'h-16'
                  )} />
                  <div className={cn(
                    "rounded-lg",
                    theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100',
                    config.densidade === 'compact' ? 'h-12' :
                    config.densidade === 'comfortable' ? 'h-20' : 'h-16'
                  )} />
                </div>
                <div className={cn(
                  "rounded-lg",
                  theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100',
                  config.densidade === 'compact' ? 'h-20' :
                  config.densidade === 'comfortable' ? 'h-32' : 'h-24'
                )} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              Tema
            </CardTitle>
            <CardDescription>
              Selecione o tema de cores do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={config.tema}
              onValueChange={(value) => handleTemaChange(value as Tema)}
              className="grid gap-4"
            >
              <Label
                htmlFor="light"
                className={cn(
                  'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
                  config.tema === 'light'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                  <Sun className="h-6 w-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="light" id="light" />
                    <span className="font-medium">{temaLabels.light}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Fundo claro com texto escuro</p>
                </div>
                {config.tema === 'light' && (
                  <Check className="h-5 w-5 text-pink-500" />
                )}
              </Label>

              <Label
                htmlFor="dark"
                className={cn(
                  'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
                  config.tema === 'dark'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-sm">
                  <Moon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <span className="font-medium">{temaLabels.dark}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Fundo escuro, ideal para ambientes com pouca luz</p>
                </div>
                {config.tema === 'dark' && (
                  <Check className="h-5 w-5 text-pink-500" />
                )}
              </Label>

              <Label
                htmlFor="system"
                className={cn(
                  'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
                  config.tema === 'system'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white to-slate-900 border border-slate-300 flex items-center justify-center shadow-sm">
                  <Monitor className="h-6 w-6 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="system" id="system" />
                    <span className="font-medium">{temaLabels.system}</span>
                    <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Acompanha a preferência do seu dispositivo</p>
                </div>
                {config.tema === 'system' && (
                  <Check className="h-5 w-5 text-pink-500" />
                )}
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Densidade */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-indigo-500" />
              Densidade da Interface
            </CardTitle>
            <CardDescription>
              Ajuste o espaçamento entre os elementos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={config.densidade}
              onValueChange={(value) =>
                setConfig({ ...config, densidade: value as Densidade })
              }
              className="grid gap-4"
            >
              <Label
                htmlFor="compact"
                className={cn(
                  'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
                  config.densidade === 'compact'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Minimize2 className="h-6 w-6 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="compact" id="compact" />
                    <span className="font-medium">{densidadeLabels.compact}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Mais conteúdo visível na tela</p>
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 bg-slate-300 dark:bg-slate-600 rounded w-full" />
                    <div className="h-1.5 bg-slate-300 dark:bg-slate-600 rounded w-3/4" />
                  </div>
                </div>
                {config.densidade === 'compact' && (
                  <Check className="h-5 w-5 text-pink-500" />
                )}
              </Label>

              <Label
                htmlFor="normal"
                className={cn(
                  'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
                  config.densidade === 'normal'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <LayoutGrid className="h-6 w-6 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="normal" id="normal" />
                    <span className="font-medium">{densidadeLabels.normal}</span>
                    <Badge variant="secondary" className="text-xs">Recomendado</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Espaçamento balanceado</p>
                  <div className="mt-2 space-y-2">
                    <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-full" />
                    <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-3/4" />
                  </div>
                </div>
                {config.densidade === 'normal' && (
                  <Check className="h-5 w-5 text-pink-500" />
                )}
              </Label>

              <Label
                htmlFor="comfortable"
                className={cn(
                  'flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all',
                  config.densidade === 'comfortable'
                    ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Maximize2 className="h-6 w-6 text-slate-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="comfortable" id="comfortable" />
                    <span className="font-medium">{densidadeLabels.comfortable}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Mais espaçoso e confortável</p>
                  <div className="mt-2 space-y-3">
                    <div className="h-2.5 bg-slate-300 dark:bg-slate-600 rounded w-full" />
                    <div className="h-2.5 bg-slate-300 dark:bg-slate-600 rounded w-3/4" />
                  </div>
                </div>
                {config.densidade === 'comfortable' && (
                  <Check className="h-5 w-5 text-pink-500" />
                )}
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>

      {/* Cor Primária */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-pink-600" />
            Cor Primária
          </CardTitle>
          <CardDescription>
            Escolha a cor principal do sistema (aplicada à barra lateral e elementos de destaque)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {coresPrimarias.map((cor) => (
              <button
                key={cor.value}
                onClick={() => setConfig({ ...config, corPrimaria: cor.value })}
                className={cn(
                  'relative aspect-square rounded-xl transition-all group',
                  config.corPrimaria === cor.value
                    ? 'ring-2 ring-offset-4 ring-pink-500 scale-110'
                    : 'hover:scale-105 hover:shadow-lg'
                )}
                style={{ backgroundColor: cor.value }}
                title={cor.label}
              >
                {config.corPrimaria === cor.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-6 w-6 text-white drop-shadow-lg" />
                  </div>
                )}
                <span className="sr-only">{cor.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: config.corPrimaria }}
            />
            Cor selecionada: {coresPrimarias.find((c) => c.value === config.corPrimaria)?.label || config.corPrimaria}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
