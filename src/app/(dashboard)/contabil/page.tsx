import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Calculator,
  BookOpen,
  PieChart,
  Construction
} from 'lucide-react'

export default function ContabilPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Contábil
        </h1>
        <p className="text-muted-foreground">
          Gerencie o plano de contas, lançamentos e relatórios contábeis.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-bmv-primary/10">
                <BookOpen className="h-5 w-5 text-bmv-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plano de Contas</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-success/10">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lançamentos</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-info/10">
                <Calculator className="h-5 w-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Centros de Custo</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-warning/10">
                <PieChart className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Relatórios</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Em Desenvolvimento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Construction className="h-5 w-5 text-warning" />
            Módulo em Desenvolvimento
          </CardTitle>
          <CardDescription>
            Estamos trabalhando para trazer as melhores funcionalidades para você.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Construction className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              O módulo Contábil está sendo desenvolvido e em breve você poderá
              gerenciar seu plano de contas, lançamentos contábeis e relatórios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
