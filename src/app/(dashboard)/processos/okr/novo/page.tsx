'use client'

import { useState, useEffect } from 'react'
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
import { ArrowLeft, Target, Loader2, Calendar } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { PeriodoTipo } from '@/types/okr'

const trimestres = [
  { value: 'Q1', label: 'Q1 - Jan a Mar' },
  { value: 'Q2', label: 'Q2 - Abr a Jun' },
  { value: 'Q3', label: 'Q3 - Jul a Set' },
  { value: 'Q4', label: 'Q4 - Out a Dez' },
]

const anos = [2024, 2025, 2026, 2027]

// Usuarios mockados - em producao viria da API
const usuariosMock = [
  { id: '1', nome: 'Joao Silva' },
  { id: '2', nome: 'Maria Santos' },
  { id: '3', nome: 'Pedro Costa' },
]

export default function NovoObjetivoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [usuarios, setUsuarios] = useState(usuariosMock)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    responsavelId: '',
    periodoTipo: 'TRIMESTRE' as PeriodoTipo,
    trimestre: 'Q1',
    ano: new Date().getFullYear().toString(),
    dataInicio: '',
    dataFim: '',
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
        description: 'O titulo do objetivo e obrigatorio',
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

    if (formData.periodoTipo === 'PERSONALIZADO') {
      if (!formData.dataInicio || !formData.dataFim) {
        toast({
          title: 'Erro',
          description: 'Informe as datas de inicio e fim',
          variant: 'destructive',
        })
        return
      }
    }

    setLoading(true)

    try {
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        responsavelId: formData.responsavelId,
        periodoTipo: formData.periodoTipo,
        ...(formData.periodoTipo === 'TRIMESTRE'
          ? {
              trimestre: formData.trimestre,
              ano: parseInt(formData.ano),
            }
          : {
              dataInicio: new Date(formData.dataInicio),
              dataFim: new Date(formData.dataFim),
            }),
      }

      const response = await fetch('/api/okr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar objetivo')
      }

      const data = await response.json()

      toast({
        title: 'Objetivo criado!',
        description: 'Agora adicione os Key Results.',
      })

      router.push(`/processos/okr/${data.id}`)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar o objetivo. Tente novamente.',
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
          href="/processos/okr"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para OKRs
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Target className="h-7 w-7 text-bmv-primary" />
          Novo Objetivo
        </h1>
        <p className="text-muted-foreground">
          Crie um novo objetivo para acompanhar resultados
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Objetivo</CardTitle>
          <CardDescription>
            Preencha as informacoes do objetivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Titulo *</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ex: Aumentar receita em 30%"
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
                placeholder="Descreva o objetivo e sua importancia..."
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
              <Label>Tipo de Periodo</Label>
              <Select
                value={formData.periodoTipo}
                onValueChange={(value: PeriodoTipo) =>
                  setFormData((prev) => ({ ...prev, periodoTipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRIMESTRE">Trimestre</SelectItem>
                  <SelectItem value="PERSONALIZADO">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.periodoTipo === 'TRIMESTRE' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trimestre</Label>
                  <Select
                    value={formData.trimestre}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, trimestre: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {trimestres.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ano</Label>
                  <Select
                    value={formData.ano}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, ano: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {anos.map((a) => (
                        <SelectItem key={a} value={a.toString()}>
                          {a}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataInicio">Data Inicio *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dataInicio"
                      name="dataInicio"
                      type="date"
                      value={formData.dataInicio}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataFim">Data Fim *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="dataFim"
                      name="dataFim"
                      type="date"
                      value={formData.dataFim}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            )}

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
                Criar Objetivo
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
