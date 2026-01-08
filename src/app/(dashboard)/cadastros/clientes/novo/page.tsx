'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

export default function NovoClientePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'PF',
    cpfCnpj: '',
    endereco: '',
    cidade: '',
    uf: '',
    cep: '',
    telefone: '',
    email: '',
    nomeContato: '',
    observacoes: '',
  })

  const formatCpfCnpj = (value: string) => {
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length <= 11) {
      // CPF: 000.000.000-00
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    } else {
      // CNPJ: 00.000.000/0000-00
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    }
  }

  const formatTelefone = (value: string) => {
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length <= 10) {
      // Telefone fixo: (00) 0000-0000
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    } else {
      // Celular: (00) 00000-0000
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    }
  }

  const formatCep = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    return cleaned.replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1')
  }

  const handleChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === 'cpfCnpj') {
      formattedValue = formatCpfCnpj(value)
      // Auto-detect tipo based on length
      const cleaned = value.replace(/\D/g, '')
      if (cleaned.length > 11) {
        setFormData(prev => ({ ...prev, tipo: 'PJ' }))
      }
    } else if (field === 'telefone') {
      formattedValue = formatTelefone(value)
    } else if (field === 'cep') {
      formattedValue = formatCep(value)
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome e obrigatorio'
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo e obrigatorio'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setLoading(true)
    try {
      const response = await fetch('/api/cadastros/clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cpfCnpj: formData.cpfCnpj.replace(/\D/g, '') || null,
          telefone: formData.telefone || null,
          cep: formData.cep.replace(/\D/g, '') || null,
        }),
      })

      if (response.ok) {
        router.push('/cadastros/clientes')
      } else {
        const data = await response.json()
        if (data.error) {
          setErrors({ submit: data.error })
        }
      }
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
      setErrors({ submit: 'Erro ao salvar cliente. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header com gradiente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 text-white animate-fade-in-up">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
        </div>

        <div className="relative">
          {/* Breadcrumb */}
          <Link href="/cadastros/clientes" className="inline-flex items-center gap-2 text-blue-100 text-sm mb-3 hover:text-white transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar para Clientes</span>
          </Link>

          {/* Titulo */}
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <UserPlus className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Novo Cliente</h1>
              <p className="text-blue-100 text-sm md:text-base">
                Preencha os dados para cadastrar um novo cliente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dados Principais */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                Dados Principais
              </CardTitle>
              <CardDescription>
                Informacoes basicas do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome / Razao Social *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => handleChange('nome', e.target.value)}
                  placeholder="Digite o nome completo ou razao social"
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)}>
                    <SelectTrigger className={errors.tipo ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PF">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Pessoa Fisica
                        </div>
                      </SelectItem>
                      <SelectItem value="PJ">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Pessoa Juridica
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.tipo && <p className="text-xs text-red-500">{errors.tipo}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">{formData.tipo === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => handleChange('cpfCnpj', e.target.value)}
                    placeholder={formData.tipo === 'PJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                    maxLength={formData.tipo === 'PJ' ? 18 : 14}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeContato">Nome do Contato</Label>
                <Input
                  id="nomeContato"
                  value={formData.nomeContato}
                  onChange={(e) => handleChange('nomeContato', e.target.value)}
                  placeholder="Nome da pessoa de contato"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-muted-foreground" />
                Contato
              </CardTitle>
              <CardDescription>
                Telefone e email para contato
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => handleChange('telefone', e.target.value)}
                    placeholder="(00) 00000-0000"
                    className="pl-10"
                    maxLength={15}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@exemplo.com"
                    className={cn("pl-10", errors.email ? 'border-red-500' : '')}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Endereco */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                Endereco
              </CardTitle>
              <CardDescription>
                Localizacao do cliente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleChange('cep', e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereco</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  placeholder="Rua, numero, complemento"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    placeholder="Nome da cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf">Estado</Label>
                  <Select value={formData.uf} onValueChange={(value) => handleChange('uf', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasileiros.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observacoes */}
          <Card className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                Observacoes
              </CardTitle>
              <CardDescription>
                Informacoes adicionais sobre o cliente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observacoes gerais sobre o cliente..."
                rows={5}
              />
            </CardContent>
          </Card>
        </div>

        {/* Erro geral */}
        {errors.submit && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm animate-fade-in-up">
            {errors.submit}
          </div>
        )}

        {/* Botoes de acao */}
        <div className="flex justify-end gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <Link href="/cadastros/clientes">
            <Button type="button" variant="outline" disabled={loading}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </Link>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvar Cliente
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
