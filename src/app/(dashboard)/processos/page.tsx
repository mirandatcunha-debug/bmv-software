import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, Clock, GitBranch, ChevronRight } from 'lucide-react'

const processos = [
  {
    titulo: 'OKRs',
    descricao: 'Objetivos e Resultados-Chave',
    icone: Target,
    href: '/processos/okr',
    cor: 'bg-blue-500',
    disponivel: true,
  },
  {
    titulo: 'Em breve',
    descricao: 'Novos processos serão adicionados',
    icone: Clock,
    href: '#',
    cor: 'bg-slate-400',
    disponivel: false,
  },
]

export default function ProcessosPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <GitBranch className="h-7 w-7 text-bmv-primary" />
          Processos
        </h1>
        <p className="text-muted-foreground">
          Gerencie os processos da sua empresa
        </p>
      </div>

      {/* Process Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {processos.map((processo) => {
          const Icone = processo.icone

          if (!processo.disponivel) {
            return (
              <Card key={processo.titulo} className="opacity-60 cursor-not-allowed">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${processo.cor}`}>
                      <Icone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                        {processo.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {processo.descricao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          }

          return (
            <Link key={processo.titulo} href={processo.href}>
              <Card className="card-hover cursor-pointer transition-all duration-200 hover:shadow-md hover:border-bmv-primary/50">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${processo.cor}`}>
                      <Icone className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                        {processo.titulo}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {processo.descricao}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Info Section */}
      <Card className="bg-slate-50 dark:bg-slate-800/50 border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Sobre os Processos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Os processos são ferramentas para gerenciar e acompanhar diferentes aspectos da sua empresa.
            Selecione um processo acima para começar a utilizá-lo.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
