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

// Dados mockados de clientes e consultores
const clientesMock = [
  { id: '1', nome: 'Empresa ABC Ltda' },
  { id: '2', nome: 'Tech Solutions SA' },
  { id: '3', nome: 'Industria XYZ' },
  { id: '4', nome: 'Comercio Beta' },
]

const consultoresMock = [
  { id: '1', nome: 'Joao Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Pedro Costa' },
]

export default function NovoProjetoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState(clientesMock)
  const [consultores, setConsultores] = useState(consultoresMock)

  const [formData, setFormData] = useState({
    nome: '',
    clienteId: '',
    descricao: '',
    consultorId: '',
    dataInicio: '',
    dataPrevista: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'O nome do projeto e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    if (!formData.clienteId) {
      toast({
        title: 'Erro',
        description: 'Selecione um cliente',
        variant: 'destructive',
      })
      return
    }

    if (!formData.consultorId) {
      toast({
        title: 'Erro',
        description: 'Selecione um consultor responsavel',
        variant: 'destructive',
      })
      return
    }

    if (!formData.dataInicio) {
      toast({
        title: 'Erro',
        description: 'A data de inicio e obrigatoria',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/consultoria/projetos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'NAO_INICIADO',
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar projeto')
      }

      const data = await response.json()

      toast({
        title: 'Projeto criado!',
        description: 'O projeto foi criado com sucesso.',
      })

      router.push(`/consultoria/projetos/${data.id}`)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar o projeto. Tente novamente.',
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
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Projetos
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <FolderKanban className="h-7 w-7 text-bmv-primary" />
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
            Preencha as informacoes do projeto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Projeto *</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Implementacao ERP"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteId">Cliente *</Label>
              <Select
                value={formData.clienteId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, clienteId: value }))
                }
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
              <Label htmlFor="descricao">Descricao</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva o objetivo e escopo do projeto..."
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultorId">Consultor Responsavel *</Label>
              <Select
                value={formData.consultorId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, consultorId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o consultor" />
                </SelectTrigger>
                <SelectContent>
                  {consultores.map((consultor) => (
                    <SelectItem key={consultor.id} value={consultor.id}>
                      {consultor.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Inicio *</Label>
                <Input
                  id="dataInicio"
                  name="dataInicio"
                  type="date"
                  value={formData.dataInicio}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataPrevista">Data Prevista de Conclusao</Label>
                <Input
                  id="dataPrevista"
                  name="dataPrevista"
                  type="date"
                  value={formData.dataPrevista}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
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
                className="bg-bmv-primary hover:bg-bmv-primary/90"
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Projeto
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
