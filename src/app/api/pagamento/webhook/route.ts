export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PAGAMENTO_CONFIG, PlanoType, PeriodoType } from '@/lib/pagamento'
import { PLAN_LIMITS } from '@/lib/plan-limits'

// Tipos de eventos suportados
type WebhookEventType =
  | 'checkout.session.completed'
  | 'customer.subscription.updated'
  | 'customer.subscription.deleted'
  | 'invoice.payment_succeeded'
  | 'invoice.payment_failed'

interface WebhookPayload {
  type: WebhookEventType
  data: {
    object: {
      id: string
      customer?: string
      subscription?: string
      metadata?: {
        tenantId?: string
        plano?: string
        periodo?: string
      }
      status?: string
      customer_email?: string
    }
  }
}

// POST: Receber webhook do gateway de pagamento
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature') ||
                      request.headers.get('x-mercadopago-signature') || ''

    // Em produção, verificar assinatura do webhook
    // const event = stripe.webhooks.constructEvent(payload, signature, PAGAMENTO_CONFIG.stripeWebhookSecret)

    // Por enquanto, aceitar qualquer payload válido (MOCK)
    let event: WebhookPayload
    try {
      event = JSON.parse(payload) as WebhookPayload
    } catch {
      return NextResponse.json(
        { error: 'Payload inválido' },
        { status: 400 }
      )
    }

    console.log(`[Webhook] Evento recebido: ${event.type}`)

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`[Webhook] Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: 'Erro ao processar webhook' },
      { status: 500 }
    )
  }
}

// Handler: Checkout completado com sucesso
async function handleCheckoutCompleted(data: WebhookPayload['data']['object']) {
  const { metadata } = data

  if (!metadata?.tenantId || !metadata?.plano) {
    console.error('[Webhook] Metadata incompleta no checkout')
    return
  }

  const plano = metadata.plano.toUpperCase() as PlanoType
  const periodo = (metadata.periodo || 'mensal') as PeriodoType

  // Atualizar tenant com novo plano
  await prisma.tenant.update({
    where: { id: metadata.tenantId },
    data: {
      plano,
      assinaturaAtiva: true,
      trialExpira: null, // Remove expiração do trial
    },
  })

  // Enviar email de confirmação (MOCK)
  await enviarEmailConfirmacao(metadata.tenantId, plano)

  console.log(`[Webhook] Plano ${plano} ativado para tenant ${metadata.tenantId}`)
}

// Handler: Assinatura atualizada
async function handleSubscriptionUpdated(data: WebhookPayload['data']['object']) {
  const { metadata, status } = data

  if (!metadata?.tenantId) {
    console.error('[Webhook] TenantId não encontrado na atualização')
    return
  }

  const assinaturaAtiva = status === 'active'

  await prisma.tenant.update({
    where: { id: metadata.tenantId },
    data: { assinaturaAtiva },
  })

  console.log(`[Webhook] Assinatura atualizada para tenant ${metadata.tenantId}: ${status}`)
}

// Handler: Assinatura cancelada/deletada
async function handleSubscriptionDeleted(data: WebhookPayload['data']['object']) {
  const { metadata } = data

  if (!metadata?.tenantId) {
    console.error('[Webhook] TenantId não encontrado no cancelamento')
    return
  }

  // Downgrade para TRIAL (mantém acesso limitado)
  await prisma.tenant.update({
    where: { id: metadata.tenantId },
    data: {
      plano: 'TRIAL',
      assinaturaAtiva: false,
    },
  })

  // Enviar email de cancelamento (MOCK)
  await enviarEmailCancelamento(metadata.tenantId)

  console.log(`[Webhook] Assinatura cancelada para tenant ${metadata.tenantId}`)
}

// Handler: Pagamento de fatura bem-sucedido
async function handlePaymentSucceeded(data: WebhookPayload['data']['object']) {
  const { metadata } = data

  if (!metadata?.tenantId) return

  console.log(`[Webhook] Pagamento confirmado para tenant ${metadata.tenantId}`)

  // Aqui poderia registrar o pagamento em uma tabela de histórico
}

// Handler: Falha no pagamento
async function handlePaymentFailed(data: WebhookPayload['data']['object']) {
  const { metadata, customer_email } = data

  if (!metadata?.tenantId) return

  console.log(`[Webhook] Falha no pagamento para tenant ${metadata.tenantId}`)

  // Enviar email de falha no pagamento (MOCK)
  await enviarEmailFalhaPagamento(metadata.tenantId, customer_email)
}

// Funções de email (MOCKADAS)
async function enviarEmailConfirmacao(tenantId: string, plano: PlanoType) {
  // Em produção, usar serviço de email (SendGrid, Resend, etc.)
  console.log(`[MOCK Email] Confirmação de assinatura enviada para tenant ${tenantId}`)
  console.log(`  Plano: ${plano}`)
  console.log(`  Limites: ${JSON.stringify(PLAN_LIMITS[plano])}`)
}

async function enviarEmailCancelamento(tenantId: string) {
  console.log(`[MOCK Email] Confirmação de cancelamento enviada para tenant ${tenantId}`)
}

async function enviarEmailFalhaPagamento(tenantId: string, email?: string) {
  console.log(`[MOCK Email] Aviso de falha no pagamento enviado para ${email || tenantId}`)
}

// GET: Verificar status do webhook (para testes)
export async function GET() {
  return NextResponse.json({
    status: 'active',
    gateway: 'stripe',
    webhookUrl: PAGAMENTO_CONFIG.webhookUrl,
    eventosSuportados: [
      'checkout.session.completed',
      'customer.subscription.updated',
      'customer.subscription.deleted',
      'invoice.payment_succeeded',
      'invoice.payment_failed',
    ],
  })
}
