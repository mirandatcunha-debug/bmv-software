// Tipos para o modulo de Configuracoes

export type Tema = 'light' | 'dark' | 'system'
export type Densidade = 'compact' | 'normal' | 'comfortable'

export interface PerfilUsuario {
  id: string
  nome: string
  email: string
  telefone?: string
  avatarUrl?: string
  perfil: string
  primeiroAcesso: boolean
  ultimoAcesso?: Date
  criadoEm?: Date
}

export interface DadosEmpresa {
  id: string
  nome: string
  cnpj?: string
  email: string
  telefone?: string
  endereco?: string
  logoUrl?: string
}

export interface UsuarioLista {
  id: string
  nome: string
  email: string
  perfil: string
  ativo: boolean
  primeiroAcesso: boolean
  ultimoAcesso?: Date | string
  criadoEm: Date | string
  avatarUrl?: string
}

export interface ConfiguracoesNotificacao {
  emailTarefaAtribuida: boolean
  emailPrazoProximo: boolean
  emailResumoSemanal: boolean
  notificacaoSistema: boolean
}

export interface ConfiguracoesAparencia {
  tema: Tema
  corPrimaria: string
  densidade: Densidade
}

// Labels
export const temaLabels: Record<Tema, string> = {
  light: 'Claro',
  dark: 'Escuro',
  system: 'Sistema',
}

export const densidadeLabels: Record<Densidade, string> = {
  compact: 'Compacto',
  normal: 'Normal',
  comfortable: 'Confortavel',
}

export const perfilLabels: Record<string, string> = {
  ADMIN_BMV: 'Administrador BM&V',
  CONSULTOR_BMV: 'Consultor BM&V',
  GESTOR: 'Gestor',
  COLABORADOR: 'Colaborador',
  CLIENTE: 'Cliente',
}

// Cores disponiveis para personalizacao
export const coresPrimarias = [
  { value: '#1a365d', label: 'Azul BM&V' },
  { value: '#0ea5e9', label: 'Azul Claro' },
  { value: '#10b981', label: 'Verde' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#f59e0b', label: 'Laranja' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#6366f1', label: 'Indigo' },
]
