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
import { ArrowLeft, FolderKanban, Loader2, Save } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useTenant } from '@/hooks/use-tenant'
import { useToast } from '@/hooks/use-toast'
import { consultoriaService } from '@/services/consultoria.service'
import { statusProjetoLabels, StatusProjeto } from '@/types/consultoria'

// Dados mockados de clientes
const clientesMock = [
  { id: '1', nome: 'Empresa ABC Ltda' },
  { id: '2', nome: 'Tech Solutions SA' },
  { id: '3', nome: 'Indústria XYZ' },
  { id: '4', nome: 'Comércio Beta' },
]

export default function NovoProjetoPage() {
  const router = useRouter()
  useAuth()
  useTenant()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [clientes] = useState(clientesMock)

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    clienteId: '',
    dataInicio: new Date().toISOString().split('T')[0],
    dataFim: '',
    status: 'NAO_INICIADO' as StatusProjeto,
  })

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do projeto é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.dataInicio) {
      toast({
        title: 'Erro de validação',
        description: 'A data de início é obrigatória.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const projeto = await consultoriaService.projetos.createProjeto({
        nome: formData.nome,
        descricao: formData.descricao,
        clienteId: formData.clienteId || undefined,
        dataInicio: formData.dataInicio,
        dataFim: formData.dataFim || undefined,
        status: formData.status,
      })

      toast({
        title: 'Projeto criado!',
        description: `O projeto "${projeto.nome}" foi criado com sucesso.`,
      })

      router.push(`/consultoria/projetos/${projeto.id}`)
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      toast({
        title: 'Erro ao criar projeto',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao criar o projeto. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href="/consultoria/projetos"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-orange-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Projetos
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FolderKanban className="h-7 w-7 text-orange-500" />
          Novo Projeto
        </h1>
        <p className="text-muted-foreground">
          Cadastre um novo projeto de consultoria
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Projeto</CardTitle>
          <CardDescription>
            Preencha as informações do projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Projeto *</Label>
              <Input
                id="nome"
                placeholder="Ex: Implementação ERP"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) => handleChange('clienteId', value)}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                placeholder="Descreva o objetivo e escopo do projeto..."
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                disabled={loading}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início *</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={(e) => handleChange('dataInicio', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFim">Data Prevista de Conclusão</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={formData.dataFim}
                  onChange={(e) => handleChange('dataFim', e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status Inicial</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusProjetoLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Criar Projeto
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
