export const TEMPLATES = {
  clientes: {
    nome: 'Clientes',
    descricao: 'Importar cadastro de clientes',
    colunas: [
      { campo: 'nome', label: 'Nome/Razão Social', obrigatorio: true, exemplo: 'Empresa ABC Ltda' },
      { campo: 'cpfCnpj', label: 'CPF/CNPJ', obrigatorio: false, exemplo: '12.345.678/0001-90' },
      { campo: 'email', label: 'Email', obrigatorio: false, exemplo: 'contato@empresa.com' },
      { campo: 'telefone', label: 'Telefone', obrigatorio: false, exemplo: '(11) 99999-9999' },
      { campo: 'endereco', label: 'Endereço', obrigatorio: false, exemplo: 'Rua das Flores, 123' },
      { campo: 'cidade', label: 'Cidade', obrigatorio: false, exemplo: 'São Paulo' },
      { campo: 'estado', label: 'Estado', obrigatorio: false, exemplo: 'SP' },
      { campo: 'cep', label: 'CEP', obrigatorio: false, exemplo: '01234-567' },
      { campo: 'observacoes', label: 'Observações', obrigatorio: false, exemplo: 'Cliente VIP' }
    ]
  },
  fornecedores: {
    nome: 'Fornecedores',
    descricao: 'Importar cadastro de fornecedores',
    colunas: [
      { campo: 'nome', label: 'Nome/Razão Social', obrigatorio: true, exemplo: 'Fornecedor XYZ' },
      { campo: 'cpfCnpj', label: 'CPF/CNPJ', obrigatorio: false, exemplo: '98.765.432/0001-10' },
      { campo: 'email', label: 'Email', obrigatorio: false, exemplo: 'vendas@fornecedor.com' },
      { campo: 'telefone', label: 'Telefone', obrigatorio: false, exemplo: '(11) 88888-8888' },
      { campo: 'endereco', label: 'Endereço', obrigatorio: false, exemplo: 'Av. Industrial, 456' },
      { campo: 'cidade', label: 'Cidade', obrigatorio: false, exemplo: 'Guarulhos' },
      { campo: 'estado', label: 'Estado', obrigatorio: false, exemplo: 'SP' },
      { campo: 'cep', label: 'CEP', obrigatorio: false, exemplo: '07000-000' },
      { campo: 'observacoes', label: 'Observações', obrigatorio: false, exemplo: 'Prazo 30 dias' }
    ]
  },
  contasReceber: {
    nome: 'Contas a Receber',
    descricao: 'Importar contas a receber',
    colunas: [
      { campo: 'descricao', label: 'Descrição', obrigatorio: true, exemplo: 'Venda NF 1234' },
      { campo: 'valor', label: 'Valor', obrigatorio: true, exemplo: '1500.00' },
      { campo: 'dataVencimento', label: 'Data Vencimento', obrigatorio: true, exemplo: '15/02/2025' },
      { campo: 'dataEmissao', label: 'Data Emissão', obrigatorio: false, exemplo: '15/01/2025' },
      { campo: 'cliente', label: 'Cliente', obrigatorio: false, exemplo: 'Empresa ABC' },
      { campo: 'categoria', label: 'Categoria', obrigatorio: false, exemplo: 'Vendas' },
      { campo: 'observacoes', label: 'Observações', obrigatorio: false, exemplo: 'Parcela 1/3' }
    ]
  },
  contasPagar: {
    nome: 'Contas a Pagar',
    descricao: 'Importar contas a pagar',
    colunas: [
      { campo: 'descricao', label: 'Descrição', obrigatorio: true, exemplo: 'Compra NF 5678' },
      { campo: 'valor', label: 'Valor', obrigatorio: true, exemplo: '800.00' },
      { campo: 'dataVencimento', label: 'Data Vencimento', obrigatorio: true, exemplo: '20/02/2025' },
      { campo: 'dataEmissao', label: 'Data Emissão', obrigatorio: false, exemplo: '20/01/2025' },
      { campo: 'fornecedor', label: 'Fornecedor', obrigatorio: false, exemplo: 'Fornecedor XYZ' },
      { campo: 'categoria', label: 'Categoria', obrigatorio: false, exemplo: 'Materiais' },
      { campo: 'observacoes', label: 'Observações', obrigatorio: false, exemplo: 'Boleto' }
    ]
  },
  movimentacoes: {
    nome: 'Movimentações',
    descricao: 'Importar movimentações financeiras',
    colunas: [
      { campo: 'descricao', label: 'Descrição', obrigatorio: true, exemplo: 'Pagamento cliente' },
      { campo: 'valor', label: 'Valor', obrigatorio: true, exemplo: '500.00' },
      { campo: 'tipo', label: 'Tipo (RECEITA/DESPESA)', obrigatorio: true, exemplo: 'RECEITA' },
      { campo: 'data', label: 'Data', obrigatorio: true, exemplo: '10/01/2025' },
      { campo: 'categoria', label: 'Categoria', obrigatorio: false, exemplo: 'Vendas' },
      { campo: 'conta', label: 'Conta Bancária', obrigatorio: false, exemplo: 'Banco do Brasil' },
      { campo: 'observacoes', label: 'Observações', obrigatorio: false, exemplo: 'PIX recebido' }
    ]
  }
}

export type TipoImportacao = keyof typeof TEMPLATES

export function gerarCSVTemplate(tipo: TipoImportacao): string {
  const template = TEMPLATES[tipo]
  const headers = template.colunas.map(c => c.label).join(';')
  const exemplo = template.colunas.map(c => c.exemplo).join(';')
  return `${headers}\n${exemplo}`
}

export function getColunasObrigatorias(tipo: TipoImportacao): string[] {
  return TEMPLATES[tipo].colunas.filter(c => c.obrigatorio).map(c => c.campo)
}
