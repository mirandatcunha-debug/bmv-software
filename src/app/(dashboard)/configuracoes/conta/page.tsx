'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Camera,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Shield,
  Calendar,
  Upload,
} from 'lucide-react'
import { PerfilUsuario, perfilLabels } from '@/types/configuracoes'
import { cn } from '@/lib/utils'

export default function MinhaContaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  })

  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: '',
  })

  // Validação de senha
  const senhaValidations = {
    minLength: senhaData.novaSenha.length >= 6,
    hasUppercase: /[A-Z]/.test(senhaData.novaSenha),
    hasNumber: /[0-9]/.test(senhaData.novaSenha),
    matches: senhaData.novaSenha === senhaData.confirmarSenha && senhaData.confirmarSenha.length > 0,
  }

  const senhaStrength = Object.values(senhaValidations).filter(Boolean).length
  const senhaStrengthPercent = (senhaStrength / 4) * 100

  useEffect(() => {
    fetchPerfil()
  }, [])

  const fetchPerfil = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setPerfil(data)
        setFormData({
          nome: data.nome || '',
          email: data.email || '',
          telefone: data.telefone || '',
        })
      }
    } catch (error) {
      console.error('Erro ao buscar perfil:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do perfil',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSavePerfil = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome é obrigatório',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/configuracoes/conta', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Perfil atualizado com sucesso',
        })
        fetchPerfil()
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao atualizar perfil',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar perfil',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAlterarSenha = async () => {
    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive',
      })
      return
    }

    if (senhaData.novaSenha.length < 6) {
      toast({
        title: 'Erro',
        description: 'A nova senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/configuracoes/conta/senha', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senhaAtual: senhaData.senhaAtual,
          novaSenha: senhaData.novaSenha,
        }),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Senha alterada com sucesso',
        })
        setSenhaData({
          senhaAtual: '',
          novaSenha: '',
          confirmarSenha: '',
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao alterar senha',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao alterar senha',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const getInitials = (nome: string) => {
    return nome
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Configurações
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Minha Conta</h1>
            <p className="text-white/80">
              Gerencie suas informações pessoais e segurança
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Esquerda - Preview do Perfil */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-emerald-500 to-teal-500" />
            <CardContent className="pt-0 -mt-10 text-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg">
                  <AvatarImage src={perfil?.avatarUrl} />
                  <AvatarFallback className="bg-emerald-600 text-white text-2xl">
                    {perfil?.nome ? getInitials(perfil.nome) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-md hover:bg-slate-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>

              <h3 className="mt-4 font-semibold text-lg">{formData.nome || perfil?.nome}</h3>
              <p className="text-sm text-muted-foreground">{formData.email || perfil?.email}</p>

              <Badge className="mt-3 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                {perfil?.perfil ? perfilLabels[perfil.perfil] || perfil.perfil : ''}
              </Badge>

              <Separator className="my-4" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Membro desde
                  </span>
                  <span className="font-medium">
                    {perfil?.criadoEm
                      ? new Date(perfil.criadoEm).toLocaleDateString('pt-BR', {
                          month: 'short',
                          year: 'numeric',
                        })
                      : '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Status
                  </span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              </div>

              {perfil?.ultimoAcesso && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Último acesso:{' '}
                  {new Date(perfil.ultimoAcesso).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Dica de Upload */}
          <Card className="border-dashed bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Upload className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Foto de perfil</p>
                  <p className="text-xs text-muted-foreground">
                    Clique no ícone de câmera para fazer upload de uma nova foto. Formatos: JPG, PNG.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Formulários */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-600" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className={cn(
                        "pl-10",
                        formData.nome && "border-emerald-300 focus:border-emerald-500"
                      )}
                      placeholder="Seu nome completo"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      className="pl-10 bg-slate-50 dark:bg-slate-800"
                      placeholder="seu@email.com"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O e-mail não pode ser alterado
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: formatPhone(e.target.value) })
                      }
                      className="pl-10"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSavePerfil} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-600" />
                Alterar Senha
              </CardTitle>
              <CardDescription>
                Mantenha sua conta segura atualizando sua senha regularmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaAtual">Senha Atual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="senhaAtual"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={senhaData.senhaAtual}
                    onChange={(e) =>
                      setSenhaData({ ...senhaData, senhaAtual: e.target.value })
                    }
                    className="pl-10 pr-10"
                    placeholder="Digite sua senha atual"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="novaSenha"
                      type={showNewPassword ? 'text' : 'password'}
                      value={senhaData.novaSenha}
                      onChange={(e) =>
                        setSenhaData({ ...senhaData, novaSenha: e.target.value })
                      }
                      className="pl-10 pr-10"
                      placeholder="Digite a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmarSenha"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={senhaData.confirmarSenha}
                      onChange={(e) =>
                        setSenhaData({
                          ...senhaData,
                          confirmarSenha: e.target.value,
                        })
                      }
                      className={cn(
                        "pl-10 pr-10",
                        senhaValidations.matches && "border-green-300 focus:border-green-500"
                      )}
                      placeholder="Confirme a nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Validação visual da senha */}
              {senhaData.novaSenha && (
                <div className="space-y-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Força da senha</span>
                    <span className={cn(
                      "text-xs font-medium",
                      senhaStrength <= 1 ? "text-red-500" :
                      senhaStrength <= 2 ? "text-amber-500" :
                      senhaStrength <= 3 ? "text-blue-500" : "text-green-500"
                    )}>
                      {senhaStrength <= 1 ? "Fraca" :
                       senhaStrength <= 2 ? "Regular" :
                       senhaStrength <= 3 ? "Boa" : "Forte"}
                    </span>
                  </div>
                  <Progress
                    value={senhaStrengthPercent}
                    className={cn(
                      "h-2",
                      senhaStrength <= 1 ? "[&>div]:bg-red-500" :
                      senhaStrength <= 2 ? "[&>div]:bg-amber-500" :
                      senhaStrength <= 3 ? "[&>div]:bg-blue-500" : "[&>div]:bg-green-500"
                    )}
                  />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={cn("flex items-center gap-1", senhaValidations.minLength ? "text-green-600" : "text-muted-foreground")}>
                      {senhaValidations.minLength ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      Mínimo 6 caracteres
                    </div>
                    <div className={cn("flex items-center gap-1", senhaValidations.hasUppercase ? "text-green-600" : "text-muted-foreground")}>
                      {senhaValidations.hasUppercase ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      Uma letra maiúscula
                    </div>
                    <div className={cn("flex items-center gap-1", senhaValidations.hasNumber ? "text-green-600" : "text-muted-foreground")}>
                      {senhaValidations.hasNumber ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      Um número
                    </div>
                    <div className={cn("flex items-center gap-1", senhaValidations.matches ? "text-green-600" : "text-muted-foreground")}>
                      {senhaValidations.matches ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                      Senhas coincidem
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleAlterarSenha}
                  disabled={
                    saving ||
                    !senhaData.senhaAtual ||
                    !senhaData.novaSenha ||
                    !senhaData.confirmarSenha ||
                    !senhaValidations.matches
                  }
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {saving ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
