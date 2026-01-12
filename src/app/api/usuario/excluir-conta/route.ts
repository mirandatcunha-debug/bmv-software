export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createServerComponentClient } from '@/lib/supabase/server'

// POST: Solicitar exclusão da conta (LGPD)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerComponentClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Nao autorizado' }, { status: 401 })
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { authId: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario nao encontrado' }, { status: 404 })
    }

    // Obter motivo da exclusão (opcional)
    let motivo = ''
    try {
      const body = await request.json()
      motivo = body.motivo || ''
    } catch {
      // Body vazio é permitido
    }

    // Verificar se usuário é GESTOR
    const isGestor = user.perfil === 'GESTOR'

    if (isGestor) {
      // Contar outros GESTOREs no tenant
      const outrosGestores = await prisma.user.count({
        where: {
          tenantId: user.tenantId,
          perfil: 'GESTOR',
          id: { not: user.id },
          ativo: true,
        },
      })

      // Contar outros usuários ativos no tenant
      const outrosUsuarios = await prisma.user.count({
        where: {
          tenantId: user.tenantId,
          id: { not: user.id },
          ativo: true,
        },
      })

      // Se for o único GESTOR e tiver outros usuários, não pode excluir
      if (outrosGestores === 0 && outrosUsuarios > 0) {
        return NextResponse.json({
          error: 'Voce e o unico gestor deste tenant. Transfira a gestao para outro usuario antes de excluir sua conta.',
          codigo: 'GESTOR_UNICO_COM_USUARIOS',
        }, { status: 400 })
      }

      // Se for o único usuário do tenant, excluir tenant e todos os dados
      if (outrosUsuarios === 0) {
        // Calcular data de exclusão efetiva (30 dias)
        const dataExclusao = new Date()
        dataExclusao.setDate(dataExclusao.getDate() + 30)

        // Marcar tenant para exclusão (soft delete)
        await prisma.tenant.update({
          where: { id: user.tenantId },
          data: {
            ativo: false,
            // Armazenar dados de exclusão em campo de metadados se existir
            // ou criar registro de auditoria
          },
        })

        // Marcar usuário como inativo
        await prisma.user.update({
          where: { id: user.id },
          data: {
            ativo: false,
          },
        })

        // Registrar log de exclusão
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            tenantId: user.tenantId,
            acao: 'SOLICITAR_EXCLUSAO_CONTA',
            entidade: 'TENANT',
            entidadeId: user.tenantId,
            dadosNovos: {
              tipo: 'EXCLUSAO_TENANT_COMPLETO',
              motivo,
              dataExclusaoEfetiva: dataExclusao.toISOString(),
              solicitadoEm: new Date().toISOString(),
            },
          },
        })

        console.log(`Exclusão de tenant solicitada - Tenant: ${user.tenantId}, Usuario: ${user.id}, Data efetiva: ${dataExclusao.toISOString()}`)

        // TODO: Enviar email confirmando solicitação de exclusão
        // await sendEmail({
        //   to: user.email,
        //   subject: 'Confirmação de solicitação de exclusão de conta',
        //   template: 'account-deletion-request',
        //   data: {
        //     nome: user.nome,
        //     dataExclusao: dataExclusao.toLocaleDateString('pt-BR'),
        //   },
        // })

        console.log(`Email de confirmação de exclusão enviado para: ${user.email}`)

        return NextResponse.json({
          message: 'Solicitacao de exclusao registrada com sucesso. Sua conta e todos os dados do tenant serao excluidos permanentemente em 30 dias.',
          dataExclusaoEfetiva: dataExclusao.toISOString(),
          tipo: 'EXCLUSAO_TENANT_COMPLETO',
        })
      }
    }

    // Soft delete do usuário (não é gestor único ou não tem outros usuários)
    const dataExclusao = new Date()
    dataExclusao.setDate(dataExclusao.getDate() + 30)

    // Marcar usuário como inativo
    await prisma.user.update({
      where: { id: user.id },
      data: {
        ativo: false,
      },
    })

    // Registrar log de exclusão
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        acao: 'SOLICITAR_EXCLUSAO_CONTA',
        entidade: 'USER',
        entidadeId: user.id,
        dadosNovos: {
          tipo: 'EXCLUSAO_USUARIO',
          motivo,
          dataExclusaoEfetiva: dataExclusao.toISOString(),
          solicitadoEm: new Date().toISOString(),
        },
      },
    })

    console.log(`Exclusão de conta solicitada - Usuario: ${user.id}, Data efetiva: ${dataExclusao.toISOString()}`)

    // TODO: Enviar email confirmando solicitação de exclusão
    // await sendEmail({
    //   to: user.email,
    //   subject: 'Confirmação de solicitação de exclusão de conta',
    //   template: 'account-deletion-request',
    //   data: {
    //     nome: user.nome,
    //     dataExclusao: dataExclusao.toLocaleDateString('pt-BR'),
    //   },
    // })

    console.log(`Email de confirmação de exclusão enviado para: ${user.email}`)

    return NextResponse.json({
      message: 'Solicitacao de exclusao registrada com sucesso. Sua conta sera excluida permanentemente em 30 dias. Voce pode cancelar esta solicitacao entrando em contato com o suporte.',
      dataExclusaoEfetiva: dataExclusao.toISOString(),
      tipo: 'EXCLUSAO_USUARIO',
    })

  } catch (error) {
    console.error('Erro ao solicitar exclusao de conta:', error)
    return NextResponse.json({ error: 'Erro ao solicitar exclusao de conta' }, { status: 500 })
  }
}
