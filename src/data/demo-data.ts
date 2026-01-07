// ============================================
// DADOS DE DEMONSTRAÇÃO - TechStore Soluções Ltda
// ============================================

// ============================================
// TIPOS
// ============================================

export interface Empresa {
  nome: string;
  cnpj: string;
  segmento: string;
  faturamentoMensal: number;
}

export interface ContaBancaria {
  id: string;
  banco: string;
  tipo: 'corrente' | 'poupanca';
  saldo: number;
}

export interface ResumoFinanceiro {
  saldoTotal: number;
  receitasMes: number;
  despesasMes: number;
  resultado: number;
  inadimplencia: number;
}

export interface Usuario {
  id: string;
  nome: string;
  cargo: string;
  area: string;
  email: string;
  avatar?: string;
}

export type StatusOKR = 'em_andamento' | 'atrasado' | 'em_dia' | 'concluido';

export interface ObjetivoOKR {
  id: string;
  titulo: string;
  progresso: number;
  status: StatusOKR;
  meta: string;
}

export interface ProjetoConsultoria {
  id: string;
  nome: string;
  consultor: string;
  consultorEmpresa: string;
  progresso: number;
  status: 'em_andamento' | 'concluido' | 'pausado' | 'cancelado';
  dataInicio: string;
  dataPrevisaoFim?: string;
}

export type TipoInsight = 'critico' | 'alerta' | 'positivo' | 'sugestao';

export interface InsightIA {
  id: string;
  tipo: TipoInsight;
  titulo: string;
  descricao: string;
  dataGeracao: string;
}

export type TipoMovimentacao = 'receita' | 'despesa';
export type CategoriaMovimentacao =
  | 'vendas_produtos'
  | 'vendas_servicos'
  | 'salarios'
  | 'fornecedores'
  | 'marketing'
  | 'aluguel'
  | 'energia'
  | 'internet_telefone'
  | 'impostos'
  | 'manutencao'
  | 'transporte'
  | 'outros';

export interface MovimentacaoFinanceira {
  id: string;
  tipo: TipoMovimentacao;
  categoria: CategoriaMovimentacao;
  descricao: string;
  valor: number;
  data: string;
  contaBancariaId: string;
  clienteFornecedor?: string;
  notaFiscal?: string;
  status: 'confirmado' | 'pendente' | 'cancelado';
}

// ============================================
// DADOS DA EMPRESA
// ============================================

export const empresa: Empresa = {
  nome: 'TechStore Soluções Ltda',
  cnpj: '45.123.456/0001-89',
  segmento: 'Varejo de tecnologia + Serviços de suporte',
  faturamentoMensal: 670000,
};

// ============================================
// CONTAS BANCÁRIAS
// ============================================

export const contasBancarias: ContaBancaria[] = [
  {
    id: 'conta-bb-001',
    banco: 'Banco do Brasil',
    tipo: 'corrente',
    saldo: 78500.00,
  },
  {
    id: 'conta-itau-001',
    banco: 'Itaú',
    tipo: 'corrente',
    saldo: 35200.00,
  },
  {
    id: 'conta-caixa-001',
    banco: 'Caixa',
    tipo: 'poupanca',
    saldo: 11750.00,
  },
];

// ============================================
// RESUMO FINANCEIRO
// ============================================

export const resumoFinanceiro: ResumoFinanceiro = {
  saldoTotal: 125450.00,
  receitasMes: 580000.00,
  despesasMes: 495000.00,
  resultado: 85000.00,
  inadimplencia: 8.5,
};

// ============================================
// USUÁRIOS
// ============================================

