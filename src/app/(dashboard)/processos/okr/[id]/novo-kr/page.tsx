'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Flag, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function NovoKRPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const objetivoId = params.id as string

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: '',
    metrica: '',
    baseline: '',
    meta: '',
    peso: '1',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        description: 'O titulo do Key Result e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    if (!formData.metrica.trim()) {
      toast({
        title: 'Erro',
        description: 'A metrica e obrigatoria',
        variant: 'destructive',
      })
      return
    }

    if (!formData.baseline || !formData.meta) {
      toast({
        title: 'Erro',
        description: 'Baseline e Meta sao obrigatorios',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const payload = {
        titulo: formData.titulo,
        metrica: formData.metrica,
        baseline: parseFloat(formData.baseline),
        meta: parseFloat(formData.meta),
        peso: parseFloat(formData.peso) || 1,
      }

      const response = await fetch(`/api/okr/${objetivoId}/krs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar Key Result')
      }

      toast({
        title: 'Key Result criado!',
        description: 'O KR foi adicionado ao objetivo.',
      })

      router.push(`/processos/okr/${objetivoId}`)
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar o Key Result. Tente novamente.',
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
          <Flag className="h-7 w-7 text-bmv-primary" />
          Novo Key Result
        </h1>
        <p className="text-muted-foreground">
          Adicione um resultado-chave mensuravel ao objetivo
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados do Key Result</CardTitle>
          <CardDescription>
            Key Results devem ser mensuraveis e ter um valor meta claro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="titulo">Titulo *</Label>
              <Input
                id="titulo"
                name="titulo"
                placeholder="Ex: Aumentar MRR para R$ 150k"
                value={formData.titulo}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metrica">Metrica *</Label>
              <Input
                id="metrica"
                name="metrica"
                placeholder="Ex: MRR em reais, Numero de clientes, Taxa de conversao %"
                value={formData.metrica}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-muted-foreground">
                Descreva como o resultado sera medido
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseline">Baseline *</Label>
                <Input
                  id="baseline"
                  name="baseline"
                  type="number"
                  step="any"
                  placeholder="0"
                  value={formData.baseline}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">Valor inicial</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta">Meta *</Label>
                <Input
                  id="meta"
                  name="meta"
                  type="number"
                  step="any"
                  placeholder="100"
                  value={formData.meta}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">Valor alvo</p>
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
                />
                <p className="text-xs text-muted-foreground">Importancia relativa</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Exemplo de KRs bem escritos:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• "Aumentar NPS de 45 para 70"</li>
                <li>• "Reduzir tempo de resposta de 8h para 2h"</li>
                <li>• "Conquistar 20 novos clientes"</li>
                <li>• "Atingir R$ 150.000 de MRR"</li>
              </ul>
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
                Criar Key Result
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
