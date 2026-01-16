import { TipoERP } from './tipos'
import { ConectorBase } from './conectores/base'
import { ConectorOmie } from './conectores/omie'

export function criarConector(tipo: TipoERP, tenantId: string, credenciais: Record<string, string>): ConectorBase | null {
  switch (tipo) {
    case 'OMIE':
      return new ConectorOmie(tenantId, credenciais)
    // Adicionar outros conectores conforme implementados
    default:
      return null
  }
}
