// Sistema de Permissões por Cargo para Colaboradores
// Define permissões padrão baseadas no cargo do colaborador

export type CargoType = 'DIRETOR' | 'GERENTE' | 'ANALISTA' | 'ASSISTENTE'

export type ModuloPermissao =
  | 'dashboard'
  | 'financeiro'
  | 'financeiro.contas'
  | 'financeiro.movimentacoes'
  | 'financeiro.contas-receber'
  | 'financeiro.contas-pagar'
  | 'financeiro.transferencias'
  | 'financeiro.fluxo-caixa'
  | 'financeiro.orcamento'
  | 'cadastros'
  | 'cadastros.clientes'
  | 'cadastros.fornecedores'
  | 'cadastros.colaboradores'
  | 'contabil'
  | 'contabil.lancamentos'
  | 'contabil.plano-contas'
  | 'contabil.centros-custo'
  | 'processos'
  | 'processos.okr'
  | 'consultoria'
  | 'consultoria.projetos'
  | 'consultoria.tarefas'
  | 'configuracoes'
  | 'configuracoes.empresa'
  | 'configuracoes.usuarios'
  | 'configuracoes.conta'
  | 'relatorios'

export interface Permissao {
  modulo: ModuloPermissao
  visualizar: boolean
  editar: boolean
  excluir: boolean
}

export interface PermissoesCargo {
  cargo: CargoType
  descricao: string
  cor: { bg: string; text: string }
  permissoes: Permissao[]
}

// Labels para exibição
export const CARGO_LABELS: Record<CargoType, string> = {
  DIRETOR: 'Diretor',
  GERENTE: 'Gerente',
  ANALISTA: 'Analista',
  ASSISTENTE: 'Assistente',
}

// Cores para badges
export const CARGO_CORES: Record<CargoType, { bg: string; text: string }> = {
  DIRETOR: { bg: 'bg-purple-100', text: 'text-purple-700' },
  GERENTE: { bg: 'bg-blue-100', text: 'text-blue-700' },
  ANALISTA: { bg: 'bg-green-100', text: 'text-green-700' },
  ASSISTENTE: { bg: 'bg-slate-100', text: 'text-slate-700' },
}

// Opções para select
export const CARGO_OPTIONS = [
  { value: 'DIRETOR', label: 'Diretor' },
  { value: 'GERENTE', label: 'Gerente' },
  { value: 'ANALISTA', label: 'Analista' },
  { value: 'ASSISTENTE', label: 'Assistente' },
] as const

// Descrições dos cargos
export const CARGO_DESCRICOES: Record<CargoType, string> = {
  DIRETOR: 'Acesso total: visualiza, edita e exclui todos os registros',
  GERENTE: 'Visualiza tudo, edita a maioria, sem permissão para excluir',
  ANALISTA: 'Visualiza tudo, edita apenas registros próprios',
  ASSISTENTE: 'Apenas visualização, sem permissão para editar ou excluir',
}

// Lista de todos os módulos
const TODOS_MODULOS: ModuloPermissao[] = [
  'dashboard',
  'financeiro',
  'financeiro.contas',
  'financeiro.movimentacoes',
  'financeiro.contas-receber',
  'financeiro.contas-pagar',
  'financeiro.transferencias',
  'financeiro.fluxo-caixa',
  'financeiro.orcamento',
  'cadastros',
  'cadastros.clientes',
  'cadastros.fornecedores',
  'cadastros.colaboradores',
  'contabil',
  'contabil.lancamentos',
  'contabil.plano-contas',
  'contabil.centros-custo',
  'processos',
  'processos.okr',
  'consultoria',
  'consultoria.projetos',
  'consultoria.tarefas',
  'configuracoes',
  'configuracoes.empresa',
  'configuracoes.usuarios',
  'configuracoes.conta',
  'relatorios',
]

