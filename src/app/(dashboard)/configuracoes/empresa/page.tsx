'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
} from 'lucide-react'
import { DadosEmpresa } from '@/types/configuracoes'

export default function MinhaEmpresaPage() {
  const router = useRouter()
  const { toast } = useToast()
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
  })

  useEffect(() => {
    checkPermissionAndFetch()
  }, [])

  const checkPermissionAndFetch = async () => {
    try {
      // Verificar permissao
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

      // Buscar dados da empresa
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
        description: 'O nome da empresa e obrigatorio',
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

  if (!hasPermission) {
    return (
      <div className="space-y-6 animate-in">
        <div className="flex items-center gap-4">
          <Link href="/configuracoes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Minha Empresa
            </h1>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-800 dark:text-amber-300">
                  Acesso Restrito
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  Voce nao tem permissao para acessar as configuracoes da empresa.
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
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/configuracoes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-blue-600" />
            Minha Empresa
          </h1>
          <p className="text-muted-foreground">
            Configure os dados da sua empresa
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Coluna Esquerda - Logo */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={empresa?.logoUrl} />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {empresa?.nome ? getInitials(empresa.nome) : 'E'}
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
              <h3 className="mt-4 font-semibold text-lg">{empresa?.nome || 'Nome da Empresa'}</h3>
              {empresa?.cnpj && (
                <p className="text-sm text-muted-foreground">
                  CNPJ: {empresa.cnpj}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Coluna Direita - Formulario */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Atualize as informacoes cadastrais da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Empresa *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      className="pl-10"
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                      className="pl-10"
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="endereco">Endereco</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Textarea
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) =>
                        setFormData({ ...formData, endereco: e.target.value })
                      }
                      className="pl-10 min-h-[80px]"
                      placeholder="Endereco completo da empresa"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Salvando...' : 'Salvar Alteracoes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
