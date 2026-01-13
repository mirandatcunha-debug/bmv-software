import { Landmark, ArrowDownCircle, ArrowUpCircle, Users, Truck, Receipt, BarChart3, Target, ClipboardList } from 'lucide-react'

export const EMPTY_STATES = {
  contasBancarias: { icon: Landmark, title: 'Nenhuma conta bancária', description: 'Adicione suas contas para controlar o fluxo de caixa', action: { label: 'Adicionar Conta', href: '/financeiro/contas/nova' } },
  contasReceber: { icon: ArrowDownCircle, title: 'Nenhuma conta a receber', description: 'Registre suas vendas e recebimentos', action: { label: 'Nova Conta', href: '/financeiro/contas-receber/novo' } },
  contasPagar: { icon: ArrowUpCircle, title: 'Nenhuma conta a pagar', description: 'Registre suas despesas e compromissos', action: { label: 'Nova Conta', href: '/financeiro/contas-pagar/novo' } },
  clientes: { icon: Users, title: 'Nenhum cliente cadastrado', description: 'Cadastre clientes para vincular às contas', action: { label: 'Novo Cliente', href: '/cadastros/clientes/novo' } },
  fornecedores: { icon: Truck, title: 'Nenhum fornecedor cadastrado', description: 'Cadastre fornecedores para vincular às contas', action: { label: 'Novo Fornecedor', href: '/cadastros/fornecedores/novo' } },
  movimentacoes: { icon: Receipt, title: 'Nenhuma movimentação', description: 'Registre receitas e despesas', action: { label: 'Nova Movimentação', href: '/financeiro/movimentacoes/nova' } },
  fluxoCaixa: { icon: BarChart3, title: 'Dados insuficientes', description: 'Cadastre contas para ver projeções', action: { label: 'Ver Contas', href: '/financeiro/contas-receber' } },
  objetivos: { icon: Target, title: 'Nenhum objetivo definido', description: 'Crie objetivos OKR para acompanhar progresso', action: { label: 'Criar Objetivo', href: '/processos/okr/novo' } },
  atividades: { icon: ClipboardList, title: 'Nenhuma atividade', description: 'As atividades da equipe aparecerão aqui', action: { label: 'Ver Processos', href: '/processos' } }
}
