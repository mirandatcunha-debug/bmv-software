import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Target,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Dados mockados para demonstração
const stats = [
  {
    title: 'Saldo Total',
    value: 125750.00,
    change: '+12.5%',
    trend: 'up',
    icon: Wallet,
    color: 'text-bmv-primary',
    bgColor: 'bg-bmv-primary/10',
  },
  {
    title: 'Receitas (Mês)',
    value: 45320.00,
    change: '+8.2%',
    trend: 'up',
    icon: TrendingUp,
    color: 'text-success',
    bgColor: 'bg-success/10',
  },
  {
    title: 'Despesas (Mês)',
    value: 32180.00,
    change: '-3.1%',
    trend: 'down',
    icon: TrendingDown,
    color: 'text-danger',
    bgColor: 'bg-danger/10',
  },
  {
    title: 'Inadimplência',
    value: 5.2,
    change: '-1.2%',
    trend: 'down',
    icon: AlertTriangle,
    color: 'text-warning',
    bgColor: 'bg-warning/10',
    isPercentage: true,
  },
]

const okrProgress = [
  { title: 'Aumentar receita em 20%', progress: 65, status: 'em_andamento' },
  { title: 'Reduzir inadimplência para 3%', progress: 48, status: 'em_andamento' },
  { title: 'Implementar novo processo de cobrança', progress: 100, status: 'concluido' },
]

const recentTasks = [
  { title: 'Revisar fluxo de caixa', status: 'pendente', prazo: '2 dias' },
  { title: 'Reunião com cliente ABC', status: 'em_andamento', prazo: 'Hoje' },
  { title: 'Análise DRE trimestral', status: 'concluido', prazo: 'Ontem' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Bem-vindo ao BM&V! Aqui está o resumo da sua empresa.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div className={`flex items-center text-sm ${
                  stat.trend === 'up' ? 'text-success' : 'text-danger'
                }`}>
                  {stat.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">
                  {stat.isPercentage 
                    ? `${stat.value}%` 
                    : formatCurrency(stat.value)
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* OKRs Progress */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-bmv-primary" />
                  OKRs do Trimestre
                </CardTitle>
                <CardDescription>Progresso dos objetivos principais</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {okrProgress.map((okr, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{okr.title}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    okr.status === 'concluido' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-info/10 text-info'
                  }`}>
                    {okr.progress}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      okr.status === 'concluido' ? 'bg-success' : 'bg-bmv-primary'
                    }`}
                    style={{ width: `${okr.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-bmv-primary" />
                  Tarefas Recentes
                </CardTitle>
                <CardDescription>Suas últimas atividades</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${
                      task.status === 'concluido' 
                        ? 'bg-success' 
                        : task.status === 'em_andamento'
                        ? 'bg-info'
                        : 'bg-warning'
                    }`} />
                    <span className="font-medium text-sm">{task.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {task.prazo}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Nova Receita', href: '/financeiro/receitas/nova', color: 'bg-success' },
              { label: 'Nova Despesa', href: '/financeiro/despesas/nova', color: 'bg-danger' },
              { label: 'Novo OKR', href: '/okr/novo', color: 'bg-bmv-primary' },
              { label: 'Ver Relatórios', href: '/relatorios', color: 'bg-bmv-secondary' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className="flex items-center justify-center p-4 rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-bmv-primary hover:bg-bmv-primary/5 transition-colors text-sm font-medium"
              >
                {action.label}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
