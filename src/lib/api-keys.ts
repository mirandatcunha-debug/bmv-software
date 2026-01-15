import { randomBytes } from 'crypto'

export function gerarApiKey(): string {
  const bytes = randomBytes(32)
  const key = bytes.toString('hex')
  return `bmv_live_${key}`
}

export function validarApiKey(chave: string): boolean {
  return chave.startsWith('bmv_live_') && chave.length === 73
}
