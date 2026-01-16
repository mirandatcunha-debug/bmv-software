import { ResultadoSync } from '../tipos'

export abstract class ConectorBase {
  protected credenciais: Record<string, string>
  protected tenantId: string

  constructor(tenantId: string, credenciais: Record<string, string>) {
    this.tenantId = tenantId
    this.credenciais = credenciais
  }

  abstract testarConexao(): Promise<{ sucesso: boolean; mensagem: string }>
  abstract sincronizarClientes(): Promise<ResultadoSync>
  abstract sincronizarFornecedores(): Promise<ResultadoSync>
  abstract sincronizarContasReceber(): Promise<ResultadoSync>
  abstract sincronizarContasPagar(): Promise<ResultadoSync>
}
