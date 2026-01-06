'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
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
} from 'lucide-react'
import { PerfilUsuario, perfilLabels } from '@/types/configuracoes'

export default function MinhaContaPage() {
  const router = useRouter()
  const { toast } = useToast()
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
        description: 'As senhas nao coincidem',
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
      <div className="flex items-center gap-4">
        <Link href="/configuracoes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User className="h-7 w-7 text-bmv-primary" />
            Minha Conta
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas informacoes pessoais
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna Esquerda - Avatar e Info */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={perfil?.avatarUrl} />
                  <AvatarFallback className="bg-bmv-primary text-white text-2xl">
                    {perfil?.nome ? getInitials(perfil.nome) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h3 className="mt-4 font-semibold text-lg">{perfil?.nome}</h3>
              <p className="text-sm text-muted-foreground">{perfil?.email}</p>
              <div className="mt-2 px-3 py-1 bg-bmv-primary/10 text-bmv-primary rounded-full text-xs font-medium">
                {perfil?.perfil ? perfilLabels[perfil.perfil] || perfil.perfil : ''}
              </div>

              {perfil?.ultimoAcesso && (
                <p className="mt-4 text-xs text-muted-foreground">
                  Ultimo acesso:{' '}
                  {new Date(perfil.ultimoAcesso).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coluna Direita - Formularios */}
        <div className="md:col-span-2 space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informacoes de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className="pl-10"
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
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="pl-10"
                      placeholder="seu@email.com"
                      disabled
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    O e-mail nao pode ser alterado
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
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                      className="pl-10"
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSavePerfil} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alteracoes'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Alterar Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
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
                      className="pl-10 pr-10"
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

              <div className="flex justify-end">
                <Button
                  onClick={handleAlterarSenha}
                  disabled={
                    saving ||
                    !senhaData.senhaAtual ||
                    !senhaData.novaSenha ||
                    !senhaData.confirmarSenha
                  }
                  variant="outline"
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
