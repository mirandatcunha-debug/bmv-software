export interface OnboardingStepData {
  id: string
  titulo: string
  descricao: string
  posicao: 'top' | 'bottom' | 'left' | 'right'
  targetId: string
}

export interface OnboardingModulo {
  id: string
  nome: string
  steps: OnboardingStepData[]
}

// Passos do Dashboard
export const dashboardSteps: OnboardingStepData[] = [
  {
    id: 'dashboard-indicadores',
    titulo: 'Indicadores Principais',
    descricao: 'Aqui você encontra os principais indicadores do seu negócio: saldo total, receitas, despesas e o resultado do período.',
    posicao: 'bottom',
    targetId: 'dashboard-indicadores'
  },
  {
    id: 'dashboard-graficos',
    titulo: 'Gráficos e Análises',
    descricao: 'Visualize a evolução das suas finanças através de gráficos interativos. Passe o mouse sobre os dados para ver detalhes.',
    posicao: 'top',
    targetId: 'dashboard-graficos'
  },
  {
    id: 'dashboard-acoes-rapidas',
    titulo: 'Ações Rápidas',
    descricao: 'Acesse rapidamente as funcionalidades mais utilizadas como novo lançamento, transferência ou relatórios.',
    posicao: 'left',
    targetId: 'dashboard-acoes-rapidas'
  },
  {
    id: 'dashboard-menu',
    titulo: 'Menu de Navegação',
    descricao: 'Use o menu lateral para acessar todos os módulos do sistema: Financeiro, Processos, Cadastros e mais.',
    posicao: 'right',
    targetId: 'sidebar-nav'
  }
]

// Passos do Financeiro
export const financeiroSteps: OnboardingStepData[] = [
  {
    id: 'financeiro-contas',
    titulo: 'Contas Bancárias',
    descricao: 'Gerencie suas contas bancárias, carteiras e caixas. Acompanhe o saldo de cada conta em tempo real.',
    posicao: 'bottom',
    targetId: 'financeiro-contas'
  },
  {
    id: 'financeiro-lancamentos',
    titulo: 'Lançamentos',
    descricao: 'Registre todas as suas receitas e despesas. Você pode categorizar, adicionar anexos e controlar parcelas.',
    posicao: 'bottom',
    targetId: 'financeiro-lancamentos'
  },
  {
    id: 'financeiro-relatorios',
    titulo: 'Relatórios Financeiros',
    descricao: 'Gere relatórios detalhados como fluxo de caixa, DRE e balanço. Exporte para Excel ou PDF.',
    posicao: 'left',
    targetId: 'financeiro-relatorios'
  }
]

// Passos do Processos
export const processosSteps: OnboardingStepData[] = [
  {
    id: 'processos-objetivos',
    titulo: 'Objetivos e OKRs',
    descricao: 'Defina objetivos estratégicos e acompanhe resultados-chave (OKRs) para medir o progresso da sua empresa.',
    posicao: 'bottom',
    targetId: 'processos-objetivos'
  },
  {
    id: 'processos-tarefas',
    titulo: 'Gestão de Tarefas',
    descricao: 'Crie e atribua tarefas para sua equipe. Defina prazos, prioridades e acompanhe o andamento.',
    posicao: 'bottom',
    targetId: 'processos-tarefas'
  },
  {
    id: 'processos-equipe',
    titulo: 'Visão da Equipe',
    descricao: 'Veja a carga de trabalho de cada colaborador e distribua tarefas de forma equilibrada.',
    posicao: 'left',
    targetId: 'processos-equipe'
  }
]

// Mapeamento de módulos para seus passos
export const onboardingModulos: Record<string, OnboardingModulo> = {
  dashboard: {
    id: 'dashboard',
    nome: 'Dashboard',
    steps: dashboardSteps
  },
  financeiro: {
    id: 'financeiro',
    nome: 'Financeiro',
    steps: financeiroSteps
  },
  processos: {
    id: 'processos',
    nome: 'Processos',
    steps: processosSteps
  }
}

// Lista de todos os módulos disponíveis
export const modulosDisponiveis = Object.keys(onboardingModulos)

// Função helper para obter passos de um módulo
export function getOnboardingSteps(moduloId: string): OnboardingStepData[] {
  return onboardingModulos[moduloId]?.steps || []
}

// Função helper para obter nome do módulo
export function getNomeModulo(moduloId: string): string {
  return onboardingModulos[moduloId]?.nome || moduloId
}
