import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

// Tipos de ações para auditoria LGPD
export const AcoesAtividade = {
  // Autenticação
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  LOGIN_FALHOU: 'LOGIN_FALHOU',

  // Cadastro e conta
  CADASTRO: 'CADASTRO',
  ALTEROU_DADOS: 'ALTEROU_DADOS',
  ALTEROU_SENHA: 'ALTEROU_SENHA',
  ALTEROU_EMAIL: 'ALTEROU_EMAIL',
  EXCLUIU_CONTA: 'EXCLUIU_CONTA',
  RECUPEROU_SENHA: 'RECUPEROU_SENHA',

  // Consentimento LGPD
  ACEITOU_TERMOS: 'ACEITOU_TERMOS',
  ACEITOU_PRIVACIDADE: 'ACEITOU_PRIVACIDADE',
  REVOGOU_CONSENTIMENTO: 'REVOGOU_CONSENTIMENTO',

  // Dados pessoais
  EXPORTOU_DADOS: 'EXPORTOU_DADOS',
  SOLICITOU_EXCLUSAO: 'SOLICITOU_EXCLUSAO',
  VISUALIZOU_DADOS: 'VISUALIZOU_DADOS',

  // Segurança
  ATIVOU_2FA: 'ATIVOU_2FA',
  DESATIVOU_2FA: 'DESATIVOU_2FA',
  SESSAO_ENCERRADA: 'SESSAO_ENCERRADA',

  // Permissões
  PERMISSAO_CONCEDIDA: 'PERMISSAO_CONCEDIDA',
  PERMISSAO_REVOGADA: 'PERMISSAO_REVOGADA',

  // Usuários
  CONVIDOU_USUARIO: 'CONVIDOU_USUARIO',
  REMOVEU_USUARIO: 'REMOVEU_USUARIO',

  // Financeiro
  EXPORTOU_RELATORIO: 'EXPORTOU_RELATORIO',
  IMPORTOU_DADOS: 'IMPORTOU_DADOS',
} as const

export type AcaoAtividade = typeof AcoesAtividade[keyof typeof AcoesAtividade]

// Descrições amigáveis das ações
export const DescricoesAcoes: Record<AcaoAtividade, string> = {
  LOGIN: 'Realizou login na plataforma',
  LOGOUT: 'Encerrou a sessão',
  LOGIN_FALHOU: 'Tentativa de login falhou',
  CADASTRO: 'Criou uma nova conta',
  ALTEROU_DADOS: 'Alterou dados do perfil',
  ALTEROU_SENHA: 'Alterou a senha',
  ALTEROU_EMAIL: 'Alterou o e-mail',
  EXCLUIU_CONTA: 'Solicitou exclusão da conta',
  RECUPEROU_SENHA: 'Solicitou recuperação de senha',
  ACEITOU_TERMOS: 'Aceitou os termos de uso',
  ACEITOU_PRIVACIDADE: 'Aceitou a política de privacidade',
  REVOGOU_CONSENTIMENTO: 'Revogou consentimento de dados',
  EXPORTOU_DADOS: 'Exportou seus dados pessoais',
  SOLICITOU_EXCLUSAO: 'Solicitou exclusão de dados',
  VISUALIZOU_DADOS: 'Visualizou seus dados pessoais',
  ATIVOU_2FA: 'Ativou autenticação em duas etapas',
  DESATIVOU_2FA: 'Desativou autenticação em duas etapas',
  SESSAO_ENCERRADA: 'Sessão encerrada por inatividade',
  PERMISSAO_CONCEDIDA: 'Recebeu nova permissão',
  PERMISSAO_REVOGADA: 'Teve permissão revogada',
  CONVIDOU_USUARIO: 'Convidou um novo usuário',
  REMOVEU_USUARIO: 'Removeu um usuário',
  EXPORTOU_RELATORIO: 'Exportou relatório',
  IMPORTOU_DADOS: 'Importou dados via planilha',
}

// Obtém IP e User-Agent do request
export function obterDadosRequest(): { ip: string | null; userAgent: string | null } {
  try {
    const headersList = headers()

    // Tenta obter o IP real (considerando proxies)
    const forwardedFor = headersList.get('x-forwarded-for')
    const realIp = headersList.get('x-real-ip')
    const ip = forwardedFor?.split(',')[0]?.trim() || realIp || null

    // Obtém o User-Agent
    const userAgent = headersList.get('user-agent') || null

    return { ip, userAgent }
  } catch {
    // Se falhar (ex: chamado fora de um request), retorna null
    return { ip: null, userAgent: null }
  }
}

interface RegistrarAtividadeParams {
  tenantId: string
  userId?: string | null
  acao: AcaoAtividade
  descricao?: string
  dados?: Record<string, unknown>
  ip?: string | null
  userAgent?: string | null
}

/**
 * Registra uma atividade para auditoria LGPD
 */
export async function registrarAtividade({
  tenantId,
  userId,
  acao,
  descricao,
  dados,
  ip,
  userAgent,
}: RegistrarAtividadeParams): Promise<void> {
  try {
    // Se IP/UserAgent não foram fornecidos, tenta obter do request
    let ipFinal = ip
    let userAgentFinal = userAgent

    if (!ipFinal || !userAgentFinal) {
      const dadosRequest = obterDadosRequest()
      ipFinal = ipFinal || dadosRequest.ip
      userAgentFinal = userAgentFinal || dadosRequest.userAgent
    }

    // Usa a descrição padrão se não fornecida
    const descricaoFinal = descricao || DescricoesAcoes[acao] || acao

    await prisma.logAtividade.create({
      data: {
        tenantId,
        userId: userId || null,
        acao,
        descricao: descricaoFinal,
        ip: ipFinal,
        userAgent: userAgentFinal,
        dados: dados ? JSON.parse(JSON.stringify(dados)) : undefined,
      },
    })
  } catch (error) {
    // Log silencioso para não interromper o fluxo principal
    console.error('Erro ao registrar atividade:', error)
  }
}

