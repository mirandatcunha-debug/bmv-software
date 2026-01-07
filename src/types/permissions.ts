// Tipos para controle de permissões do sistema

// Perfis de usuário disponíveis
export type PerfilUsuario = 'ADMIN' | 'GESTOR' | 'COLABORADOR' | 'CLIENTE'

// Módulos do sistema
export type Modulo =
  | 'dashboard'
  | 'financeiro'
  | 'financeiro.movimentacoes'
  | 'financeiro.contas'
  | 'financeiro.categorias'
  | 'financeiro.fluxo-caixa'
  | 'okr'
  | 'okr.objetivos'
  | 'okr.key-results'
  | 'okr.tarefas'
  | 'consultoria'
  | 'consultoria.projetos'
  | 'consultoria.tarefas'
  | 'contabil'
  | 'contabil.lancamentos'
  | 'contabil.plano-contas'
  | 'contabil.centros-custo'
  | 'configuracoes'
  | 'configuracoes.empresa'
  | 'configuracoes.usuarios'
  | 'configuracoes.conta'
  | 'configuracoes.aparencia'
  | 'configuracoes.notificacoes'
  | 'admin'
  | 'admin.empresas'
  | 'admin.usuarios'

// Ações possíveis
export type Acao = 'view' | 'create' | 'edit' | 'delete'

// Tipo para definir permissões por ação
export type PermissoesAcao = {
  [key in Acao]: boolean
}

// Tipo para definir permissões por módulo
export type PermissoesModulo = {
  [key in Modulo]?: PermissoesAcao
}

// Tipo para matriz completa de permissões
export type MatrizPermissoes = {
  [key in PerfilUsuario]: PermissoesModulo
}

// Permissão completa (todas as ações permitidas)
const FULL: PermissoesAcao = { view: true, create: true, edit: true, delete: true }

// Apenas visualização
const VIEW_ONLY: PermissoesAcao = { view: true, create: false, edit: false, delete: false }

// Visualizar e criar
const VIEW_CREATE: PermissoesAcao = { view: true, create: true, edit: false, delete: false }

// Visualizar, criar e editar
const VIEW_CREATE_EDIT: PermissoesAcao = { view: true, create: true, edit: true, delete: false }

// Sem acesso
const NONE: PermissoesAcao = { view: false, create: false, edit: false, delete: false }

/**
 * Matriz de Permissões do Sistema
 *
 * Define o que cada perfil pode fazer em cada módulo:
 * - ADMIN: Acesso total a tudo
 * - GESTOR: Gerencia operações do dia-a-dia, sem acesso admin
 * - COLABORADOR: Executa tarefas, visualiza dados relacionados
 * - CLIENTE: Visualiza apenas projetos e tarefas relacionados a ele
 */
