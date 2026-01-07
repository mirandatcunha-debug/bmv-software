'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  AlertTriangle,
  Shield,
  Check,
  X,
  Sparkles
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface ConviteData {
  valid: boolean
  nome?: string
  email?: string
  empresa?: string
  expired?: boolean
  message?: string
}

interface PasswordStrength {
  score: number
  label: string
  color: string
  requirements: {
    minLength: boolean
    hasUppercase: boolean
    hasLowercase: boolean
    hasNumber: boolean
    hasSpecial: boolean
  }
}

function calculatePasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }

  const score = Object.values(requirements).filter(Boolean).length

  let label = 'Muito fraca'
  let color = 'bg-red-500'

  if (score === 5) {
    label = 'Excelente'
    color = 'bg-green-500'
  } else if (score === 4) {
    label = 'Forte'
    color = 'bg-emerald-500'
  } else if (score === 3) {
    label = 'Boa'
    color = 'bg-yellow-500'
  } else if (score === 2) {
    label = 'Fraca'
    color = 'bg-orange-500'
  }

  return { score, label, color, requirements }
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

  const passwordStrength = useMemo(
    () => calculatePasswordStrength(formData.senha),
    [formData.senha]
  )

  const passwordsMatch = formData.senha === formData.confirmarSenha && formData.confirmarSenha.length > 0

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
        description: 'As senhas não conferem',
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
        description: 'Você será redirecionado para o login.',
      })

      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível ativar sua conta. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="text-center animate-fade-in-up">
          <div className="w-20 h-20 mx-auto mb-6 bg-bmv-primary rounded-2xl flex items-center justify-center shadow-lg animate-pulse-soft">
            <Image
              src="/logo.png"
              alt="BM&V Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <Loader2 className="h-8 w-8 animate-spin text-bmv-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">Validando seu convite...</p>
        </div>
      </div>
    )
  }

  // Invalid/Expired state
  if (!conviteData?.valid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md animate-scale-in border-0 shadow-2xl">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            {conviteData?.expired ? (
              <>
                <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6 animate-check-bounce">
                  <AlertTriangle className="h-10 w-10 text-amber-500" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Convite Expirado</h2>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Este link de convite expirou. Entre em contato com o administrador
                  para solicitar um novo convite.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6 animate-check-bounce">
                  <XCircle className="h-10 w-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Convite Inválido</h2>
                <p className="text-muted-foreground mb-8 max-w-sm">
                  Este link de convite não é válido ou já foi utilizado.
                </p>
              </>
            )}
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8">
                Ir para Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (activated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-green-400 to-emerald-500" />
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-6">
              <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-check-bounce">
                <CheckCircle2 className="h-12 w-12 text-green-500" />
              </div>
              <div className="absolute -top-1 -right-1">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-3 text-green-600 dark:text-green-400">
              Conta Ativada com Sucesso!
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Sua conta foi ativada. Você será redirecionado para o login em instantes...
            </p>
            <div className="flex items-center gap-2 text-bmv-primary">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Redirecionando...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-lg border-0 shadow-2xl overflow-hidden animate-fade-in-up">
        {/* Header gradient bar */}
        <div className="h-2 bg-gradient-to-r from-bmv-primary via-bmv-secondary to-bmv-accent" />

        <CardHeader className="text-center pb-4 pt-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-bmv-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Image
              src="/logo.png"
              alt="BM&V Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Bem-vindo ao BM&V!</CardTitle>
          <CardDescription className="text-lg mt-2">
            Olá, <span className="font-semibold text-foreground">{conviteData.nome}</span>!
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          {/* Company info */}
          <div className="mb-8 p-4 bg-gradient-to-r from-bmv-primary/5 to-bmv-secondary/5 rounded-xl border border-bmv-primary/10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-bmv-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Você foi convidado por</p>
                <p className="font-semibold text-lg text-bmv-primary">{conviteData.empresa}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password field */}
            <div className="space-y-3">
              <Label htmlFor="senha" className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4 text-bmv-primary" />
                Criar Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite uma senha segura"
                  value={formData.senha}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, senha: e.target.value }))
                  }
                  required
                  className="h-12 pr-12"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {formData.senha && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-300 rounded-full",
                          passwordStrength.color
                        )}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={cn(
                      "text-sm font-medium min-w-[80px] text-right",
                      passwordStrength.score >= 4 ? "text-green-600" :
                      passwordStrength.score >= 3 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {passwordStrength.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={cn(
                      "flex items-center gap-1.5",
                      passwordStrength.requirements.minLength ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {passwordStrength.requirements.minLength ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      8+ caracteres
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5",
                      passwordStrength.requirements.hasUppercase ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {passwordStrength.requirements.hasUppercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      Letra maiúscula
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5",
                      passwordStrength.requirements.hasLowercase ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {passwordStrength.requirements.hasLowercase ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      Letra minúscula
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5",
                      passwordStrength.requirements.hasNumber ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {passwordStrength.requirements.hasNumber ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      Número
                    </div>
                    <div className={cn(
                      "flex items-center gap-1.5 col-span-2",
                      passwordStrength.requirements.hasSpecial ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {passwordStrength.requirements.hasSpecial ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                      Caractere especial (!@#$%...)
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password field */}
            <div className="space-y-3">
              <Label htmlFor="confirmarSenha" className="text-sm font-medium">
                Confirmar Senha
              </Label>
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
                  className={cn(
                    "h-12 pr-12 transition-all duration-200",
                    formData.confirmarSenha && (
                      passwordsMatch
                        ? "border-green-500 focus-visible:ring-green-500"
                        : "border-red-500 focus-visible:ring-red-500"
                    )
                  )}
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formData.confirmarSenha && (
                <p className={cn(
                  "text-sm flex items-center gap-1.5 animate-fade-in",
                  passwordsMatch ? "text-green-600" : "text-red-500"
                )}>
                  {passwordsMatch ? (
                    <>
                      <Check className="h-4 w-4" />
                      Senhas conferem
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      As senhas não conferem
                    </>
                  )}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300 text-base font-semibold shadow-lg hover:shadow-xl"
              disabled={submitting || !passwordsMatch || formData.senha.length < 6}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Ativando conta...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Ativar Minha Conta
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-muted-foreground">
              Já possui uma conta?{' '}
              <Link href="/login" className="text-bmv-secondary hover:text-bmv-primary font-semibold transition-colors">
                Fazer login
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
