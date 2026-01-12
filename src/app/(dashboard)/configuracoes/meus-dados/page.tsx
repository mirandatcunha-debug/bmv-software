'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Shield,
  User,
  Mail,
  Building2,
  Calendar,
  Download,
  FileJson,
  FileSpreadsheet,
  Trash2,
  AlertTriangle,
  Bell,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface UserData {
  id: string
  nome: string
  email: string
  empresa?: string
  criadoEm: string
  consentimentos: {
    termosUso: { aceito: boolean; data: string }
    politicaPrivacidade: { aceito: boolean; data: string }
    comunicacaoMarketing?: { aceito: boolean; data: string }
  }
}

interface CommunicationPreferences {
  emailNovidades: boolean
  emailDicasUso: boolean
}

export default function MeusDadosPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [preferences, setPreferences] = useState<CommunicationPreferences>({
    emailNovidades: true,
    emailDicasUso: true,
  })
  const [savingPreferences, setSavingPreferences] = useState(false)
  const [exportingJson, setExportingJson] = useState(false)
  const [exportingCsv, setExportingCsv] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setUserData({
            id: data.id,
            nome: data.nome,
            email: data.email,
            empresa: data.empresa?.nome || 'Não vinculado',
            criadoEm: data.criadoEm,
            consentimentos: {
              termosUso: { aceito: true, data: data.criadoEm },
              politicaPrivacidade: { aceito: true, data: data.criadoEm },
              comunicacaoMarketing: { aceito: false, data: data.criadoEm },
            },
          })
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar seus dados',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [toast])

  const handleExportJson = async () => {
    setExportingJson(true)
    try {
      // Simula preparação dos dados
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const dataToExport = {
        exportadoEm: new Date().toISOString(),
        usuario: userData,
        preferencias: preferences,
      }

      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meus-dados-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Exportação concluída',
        description: 'Seus dados foram exportados em formato JSON',
      })
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar seus dados',
        variant: 'destructive',
      })
    } finally {
      setExportingJson(false)
    }
  }

  const handleExportCsv = async () => {
    setExportingCsv(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const csvContent = [
        ['Campo', 'Valor'],
        ['Nome', userData?.nome || ''],
        ['Email', userData?.email || ''],
        ['Empresa', userData?.empresa || ''],
        ['Data de Cadastro', userData?.criadoEm ? new Date(userData.criadoEm).toLocaleDateString('pt-BR') : ''],
        ['Termos de Uso Aceitos', userData?.consentimentos.termosUso.aceito ? 'Sim' : 'Não'],
        ['Política de Privacidade Aceita', userData?.consentimentos.politicaPrivacidade.aceito ? 'Sim' : 'Não'],
        ['Email Novidades', preferences.emailNovidades ? 'Ativado' : 'Desativado'],
        ['Email Dicas de Uso', preferences.emailDicasUso ? 'Ativado' : 'Desativado'],
      ]
        .map((row) => row.join(','))
        .join('\n')

      const blob = new Blob(['\ufeff' + csvContent], {
        type: 'text/csv;charset=utf-8',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meus-dados-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Exportação concluída',
        description: 'Seus dados foram exportados em formato CSV',
      })
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível exportar seus dados',
        variant: 'destructive',
      })
    } finally {
      setExportingCsv(false)
    }
  }

  const handleSavePreferences = async () => {
    setSavingPreferences(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      toast({
        title: 'Preferências salvas',
        description: 'Suas preferências de comunicação foram atualizadas',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar as preferências',
        variant: 'destructive',
      })
    } finally {
      setSavingPreferences(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'EXCLUIR') return

    setDeletingAccount(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast({
        title: 'Solicitação enviada',
        description: 'Sua solicitação de exclusão foi registrada. Você receberá um email de confirmação.',
      })
      setDeleteDialogOpen(false)
      setDeleteConfirmation('')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível processar sua solicitação',
        variant: 'destructive',
      })
    } finally {
      setDeletingAccount(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Configurações
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Meus Dados Pessoais</h1>
            <p className="text-white/80">
              Gerencie seus dados conforme a Lei Geral de Proteção de Dados (LGPD)
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Seção: Seus Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-teal-600" />
              Seus Dados
            </CardTitle>
            <CardDescription>
              Informações pessoais armazenadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{userData?.nome}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{userData?.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Empresa</p>
                  <p className="font-medium">{userData?.empresa}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Data de cadastro</p>
                  <p className="font-medium">
                    {userData?.criadoEm ? formatDate(userData.criadoEm) : '-'}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-3">Consentimentos</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Termos de Uso</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {userData?.consentimentos.termosUso.data
                      ? formatDate(userData.consentimentos.termosUso.data)
                      : '-'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Política de Privacidade</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {userData?.consentimentos.politicaPrivacidade.data
                      ? formatDate(userData.consentimentos.politicaPrivacidade.data)
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Exportar Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Download className="h-5 w-5 text-blue-600" />
              Exportar Dados
            </CardTitle>
            <CardDescription>
              Baixe uma cópia de todos os seus dados armazenados no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Conforme a LGPD, você tem o direito de receber uma cópia de todos os dados
              pessoais que mantemos sobre você. Escolha o formato desejado:
            </p>

            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={handleExportJson}
                disabled={exportingJson}
              >
                {exportingJson ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileJson className="h-5 w-5 text-amber-600" />
                )}
                <div className="text-left">
                  <p className="font-medium">Exportar meus dados (JSON)</p>
                  <p className="text-xs text-muted-foreground">
                    Formato legível por máquinas e outros sistemas
                  </p>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={handleExportCsv}
                disabled={exportingCsv}
              >
                {exportingCsv ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                )}
                <div className="text-left">
                  <p className="font-medium">Exportar meus dados (CSV)</p>
                  <p className="text-xs text-muted-foreground">
                    Formato compatível com Excel e planilhas
                  </p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Preferências de Comunicação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-amber-600" />
              Preferências de Comunicação
            </CardTitle>
            <CardDescription>
              Escolha quais tipos de comunicação deseja receber
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="email-novidades" className="font-medium">
                    Receber emails de novidades
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Novos recursos, atualizações e melhorias do sistema
                  </p>
                </div>
                <Switch
                  id="email-novidades"
                  checked={preferences.emailNovidades}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, emailNovidades: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="space-y-0.5">
                  <Label htmlFor="email-dicas" className="font-medium">
                    Receber emails de dicas de uso
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Dicas para aproveitar melhor o sistema
                  </p>
                </div>
                <Switch
                  id="email-dicas"
                  checked={preferences.emailDicasUso}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({ ...prev, emailDicasUso: checked }))
                  }
                />
              </div>
            </div>

            <Button
              onClick={handleSavePreferences}
              disabled={savingPreferences}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {savingPreferences ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar preferências'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Seção: Excluir Conta */}
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-red-600">
              <Trash2 className="h-5 w-5" />
              Excluir Conta
            </CardTitle>
            <CardDescription>
              Solicite a exclusão permanente de sua conta e dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Esta ação é irreversível</AlertTitle>
              <AlertDescription>
                Ao solicitar a exclusão da sua conta, todos os seus dados serão
                permanentemente removidos do sistema.
              </AlertDescription>
            </Alert>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-slate-700 dark:text-slate-300">
                O que será excluído:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Seus dados pessoais (nome, email, telefone)</li>
                <li>Histórico de atividades e logs</li>
                <li>Preferências e configurações</li>
                <li>Acesso a todos os recursos do sistema</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Solicitar exclusão da conta
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Exclusão da Conta
            </DialogTitle>
            <DialogDescription>
              Esta ação é permanente e não pode ser desfeita. Todos os seus dados
              serão excluídos do sistema.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Para confirmar, digite <strong>EXCLUIR</strong> no campo abaixo.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirm-delete">Confirmação</Label>
              <Input
                id="confirm-delete"
                placeholder="Digite EXCLUIR para confirmar"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setDeleteConfirmation('')
              }}
              disabled={deletingAccount}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'EXCLUIR' || deletingAccount}
            >
              {deletingAccount ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirmar Exclusão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
