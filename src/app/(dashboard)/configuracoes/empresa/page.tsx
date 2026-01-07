'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  Save,
  Camera,
  AlertCircle,
  Upload,
  Palette,
  Check,
  Globe,
  Hash,
} from 'lucide-react'
import { DadosEmpresa } from '@/types/configuracoes'
import { cn } from '@/lib/utils'

// Cores para personalização
const coresDisponiveis = [
  { value: '#1a365d', label: 'Azul Marinho' },
  { value: '#059669', label: 'Esmeralda' },
  { value: '#7c3aed', label: 'Violeta' },
  { value: '#dc2626', label: 'Vermelho' },
  { value: '#ea580c', label: 'Laranja' },
  { value: '#0891b2', label: 'Ciano' },
  { value: '#4f46e5', label: 'Índigo' },
  { value: '#be185d', label: 'Rosa' },
]

export default function MinhaEmpresaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  const [empresa, setEmpresa] = useState<DadosEmpresa | null>(null)
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    corPrimaria: '#1a365d',
  })

  useEffect(() => {
    checkPermissionAndFetch()
  }, [])

  const checkPermissionAndFetch = async () => {
    try {
      const meResponse = await fetch('/api/auth/me')
      if (meResponse.ok) {
        const userData = await meResponse.json()
        const canManage = ['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(userData.perfil)
        setHasPermission(canManage)

        if (!canManage) {
          setLoading(false)
          return
        }
      }

      const response = await fetch('/api/configuracoes/empresa')
      if (response.ok) {
        const data = await response.json()
        setEmpresa(data)
        setFormData({
          nome: data.nome || '',
          cnpj: data.cnpj || '',
          email: data.email || '',
          telefone: data.telefone || '',
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: data.cep || '',
          corPrimaria: data.corPrimaria || '#1a365d',
        })
      }
    } catch (error) {
      console.error('Erro ao buscar dados:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados da empresa',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.nome) {
      toast({
        title: 'Erro',
        description: 'O nome da empresa é obrigatório',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/configuracoes/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: 'Sucesso',
          description: 'Dados da empresa atualizados com sucesso',
        })
        checkPermissionAndFetch()
      } else {
        const error = await response.json()
        toast({
          title: 'Erro',
          description: error.message || 'Erro ao atualizar dados',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar dados da empresa',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18)
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9)
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!hasPermission) {
    return (
      <div className="space-y-6 animate-in">
        <Link
          href="/configuracoes"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Configurações
        </Link>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Acesso Restrito
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Você não tem permissão para acessar as configurações da empresa.
                  Entre em contato com o administrador.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in">
      {/* Breadcrumb */}
      <Link
        href="/configuracoes"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para Configurações
      </Link>

      {/* Header com Gradiente */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMCAwaDQwdjQwSDB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Minha Empresa</h1>
            <p className="text-white/80">
              Configure os dados cadastrais e identidade visual
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna Esquerda - Preview da Empresa */}
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div
              className="h-20 transition-colors"
              style={{ backgroundColor: formData.corPrimaria }}
            />
            <CardContent className="pt-0 -mt-10 text-center">
              <div className="relative inline-block">
                <Avatar className="h-24 w-24 border-4 border-white dark:border-slate-900 shadow-lg">
                  <AvatarImage src={empresa?.logoUrl} />
                  <AvatarFallback
                    className="text-white text-2xl"
                    style={{ backgroundColor: formData.corPrimaria }}
                  >
                    {formData.nome ? getInitials(formData.nome) : 'E'}
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

              <h3 className="mt-4 font-semibold text-lg">{formData.nome || 'Nome da Empresa'}</h3>
              {formData.cnpj && (
                <p className="text-sm text-muted-foreground">
                  CNPJ: {formData.cnpj}
                </p>
              )}

              <Separator className="my-4" />

              <div className="space-y-2 text-sm text-left">
                {formData.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {formData.email}
                  </div>
                )}
                {formData.telefone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {formData.telefone}
                  </div>
                )}
                {formData.endereco && (
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>
                      {formData.endereco}
                      {formData.cidade && `, ${formData.cidade}`}
                      {formData.estado && ` - ${formData.estado}`}
                      {formData.cep && ` (${formData.cep})`}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dica de Upload */}
          <Card className="border-dashed bg-slate-50 dark:bg-slate-900/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Upload className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Logo da empresa</p>
                  <p className="text-xs text-muted-foreground">
                    Clique no ícone de câmera para fazer upload. Recomendado: PNG transparente, 256x256px.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Coluna Direita - Formulário */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados Cadastrais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Dados Cadastrais
              </CardTitle>
              <CardDescription>
                Informações básicas da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Razão Social *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className={cn(
                        "pl-10",
                        formData.nome && "border-blue-300 focus:border-blue-500"
                      )}
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cnpj"
                      value={formData.cnpj}
                      onChange={(e) =>
                        setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })
                      }
                      className="pl-10"
                      placeholder="00.000.000/0000-00"
                      maxLength={18}
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
                      placeholder="contato@empresa.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
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
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Endereço
              </CardTitle>
              <CardDescription>
                Localização da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) =>
                      setFormData({ ...formData, endereco: e.target.value })
                    }
                    className="pl-10 min-h-[80px] resize-none"
                    placeholder="Rua, número, complemento, bairro"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) =>
                      setFormData({ ...formData, cidade: e.target.value })
                    }
                    placeholder="Cidade"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) =>
                      setFormData({ ...formData, estado: e.target.value.toUpperCase().slice(0, 2) })
                    }
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) =>
                      setFormData({ ...formData, cep: formatCEP(e.target.value) })
                    }
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personalização */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-pink-600" />
                Personalização
              </CardTitle>
              <CardDescription>
                Escolha a cor principal da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Cor Primária</Label>
                <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                  {coresDisponiveis.map((cor) => (
                    <button
                      key={cor.value}
                      onClick={() => setFormData({ ...formData, corPrimaria: cor.value })}
                      className={cn(
                        'relative aspect-square rounded-lg transition-all',
                        formData.corPrimaria === cor.value
                          ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: cor.value }}
                      title={cor.label}
                    >
                      {formData.corPrimaria === cor.value && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Cor selecionada: {coresDisponiveis.find((c) => c.value === formData.corPrimaria)?.label || formData.corPrimaria}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