export const usuarios: Usuario[] = [
  {
    id: 'user-001',
    nome: 'Carlos Mendonça',
    cargo: 'Diretor',
    area: 'Diretoria',
    email: 'carlos.mendonca@techstore.com.br',
  },
  {
    id: 'user-002',
    nome: 'Fernanda Lima',
    cargo: 'Gerente Comercial',
    area: 'Comercial',
    email: 'fernanda.lima@techstore.com.br',
  },
  {
    id: 'user-003',
    nome: 'Ricardo Santos',
    cargo: 'Analista Financeiro',
    area: 'Financeiro',
    email: 'ricardo.santos@techstore.com.br',
  },
  {
    id: 'user-004',
    nome: 'Bruno Alves',
    cargo: 'Coordenador de Suporte',
    area: 'Suporte Técnico',
    email: 'bruno.alves@techstore.com.br',
  },
  {
    id: 'user-005',
    nome: 'Maria Clara',
    cargo: 'Assistente Administrativo',
    area: 'Administrativo',
    email: 'maria.clara@techstore.com.br',
  },
  {
    id: 'user-006',
    nome: 'Juliana Costa',
    cargo: 'Analista de Marketing',
    area: 'Marketing',
    email: 'juliana.costa@techstore.com.br',
  },
];

// ============================================
// OBJETIVOS / OKRs
// ============================================

export const objetivosOKR: ObjetivoOKR[] = [
  {
    id: 'okr-001',
    titulo: 'Aumentar Faturamento',
    progresso: 65,
    status: 'em_andamento',
    meta: 'Crescimento de 20% no faturamento anual',
  },
  {
    id: 'okr-002',
    titulo: 'Reduzir Inadimplência',
    progresso: 35,
    status: 'atrasado',
    meta: 'Reduzir inadimplência para 3%',
  },
  {
    id: 'okr-003',
    titulo: 'Organizar Processos Internos',
    progresso: 78,
    status: 'em_dia',
    meta: 'Documentar e otimizar 100% dos processos',
  },
];

// ============================================
// PROJETO DE CONSULTORIA
// ============================================

export const projetoConsultoria: ProjetoConsultoria = {
  id: 'proj-001',
  nome: 'Reestruturação Financeira e Processos',
  consultor: 'João Silva',
  consultorEmpresa: 'BMV',
  progresso: 45,
  status: 'em_andamento',
  dataInicio: '2025-10-15',
  dataPrevisaoFim: '2026-04-15',
};

// ============================================
// INSIGHTS DE IA
// ============================================

export const insightsIA: InsightIA[] = [
  {
    id: 'insight-001',
    tipo: 'critico',
    titulo: 'Inadimplência Elevada',
    descricao: 'Inadimplência em 8,5% - 12 clientes com atraso superior a 30 dias. Ação imediata recomendada.',
    dataGeracao: '2026-01-06',
  },
  {
    id: 'insight-002',
    tipo: 'alerta',
    titulo: 'Aumento em Despesas de Marketing',
    descricao: 'Despesas com Marketing aumentaram 45% este mês em comparação ao mês anterior.',
    dataGeracao: '2026-01-05',
  },
  {
    id: 'insight-003',
    tipo: 'positivo',
    titulo: 'Crescimento em Serviços',
    descricao: 'Receita de Serviços de Suporte cresceu 23% comparado ao mesmo período do ano anterior.',
    dataGeracao: '2026-01-04',
  },
  {
    id: 'insight-004',
    tipo: 'sugestao',
    titulo: 'Previsão de Fluxo de Caixa',
    descricao: 'Análise preditiva indica possível saldo negativo em Março. Recomenda-se revisar compromissos.',
    dataGeracao: '2026-01-03',
  },
];

// ============================================
// MOVIMENTAÇÕES FINANCEIRAS (últimos 30 dias)
// ============================================

