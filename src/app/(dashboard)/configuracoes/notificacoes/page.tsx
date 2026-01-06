'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Bell,
  Mail,
  Monitor,
  Save,
  CheckCircle,
  Calendar,
  FileText,
} from 'lucide-react'
import { ConfiguracoesNotificacao } from '@/types/configuracoes'

export default function NotificacoesPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [config, setConfig] = useState<ConfiguracoesNotificacao>({
    emailTarefaAtribuida: true,
    emailPrazoProximo: true,
    emailResumoSemanal: false,
    notificacaoSistema: true,
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/configuracoes/notificacoes')
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

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/configuracoes/notificacoes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Preferencias de notificacao salvas com sucesso',
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

  if (loading) {
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
              <Bell className="h-7 w-7 text-amber-600" />
              Notificacoes
            </h1>
            <p className="text-muted-foreground">
              Configure suas preferencias de notificacao
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Notificacoes por E-mail */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Notificacoes por E-mail
            </CardTitle>
            <CardDescription>
              Escolha quais notificacoes deseja receber por e-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <Label htmlFor="emailTarefaAtribuida" className="font-medium">
                    Tarefa Atribuida
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um e-mail quando uma nova tarefa for atribuida a voce
                  </p>
                </div>
              </div>
              <Switch
                id="emailTarefaAtribuida"
                checked={config.emailTarefaAtribuida}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, emailTarefaAtribuida: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <Label htmlFor="emailPrazoProximo" className="font-medium">
                    Prazo Proximo
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um lembrete quando uma tarefa estiver proxima do prazo
                  </p>
                </div>
              </div>
              <Switch
                id="emailPrazoProximo"
                checked={config.emailPrazoProximo}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, emailPrazoProximo: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <FileText className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <Label htmlFor="emailResumoSemanal" className="font-medium">
                    Resumo Semanal
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba um resumo semanal das atividades e tarefas pendentes
                  </p>
                </div>
              </div>
              <Switch
                id="emailResumoSemanal"
                checked={config.emailResumoSemanal}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, emailResumoSemanal: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificacoes do Sistema */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Notificacoes do Sistema
            </CardTitle>
            <CardDescription>
              Configure as notificacoes exibidas dentro do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Bell className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <Label htmlFor="notificacaoSistema" className="font-medium">
                    Notificacoes em Tempo Real
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificacoes no sistema sobre atualizacoes importantes
                  </p>
                </div>
              </div>
              <Switch
                id="notificacaoSistema"
                checked={config.notificacaoSistema}
                onCheckedChange={(checked) =>
                  setConfig({ ...config, notificacaoSistema: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                  Sobre as notificacoes por e-mail
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Os e-mails sao enviados para o endereco cadastrado na sua conta.
                  Voce pode alterar seu e-mail nas configuracoes de conta.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
