'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Eye, EyeOff, Clock, CreditCard, Zap, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type PasswordStrength = 'fraca' | 'media' | 'forte'

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'fraca'

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score >= 4) return 'forte'
  if (score >= 2) return 'media'
  return 'fraca'
}

function PasswordStrengthIndicator({ password }: { password: string }) {
  const strength = getPasswordStrength(password)

  const config = {
    fraca: { color: 'bg-red-500', width: 'w-1/3', text: 'Fraca', textColor: 'text-red-500' },
    media: { color: 'bg-yellow-500', width: 'w-2/3', text: 'Média', textColor: 'text-yellow-500' },
    forte: { color: 'bg-green-500', width: 'w-full', text: 'Forte', textColor: 'text-green-500' },
  }

  const { color, width, text, textColor } = config[strength]

  return (
    <div className="space-y-1">
      <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-300", color, width)} />
      </div>
      <p className={cn("text-xs", textColor)}>Força da senha: {text}</p>
    </div>
  )
}

export default function CadastroPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [nomeEmpresa, setNomeEmpresa] = useState('')
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [errors, setErrors] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    nomeEmpresa: '',
    termos: '',
  })

  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const validateField = (field: string, value: string | boolean) => {
    const newErrors = { ...errors }

    switch (field) {
      case 'nome':
        if (!value) {
          newErrors.nome = 'Nome é obrigatório'
        } else if (typeof value === 'string' && value.length < 3) {
          newErrors.nome = 'Nome deve ter no mínimo 3 caracteres'
        } else {
          newErrors.nome = ''
        }
        break
      case 'email':
        if (!value) {
          newErrors.email = 'E-mail é obrigatório'
        } else if (typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'E-mail inválido'
        } else {
          newErrors.email = ''
        }
        break
      case 'senha':
        if (!value) {
          newErrors.senha = 'Senha é obrigatória'
        } else if (typeof value === 'string' && value.length < 8) {
          newErrors.senha = 'Senha deve ter no mínimo 8 caracteres'
        } else {
          newErrors.senha = ''
        }
        if (confirmarSenha && value !== confirmarSenha) {
          newErrors.confirmarSenha = 'As senhas não coincidem'
        } else if (confirmarSenha) {
          newErrors.confirmarSenha = ''
        }
        break
      case 'confirmarSenha':
        if (!value) {
          newErrors.confirmarSenha = 'Confirmação de senha é obrigatória'
        } else if (value !== senha) {
          newErrors.confirmarSenha = 'As senhas não coincidem'
        } else {
          newErrors.confirmarSenha = ''
        }
        break
      case 'nomeEmpresa':
        if (!value) {
          newErrors.nomeEmpresa = 'Nome da empresa é obrigatório'
        } else {
          newErrors.nomeEmpresa = ''
        }
        break
      case 'termos':
        if (!value) {
          newErrors.termos = 'Você deve aceitar os termos de uso'
        } else {
          newErrors.termos = ''
        }
        break
    }

    setErrors(newErrors)
    return !newErrors[field as keyof typeof newErrors]
  }

  const validateAll = () => {
    const validations = [
      validateField('nome', nome),
      validateField('email', email),
      validateField('senha', senha),
      validateField('confirmarSenha', confirmarSenha),
      validateField('nomeEmpresa', nomeEmpresa),
      validateField('termos', aceitouTermos),
    ]
    return validations.every(Boolean)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!validateAll()) return

    setIsLoading(true)

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            nome,
            nomeEmpresa,
          },
        },
      })

      if (authError) {
        toast({
          variant: 'destructive',
          title: 'Erro ao criar conta',
          description: authError.message === 'User already registered'
            ? 'Este e-mail já está cadastrado'
            : authError.message,
        })
        return
      }

      if (authData.user) {
        // 2. Criar o tenant com período de trial
        const trialInicio = new Date()
        const trialExpira = new Date()
        trialExpira.setDate(trialExpira.getDate() + 7) // 7 dias de trial

        const { error: tenantError } = await supabase
          .from('tenants')
          .insert({
            nome: nomeEmpresa,
            email,
            plano: 'TRIAL',
            trial_inicio: trialInicio.toISOString(),
            trial_expira: trialExpira.toISOString(),
            assinatura_ativa: false,
          })

        if (tenantError) {
          console.error('Erro ao criar tenant:', tenantError)
        }
      }

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Seu período de teste de 7 dias começou. Aproveite!',
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao criar sua conta. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const trialBenefits = [
    {
      icon: Clock,
      title: '7 Dias Grátis',
      description: 'Teste completo sem compromisso',
    },
    {
      icon: Zap,
      title: 'Módulo Financeiro Completo',
      description: 'Acesso a todas as funcionalidades',
    },
    {
      icon: CreditCard,
      title: 'Sem Cartão de Crédito',
      description: 'Comece agora, pague depois',
    },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Trial Benefits */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bmv-primary via-bmv-secondary to-bmv-accent relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-white rounded-full translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Logo Section */}
          <div className="animate-fade-in-up">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <Image
                  src="/logo.png"
                  alt="BM&V Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">BM&V</h1>
                <p className="text-white/80 text-sm">Consultoria Empresarial</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="mb-6 animate-fade-in-up">
              <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                Comece seu Trial Gratuito
              </span>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight animate-fade-in-up">
              Experimente grátis por 7 dias
            </h2>
            <p className="text-lg text-white/90 mb-10 animate-fade-in-up-delay">
              Tenha acesso completo a todas as funcionalidades da plataforma
              sem precisar de cartão de crédito.
            </p>

            {/* Trial Benefits */}
            <div className="space-y-6">
              {trialBenefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className={cn(
                    "flex items-start gap-4 animate-fade-in-up",
                    index === 0 && "animate-fade-in-up-delay",
                    index === 1 && "animate-fade-in-up-delay-2",
                    index === 2 && "animate-fade-in-up-delay-3"
                  )}
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{benefit.title}</h3>
                    <p className="text-sm text-white/80">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="mt-10 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <p className="font-semibold mb-4">O que está incluso:</p>
              <ul className="space-y-3">
                {[
                  'Gestão financeira completa',
                  'Contas a pagar e receber',
                  'Fluxo de caixa diário',
                  'Relatórios e dashboards',
                  'Suporte por e-mail',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60 animate-fade-in">
            <p>Mais de 500 empresas confiam na BM&V</p>
          </div>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="w-full max-w-md animate-slide-in-right">
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center mb-6 sm:mb-8 animate-fade-in-up">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-bmv-primary rounded-xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <Image
                src="/logo.png"
                alt="BM&V Logo"
                width={56}
                height={56}
                className="object-contain w-10 h-10 sm:w-14 sm:h-14"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-bmv-primary">BM&V Consultoria</h1>
            <p className="text-sm text-slate-600 mt-1">7 dias grátis para testar</p>
          </div>

          {/* Sign Up Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                Crie sua conta grátis
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Comece seu trial de 7 dias agora
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome Completo */}
              <div className="space-y-1.5">
                <Label htmlFor="nome" className="text-sm font-medium">
                  Nome completo
                </Label>
                <Input
                  id="nome"
                  type="text"
                  placeholder="Seu nome completo"
                  value={nome}
                  onChange={(e) => {
                    setNome(e.target.value)
                    if (errors.nome) validateField('nome', e.target.value)
                  }}
                  onBlur={() => validateField('nome', nome)}
                  disabled={isLoading}
                  className={cn(
                    "h-11 transition-all duration-200",
                    errors.nome && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.nome && (
                  <p className="text-xs text-red-500 animate-fade-in">{errors.nome}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium">
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) validateField('email', e.target.value)
                  }}
                  onBlur={() => validateField('email', email)}
                  disabled={isLoading}
                  className={cn(
                    "h-11 transition-all duration-200",
                    errors.email && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 animate-fade-in">{errors.email}</p>
                )}
              </div>

              {/* Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="senha" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres"
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value)
                      if (errors.senha) validateField('senha', e.target.value)
                    }}
                    onBlur={() => validateField('senha', senha)}
                    disabled={isLoading}
                    className={cn(
                      "h-11 pr-12 transition-all duration-200",
                      errors.senha && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {senha && <PasswordStrengthIndicator password={senha} />}
                {errors.senha && (
                  <p className="text-xs text-red-500 animate-fade-in">{errors.senha}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmarSenha" className="text-sm font-medium">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmarSenha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Digite a senha novamente"
                    value={confirmarSenha}
                    onChange={(e) => {
                      setConfirmarSenha(e.target.value)
                      if (errors.confirmarSenha) validateField('confirmarSenha', e.target.value)
                    }}
                    onBlur={() => validateField('confirmarSenha', confirmarSenha)}
                    disabled={isLoading}
                    className={cn(
                      "h-11 pr-12 transition-all duration-200",
                      errors.confirmarSenha && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.confirmarSenha && (
                  <p className="text-xs text-red-500 animate-fade-in">{errors.confirmarSenha}</p>
                )}
              </div>

              {/* Nome da Empresa */}
              <div className="space-y-1.5">
                <Label htmlFor="nomeEmpresa" className="text-sm font-medium">
                  Nome da empresa
                </Label>
                <Input
                  id="nomeEmpresa"
                  type="text"
                  placeholder="Nome da sua empresa"
                  value={nomeEmpresa}
                  onChange={(e) => {
                    setNomeEmpresa(e.target.value)
                    if (errors.nomeEmpresa) validateField('nomeEmpresa', e.target.value)
                  }}
                  onBlur={() => validateField('nomeEmpresa', nomeEmpresa)}
                  disabled={isLoading}
                  className={cn(
                    "h-11 transition-all duration-200",
                    errors.nomeEmpresa && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {errors.nomeEmpresa && (
                  <p className="text-xs text-red-500 animate-fade-in">{errors.nomeEmpresa}</p>
                )}
              </div>

              {/* Termos de Uso */}
              <div className="space-y-1.5">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="termos"
                    checked={aceitouTermos}
                    onCheckedChange={(checked) => {
                      setAceitouTermos(checked as boolean)
                      if (errors.termos) validateField('termos', checked as boolean)
                    }}
                    disabled={isLoading}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="termos"
                    className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer leading-relaxed"
                  >
                    Aceito os{' '}
                    <Link href="/termos" className="text-bmv-secondary hover:text-bmv-primary font-medium">
                      termos de uso
                    </Link>{' '}
                    e a{' '}
                    <Link href="/privacidade" className="text-bmv-secondary hover:text-bmv-primary font-medium">
                      política de privacidade
                    </Link>
                  </Label>
                </div>
                {errors.termos && (
                  <p className="text-xs text-red-500 animate-fade-in">{errors.termos}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta Grátis'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Já tem uma conta?{' '}
                <Link
                  href="/login"
                  className="text-bmv-secondary hover:text-bmv-primary font-semibold transition-colors"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; 2026 BM&V Consultoria. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