export const movimentacoesFinanceiras: MovimentacaoFinanceira[] = [
  // RECEITAS
  {
    id: 'mov-001',
    tipo: 'receita',
    categoria: 'vendas_produtos',
    descricao: 'Venda de notebooks Dell - Lote corporativo',
    valor: 45000.00,
    data: '2026-01-05',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Empresa ABC Ltda',
    notaFiscal: 'NF-2026-0105',
    status: 'confirmado',
  },
  {
    id: 'mov-002',
    tipo: 'receita',
    categoria: 'vendas_servicos',
    descricao: 'Contrato de suporte mensal - Cliente Premium',
    valor: 12500.00,
    data: '2026-01-04',
    contaBancariaId: 'conta-itau-001',
    clienteFornecedor: 'Indústria XYZ S.A.',
    notaFiscal: 'NF-2026-0104',
    status: 'confirmado',
  },
  {
    id: 'mov-003',
    tipo: 'receita',
    categoria: 'vendas_produtos',
    descricao: 'Venda de periféricos e acessórios',
    valor: 8750.00,
    data: '2026-01-03',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Diversos clientes varejo',
    notaFiscal: 'NF-2026-0103',
    status: 'confirmado',
  },
  {
    id: 'mov-004',
    tipo: 'receita',
    categoria: 'vendas_servicos',
    descricao: 'Instalação de rede corporativa',
    valor: 18000.00,
    data: '2025-12-28',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Escritório Advocacia Silva',
    notaFiscal: 'NF-2025-1228',
    status: 'confirmado',
  },
  {
    id: 'mov-005',
    tipo: 'receita',
    categoria: 'vendas_produtos',
    descricao: 'Venda de servidores HP',
    valor: 78000.00,
    data: '2025-12-23',
    contaBancariaId: 'conta-itau-001',
    clienteFornecedor: 'Hospital Santa Maria',
    notaFiscal: 'NF-2025-1223',
    status: 'confirmado',
  },
  {
    id: 'mov-006',
    tipo: 'receita',
    categoria: 'vendas_servicos',
    descricao: 'Manutenção preventiva - Pacote trimestral',
    valor: 9500.00,
    data: '2025-12-20',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Colégio São Paulo',
    notaFiscal: 'NF-2025-1220',
    status: 'confirmado',
  },
  {
    id: 'mov-007',
    tipo: 'receita',
    categoria: 'vendas_produtos',
    descricao: 'Venda de monitores LG 27"',
    valor: 15600.00,
    data: '2025-12-18',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Startup Tech Innovation',
    notaFiscal: 'NF-2025-1218',
    status: 'confirmado',
  },
  {
    id: 'mov-008',
    tipo: 'receita',
    categoria: 'vendas_servicos',
    descricao: 'Consultoria em infraestrutura de TI',
    valor: 22000.00,
    data: '2025-12-15',
    contaBancariaId: 'conta-itau-001',
    clienteFornecedor: 'Construtora Horizonte',
    notaFiscal: 'NF-2025-1215',
    status: 'confirmado',
  },
  {
    id: 'mov-009',
    tipo: 'receita',
    categoria: 'vendas_produtos',
    descricao: 'Venda de impressoras multifuncionais',
    valor: 6800.00,
    data: '2025-12-12',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Clínica Saúde Total',
    notaFiscal: 'NF-2025-1212',
    status: 'pendente',
  },
  {
    id: 'mov-010',
    tipo: 'receita',
    categoria: 'vendas_servicos',
    descricao: 'Suporte técnico emergencial',
    valor: 3500.00,
    data: '2025-12-10',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Restaurante Sabor & Arte',
    notaFiscal: 'NF-2025-1210',
    status: 'confirmado',
  },
  // DESPESAS
  {
    id: 'mov-011',
    tipo: 'despesa',
    categoria: 'salarios',
    descricao: 'Folha de pagamento - Janeiro/2026',
    valor: 85000.00,
    data: '2026-01-05',
    contaBancariaId: 'conta-bb-001',
    status: 'confirmado',
  },
  {
    id: 'mov-012',
    tipo: 'despesa',
    categoria: 'fornecedores',
    descricao: 'Compra de estoque - Notebooks Dell',
    valor: 120000.00,
    data: '2026-01-02',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Dell Brasil',
    notaFiscal: 'NF-FORN-2026-001',
    status: 'confirmado',
  },
  {
    id: 'mov-013',
    tipo: 'despesa',
    categoria: 'marketing',
    descricao: 'Campanha Google Ads - Janeiro',
    valor: 15000.00,
    data: '2026-01-01',
    contaBancariaId: 'conta-itau-001',
    clienteFornecedor: 'Google Brasil',
    status: 'confirmado',
  },
  {
    id: 'mov-014',
    tipo: 'despesa',
    categoria: 'aluguel',
    descricao: 'Aluguel do galpão e escritório - Janeiro',
    valor: 18500.00,
    data: '2026-01-02',
    contaBancariaId: 'conta-bb-001',
    clienteFornecedor: 'Imobiliária Central',
    status: 'confirmado',
  },
  {
    id: 'mov-015',
    tipo: 'despesa',
    categoria: 'energia',
    descricao: 'Conta de energia elétrica - Dezembro',
    valor: 4200.00,
    data: '2025-12-28',
    contaBancariaId: 'conta-caixa-001',
    clienteFornecedor: 'CEMIG',
    status: 'confirmado',
  },
  {
    id: 'mov-016',
    tipo: 'despesa',
    categoria: 'internet_telefone',
    descricao: 'Internet fibra + telefonia - Dezembro',
    valor: 1800.00,
    data: '2025-12-26',
    contaBancariaId: 'conta-caixa-001',
    clienteFornecedor: 'Vivo Empresas',
    status: 'confirmado',
  },
  {
    id: 'mov-017',
    tipo: 'despesa',
    categoria: 'impostos',
    descricao: 'ICMS sobre vendas - Dezembro',
    valor: 32000.00,
    data: '2025-12-20',
    contaBancariaId: 'conta-bb-001',
    status: 'confirmado',
  },
  {
    id: 'mov-018',
    tipo: 'despesa',
    categoria: 'fornecedores',
    descricao: 'Compra de periféricos - Estoque',
    valor: 28000.00,
    data: '2025-12-18',
    contaBancariaId: 'conta-itau-001',
    clienteFornecedor: 'Distribuidora Tech Parts',
    notaFiscal: 'NF-FORN-2025-089',
    status: 'confirmado',
  },
  {
    id: 'mov-019',
    tipo: 'despesa',
    categoria: 'manutencao',
    descricao: 'Manutenção veículos da frota',
    valor: 3500.00,
    data: '2025-12-15',
    contaBancariaId: 'conta-caixa-001',
    clienteFornecedor: 'Auto Center Premium',
    status: 'confirmado',
  },
  {
    id: 'mov-020',
    tipo: 'despesa',
    categoria: 'transporte',
    descricao: 'Combustível frota - Dezembro',
    valor: 4800.00,
    data: '2025-12-10',
    contaBancariaId: 'conta-caixa-001',
    clienteFornecedor: 'Posto Shell Centro',
    status: 'confirmado',
  },
];

