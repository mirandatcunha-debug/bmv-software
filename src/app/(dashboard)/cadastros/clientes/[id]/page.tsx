'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  ArrowLeft,
  Save,
  X,
  Pencil,
  Calendar,
  Receipt,
  DollarSign,
  Loader2,
  UserX,
  UserCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { use } from 'react'

const estadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

interface Client {
  id: string
  codigo: string
  nome: string
  tipo: string
  cpfCnpj: string | null
  endereco: string | null
  cidade: string | null
  uf: string | null
  cep: string | null
  telefone: string | null
  email: string | null
  nomeContato: string | null
  observacoes: string | null
  ativo: boolean
  criadoEm: string
  atualizadoEm: string
  contasReceber?: Receivable[]
}

interface Receivable {
  id: string
  descricao: string
  valor: number
  dataVencimento: string
  status: string
}

export default function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === 'true'

  const [cliente, setCliente] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(isEditMode)
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

  useEffect(() => {
    const loadCliente = async () => {
      try {
        const response = await fetch(`/api/cadastros/clientes/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          setCliente(data)
          setFormData({
            nome: data.nome || '',
            tipo: data.tipo || 'PF',
            cpfCnpj: formatCpfCnpj(data.cpfCnpj) || '',
            endereco: data.endereco || '',
            cidade: data.cidade || '',
            uf: data.uf || '',
            cep: formatCep(data.cep) || '',
            telefone: formatTelefone(data.telefone) || '',
            email: data.email || '',
            nomeContato: data.nomeContato || '',
            observacoes: data.observacoes || '',
          })
        } else {
          router.push('/cadastros/clientes')
        }
      } catch (error) {
        console.error('Erro ao buscar cliente:', error)
      } finally {
        setLoading(false)
      }
    }
    loadCliente()
  }, [resolvedParams.id, router])

  const fetchCliente = async () => {
    try {
      const response = await fetch(`/api/cadastros/clientes/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setCliente(data)
        setFormData({
          nome: data.nome || '',
          tipo: data.tipo || 'PF',
          cpfCnpj: formatCpfCnpj(data.cpfCnpj) || '',
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          uf: data.uf || '',
          cep: formatCep(data.cep) || '',
          telefone: formatTelefone(data.telefone) || '',
          email: data.email || '',
          nomeContato: data.nomeContato || '',
          observacoes: data.observacoes || '',
        })
      } else {
        router.push('/cadastros/clientes')
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCpfCnpj = (value: string | null) => {
    if (!value) return ''
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length <= 11) {
      return cleaned
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1')
    }
  }

  const formatTelefone = (value: string | null) => {
    if (!value) return ''
    const cleaned = value.replace(/\D/g, '')

    if (cleaned.length <= 10) {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    } else {
      return cleaned
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .replace(/(-\d{4})\d+?$/, '$1')
    }
  }

  const formatCep = (value: string | null) => {
    if (!value) return ''
    const cleaned = value.replace(/\D/g, '')
    return cleaned.replace(/(\d{5})(\d)/, '$1-$2').replace(/(-\d{3})\d+?$/, '$1')
  }

  const handleChange = (field: string, value: string) => {
    let formattedValue = value

    if (field === 'cpfCnpj') {
      formattedValue = formatCpfCnpj(value)
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

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/cadastros/clientes/${resolvedParams.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          cpfCnpj: formData.cpfCnpj.replace(/\D/g, '') || null,
          telefone: formData.telefone || null,
          cep: formData.cep.replace(/\D/g, '') || null,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setCliente(data)
        setEditing(false)
      } else {
        const data = await response.json()
        if (data.error) {
          setErrors({ submit: data.error })
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      setErrors({ submit: 'Erro ao atualizar cliente. Tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!cliente) return

    const action = cliente.ativo ? 'desativar' : 'reativar'
    if (!confirm(`Deseja realmente ${action} este cliente?`)) return

    try {
      const response = await fetch(`/api/cadastros/clientes/${resolvedParams.id}`, {
        method: cliente.ativo ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: cliente.ativo ? undefined : JSON.stringify({ ...formData, ativo: true }),
      })

      if (response.ok) {
        fetchCliente()
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'
      case 'VENCIDO':
        return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p>Cliente nao encontrado</p>
        <Link href="/cadastros/clientes">
          <Button className="mt-4">Voltar para Clientes</Button>
        </Link>
      </div>
    )
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                {cliente.tipo === 'PJ' ? (
                  <Building2 className="h-8 w-8" />
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold">{cliente.nome}</h1>
                  <Badge variant={cliente.ativo ? "default" : "secondary"} className={cn(
                    "text-xs",
                    cliente.ativo
                      ? "bg-green-500/20 text-green-100 border-green-400/30"
                      : "bg-slate-500/20 text-slate-200 border-slate-400/30"
                  )}>
                    {cliente.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                <p className="text-blue-100 text-sm md:text-base">
                  Codigo: {cliente.codigo} | {cliente.tipo === 'PJ' ? 'Pessoa Juridica' : 'Pessoa Fisica'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!editing ? (
                <>
                  <Button
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm transition-all hover:scale-105"
                    variant="outline"
                    onClick={() => setEditing(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    className={cn(
                      "backdrop-blur-sm transition-all hover:scale-105",
                      cliente.ativo
                        ? "bg-red-500/20 hover:bg-red-500/30 border-red-300/30 text-white"
                        : "bg-green-500/20 hover:bg-green-500/30 border-green-300/30 text-white"
                    )}
                    variant="outline"
                    onClick={handleToggleStatus}
                  >
                    {cliente.ativo ? (
                      <>
                        <UserX className="h-4 w-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Reativar
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="bg-white/20 hover:bg-white/30 border-white/30 text-white backdrop-blur-sm"
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      fetchCliente()
                    }}
                    disabled={saving}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    className="bg-white text-blue-600 hover:bg-blue-50"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mini cards de info no header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Cadastrado em</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{formatDate(cliente.criadoEm)}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Receipt className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Contas a Receber</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{cliente.contasReceber?.length || 0}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 transition-all hover:bg-white/20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-200" />
                <span className="text-xs text-blue-200">Ultima atualizacao</span>
              </div>
              <p className="text-base sm:text-lg font-bold">{formatDate(cliente.atualizadoEm)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario/Visualizacao */}
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
                  disabled={!editing}
                  className={errors.nome ? 'border-red-500' : ''}
                />
                {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => handleChange('tipo', value)} disabled={!editing}>
                    <SelectTrigger>
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">{formData.tipo === 'PJ' ? 'CNPJ' : 'CPF'}</Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => handleChange('cpfCnpj', e.target.value)}
                    disabled={!editing}
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
                  disabled={!editing}
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
                    disabled={!editing}
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
                    disabled={!editing}
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
                  disabled={!editing}
                  maxLength={9}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereco</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => handleChange('endereco', e.target.value)}
                  disabled={!editing}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleChange('cidade', e.target.value)}
                    disabled={!editing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="uf">Estado</Label>
                  <Select value={formData.uf} onValueChange={(value) => handleChange('uf', value)} disabled={!editing}>
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
                disabled={!editing}
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
      </form>

      {/* Historico de Contas a Receber */}
      <Card className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-muted-foreground" />
            Historico de Contas a Receber
          </CardTitle>
          <CardDescription>
            Titulos vinculados a este cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {cliente.contasReceber && cliente.contasReceber.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descricao</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cliente.contasReceber.map((conta) => (
                  <TableRow key={conta.id}>
                    <TableCell className="font-medium">{conta.descricao}</TableCell>
                    <TableCell>{formatCurrency(conta.valor)}</TableCell>
                    <TableCell>{formatDate(conta.dataVencimento)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(conta.status)}>
                        {conta.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma conta a receber encontrada para este cliente.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