// Permissões padrão por cargo
export const PERMISSOES_POR_CARGO: Record<CargoType, PermissoesCargo> = {
  // GESTOR/DIRETOR: Acesso total a tudo
  DIRETOR: {
    cargo: 'DIRETOR',
    descricao: 'Acesso total: visualiza, edita e exclui todos os registros',
    cor: CARGO_CORES.DIRETOR,
    permissoes: TODOS_MODULOS.map(modulo => ({
      modulo,
      visualizar: true,
      editar: true,
      excluir: true,
    })),
  },

  // GERENTE: Visualiza tudo, edita maioria, não exclui
  GERENTE: {
    cargo: 'GERENTE',
    descricao: 'Visualiza tudo, edita a maioria, sem permissão para excluir',
    cor: CARGO_CORES.GERENTE,
    permissoes: TODOS_MODULOS.map(modulo => ({
      modulo,
      visualizar: true,
      editar: !['configuracoes.empresa', 'configuracoes.usuarios'].includes(modulo),
      excluir: false,
    })),
  },

  // ANALISTA: Visualiza tudo, edita próprios registros (representado como editar = true em módulos operacionais)
  ANALISTA: {
    cargo: 'ANALISTA',
    descricao: 'Visualiza tudo, edita apenas registros próprios',
    cor: CARGO_CORES.ANALISTA,
    permissoes: TODOS_MODULOS.map(modulo => {
      // Módulos onde o analista pode editar (seus próprios registros)
      const modulosEditaveis = [
        'financeiro.movimentacoes',
        'cadastros.clientes',
        'cadastros.fornecedores',
        'processos.okr',
        'consultoria.tarefas',
        'configuracoes.conta',
      ]
      return {
        modulo,
        visualizar: true,
        editar: modulosEditaveis.includes(modulo),
        excluir: false,
      }
    }),
  },

  // ASSISTENTE: Apenas visualiza
  ASSISTENTE: {
    cargo: 'ASSISTENTE',
    descricao: 'Apenas visualização, sem permissão para editar ou excluir',
    cor: CARGO_CORES.ASSISTENTE,
    permissoes: TODOS_MODULOS.map(modulo => ({
      modulo,
      visualizar: true,
      editar: modulo === 'configuracoes.conta', // Só pode editar própria conta
      excluir: false,
    })),
  },
}

/**
 * Verifica se um cargo tem permissão para uma ação em um módulo
 * @param cargo - Cargo do colaborador
 * @param modulo - Módulo a verificar
 * @param acao - Ação: 'visualizar' | 'editar' | 'excluir'
 * @returns boolean
 */
export function temPermissao(
  cargo: string | null | undefined,
  modulo: ModuloPermissao,
  acao: 'visualizar' | 'editar' | 'excluir'
): boolean {
  // Se não tem cargo definido, assume permissões mínimas (assistente)
  const cargoNormalizado = (cargo?.toUpperCase() || 'ASSISTENTE') as CargoType

  // Se cargo não reconhecido, assume assistente
  const permissoesCargo = PERMISSOES_POR_CARGO[cargoNormalizado] || PERMISSOES_POR_CARGO.ASSISTENTE

  // Busca permissão do módulo
  const permissaoModulo = permissoesCargo.permissoes.find(p => p.modulo === modulo)

  if (!permissaoModulo) {
    // Se módulo não encontrado, tenta buscar módulo pai
    const moduloPai = modulo.split('.')[0] as ModuloPermissao
    const permissaoPai = permissoesCargo.permissoes.find(p => p.modulo === moduloPai)

    if (permissaoPai) {
      return permissaoPai[acao]
    }

    // Se não encontrou, nega por padrão
    return false
  }

  return permissaoModulo[acao]
}

/**
 * Retorna todas as permissões de um cargo
 * @param cargo - Cargo do colaborador
 * @returns Array de permissões
 */
export function getPermissoesUsuario(cargo: string | null | undefined): Permissao[] {
  const cargoNormalizado = (cargo?.toUpperCase() || 'ASSISTENTE') as CargoType
  const permissoesCargo = PERMISSOES_POR_CARGO[cargoNormalizado] || PERMISSOES_POR_CARGO.ASSISTENTE

  return permissoesCargo.permissoes
}

/**
 * Retorna informações completas do cargo
 * @param cargo - Cargo do colaborador
 * @returns Objeto com informações do cargo
 */
export function getInfoCargo(cargo: string | null | undefined): PermissoesCargo {
  const cargoNormalizado = (cargo?.toUpperCase() || 'ASSISTENTE') as CargoType
  return PERMISSOES_POR_CARGO[cargoNormalizado] || PERMISSOES_POR_CARGO.ASSISTENTE
}

/**
 * Retorna resumo das permissões para exibição
 * @param cargo - Cargo do colaborador
 * @returns Objeto com resumo de permissões
 */
export function getResumoPermissoes(cargo: string | null | undefined): {
  totalModulos: number
  podeVisualizar: number
  podeEditar: number
  podeExcluir: number
} {
  const permissoes = getPermissoesUsuario(cargo)

  return {
    totalModulos: permissoes.length,
    podeVisualizar: permissoes.filter(p => p.visualizar).length,
    podeEditar: permissoes.filter(p => p.editar).length,
    podeExcluir: permissoes.filter(p => p.excluir).length,
  }
}

/**
 * Verifica se o cargo pode excluir em algum módulo
 * @param cargo - Cargo do colaborador
 * @returns boolean
 */
export function podeExcluirAlgo(cargo: string | null | undefined): boolean {
  const permissoes = getPermissoesUsuario(cargo)
  return permissoes.some(p => p.excluir)
}

/**
 * Lista módulos onde o cargo pode excluir
 * @param cargo - Cargo do colaborador
 * @returns Array de módulos
 */
export function getModulosComExclusao(cargo: string | null | undefined): ModuloPermissao[] {
  const permissoes = getPermissoesUsuario(cargo)
  return permissoes.filter(p => p.excluir).map(p => p.modulo)
}
