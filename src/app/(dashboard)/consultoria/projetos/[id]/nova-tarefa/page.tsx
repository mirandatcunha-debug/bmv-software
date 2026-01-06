'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
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
import { ArrowLeft, ClipboardList, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import {
  StatusTarefa,
  Prioridade,
  statusTarefaLabels,
  prioridadeLabels,
} from '@/types/consultoria'

// Dados mockados de responsaveis
const responsaveisMock = [
  { id: '1', nome: 'Joao Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Pedro Costa' },
]

const statusOptions: StatusTarefa[] = ['A_FAZER', 'EM_ANDAMENTO', 'EM_VALIDACAO', 'CONCLUIDO']
const prioridadeOptions: Prioridade[] = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']

export default function NovaTarefaPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const statusInicial = (searchParams.get('status') as StatusTarefa) || 'A_FAZER'

  const [loading, setLoading] = useState(false)
  const [responsaveis] = useState(responsaveisMock)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    responsavelId: '',
    prazo: '',
    status: statusInicial,
    prioridade: 'MEDIA' as Prioridade,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.titulo.trim()) {
      toast({
        title: 'Erro',
        description: 'O titulo da tarefa e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    if (!formData.responsavelId) {
      toast({
        title: 'Erro',
        description: 'Selecione um responsavel',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/consultoria/projetos/${params.id}/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa')
      }

      toast({
        title: 'Tarefa criada!',
        description: 'A tarefa foi adicionada ao projeto.',
      })

      router.push(`/consultoria/projetos/${params.id}`)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar a tarefa. Tente novamente.',
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
          href={`/consultoria/projetos/${params.id}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Projeto
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="h-7 w-7 text-bmv-primary" />
          Nova Tarefa
        </h1>
        <p className="text-muted-foreground">
          Adicione uma nova tarefa ao projeto
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Tarefa</CardTitle>
          <CardDescription>
            Preencha as informacoes da tarefa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Titulo *</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ex: Implementar modulo de vendas"
                value={formData.titulo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descricao</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva os detalhes da tarefa..."
                value={formData.descricao}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavelId">Responsavel *</Label>
              <Select
                value={formData.responsavelId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, responsavelId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsavel" />
                </SelectTrigger>
                <SelectContent>
                  {responsaveis.map((resp) => (
                    <SelectItem key={resp.id} value={resp.id}>
                      {resp.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Coluna/Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, status: value as StatusTarefa }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {statusTarefaLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridade">Prioridade</Label>
                <Select
                  value={formData.prioridade}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, prioridade: value as Prioridade }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioridadeOptions.map((prioridade) => (
                      <SelectItem key={prioridade} value={prioridade}>
                        {prioridadeLabels[prioridade]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo</Label>
              <Input
                id="prazo"
                name="prazo"
                type="date"
                value={formData.prazo}
                onChange={handleChange}
              />
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
                Criar Tarefa
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
