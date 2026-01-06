'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
      console.error('Erro ao buscar configuracoes:', error)
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
          description: 'Preferencias de aparencia salvas com sucesso',
        })
      } else {
        toast({
          title: 'Erro',
          description: 'Erro ao salvar preferencias',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao salvar preferencias',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !mounted) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bmv-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/configuracoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Palette className="h-7 w-7 text-pink-600" />
              Aparencia
            </h1>
            <p className="text-muted-foreground">
              Personalize o tema e visual do sistema
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Tema */}
        <Card>
          <CardHeader>
            <CardTitle>Tema</CardTitle>
            <CardDescription>
              Selecione o tema de cores do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={config.tema}
              onValueChange={(value) => handleTemaChange(value as Tema)}
              className="grid gap-4 md:grid-cols-3"
            >
              <Label
                htmlFor="light"
                className={cn(
                  'flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                  config.tema === 'light'
                    ? 'border-bmv-primary bg-bmv-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-full aspect-video rounded bg-white border border-slate-200 flex items-center justify-center">
                  <Sun className="h-8 w-8 text-amber-500" />
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="light" id="light" />
                  <span className="font-medium">{temaLabels.light}</span>
                </div>
              </Label>

              <Label
                htmlFor="dark"
                className={cn(
                  'flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                  config.tema === 'dark'
                    ? 'border-bmv-primary bg-bmv-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-full aspect-video rounded bg-slate-900 border border-slate-700 flex items-center justify-center">
                  <Moon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <span className="font-medium">{temaLabels.dark}</span>
                </div>
              </Label>

              <Label
                htmlFor="system"
                className={cn(
                  'flex flex-col items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all',
                  config.tema === 'system'
                    ? 'border-bmv-primary bg-bmv-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="w-full aspect-video rounded bg-gradient-to-r from-white to-slate-900 border border-slate-300 flex items-center justify-center">
                  <Monitor className="h-8 w-8 text-slate-500" />
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="system" id="system" />
                  <span className="font-medium">{temaLabels.system}</span>
                </div>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Cor Primaria */}
        <Card>
          <CardHeader>
            <CardTitle>Cor Primaria</CardTitle>
            <CardDescription>
              Escolha a cor principal do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {coresPrimarias.map((cor) => (
                <button
                  key={cor.value}
                  onClick={() => setConfig({ ...config, corPrimaria: cor.value })}
                  className={cn(
                    'relative aspect-square rounded-lg transition-all',
                    config.corPrimaria === cor.value
                      ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white'
                      : 'hover:scale-105'
                  )}
                  style={{ backgroundColor: cor.value }}
                  title={cor.label}
                >
                  {config.corPrimaria === cor.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-5 w-5 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Cor selecionada: {coresPrimarias.find((c) => c.value === config.corPrimaria)?.label || config.corPrimaria}
            </p>
          </CardContent>
        </Card>

        {/* Densidade */}
        <Card>
          <CardHeader>
            <CardTitle>Densidade da Interface</CardTitle>
            <CardDescription>
              Ajuste o espacamento entre os elementos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={config.densidade}
              onValueChange={(value) =>
                setConfig({ ...config, densidade: value as Densidade })
              }
              className="grid gap-4 md:grid-cols-3"
            >
              <Label
                htmlFor="compact"
                className={cn(
                  'flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all',
                  config.densidade === 'compact'
                    ? 'border-bmv-primary bg-bmv-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="compact" id="compact" />
                  <span className="font-medium">{densidadeLabels.compact}</span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mais conteudo visivel
                </p>
              </Label>

              <Label
                htmlFor="normal"
                className={cn(
                  'flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all',
                  config.densidade === 'normal'
                    ? 'border-bmv-primary bg-bmv-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="normal" id="normal" />
                  <span className="font-medium">{densidadeLabels.normal}</span>
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Balanceado (recomendado)
                </p>
              </Label>

              <Label
                htmlFor="comfortable"
                className={cn(
                  'flex flex-col gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all',
                  config.densidade === 'comfortable'
                    ? 'border-bmv-primary bg-bmv-primary/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="comfortable" id="comfortable" />
                  <span className="font-medium">{densidadeLabels.comfortable}</span>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-full"></div>
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
                  <div className="h-2 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mais espacoso
                </p>
              </Label>
            </RadioGroup>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