// ============================================
// DADOS AGREGADOS E HELPERS
// ============================================

export const getDadosCompletos = () => ({
  empresa,
  contasBancarias,
  resumoFinanceiro,
  usuarios,
  objetivosOKR,
  projetoConsultoria,
  insightsIA,
  movimentacoesFinanceiras,
});

export const calcularTotalReceitas = (): number => {
  return movimentacoesFinanceiras
    .filter((m) => m.tipo === 'receita' && m.status === 'confirmado')
    .reduce((acc, m) => acc + m.valor, 0);
};

export const calcularTotalDespesas = (): number => {
  return movimentacoesFinanceiras
    .filter((m) => m.tipo === 'despesa' && m.status === 'confirmado')
    .reduce((acc, m) => acc + m.valor, 0);
};

export const calcularSaldoContas = (): number => {
  return contasBancarias.reduce((acc, conta) => acc + conta.saldo, 0);
};

export const getMovimentacoesPorTipo = (tipo: TipoMovimentacao): MovimentacaoFinanceira[] => {
  return movimentacoesFinanceiras.filter((m) => m.tipo === tipo);
};

export const getMovimentacoesPorCategoria = (categoria: CategoriaMovimentacao): MovimentacaoFinanceira[] => {
  return movimentacoesFinanceiras.filter((m) => m.categoria === categoria);
};

export const getInsightsPorTipo = (tipo: TipoInsight): InsightIA[] => {
  return insightsIA.filter((i) => i.tipo === tipo);
};

// ============================================
// EXPORT DEFAULT
// ============================================

const demoData = {
  empresa,
  contasBancarias,
  resumoFinanceiro,
  usuarios,
  objetivosOKR,
  projetoConsultoria,
  insightsIA,
  movimentacoesFinanceiras,
  getDadosCompletos,
  calcularTotalReceitas,
  calcularTotalDespesas,
  calcularSaldoContas,
  getMovimentacoesPorTipo,
  getMovimentacoesPorCategoria,
  getInsightsPorTipo,
};

export default demoData;
