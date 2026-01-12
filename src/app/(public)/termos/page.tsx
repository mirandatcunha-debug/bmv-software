'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, FileText, Shield, Users, CreditCard, CheckCircle, AlertTriangle, Scale, RefreshCw, Globe, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-bmv-primary rounded-lg flex items-center justify-center shadow-md">
                <Image
                  src="/logo.png"
                  alt="BM&V Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-xl text-bmv-primary">BM&V</span>
            </Link>
            <Link href="/">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-bmv-primary/10 rounded-2xl mb-6">
            <FileText className="h-8 w-8 text-bmv-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Termos de Uso
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Última atualização: Janeiro 2025
          </p>
        </div>

        {/* Terms Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 md:p-12 space-y-10">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                1. Aceitação dos Termos
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                Ao acessar ou usar a plataforma BM&V (&quot;Serviço&quot;), você concorda em estar vinculado
                a estes Termos de Uso. Se você não concordar com qualquer parte destes termos,
                não poderá acessar o Serviço.
              </p>
              <p>
                Estes Termos de Uso constituem um acordo legal entre você (&quot;Usuário&quot;, &quot;você&quot;)
                e a BM&V Consultoria Empresarial LTDA (&quot;BM&V&quot;, &quot;nós&quot;, &quot;nosso&quot;), com sede no Brasil.
              </p>
              <p>
                Ao clicar em &quot;Aceito&quot;, &quot;Criar Conta&quot; ou ao utilizar nossos serviços, você confirma
                que leu, entendeu e aceita estes Termos de Uso e nossa Política de Privacidade.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                2. Descrição do Serviço
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                A BM&V oferece uma plataforma de gestão empresarial baseada em nuvem que inclui:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Gestão financeira (contas a pagar, contas a receber, fluxo de caixa)</li>
                <li>Dashboard e relatórios gerenciais</li>
                <li>Cadastro de clientes, fornecedores e colaboradores</li>
                <li>Módulo contábil e plano de contas</li>
                <li>Módulo de consultoria e projetos</li>
                <li>OKRs e gestão de processos</li>
                <li>Análises e insights com inteligência artificial</li>
              </ul>
              <p>
                As funcionalidades disponíveis variam de acordo com o plano contratado.
                Consulte nossa página de planos para mais detalhes.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                3. Cadastro e Conta
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>Para utilizar o Serviço, você deve:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Ter pelo menos 18 anos de idade ou capacidade legal para contratar</li>
                <li>Fornecer informações verdadeiras, precisas e completas durante o cadastro</li>
                <li>Manter suas informações de conta atualizadas</li>
                <li>Ser responsável por manter a confidencialidade de sua senha</li>
                <li>Notificar imediatamente sobre qualquer uso não autorizado de sua conta</li>
              </ul>
              <p>
                <strong>Responsabilidade:</strong> Você é responsável por todas as atividades
                realizadas em sua conta. A BM&V não se responsabiliza por perdas decorrentes
                de uso não autorizado de sua conta.
              </p>
              <p>
                <strong>Uma conta por empresa:</strong> Cada empresa deve ter apenas uma conta
                principal. Usuários adicionais podem ser convidados pelo administrador da conta.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                4. Planos e Pagamento
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                <strong>Planos disponíveis:</strong> Oferecemos diferentes planos de assinatura
                (Básico, Profissional e Enterprise), cada um com funcionalidades e limites específicos.
              </p>
              <p>
                <strong>Período de teste:</strong> Novos usuários podem ter acesso a um período
                de teste gratuito de 14 dias com funcionalidades limitadas.
              </p>
              <p>
                <strong>Cobrança:</strong> As assinaturas são cobradas de forma recorrente
                (mensal ou anual, conforme sua escolha). O pagamento é processado automaticamente
                na data de renovação.
              </p>
              <p>
                <strong>Alteração de plano:</strong> Você pode fazer upgrade ou downgrade
                do seu plano a qualquer momento. Alterações entram em vigor no próximo ciclo de cobrança.
              </p>
              <p>
                <strong>Preços:</strong> Os preços estão sujeitos a alterações. Você será notificado
                com antecedência de 30 dias sobre qualquer mudança de preço.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                5. Uso Aceitável
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p><strong>Você PODE:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Usar o Serviço para gerenciar as finanças e operações da sua empresa</li>
                <li>Convidar colaboradores da sua organização para usar a plataforma</li>
                <li>Exportar seus dados a qualquer momento</li>
                <li>Integrar o Serviço com outras ferramentas autorizadas (plano Enterprise)</li>
              </ul>
              <p><strong>Você NÃO PODE:</strong></p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Compartilhar sua conta ou credenciais com terceiros</li>
                <li>Usar o Serviço para atividades ilegais ou fraudulentas</li>
                <li>Tentar acessar dados de outras empresas ou usuários</li>
                <li>Fazer engenharia reversa, descompilar ou modificar o software</li>
                <li>Sobrecarregar intencionalmente nossos servidores ou infraestrutura</li>
                <li>Usar bots, scrapers ou ferramentas automatizadas não autorizadas</li>
                <li>Revender ou sublicenciar o acesso ao Serviço</li>
                <li>Inserir dados falsos ou informações que violem direitos de terceiros</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                6. Propriedade Intelectual
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                <strong>Nossos direitos:</strong> A plataforma BM&V, incluindo seu código-fonte,
                design, logotipos, textos e funcionalidades, é propriedade exclusiva da BM&V
                Consultoria Empresarial e está protegida por leis de propriedade intelectual.
              </p>
              <p>
                <strong>Seus dados:</strong> Você mantém todos os direitos sobre os dados
                que insere na plataforma. Ao usar o Serviço, você nos concede uma licença
                limitada para processar esses dados apenas para fornecer o Serviço.
              </p>
              <p>
                <strong>Feedback:</strong> Sugestões, ideias ou feedbacks fornecidos podem ser
                utilizados pela BM&V para melhorar o Serviço sem qualquer obrigação de compensação.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                7. Limitação de Responsabilidade
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                <strong>Disponibilidade:</strong> Nos esforçamos para manter o Serviço disponível
                24/7, mas não garantimos disponibilidade ininterrupta. Manutenções programadas
                serão comunicadas com antecedência.
              </p>
              <p>
                <strong>Decisões de negócio:</strong> O Serviço fornece ferramentas e análises
                para auxiliar na gestão empresarial. As decisões tomadas com base nessas informações
                são de responsabilidade exclusiva do usuário.
              </p>
              <p>
                <strong>Limitação:</strong> Na extensão máxima permitida por lei, a BM&V não será
                responsável por danos indiretos, incidentais, especiais ou consequentes, incluindo
                perda de lucros, dados ou oportunidades de negócio.
              </p>
              <p>
                <strong>Limite de indenização:</strong> Nossa responsabilidade total está limitada
                ao valor pago pelo usuário nos últimos 12 meses de assinatura.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <RefreshCw className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                8. Cancelamento e Reembolso
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                <strong>Cancelamento pelo usuário:</strong> Você pode cancelar sua assinatura
                a qualquer momento através das configurações da conta. O cancelamento entra
                em vigor ao final do período já pago.
              </p>
              <p>
                <strong>Garantia de 7 dias:</strong> Se você cancelar dentro dos primeiros
                7 dias após a contratação de um plano pago, terá direito ao reembolso integral.
              </p>
              <p>
                <strong>Após 7 dias:</strong> Não há reembolso proporcional para cancelamentos
                após o período de garantia. Você manterá acesso até o fim do período pago.
              </p>
              <p>
                <strong>Cancelamento pela BM&V:</strong> Reservamo-nos o direito de suspender
                ou cancelar contas que violem estes Termos, com aviso prévio quando possível.
              </p>
              <p>
                <strong>Exportação de dados:</strong> Após o cancelamento, você terá 30 dias
                para exportar seus dados. Após esse período, os dados serão excluídos.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                9. Alterações nos Termos
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                Podemos modificar estes Termos de Uso a qualquer momento. As alterações serão
                comunicadas através de:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Notificação na plataforma</li>
                <li>E-mail para o endereço cadastrado</li>
                <li>Atualização da data de &quot;Última atualização&quot; nesta página</li>
              </ul>
              <p>
                Para alterações significativas, você será notificado com pelo menos 30 dias
                de antecedência. O uso continuado do Serviço após as alterações constitui
                aceitação dos novos termos.
              </p>
              <p>
                Se você não concordar com os novos termos, deve cessar o uso do Serviço
                e cancelar sua conta.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Scale className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                10. Foro e Legislação Aplicável
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                <strong>Lei aplicável:</strong> Estes Termos de Uso são regidos pelas leis
                da República Federativa do Brasil.
              </p>
              <p>
                <strong>LGPD:</strong> O tratamento de dados pessoais está em conformidade
                com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e demais
                regulamentações aplicáveis.
              </p>
              <p>
                <strong>Foro:</strong> Fica eleito o foro da comarca de São Paulo, Estado
                de São Paulo, Brasil, para dirimir quaisquer controvérsias decorrentes
                destes Termos, com renúncia expressa a qualquer outro, por mais privilegiado que seja.
              </p>
              <p>
                <strong>Resolução de disputas:</strong> Antes de iniciar qualquer ação judicial,
                as partes concordam em tentar resolver a disputa de forma amigável através
                de nosso canal de suporte.
              </p>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 mt-4">
                <p className="font-semibold text-slate-900 dark:text-white mb-2">
                  Contato para questões legais:
                </p>
                <p className="text-sm">
                  <strong>E-mail:</strong>{' '}
                  <a
                    href="mailto:juridico@bmvconsultoria.com.br"
                    className="text-bmv-primary hover:text-bmv-secondary transition-colors"
                  >
                    juridico@bmvconsultoria.com.br
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/privacidade" className="hover:text-bmv-primary transition-colors">
              Política de Privacidade
            </Link>
            <span>|</span>
            <Link href="/" className="hover:text-bmv-primary transition-colors">
              Página Inicial
            </Link>
            <span>|</span>
            <Link href="/login" className="hover:text-bmv-primary transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 mt-12">
        <div className="container mx-auto px-6 text-center text-sm text-slate-500">
          <p>&copy; 2026 BM&V Consultoria Empresarial. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
