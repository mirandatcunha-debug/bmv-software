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
import { ArrowLeft, CheckSquare, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Usuarios mockados - em producao viria da API
const usuariosMock = [
  { id: '1', nome: 'Joao Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Pedro Costa' },
]

// KRs mockados - em producao viria da API
const krsMock = [
  { id: 'kr1', titulo: 'Aumentar MRR para R$ 150k' },
  { id: 'kr2', titulo: 'Conquistar 20 novos clientes' },
  { id: 'kr3', titulo: 'Reduzir churn para menos de 3%' },
]

export default function NovaTarefaPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const objetivoId = params.id as string
  const krIdFromUrl = searchParams.get('kr')

  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState(usuariosMock)
  const [krs, setKrs] = useState(krsMock)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    responsavelId: '',
    keyResultId: krIdFromUrl || '',
    peso: '1',
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
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao || null,
        responsavelId: formData.responsavelId,
        keyResultId: formData.keyResultId || null,
        peso: parseFloat(formData.peso) || 1,
      }

      const response = await fetch(`/api/okr/${objetivoId}/tarefas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar tarefa')
      }

      toast({
        title: 'Tarefa criada!',
        description: 'A tarefa foi adicionada.',
      })

      router.push(`/processos/okr/${objetivoId}`)
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
          href={`/processos/okr/${objetivoId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Objetivo
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <CheckSquare className="h-7 w-7 text-bmv-primary" />
          Nova Tarefa
        </h1>
        <p className="text-muted-foreground">
          Adicione uma tarefa para contribuir com o objetivo
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Tarefa</CardTitle>
          <CardDescription>
            Tarefas sao acoes especificas que contribuem para o Key Result
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Titulo *</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ex: Criar campanha de email marketing"
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
                placeholder="Descreva o que precisa ser feito..."
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
                  {usuarios.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyResultId">Vincular a Key Result</Label>
              <Select
                value={formData.keyResultId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, keyResultId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um KR (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhum (tarefa geral)</SelectItem>
                  {krs.map((kr) => (
                    <SelectItem key={kr.id} value={kr.id}>
                      {kr.titulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Vincule a tarefa a um KR para contribuir com seu progresso
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso</Label>
              <Input
                id="peso"
                name="peso"
                type="number"
                step="0.1"
                min="0.1"
                placeholder="1"
                value={formData.peso}
                onChange={handleChange}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Tarefas com maior peso contribuem mais para o progresso do KR
              </p>
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
