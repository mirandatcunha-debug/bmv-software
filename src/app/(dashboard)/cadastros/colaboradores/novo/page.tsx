'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  UserPlus,
  ArrowLeft,
  Save,
  X,
  Loader2,
  Mail,
  User,
  Shield,
  AlertCircle,
  CheckCircle,
  Crown,
  TrendingUp,
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface LimiteInfo {
  totalUsuarios: number
  limiteUsuarios: number
  plano: string
  atingiuLimite: boolean
}

export default function NovoColaboradorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingLimit, setCheckingLimit] = useState(true)
  const [limiteInfo, setLimiteInfo] = useState<LimiteInfo | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [conviteUrl, setConviteUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil: 'COLABORADOR',
  })

  // Verificar limite ao carregar a página
  useEffect(() => {
    const checkLimit = async () => {
      try {
        const response = await fetch('/api/cadastros/colaboradores')
        if (response.ok) {
          const data = await response.json()
          const atingiuLimite = data.limiteUsuarios !== -1 && data.totalUsuarios >= data.limiteUsuarios
          setLimiteInfo({
            totalUsuarios: data.totalUsuarios,
            limiteUsuarios: data.limiteUsuarios,
            plano: data.plano,
            atingiuLimite,
          })
        }
      } catch (error) {
        console.error('Erro ao verificar limite:', error)
      } finally {
        setCheckingLimit(false)
      }
    }
    checkLimit()
  }, [])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.perfil) {
      newErrors.perfil = 'Perfil é obrigatório'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const response = await fetch('/api/cadastros/colaboradores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        setConviteUrl(data.conviteUrl)
        // Não redirecionar imediatamente, mostrar URL do convite
      } else {
        if (data.error === 'Limite de usuários atingido') {
          setErrors({ submit: `${data.message}` })
        } else {
          setErrors({ submit: data.error || 'Erro ao criar colaborador' })
        }
      }
    } catch (error) {
      console.error('Erro ao criar colaborador:', error)
      setErrors({ submit: 'Erro ao criar colaborador' })
    } finally {
      setLoading(false)
    }
  }

  const handleVoltar = () => {
    router.push('/cadastros/colaboradores')
  }

  // Se ainda está verificando o limite
  if (checkingLimit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Se atingiu o limite
  if (limiteInfo?.atingiuLimite) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6 text-white">
          <div className="relative">
            <Link href="/cadastros/colaboradores" className="inline-flex items-center gap-2 text-orange-100 text-sm mb-3 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar para Colaboradores</span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Limite Atingido</h1>
                <p className="text-orange-100 text-sm md:text-base">
                  Faça upgrade para adicionar mais colaboradores
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Você atingiu o limite do seu plano</CardTitle>
            <CardDescription>
              Seu plano {limiteInfo.plano} permite até {limiteInfo.limiteUsuarios} usuários.
              Atualmente você tem {limiteInfo.totalUsuarios} usuários cadastrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Faça upgrade do seu plano para adicionar mais colaboradores e acessar recursos premium.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Link href="/configuracoes/planos" className="flex-1">
                <Button className="w-full">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </Link>
              <Button variant="outline" onClick={handleVoltar}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Se o convite foi criado com sucesso
  if (conviteUrl) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white">
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Colaborador Criado!</h1>
                <p className="text-green-100 text-sm md:text-base">
                  Convite enviado com sucesso
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Colaborador criado com sucesso</CardTitle>
            <CardDescription>
              Um convite foi gerado para {formData.nome}. Compartilhe o link abaixo para que ele possa acessar o sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Link de Convite</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={conviteUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(conviteUrl)
                    alert('Link copiado!')
                  }}
                >
                  Copiar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Este link é válido por 7 dias. O colaborador precisará acessá-lo para definir sua senha.
              </p>
            </div>

            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Por enquanto, o envio de email está desabilitado. Compartilhe o link manualmente com o colaborador.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleVoltar} className="flex-1">
                Voltar para Colaboradores
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConviteUrl(null)
                  setFormData({ nome: '', email: '', perfil: 'COLABORADOR' })
                }}
              >
                Adicionar Outro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Formulário normal
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 p-6 text-white animate-fade-in-up">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
        </div>

        <div className="relative">
          <Link href="/cadastros/colaboradores" className="inline-flex items-center gap-2 text-blue-100 text-sm mb-3 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Colaboradores</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Novo Colaborador</h1>
              <p className="text-blue-100 text-sm md:text-base">
                Adicione um novo membro à sua equipe
              </p>
            </div>
          </div>

          {/* Info do limite */}
          {limiteInfo && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm">
                {limiteInfo.totalUsuarios} de {limiteInfo.limiteUsuarios === -1 ? '∞' : limiteInfo.limiteUsuarios} usuários
              </span>
              <span className="text-xs text-blue-100">
                ({limiteInfo.limiteUsuarios === -1 ? 'Ilimitado' : `${limiteInfo.limiteUsuarios - limiteInfo.totalUsuarios} vagas disponíveis`})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Formulário */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <CardHeader>
          <CardTitle>Informações do Colaborador</CardTitle>
          <CardDescription>
            Preencha os dados do novo colaborador. Um convite será enviado para o email informado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo *
              </Label>
              <Input
                id="nome"
                placeholder="Ex: João da Silva"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                className={cn(errors.nome && "border-red-500")}
                disabled={loading}
              />
              {errors.nome && (
                <p className="text-sm text-red-500">{errors.nome}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: joao@empresa.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className={cn(errors.email && "border-red-500")}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Um convite será enviado para este email
              </p>
            </div>

            {/* Perfil */}
            <div className="space-y-2">
              <Label htmlFor="perfil" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Perfil *
              </Label>
              <Select
                value={formData.perfil}
                onValueChange={(value) => handleChange('perfil', value)}
                disabled={loading}
              >
                <SelectTrigger className={cn(errors.perfil && "border-red-500")}>
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COLABORADOR">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Colaborador</div>
                        <div className="text-xs text-muted-foreground">Acesso básico ao sistema</div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="GESTOR">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      <div>
                        <div className="font-medium">Gestor</div>
                        <div className="text-xs text-muted-foreground">Acesso completo e gerenciamento</div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.perfil && (
                <p className="text-sm text-red-500">{errors.perfil}</p>
              )}
            </div>

            {/* Info sobre convite */}
            <Alert>
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Após criar o colaborador, um link de convite será gerado. O colaborador terá 7 dias para aceitar o convite e definir sua senha.
              </AlertDescription>
            </Alert>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Colaborador
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleVoltar}
                disabled={loading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
