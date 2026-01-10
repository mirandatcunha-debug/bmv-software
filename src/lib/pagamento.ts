// Configuração de pagamento - integração com Stripe/MercadoPago
// As chaves reais virão das variáveis de ambiente

export const PAGAMENTO_CONFIG = {
  // Stripe
  stripePublicKey: process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',

  // MercadoPago (alternativa)
  mercadoPagoPublicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '',
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',

  // URLs
  successUrl: process.env.NEXT_PUBLIC_APP_URL + '/pagamento/sucesso',
  cancelUrl: process.env.NEXT_PUBLIC_APP_URL + '/planos',
  webhookUrl: process.env.NEXT_PUBLIC_APP_URL + '/api/pagamento/webhook',
} as const

// Preços dos planos (em centavos para Stripe)
export const PRECOS_PLANOS = {
  BASICO: {
    mensal: 9900, // R$ 99,00
    anual: 99000, // R$ 990,00 (2 meses grátis)
    nome: 'Plano Básico',
    descricao: 'Ideal para pequenas empresas',
  },
  PROFISSIONAL: {
    mensal: 19900, // R$ 199,00
    anual: 199000, // R$ 1.990,00 (2 meses grátis)
    nome: 'Plano Profissional',
    descricao: 'Para empresas em crescimento',
  },
  ENTERPRISE: {
    mensal: 49900, // R$ 499,00
    anual: 499000, // R$ 4.990,00 (2 meses grátis)
    nome: 'Plano Enterprise',
    descricao: 'Recursos ilimitados para grandes operações',
  },
} as const

export type PlanoType = keyof typeof PRECOS_PLANOS
export type PeriodoType = 'mensal' | 'anual'

// Interface de configuração de pagamento
export interface PagamentoConfig {
  gateway: 'stripe' | 'mercadopago'
  plano: PlanoType
  periodo: PeriodoType
  tenantId: string
  email: string
}

// Interface de assinatura
export interface Assinatura {
  id: string
  tenantId: string
  plano: PlanoType
  periodo: PeriodoType
  status: 'ativa' | 'cancelada' | 'pendente' | 'expirada'
  dataInicio: Date
  dataRenovacao: Date
  gatewayAssinaturaId: string
  gateway: 'stripe' | 'mercadopago'
}

// Interface de resposta de checkout
export interface CheckoutResponse {
  success: boolean
  checkoutUrl?: string
  sessionId?: string
  error?: string
}

// Interface de resposta de webhook
export interface WebhookResponse {
  success: boolean
  message: string
  evento?: string
}

/**
 * Cria uma nova assinatura (MOCKADA)
 * Em produção, isso criará uma sessão de checkout no Stripe/MercadoPago
 */
export async function criarAssinatura(
  plano: PlanoType,
  tenantId: string,
  periodo: PeriodoType = 'mensal',
  email?: string
): Promise<CheckoutResponse> {
  // Mock: simula criação de sessão de checkout
  console.log(`[MOCK] Criando assinatura: ${plano} para tenant ${tenantId}`)

  const preco = PRECOS_PLANOS[plano]
  if (!preco) {
    return {
      success: false,
      error: 'Plano inválido',
    }
  }

  // Em produção, aqui criaria a sessão no Stripe:
  // const session = await stripe.checkout.sessions.create({...})

  // Mock: retorna URL de checkout simulada
  const mockSessionId = `mock_session_${Date.now()}_${tenantId}`
  const mockCheckoutUrl = `/checkout/${plano.toLowerCase()}?session=${mockSessionId}&periodo=${periodo}`

  return {
    success: true,
    checkoutUrl: mockCheckoutUrl,
    sessionId: mockSessionId,
  }
}

/**
 * Cancela uma assinatura existente (MOCKADA)
 * Em produção, isso cancelará no Stripe/MercadoPago
 */
export async function cancelarAssinatura(
  assinaturaId: string
): Promise<{ success: boolean; message: string }> {
  // Mock: simula cancelamento
  console.log(`[MOCK] Cancelando assinatura: ${assinaturaId}`)

  // Em produção, aqui cancelaria no Stripe:
  // await stripe.subscriptions.cancel(assinaturaId)

  return {
    success: true,
    message: 'Assinatura cancelada com sucesso',
  }
}

/**
 * Verifica status da assinatura de um tenant (MOCKADA)
 * Em produção, isso consultará o banco e/ou Stripe
 */
export async function verificarAssinatura(
  tenantId: string
): Promise<Assinatura | null> {
  // Mock: simula verificação
  console.log(`[MOCK] Verificando assinatura do tenant: ${tenantId}`)

  // Em produção, aqui consultaria o banco de dados
  // const assinatura = await prisma.assinatura.findFirst({ where: { tenantId } })

  // Mock: retorna null (sem assinatura ativa)
  return null
}

/**
 * Processa webhook de pagamento (MOCKADA)
 * Em produção, isso verificará a assinatura do webhook e processará o evento
 */
export async function processarWebhook(
  payload: string,
  signature: string,
  gateway: 'stripe' | 'mercadopago'
): Promise<WebhookResponse> {
  // Mock: simula processamento de webhook
  console.log(`[MOCK] Processando webhook ${gateway}`)

  // Em produção, aqui verificaria a assinatura:
  // const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)

  return {
    success: true,
    message: 'Webhook processado com sucesso',
    evento: 'mock_event',
  }
}

/**
 * Ativa o plano de um tenant (usado após confirmação de pagamento)
 */
export async function ativarPlano(
  tenantId: string,
  plano: PlanoType,
  periodo: PeriodoType
): Promise<{ success: boolean; message: string }> {
  // Esta função será chamada pelo webhook ou simulação
  console.log(`[MOCK] Ativando plano ${plano} para tenant ${tenantId}`)

  // Em produção, atualizaria o tenant no banco:
  // await prisma.tenant.update({
  //   where: { id: tenantId },
  //   data: { plano, assinaturaAtiva: true }
  // })

  return {
    success: true,
    message: `Plano ${plano} ativado com sucesso`,
  }
}

/**
 * Formata preço em reais
 */
export function formatarPreco(centavos: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(centavos / 100)
}

/**
 * Calcula desconto do plano anual
 */
export function calcularDescontoAnual(plano: PlanoType): number {
  const preco = PRECOS_PLANOS[plano]
  const precoMensalAnualizado = preco.mensal * 12
  const economia = precoMensalAnualizado - preco.anual
  return Math.round((economia / precoMensalAnualizado) * 100)
}
