'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Landmark, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { TipoConta, tipoContaLabels } from '@/types/financeiro'

const tipoOptions: TipoConta[] = ['CORRENTE', 'POUPANCA', 'INVESTIMENTO', 'CAIXA']

const coresOptions = [
  { value: '#1a365d', label: 'Azul Escuro' },
  { value: '#ec7211', label: 'Laranja' },
  { value: '#0066cc', label: 'Azul' },
  { value: '#00875a', label: 'Verde' },
  { value: '#9333ea', label: 'Roxo' },
  { value: '#dc2626', label: 'Vermelho' },
]

export default function NovaContaPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    banco: '',
    agencia: '',
    conta: '',
    tipo: 'CORRENTE' as TipoConta,
    saldoInicial: '',
    cor: '#1a365d',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        description: 'O nome da conta e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/financeiro/contas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          saldoInicial: parseFloat(formData.saldoInicial) || 0,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar conta')
      }

      toast({
        title: 'Conta criada!',
        description: 'A conta bancaria foi cadastrada com sucesso.',
      })

      router.push('/financeiro/contas')
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar a conta. Tente novamente.',
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
          href="/financeiro/contas"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Contas
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Landmark className="h-7 w-7 text-bmv-primary" />
          Nova Conta Bancaria
        </h1>
        <p className="text-muted-foreground">
          Cadastre uma nova conta bancaria
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Dados da Conta</CardTitle>
          <CardDescription>
            Preencha as informacoes da conta bancaria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Conta *</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Conta Principal"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="banco">Banco</Label>
              <Input
                id="banco"
                name="banco"
                placeholder="Ex: Banco do Brasil"
                value={formData.banco}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agencia">Agencia</Label>
                <Input
                  id="agencia"
                  name="agencia"
                  placeholder="Ex: 1234"
                  value={formData.agencia}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conta">Numero da Conta</Label>
                <Input
                  id="conta"
                  name="conta"
                  placeholder="Ex: 12345-6"
                  value={formData.conta}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Conta</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, tipo: value as TipoConta }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoOptions.map((tipo) => (
                      <SelectItem key={tipo} value={tipo}>
                        {tipoContaLabels[tipo]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="saldoInicial">Saldo Inicial</Label>
                <Input
                  id="saldoInicial"
                  name="saldoInicial"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.saldoInicial}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor de Identificacao</Label>
              <div className="flex gap-2">
                {coresOptions.map((cor) => (
                  <button
                    key={cor.value}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.cor === cor.value
                        ? 'border-slate-900 scale-110'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: cor.value }}
                    onClick={() => setFormData((prev) => ({ ...prev, cor: cor.value }))}
                    title={cor.label}
                  />
                ))}
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
                Criar Conta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
