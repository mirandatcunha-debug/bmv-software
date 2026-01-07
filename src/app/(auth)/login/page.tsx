'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Eye, EyeOff, Shield, Users, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('E-mail é obrigatório')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('E-mail inválido')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('Senha é obrigatória')
      return false
    }
    if (value.length < 6) {
      setPasswordError('Senha deve ter no mínimo 6 caracteres')
      return false
    }
    setPasswordError('')
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isEmailValid || !isPasswordValid) return

    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro ao entrar',
          description: error.message === 'Invalid login credentials'
            ? 'E-mail ou senha incorretos'
            : error.message,
        })
        return
      }

      toast({
        title: 'Bem-vindo!',
        description: 'Login realizado com sucesso.',
      })

      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Ocorreu um erro ao fazer login. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const features = [
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de ponta a ponta',
    },
    {
      icon: Users,
      title: 'Gestão de Equipes',
      description: 'Controle completo de acessos e permissões',
    },
    {
      icon: BarChart3,
      title: 'Relatórios Avançados',
      description: 'Análises detalhadas para tomada de decisão',
    },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
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
            <h2 className="text-4xl font-bold mb-6 leading-tight animate-fade-in-up">
              Transformando dados em decisões estratégicas
            </h2>
            <p className="text-lg text-white/90 mb-10 animate-fade-in-up-delay">
              Plataforma completa para gestão empresarial, controle de processos
              e análise de performance.
            </p>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className={cn(
                    "flex items-start gap-4 animate-fade-in-up",
                    index === 0 && "animate-fade-in-up-delay",
                    index === 1 && "animate-fade-in-up-delay-2",
                    index === 2 && "animate-fade-in-up-delay-3"
                  )}
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shrink-0">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-white/80">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/60 animate-fade-in">
            <p>Mais de 500 empresas confiam na BM&V</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
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
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-8 border border-slate-200 dark:border-slate-700">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-1 sm:mb-2">
                Bem-vindo de volta
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                Entre com suas credenciais para acessar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-1.5 sm:space-y-2">
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
                    if (emailError) validateEmail(e.target.value)
                  }}
                  onBlur={() => validateEmail(email)}
                  disabled={isLoading}
                  className={cn(
                    "h-11 sm:h-12 transition-all duration-200",
                    emailError && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                {emailError && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Senha
                  </Label>
                  <Link
                    href="/esqueci-senha"
                    className="text-xs sm:text-sm text-bmv-secondary hover:text-bmv-primary transition-colors font-medium"
                  >
                    Esqueceu a senha?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (passwordError) validatePassword(e.target.value)
                    }}
                    onBlur={() => validatePassword(password)}
                    disabled={isLoading}
                    className={cn(
                      "h-11 sm:h-12 pr-12 transition-all duration-200",
                      passwordError && "border-red-500 focus-visible:ring-red-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-xs sm:text-sm text-red-500 flex items-center gap-1 animate-fade-in">
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 sm:h-12 bg-bmv-primary hover:bg-bmv-secondary transition-all duration-300 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>

            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Não tem uma conta?{' '}
                <Link
                  href="/cadastro"
                  className="text-bmv-secondary hover:text-bmv-primary font-semibold transition-colors"
                >
                  Fale conosco
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