export const MATRIZ_PERMISSOES: MatrizPermissoes = {
  ADMIN: {
    // Dashboard
    dashboard: FULL,

    // Financeiro
    financeiro: FULL,
    'financeiro.movimentacoes': FULL,
    'financeiro.contas': FULL,
    'financeiro.categorias': FULL,
    'financeiro.fluxo-caixa': FULL,

    // OKR
    okr: FULL,
    'okr.objetivos': FULL,
    'okr.key-results': FULL,
    'okr.tarefas': FULL,

    // Consultoria
    consultoria: FULL,
    'consultoria.projetos': FULL,
    'consultoria.tarefas': FULL,

    // Contábil
    contabil: FULL,
    'contabil.lancamentos': FULL,
    'contabil.plano-contas': FULL,
    'contabil.centros-custo': FULL,

    // Configurações
    configuracoes: FULL,
    'configuracoes.empresa': FULL,
    'configuracoes.usuarios': FULL,
    'configuracoes.conta': FULL,
    'configuracoes.aparencia': FULL,
    'configuracoes.notificacoes': FULL,

    // Admin (Super Admin)
    admin: FULL,
    'admin.empresas': FULL,
    'admin.usuarios': FULL,
  },

  GESTOR: {
    // Dashboard
    dashboard: VIEW_ONLY,

    // Financeiro - Acesso total
    financeiro: FULL,
    'financeiro.movimentacoes': FULL,
    'financeiro.contas': FULL,
    'financeiro.categorias': FULL,
    'financeiro.fluxo-caixa': VIEW_ONLY,

    // OKR - Acesso total
    okr: FULL,
    'okr.objetivos': FULL,
    'okr.key-results': FULL,
    'okr.tarefas': FULL,

    // Consultoria - Acesso total
    consultoria: FULL,
    'consultoria.projetos': FULL,
    'consultoria.tarefas': FULL,

    // Contábil - Visualização e criação
    contabil: VIEW_CREATE_EDIT,
    'contabil.lancamentos': VIEW_CREATE_EDIT,
    'contabil.plano-contas': VIEW_ONLY,
    'contabil.centros-custo': VIEW_ONLY,

    // Configurações - Limitado
    configuracoes: VIEW_CREATE_EDIT,
    'configuracoes.empresa': VIEW_ONLY,
    'configuracoes.usuarios': VIEW_CREATE_EDIT,
    'configuracoes.conta': FULL,
    'configuracoes.aparencia': FULL,
    'configuracoes.notificacoes': FULL,

    // Admin - Sem acesso
    admin: NONE,
    'admin.empresas': NONE,
    'admin.usuarios': NONE,
  },

  COLABORADOR: {
    // Dashboard
    dashboard: VIEW_ONLY,

    // Financeiro - Apenas visualização
    financeiro: VIEW_ONLY,
    'financeiro.movimentacoes': VIEW_CREATE,
    'financeiro.contas': VIEW_ONLY,
    'financeiro.categorias': VIEW_ONLY,
    'financeiro.fluxo-caixa': VIEW_ONLY,

    // OKR - Pode gerenciar suas tarefas
    okr: VIEW_CREATE_EDIT,
    'okr.objetivos': VIEW_ONLY,
    'okr.key-results': VIEW_ONLY,
    'okr.tarefas': VIEW_CREATE_EDIT,

    // Consultoria - Pode gerenciar suas tarefas
    consultoria: VIEW_CREATE_EDIT,
    'consultoria.projetos': VIEW_ONLY,
    'consultoria.tarefas': VIEW_CREATE_EDIT,

    // Contábil - Sem acesso
    contabil: NONE,
    'contabil.lancamentos': NONE,
    'contabil.plano-contas': NONE,
    'contabil.centros-custo': NONE,

    // Configurações - Apenas perfil pessoal
    configuracoes: VIEW_ONLY,
    'configuracoes.empresa': NONE,
    'configuracoes.usuarios': NONE,
    'configuracoes.conta': FULL,
    'configuracoes.aparencia': FULL,
    'configuracoes.notificacoes': FULL,

    // Admin - Sem acesso
    admin: NONE,
    'admin.empresas': NONE,
    'admin.usuarios': NONE,
  },

  CLIENTE: {
    // Dashboard - Visualização limitada
    dashboard: VIEW_ONLY,

    // Financeiro - Sem acesso
    financeiro: NONE,
    'financeiro.movimentacoes': NONE,
    'financeiro.contas': NONE,
    'financeiro.categorias': NONE,
    'financeiro.fluxo-caixa': NONE,

    // OKR - Sem acesso
    okr: NONE,
    'okr.objetivos': NONE,
    'okr.key-results': NONE,
    'okr.tarefas': NONE,

    // Consultoria - Visualiza projetos relacionados
    consultoria: VIEW_ONLY,
    'consultoria.projetos': VIEW_ONLY,
    'consultoria.tarefas': VIEW_ONLY,

    // Contábil - Sem acesso
    contabil: NONE,
    'contabil.lancamentos': NONE,
    'contabil.plano-contas': NONE,
    'contabil.centros-custo': NONE,

    // Configurações - Apenas perfil pessoal
    configuracoes: VIEW_ONLY,
    'configuracoes.empresa': NONE,
    'configuracoes.usuarios': NONE,
    'configuracoes.conta': VIEW_CREATE_EDIT,
    'configuracoes.aparencia': FULL,
    'configuracoes.notificacoes': FULL,

    // Admin - Sem acesso
    admin: NONE,
    'admin.empresas': NONE,
    'admin.usuarios': NONE,
  },
}

// Labels para exibição dos perfis
export const perfilLabels: Record<PerfilUsuario, string> = {
  ADMIN: 'Administrador',
  GESTOR: 'Gestor',
  COLABORADOR: 'Colaborador',
  CLIENTE: 'Cliente',
}

// Descrições dos perfis
export const perfilDescricoes: Record<PerfilUsuario, string> = {
  ADMIN: 'Acesso total ao sistema, incluindo configurações administrativas',
  GESTOR: 'Gerencia operações do dia-a-dia e equipes',
  COLABORADOR: 'Executa tarefas e visualiza dados relacionados ao seu trabalho',
  CLIENTE: 'Visualiza apenas projetos e tarefas relacionados a ele',
}

// Função helper para verificar permissão
export function verificarPermissao(
  perfil: PerfilUsuario | undefined,
  modulo: Modulo,
  acao: Acao
): boolean {
  if (!perfil) return false

  const permissoesModulo = MATRIZ_PERMISSOES[perfil]?.[modulo]
  if (!permissoesModulo) return false

  return permissoesModulo[acao] ?? false
}

// Função helper para obter todas as permissões de um módulo
export function obterPermissoesModulo(
  perfil: PerfilUsuario | undefined,
  modulo: Modulo
): PermissoesAcao {
  if (!perfil) return NONE

  return MATRIZ_PERMISSOES[perfil]?.[modulo] ?? NONE
}
