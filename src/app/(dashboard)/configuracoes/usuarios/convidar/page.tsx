'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  UserPlus,
  Mail,
  User,
  Shield,
  Send,
  Info,
} from 'lucide-react'
import { perfilLabels } from '@/types/configuracoes'

const perfisDisponiveis = [
  {
    value: 'GESTOR',
    label: perfilLabels['GESTOR'],
    descricao: 'Acesso total ao tenant, pode gerenciar usuarios e configuracoes',
  },
  {
    value: 'COLABORADOR',
    label: perfilLabels['COLABORADOR'],
    descricao: 'Acesso padrao para colaboradores da empresa',
  },
  {
    value: 'CLIENTE',
    label: perfilLabels['CLIENTE'],
    descricao: 'Acesso limitado para visualizacao de projetos',
  },
]

export default function ConvidarUsuarioPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome || !formData.email || !formData.perfil) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatorios',
        variant: 'destructive',
      })
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Erro',
        description: 'Digite um e-mail valido',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/configuracoes/usuarios/convidar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Convite enviado com sucesso!',
        })
        router.push('/configuracoes/usuarios')
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao enviar convite',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao enviar convite:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao enviar convite',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/configuracoes/usuarios">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <UserPlus className="h-7 w-7 text-purple-600" />
            Convidar Usuario
          </h1>
          <p className="text-muted-foreground">
            Convide um novo usuario para a empresa
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Formulario */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Convite</CardTitle>
              <CardDescription>
                Preencha os dados do usuario que sera convidado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
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
                        className="pl-10"
                        placeholder="Nome do usuario"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
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
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      O convite sera enviado para este e-mail
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="perfil">Perfil de Acesso *</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                      <Select
                        value={formData.perfil}
                        onValueChange={(value) =>
                          setFormData({ ...formData, perfil: value })
                        }
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Selecione o perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          {perfisDisponiveis.map((perfil) => (
                            <SelectItem key={perfil.value} value={perfil.value}>
                              <div>
                                <p className="font-medium">{perfil.label}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.perfil && (
                    <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Info className="h-5 w-5 text-slate-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-sm">
                              {perfisDisponiveis.find((p) => p.value === formData.perfil)?.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {perfisDisponiveis.find((p) => p.value === formData.perfil)?.descricao}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Enviando...' : 'Enviar Convite'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Informacoes */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como funciona?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-bmv-primary text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium">Envio do Convite</p>
                  <p className="text-xs text-muted-foreground">
                    Um e-mail sera enviado para o usuario com um link de acesso
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-bmv-primary text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium">Criacao de Senha</p>
                  <p className="text-xs text-muted-foreground">
                    O usuario clica no link e cria sua senha de acesso
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-bmv-primary text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium">Acesso Liberado</p>
                  <p className="text-xs text-muted-foreground">
                    Apos criar a senha, o usuario pode acessar o sistema
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Importante
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    O convite expira em 7 dias. Caso expire, voce pode reenviar
                    pela lista de usuarios.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
