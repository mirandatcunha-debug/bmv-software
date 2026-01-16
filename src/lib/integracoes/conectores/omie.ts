import { ConectorBase } from './base'
import { ResultadoSync } from '../tipos'
import { prisma } from '@/lib/prisma'

export class ConectorOmie extends ConectorBase {
  private baseUrl = 'https://app.omie.com.br/api/v1'

  private async chamarAPI(endpoint: string, call: string, params: any = {}) {
    const response = await fetch(`${this.baseUrl}/${endpoint}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        call,
        app_key: this.credenciais.appKey,
        app_secret: this.credenciais.appSecret,
        param: [params]
      })
    })
    return response.json()
  }

  async testarConexao(): Promise<{ sucesso: boolean; mensagem: string }> {
    try {
      const resultado = await this.chamarAPI('geral/empresas', 'ListarEmpresas', {
        pagina: 1,
        registros_por_pagina: 1
      })

      if (resultado.faultstring) {
        return { sucesso: false, mensagem: resultado.faultstring }
      }

      return { sucesso: true, mensagem: 'Conexão estabelecida com sucesso!' }
    } catch (error) {
      return { sucesso: false, mensagem: 'Erro ao conectar com a API do Omie' }
    }
  }

  async sincronizarClientes(): Promise<ResultadoSync> {
    let criados = 0, atualizados = 0, erros = 0
    let pagina = 1
    const porPagina = 50

    try {
      while (true) {
        const resultado = await this.chamarAPI('geral/clientes', 'ListarClientes', {
          pagina,
          registros_por_pagina: porPagina,
          apenas_importado_api: 'N'
        })

        if (resultado.faultstring || !resultado.clientes_cadastro) break

        for (const cliente of resultado.clientes_cadastro) {
          try {
            const existente = await prisma.client.findFirst({
              where: {
                tenantId: this.tenantId,
                OR: [
                  { cpfCnpj: cliente.cnpj_cpf },
                  { email: cliente.email }
                ].filter(c => Object.values(c)[0])
              }
            })

            const nome = cliente.razao_social || cliente.nome_fantasia || 'Cliente sem nome'
            const codigo = cliente.codigo_cliente_omie?.toString() || cliente.cnpj_cpf || `OMIE-${Date.now()}`
            const tipo = cliente.cnpj_cpf && cliente.cnpj_cpf.length > 14 ? 'PJ' : 'PF'

            const dados = {
              nome,
              cpfCnpj: cliente.cnpj_cpf || null,
              email: cliente.email || null,
              telefone: cliente.telefone1_numero || null,
              endereco: cliente.endereco || null,
              cidade: cliente.cidade || null,
              uf: cliente.estado || null,
              cep: cliente.cep || null
            }

            if (existente) {
              await prisma.client.update({ where: { id: existente.id }, data: dados })
              atualizados++
            } else {
              await prisma.client.create({
                data: {
                  ...dados,
                  tenantId: this.tenantId,
                  codigo,
                  tipo
                }
              })
              criados++
            }
          } catch (err) {
            erros++
          }
        }

        if (resultado.clientes_cadastro.length < porPagina) break
        pagina++
      }

      return { sucesso: true, tipo: 'clientes', criados, atualizados, erros }
    } catch (error) {
      return { sucesso: false, tipo: 'clientes', criados, atualizados, erros, mensagem: String(error) }
    }
  }

  async sincronizarFornecedores(): Promise<ResultadoSync> {
    // Implementação similar ao sincronizarClientes
    return { sucesso: true, tipo: 'fornecedores', criados: 0, atualizados: 0, erros: 0, mensagem: 'Em desenvolvimento' }
  }

  async sincronizarContasReceber(): Promise<ResultadoSync> {
    let criados = 0, atualizados = 0, erros = 0

    try {
      const resultado = await this.chamarAPI('financas/contareceber', 'ListarContasReceber', {
        pagina: 1,
        registros_por_pagina: 100,
        apenas_importado_api: 'N'
      })

      if (resultado.conta_receber_cadastro) {
        for (const conta of resultado.conta_receber_cadastro) {
          try {
            await prisma.receivable.create({
              data: {
                tenantId: this.tenantId,
                cliente: conta.nome_cliente || 'Cliente não identificado',
                descricao: conta.observacao || `Conta ${conta.numero_documento}`,
                valor: parseFloat(conta.valor_documento),
                dataVencimento: new Date(conta.data_vencimento),
                dataEmissao: conta.data_emissao ? new Date(conta.data_emissao) : new Date(),
                status: conta.status_titulo === 'LIQUIDADO' ? 'PAGO' : 'PENDENTE'
              }
            })
            criados++
          } catch (err) {
            erros++
          }
        }
      }

      return { sucesso: true, tipo: 'contasReceber', criados, atualizados, erros }
    } catch (error) {
      return { sucesso: false, tipo: 'contasReceber', criados, atualizados, erros, mensagem: String(error) }
    }
  }

  async sincronizarContasPagar(): Promise<ResultadoSync> {
    // Implementação similar
    return { sucesso: true, tipo: 'contasPagar', criados: 0, atualizados: 0, erros: 0, mensagem: 'Em desenvolvimento' }
  }
}
