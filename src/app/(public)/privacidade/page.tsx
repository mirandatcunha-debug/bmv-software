'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Shield, Lock, Eye, Mail, Cookie, FileText, Users, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PrivacidadePage() {
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
            <Shield className="h-8 w-8 text-bmv-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Política de Privacidade
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Última atualização: Janeiro 2025
          </p>
        </div>

        {/* Policy Content */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8 md:p-12 space-y-10">

          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                1. Introdução
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                A BM&V Consultoria Empresarial (&quot;BM&V&quot;, &quot;nós&quot;, &quot;nosso&quot;) está comprometida em proteger
                a privacidade e os dados pessoais de nossos usuários e clientes.
              </p>
              <p>
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas
                informações pessoais quando você utiliza nossa plataforma de gestão empresarial e serviços relacionados.
              </p>
              <p>
                Ao utilizar nossos serviços, você concorda com as práticas descritas nesta política.
                Recomendamos a leitura atenta deste documento.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Database className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                2. Dados que Coletamos
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>Coletamos os seguintes tipos de dados:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Dados de identificação:</strong> nome completo, e-mail, telefone, CPF/CNPJ
                </li>
                <li>
                  <strong>Dados da empresa:</strong> razão social, nome fantasia, endereço comercial, setor de atuação
                </li>
                <li>
                  <strong>Dados financeiros:</strong> informações bancárias, movimentações financeiras,
                  contas a pagar e receber, fluxo de caixa (inseridos por você na plataforma)
                </li>
                <li>
                  <strong>Dados de uso:</strong> logs de acesso, páginas visitadas, funcionalidades utilizadas,
                  endereço IP, tipo de navegador e dispositivo
                </li>
                <li>
                  <strong>Dados de comunicação:</strong> mensagens enviadas ao suporte, feedbacks e avaliações
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Eye className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                3. Como Usamos Seus Dados
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>Utilizamos seus dados para as seguintes finalidades:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Fornecer nossos serviços:</strong> processar seus dados financeiros,
                  gerar relatórios, dashboards e análises
                </li>
                <li>
                  <strong>Melhorar a experiência:</strong> personalizar a plataforma, desenvolver
                  novas funcionalidades e otimizar o desempenho
                </li>
                <li>
                  <strong>Comunicação:</strong> enviar notificações importantes, atualizações do sistema,
                  alertas de segurança e informações sobre sua conta
                </li>
                <li>
                  <strong>Suporte ao cliente:</strong> responder suas dúvidas e solucionar problemas técnicos
                </li>
                <li>
                  <strong>Análises com IA:</strong> gerar insights e recomendações personalizadas
                  para sua gestão empresarial
                </li>
                <li>
                  <strong>Obrigações legais:</strong> cumprir exigências legais e regulatórias aplicáveis
                </li>
              </ul>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                4. Compartilhamento de Dados
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                <strong>Não vendemos seus dados pessoais.</strong> Compartilhamos informações apenas nas
                seguintes situações:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Processadores de pagamento:</strong> para processar transações de assinatura
                  (ex: Stripe, PagSeguro)
                </li>
                <li>
                  <strong>Provedores de infraestrutura:</strong> serviços de hospedagem e armazenamento
                  em nuvem (ex: AWS, Vercel, Supabase)
                </li>
                <li>
                  <strong>Ferramentas de análise:</strong> para melhorar nossa plataforma e entender
                  padrões de uso (dados anonimizados)
                </li>
                <li>
                  <strong>Obrigações legais:</strong> quando exigido por lei, ordem judicial ou
                  autoridades competentes
                </li>
              </ul>
              <p>
                Todos os nossos parceiros e fornecedores estão sujeitos a acordos de confidencialidade
                e proteção de dados.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Lock className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                5. Armazenamento e Segurança
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                Implementamos medidas técnicas e organizacionais para proteger seus dados:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Criptografia:</strong> todos os dados são criptografados em trânsito (TLS/SSL)
                  e em repouso (AES-256)
                </li>
                <li>
                  <strong>Servidores seguros:</strong> utilizamos infraestrutura de provedores certificados
                  com SOC 2, ISO 27001
                </li>
                <li>
                  <strong>Controle de acesso:</strong> acesso restrito aos dados com autenticação
                  multifator e logs de auditoria
                </li>
                <li>
                  <strong>Backups:</strong> realizamos backups regulares e seguros dos dados
                </li>
                <li>
                  <strong>Monitoramento:</strong> sistemas de detecção de intrusão e monitoramento
                  contínuo de segurança
                </li>
              </ul>
              <p>
                Seus dados são armazenados em servidores localizados no Brasil e nos Estados Unidos,
                sempre em conformidade com a LGPD.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                6. Seus Direitos
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Acesso:</strong> solicitar uma cópia dos seus dados pessoais que possuímos
                </li>
                <li>
                  <strong>Correção:</strong> solicitar a correção de dados incompletos, inexatos ou desatualizados
                </li>
                <li>
                  <strong>Exclusão:</strong> solicitar a exclusão dos seus dados pessoais (quando aplicável)
                </li>
                <li>
                  <strong>Portabilidade:</strong> solicitar a transferência dos seus dados para outro fornecedor
                </li>
                <li>
                  <strong>Revogação do consentimento:</strong> retirar seu consentimento a qualquer momento
                </li>
                <li>
                  <strong>Oposição:</strong> se opor ao tratamento de dados em determinadas situações
                </li>
              </ul>
              <p>
                Para exercer qualquer desses direitos, entre em contato através do e-mail indicado
                na seção de Contato.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Cookie className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                7. Cookies
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>Utilizamos cookies e tecnologias similares para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Cookies essenciais:</strong> necessários para o funcionamento da plataforma,
                  autenticação e segurança
                </li>
                <li>
                  <strong>Cookies de preferências:</strong> para lembrar suas configurações,
                  como tema escuro e idioma
                </li>
                <li>
                  <strong>Cookies de análise:</strong> para entender como você usa a plataforma
                  e melhorar nossa experiência
                </li>
              </ul>
              <p>
                Você pode gerenciar suas preferências de cookies através das configurações do seu navegador.
                Note que desabilitar alguns cookies pode afetar a funcionalidade da plataforma.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                8. Alterações na Política
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças
                em nossas práticas ou por exigências legais.
              </p>
              <p>
                Quando fizermos alterações significativas, notificaremos você através de:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Aviso na plataforma</li>
                <li>E-mail para o endereço cadastrado</li>
                <li>Atualização da data de &quot;Última atualização&quot; no topo desta página</li>
              </ul>
              <p>
                Recomendamos revisar esta política periodicamente. O uso continuado de nossos serviços
                após as alterações constitui aceitação da política atualizada.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-bmv-primary/10 rounded-lg flex items-center justify-center">
                <Mail className="h-5 w-5 text-bmv-primary" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                9. Contato
              </h2>
            </div>
            <div className="text-slate-700 dark:text-slate-300 space-y-4 pl-13">
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados,
                entre em contato com nosso Encarregado de Proteção de Dados (DPO):
              </p>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 mt-4">
                <p className="font-semibold text-slate-900 dark:text-white mb-2">
                  BM&V Consultoria Empresarial
                </p>
                <p className="text-sm">
                  <strong>E-mail do DPO:</strong>{' '}
                  <a
                    href="mailto:privacidade@bmvconsultoria.com.br"
                    className="text-bmv-primary hover:text-bmv-secondary transition-colors"
                  >
                    privacidade@bmvconsultoria.com.br
                  </a>
                </p>
                <p className="text-sm mt-2">
                  <strong>E-mail geral:</strong>{' '}
                  <a
                    href="mailto:contato@bmvconsultoria.com.br"
                    className="text-bmv-primary hover:text-bmv-secondary transition-colors"
                  >
                    contato@bmvconsultoria.com.br
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer Links */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <Link href="/termos" className="hover:text-bmv-primary transition-colors">
              Termos de Uso
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
