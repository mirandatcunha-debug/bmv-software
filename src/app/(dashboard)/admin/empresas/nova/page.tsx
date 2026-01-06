'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Loader2,
  Check,
  AlertCircle,
  MapPin,
  Settings,
  FileText,
  Upload,
  Image,
  Sparkles,
  Users,
  Mail,
  Phone,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

const steps = [
  { id: 1, title: 'Dados Basicos', icon: FileText, description: 'Informacoes principais' },
  { id: 2, title: 'Endereco', icon: MapPin, description: 'Localizacao da empresa' },
  { id: 3, title: 'Configuracoes', icon: Settings, description: 'Preferencias e logo' },
]

export default function NovaEmpresaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    // Dados básicos
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    // Endereço
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    // Configurações
    logo: null as string | null,
    cor: '#1a365d',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const isFieldValid = (field: string) => {
    if (field === 'nome') return formData.nome.trim().length >= 3
    if (field === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    return true
  }

  const getFieldError = (field: string) => {
    if (!touched[field]) return null
    if (field === 'nome' && formData.nome.trim().length < 3) {
      return 'Nome deve ter pelo menos 3 caracteres'
    }
    if (field === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Email invalido'
    }
    return null
  }

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.nome.trim().length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    }
    return true
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome da empresa e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Erro',
        description: 'O email de contato e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar empresa')
      }

      const data = await response.json()

      toast({
        title: 'Empresa criada!',
        description: 'Agora voce pode adicionar usuarios.',
      })

      router.push(`/admin/empresas/${data.id}/usuarios/novo?primeiro=true`)
    } catch {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar a empresa. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const coresOptions = [
    { value: '#1a365d', label: 'Azul Escuro' },
    { value: '#065f46', label: 'Verde' },
    { value: '#7c3aed', label: 'Roxo' },
    { value: '#dc2626', label: 'Vermelho' },
    { value: '#ea580c', label: 'Laranja' },
    { value: '#0891b2', label: 'Cyan' },
  ]

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <Link
          href="/admin/empresas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para Empresas
        </Link>

        {/* Header com gradiente */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 text-white animate-fade-in-up">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>

          <div className="relative flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Nova Empresa</h1>
              <p className="text-blue-100 text-sm md:text-base">
                Cadastre uma nova empresa no sistema
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => currentStep > step.id && setCurrentStep(step.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
                currentStep === step.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : currentStep > step.id
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-pointer hover:bg-green-200"
                    : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold",
                currentStep === step.id
                  ? "bg-white/20"
                  : currentStep > step.id
                    ? "bg-green-500 text-white"
                    : "bg-slate-200 dark:bg-slate-700"
              )}>
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <div className="hidden sm:block">
                <p className="font-medium text-sm">{step.title}</p>
                <p className={cn(
                  "text-xs",
                  currentStep === step.id ? "text-blue-100" : "text-muted-foreground"
                )}>{step.description}</p>
              </div>
            </button>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 mx-2",
                currentStep > step.id ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
              )} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <Card className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentStep === 1 && <FileText className="h-5 w-5 text-blue-500" />}
              {currentStep === 2 && <MapPin className="h-5 w-5 text-blue-500" />}
              {currentStep === 3 && <Settings className="h-5 w-5 text-blue-500" />}
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              {steps[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Dados Básicos */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="flex items-center gap-1">
                      Nome da Empresa
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="nome"
                        name="nome"
                        placeholder="Ex: Empresa ABC Ltda"
                        value={formData.nome}
                        onChange={handleChange}
                        onBlur={() => handleBlur('nome')}
                        className={cn(
                          "pr-10 transition-all",
                          touched.nome && (isFieldValid('nome')
                            ? "border-green-500 focus-visible:ring-green-500"
                            : "border-red-500 focus-visible:ring-red-500")
                        )}
                        required
                      />
                      {touched.nome && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isFieldValid('nome') ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {getFieldError('nome') && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError('nome')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">CNPJ</Label>
                    <Input
                      id="cnpj"
                      name="cnpj"
                      placeholder="00.000.000/0000-00"
                      value={formData.cnpj}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-1">
                      Email de Contato
                      <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="contato@empresa.com.br"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={() => handleBlur('email')}
                        className={cn(
                          "pr-10 transition-all",
                          touched.email && (isFieldValid('email')
                            ? "border-green-500 focus-visible:ring-green-500"
                            : "border-red-500 focus-visible:ring-red-500")
                        )}
                        required
                      />
                      {touched.email && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {isFieldValid('email') ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                    {getFieldError('email') && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {getFieldError('email')}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      name="telefone"
                      placeholder="(00) 00000-0000"
                      value={formData.telefone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Endereço */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in-up">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        name="cep"
                        placeholder="00000-000"
                        value={formData.cep}
                        onChange={handleChange}
                      />
                    </div>
                    <div></div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="logradouro">Logradouro</Label>
                      <Input
                        id="logradouro"
                        name="logradouro"
                        placeholder="Rua, Avenida..."
                        value={formData.logradouro}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero">Numero</Label>
                      <Input
                        id="numero"
                        name="numero"
                        placeholder="123"
                        value={formData.numero}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      name="complemento"
                      placeholder="Sala, Andar..."
                      value={formData.complemento}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bairro">Bairro</Label>
                      <Input
                        id="bairro"
                        name="bairro"
                        placeholder="Bairro"
                        value={formData.bairro}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        name="cidade"
                        placeholder="Cidade"
                        value={formData.cidade}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        name="estado"
                        placeholder="UF"
                        maxLength={2}
                        value={formData.estado}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Configurações */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in-up">
                  {/* Upload de Logo */}
                  <div className="space-y-3">
                    <Label>Logo da Empresa</Label>
                    <div className="border-2 border-dashed rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                          {formData.logo ? (
                            <Image className="h-8 w-8 text-blue-600" />
                          ) : (
                            <Upload className="h-8 w-8 text-slate-400 group-hover:text-blue-600 transition-colors" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">Clique para enviar</p>
                          <p className="text-xs text-muted-foreground">PNG, JPG ou SVG (max 2MB)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cor de Identificação */}
                  <div className="space-y-3">
                    <Label>Cor de Identificacao</Label>
                    <p className="text-xs text-muted-foreground">
                      Esta cor sera usada como destaque para esta empresa
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {coresOptions.map((cor) => (
                        <button
                          key={cor.value}
                          type="button"
                          className={cn(
                            "w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110",
                            formData.cor === cor.value
                              ? 'border-slate-900 dark:border-white scale-110 ring-2 ring-offset-2'
                              : 'border-transparent'
                          )}
                          style={{ backgroundColor: cor.value }}
                          onClick={() => setFormData((prev) => ({ ...prev, cor: cor.value }))}
                          title={cor.label}
                        >
                          {formData.cor === cor.value && (
                            <Check className="h-5 w-5 text-white mx-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    Proximo
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Criar Empresa
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="sticky top-6">
            <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Preview da Empresa
            </p>
            <Card className="overflow-hidden border-2 shadow-lg">
              {/* Barra colorida */}
              <div
                className="h-2"
                style={{ backgroundColor: formData.cor }}
              />

              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Avatar/Logo */}
                  <div
                    className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      backgroundColor: `${formData.cor}15`,
                      border: `2px solid ${formData.cor}30`
                    }}
                  >
                    {formData.logo ? (
                      <Image className="h-7 w-7" style={{ color: formData.cor }} />
                    ) : (
                      <span className="text-xl font-bold" style={{ color: formData.cor }}>
                        {formData.nome.charAt(0) || 'E'}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg">
                      {formData.nome || 'Nome da Empresa'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formData.cnpj || 'CNPJ nao informado'}
                    </p>
                    <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Ativa
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {formData.email || 'email@empresa.com'}
                  </div>
                  {formData.telefone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {formData.telefone}
                    </div>
                  )}
                  {(formData.cidade || formData.estado) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {[formData.cidade, formData.estado].filter(Boolean).join(' - ')}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">0</p>
                      <p className="text-xs text-muted-foreground">usuarios</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground mt-3 text-center">
              Assim ficara o card da empresa
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
