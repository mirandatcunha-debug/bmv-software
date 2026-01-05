import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Settings,
  User,
  Building2,
  Bell,
  Shield,
  Construction
} from 'lucide-react'

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6 animate-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do sistema, usuários e preferências.
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="card-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-bmv-primary/10">
                <User className="h-6 w-6 text-bmv-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Meu Perfil</h3>
                <p className="text-sm text-muted-foreground">
                  Gerencie suas informações pessoais e preferências
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-info/10">
                <Building2 className="h-6 w-6 text-info" />
              </div>
              <div>
                <h3 className="font-semibold">Empresa</h3>
                <p className="text-sm text-muted-foreground">
                  Configure os dados da sua empresa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-warning/10">
                <Bell className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold">Notificações</h3>
                <p className="text-sm text-muted-foreground">
                  Configure suas preferências de notificação
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-danger/10">
                <Shield className="h-6 w-6 text-danger" />
              </div>
              <div>
                <h3 className="font-semibold">Segurança</h3>
                <p className="text-sm text-muted-foreground">
                  Altere sua senha e configurações de segurança
                </p>
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
            <Settings className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Em breve!</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              As configurações avançadas estão sendo desenvolvidas e em breve você poderá
              personalizar completamente sua experiência no sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
