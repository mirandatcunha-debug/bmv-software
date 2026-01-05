'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Building2,
  AlertTriangle
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface ConviteData {
  valid: boolean
  nome?: string
  email?: string
  empresa?: string
  expired?: boolean
  message?: string
}

export default function ConvitePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [conviteData, setConviteData] = useState<ConviteData | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activated, setActivated] = useState(false)

  const [formData, setFormData] = useState({
    senha: '',
    confirmarSenha: '',
  })

  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/convite/${token}`)
      const data = await response.json()
      setConviteData(data)
    } catch (error) {
      setConviteData({ valid: false, message: 'Erro ao validar convite' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.senha.length < 6) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 6 caracteres',
        variant: 'destructive',
      })
      return
    }

    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: 'Erro',
        description: 'As senhas nao conferem',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch(`/api/convite/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha: formData.senha }),
      })

      if (!response.ok) {
        throw new Error('Erro ao ativar conta')
      }

      setActivated(true)
      toast({
        title: 'Conta ativada!',
        description: 'Voce sera redirecionado para o login.',
      })

      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel ativar sua conta. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-bmv-primary mb-4" />
            <p className="text-muted-foreground">Validando convite...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!conviteData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {conviteData?.expired ? (
              <>
                <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Convite Expirado</h2>
                <p className="text-muted-foreground mb-6">
                  Este link de convite expirou. Entre em contato com o administrador
                  para solicitar um novo convite.
                </p>
              </>
            ) : (
              <>
                <XCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">Convite Invalido</h2>
                <p className="text-muted-foreground mb-6">
                  Este link de convite nao e valido ou ja foi utilizado.
                </p>
              </>
            )}
            <Link href="/login">
              <Button variant="outline">Ir para Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (activated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Conta Ativada!</h2>
            <p className="text-muted-foreground mb-4">
              Sua conta foi ativada com sucesso.
              Voce sera redirecionado para o login em instantes...
            </p>
            <Loader2 className="h-5 w-5 animate-spin text-bmv-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-bmv-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <CardTitle className="text-2xl">Bem-vindo ao BM&V!</CardTitle>
          <CardDescription className="text-base">
            Ola, <strong>{conviteData.nome}</strong>!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center gap-3">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Empresa</p>
              <p className="font-medium">{conviteData.empresa}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="senha">Criar Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimo 6 caracteres"
                  value={formData.senha}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, senha: e.target.value }))
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  id="confirmarSenha"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Digite a senha novamente"
                  value={formData.confirmarSenha}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      confirmarSenha: e.target.value,
                    }))
                  }
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-bmv-primary hover:bg-bmv-primary/90"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ativar Minha Conta
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
