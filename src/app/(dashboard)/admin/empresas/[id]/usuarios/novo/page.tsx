'use client'

import { useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
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
import { ArrowLeft, UserPlus, Loader2, Copy, Check, Mail } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { roleLabels, getAssignableRoles } from '@/lib/permissions'

export default function NovoUsuarioPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const isPrimeiroUsuario = searchParams.get('primeiro') === 'true'

  const [loading, setLoading] = useState(false)
  const [linkGerado, setLinkGerado] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    perfil: isPrimeiroUsuario ? 'GESTOR' : '',
  })

  // Simula que o usuario atual e ADMIN_BMV
  const currentUserRole = 'ADMIN_BMV'
  const assignableRoles = getAssignableRoles(currentUserRole)

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
        description: 'O nome e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Erro',
        description: 'O email e obrigatorio',
        variant: 'destructive',
      })
      return
    }

    if (!formData.perfil) {
      toast({
        title: 'Erro',
        description: 'Selecione um perfil',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/tenants/${params.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Erro ao criar usuario')
      }

      const data = await response.json()

      // Gera o link de convite
      const link = `${window.location.origin}/convite/${data.tokenConvite}`
      setLinkGerado(link)

      toast({
        title: 'Usuario criado!',
        description: 'O link de convite foi gerado.',
      })
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Nao foi possivel criar o usuario. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    if (linkGerado) {
      navigator.clipboard.writeText(linkGerado)
      setCopied(true)
      toast({
        title: 'Link copiado!',
        description: 'O link de convite foi copiado para a area de transferencia.',
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      {/* Header */}
      <div>
        <Link
          href={`/admin/empresas/${params.id}/usuarios`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Usuarios
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <UserPlus className="h-7 w-7 text-bmv-primary" />
          {isPrimeiroUsuario ? 'Criar Gestor' : 'Novo Usuario'}
        </h1>
        <p className="text-muted-foreground">
          {isPrimeiroUsuario
            ? 'Cadastre o gestor responsavel pela empresa'
            : 'Cadastre um novo usuario para esta empresa'}
        </p>
      </div>

      {linkGerado ? (
        // Link gerado com sucesso
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Usuario Criado com Sucesso!</CardTitle>
            <CardDescription>
              Envie o link abaixo para o usuario ativar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <Label className="text-xs text-muted-foreground">Link de Convite</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input value={linkGerado} readOnly className="font-mono text-sm" />
                <Button onClick={copyLink} variant="outline">
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span>Este link expira em 7 dias</span>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setLinkGerado(null)
                  setFormData({ nome: '', email: '', perfil: '' })
                }}
              >
                Criar Outro Usuario
              </Button>
              <Link href={`/admin/empresas/${params.id}/usuarios`}>
                <Button className="bg-bmv-primary hover:bg-bmv-primary/90">
                  Ver Lista de Usuarios
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Formulario
        <Card>
          <CardHeader>
            <CardTitle>Dados do Usuario</CardTitle>
            <CardDescription>
              Preencha as informacoes do novo usuario
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo *</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Ex: Joao Silva"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="joao@empresa.com.br"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="perfil">Perfil *</Label>
                <Select
                  value={formData.perfil}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, perfil: value }))
                  }
                  disabled={isPrimeiroUsuario}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o perfil" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isPrimeiroUsuario && (
                  <p className="text-xs text-muted-foreground">
                    O primeiro usuario deve ser um Gestor
                  </p>
                )}
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
                  Criar e Gerar Link de Convite
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
