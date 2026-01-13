export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[Webhook MP] Notificação recebida:', JSON.stringify(body, null, 2))

    if (body.type === 'payment') {
      const paymentId = body.data?.id
      console.log('[Webhook MP] Pagamento recebido, ID:', paymentId)

      // TODO: Buscar detalhes do pagamento na API do Mercado Pago
      // const payment = await mercadopago.payment.findById(paymentId)
      //
      // TODO: Atualizar status do tenant/assinatura no banco
      // if (payment.status === 'approved') {
      //   await prisma.tenant.update({ ... })
      // }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[Webhook MP] Erro ao processar:', error)
    return NextResponse.json({ received: true })
  }
}