/**
 * Busca atividades de um usuário
 */
export async function buscarAtividadesUsuario(
  tenantId: string,
  userId: string,
  limite: number = 50
) {
  return prisma.logAtividade.findMany({
    where: {
      tenantId,
      userId,
    },
    orderBy: {
      criadoEm: 'desc',
    },
    take: limite,
  })
}

/**
 * Busca atividades de um tenant (para admins)
 */
export async function buscarAtividadesTenant(
  tenantId: string,
  limite: number = 100,
  filtros?: {
    userId?: string
    acao?: AcaoAtividade
    dataInicio?: Date
    dataFim?: Date
  }
) {
  return prisma.logAtividade.findMany({
    where: {
      tenantId,
      ...(filtros?.userId && { userId: filtros.userId }),
      ...(filtros?.acao && { acao: filtros.acao }),
      ...(filtros?.dataInicio || filtros?.dataFim
        ? {
            criadoEm: {
              ...(filtros.dataInicio && { gte: filtros.dataInicio }),
              ...(filtros.dataFim && { lte: filtros.dataFim }),
            },
          }
        : {}),
    },
    orderBy: {
      criadoEm: 'desc',
    },
    take: limite,
  })
}

/**
 * Formata a data de atividade para exibição
 */
export function formatarDataAtividade(data: Date): string {
  const agora = new Date()
  const diff = agora.getTime() - data.getTime()
  const minutos = Math.floor(diff / 60000)
  const horas = Math.floor(diff / 3600000)
  const dias = Math.floor(diff / 86400000)

  if (minutos < 1) return 'Agora mesmo'
  if (minutos < 60) return `Há ${minutos} min`
  if (horas < 24) return `Há ${horas}h`
  if (dias < 7) return `Há ${dias} dia${dias > 1 ? 's' : ''}`

  return data.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Retorna o ícone apropriado para cada tipo de ação
 */
export function obterIconeAcao(acao: string): string {
  const icones: Record<string, string> = {
    LOGIN: 'LogIn',
    LOGOUT: 'LogOut',
    LOGIN_FALHOU: 'AlertTriangle',
    CADASTRO: 'UserPlus',
    ALTEROU_DADOS: 'Edit',
    ALTEROU_SENHA: 'Key',
    ALTEROU_EMAIL: 'Mail',
    EXCLUIU_CONTA: 'Trash2',
    RECUPEROU_SENHA: 'RefreshCw',
    ACEITOU_TERMOS: 'FileCheck',
    ACEITOU_PRIVACIDADE: 'Shield',
    REVOGOU_CONSENTIMENTO: 'ShieldOff',
    EXPORTOU_DADOS: 'Download',
    SOLICITOU_EXCLUSAO: 'Trash',
    VISUALIZOU_DADOS: 'Eye',
    ATIVOU_2FA: 'Lock',
    DESATIVOU_2FA: 'Unlock',
    SESSAO_ENCERRADA: 'Clock',
    PERMISSAO_CONCEDIDA: 'CheckCircle',
    PERMISSAO_REVOGADA: 'XCircle',
    CONVIDOU_USUARIO: 'UserPlus',
    REMOVEU_USUARIO: 'UserMinus',
    EXPORTOU_RELATORIO: 'FileDown',
    IMPORTOU_DADOS: 'FileUp',
  }

  return icones[acao] || 'Activity'
}

/**
 * Retorna a cor apropriada para cada tipo de ação
 */
export function obterCorAcao(acao: string): string {
  const cores: Record<string, string> = {
    LOGIN: 'text-green-600',
    LOGOUT: 'text-slate-600',
    LOGIN_FALHOU: 'text-red-600',
    CADASTRO: 'text-blue-600',
    ALTEROU_DADOS: 'text-amber-600',
    ALTEROU_SENHA: 'text-purple-600',
    ALTEROU_EMAIL: 'text-blue-600',
    EXCLUIU_CONTA: 'text-red-600',
    RECUPEROU_SENHA: 'text-amber-600',
    ACEITOU_TERMOS: 'text-green-600',
    ACEITOU_PRIVACIDADE: 'text-green-600',
    REVOGOU_CONSENTIMENTO: 'text-red-600',
    EXPORTOU_DADOS: 'text-blue-600',
    SOLICITOU_EXCLUSAO: 'text-red-600',
    VISUALIZOU_DADOS: 'text-slate-600',
    ATIVOU_2FA: 'text-green-600',
    DESATIVOU_2FA: 'text-amber-600',
    SESSAO_ENCERRADA: 'text-slate-600',
    PERMISSAO_CONCEDIDA: 'text-green-600',
    PERMISSAO_REVOGADA: 'text-red-600',
    CONVIDOU_USUARIO: 'text-blue-600',
    REMOVEU_USUARIO: 'text-red-600',
    EXPORTOU_RELATORIO: 'text-blue-600',
    IMPORTOU_DADOS: 'text-green-600',
  }

  return cores[acao] || 'text-slate-600'
}
