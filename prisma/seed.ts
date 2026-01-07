import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')

  // Limpar dados existentes (ordem importante por causa das foreign keys)
  await prisma.comment.deleteMany()
  await prisma.consultingEvidence.deleteMany()
  await prisma.consultingTask.deleteMany()
  await prisma.consultingStage.deleteMany()
  await prisma.consultingProject.deleteMany()
  await prisma.subtask.deleteMany()
  await prisma.task.deleteMany()
  await prisma.keyResult.deleteMany()
  await prisma.objective.deleteMany()
  await prisma.journalEntry.deleteMany()
  await prisma.costCenter.deleteMany()
  await prisma.chartOfAccount.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.bankAccount.deleteMany()
  await prisma.receivable.deleteMany()
  await prisma.payable.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.userPermission.deleteMany()
  await prisma.user.deleteMany()
  await prisma.tenant.deleteMany()

  console.log('Dados anteriores removidos.')

  // ============================================
  // 1. TENANT - TechStore Solucoes Ltda
  // ============================================
  const tenant = await prisma.tenant.create({
    data: {
      nome: 'TechStore Solucoes Ltda',
      cnpj: '45.123.456/0001-89',
      email: 'contato@techstore.com.br',
      telefone: '(31) 3333-4444',
      endereco: 'Av. Tecnologia, 1000 - Belo Horizonte/MG',
      ativo: true,
      configuracoes: {
        segmento: 'Varejo de tecnologia + Servicos de suporte',
        faturamentoMensal: 670000,
      },
    },
  })
  console.log('Tenant criado:', tenant.nome)

  // ============================================
  // 2. USUARIOS (6 usuarios)
  // ============================================
  const usuarios = await Promise.all([
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        authId: 'seed-user-1',
        nome: 'Carlos Mendonca',
        email: 'carlos.mendonca@techstore.com.br',
        perfil: 'GESTOR',
        ativo: true,
      },
    }),
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        authId: 'seed-user-2',
        nome: 'Fernanda Lima',
        email: 'fernanda.lima@techstore.com.br',
        perfil: 'COLABORADOR',
        ativo: true,
      },
    }),
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        authId: 'seed-user-3',
        nome: 'Ricardo Santos',
        email: 'ricardo.santos@techstore.com.br',
        perfil: 'COLABORADOR',
        ativo: true,
      },
    }),
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        authId: 'seed-user-4',
        nome: 'Bruno Alves',
        email: 'bruno.alves@techstore.com.br',
        perfil: 'COLABORADOR',
        ativo: true,
      },
    }),
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        authId: 'seed-user-5',
        nome: 'Maria Clara',
        email: 'maria.clara@techstore.com.br',
        perfil: 'COLABORADOR',
        ativo: true,
      },
    }),
    prisma.user.create({
      data: {
        tenantId: tenant.id,
        authId: 'seed-user-6',
        nome: 'Juliana Costa',
        email: 'juliana.costa@techstore.com.br',
        perfil: 'COLABORADOR',
        ativo: true,
      },
    }),
  ])

  const [carlos, fernanda, ricardo, bruno, mariaClara, juliana] = usuarios
  console.log(`${usuarios.length} usuarios criados.`)

  // ============================================
  // 3. CONTAS BANCARIAS (3 contas)
  // ============================================
  const contaBB = await prisma.bankAccount.create({
    data: {
      tenantId: tenant.id,
      nome: 'Conta Principal BB',
      banco: 'Banco do Brasil',
      agencia: '1234-5',
      conta: '12345-6',
      tipo: 'CORRENTE',
      saldoInicial: 50000,
      saldoAtual: 78500,
      cor: '#FFCC00',
      ativo: true,
    },
  })

  const contaItau = await prisma.bankAccount.create({
    data: {
      tenantId: tenant.id,
      nome: 'Conta Empresarial Itau',
      banco: 'Itau',
      agencia: '0987',
      conta: '98765-4',
      tipo: 'CORRENTE',
      saldoInicial: 20000,
      saldoAtual: 35200,
      cor: '#FF6600',
      ativo: true,
    },
  })

  const contaCaixa = await prisma.bankAccount.create({
    data: {
      tenantId: tenant.id,
      nome: 'Poupanca Reserva Caixa',
      banco: 'Caixa',
      agencia: '2468',
      conta: '13579-0',
      tipo: 'POUPANCA',
      saldoInicial: 10000,
      saldoAtual: 11750,
      cor: '#0066CC',
      ativo: true,
    },
  })
  console.log('3 contas bancarias criadas.')

  // ============================================
  // 4. MOVIMENTACOES FINANCEIRAS (20 transacoes)
  // ============================================
  const movimentacoes = [
    // RECEITAS
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_produtos',
      descricao: 'Venda de notebooks Dell - Lote corporativo',
      valor: 45000,
      dataMovimento: new Date('2026-01-05'),
      observacoes: 'Cliente: Empresa ABC Ltda - NF-2026-0105',
    },
    {
      tenantId: tenant.id,
      contaId: contaItau.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_servicos',
      descricao: 'Contrato de suporte mensal - Cliente Premium',
      valor: 12500,
      dataMovimento: new Date('2026-01-04'),
      observacoes: 'Cliente: Industria XYZ S.A. - NF-2026-0104',
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_produtos',
      descricao: 'Venda de perifericos e acessorios',
      valor: 8750,
      dataMovimento: new Date('2026-01-03'),
      observacoes: 'Diversos clientes varejo - NF-2026-0103',
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_servicos',
      descricao: 'Instalacao de rede corporativa',
      valor: 18000,
      dataMovimento: new Date('2025-12-28'),
      observacoes: 'Cliente: Escritorio Advocacia Silva - NF-2025-1228',
    },
    {
      tenantId: tenant.id,
      contaId: contaItau.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_produtos',
      descricao: 'Venda de servidores HP',
      valor: 78000,
      dataMovimento: new Date('2025-12-23'),
      observacoes: 'Cliente: Hospital Santa Maria - NF-2025-1223',
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_servicos',
      descricao: 'Manutencao preventiva - Pacote trimestral',
      valor: 9500,
      dataMovimento: new Date('2025-12-20'),
      observacoes: 'Cliente: Colegio Sao Paulo - NF-2025-1220',
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_produtos',
      descricao: 'Venda de monitores LG 27"',
      valor: 15600,
      dataMovimento: new Date('2025-12-18'),
      observacoes: 'Cliente: Startup Tech Innovation - NF-2025-1218',
    },
    {
      tenantId: tenant.id,
      contaId: contaItau.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_servicos',
      descricao: 'Consultoria em infraestrutura de TI',
      valor: 22000,
      dataMovimento: new Date('2025-12-15'),
      observacoes: 'Cliente: Construtora Horizonte - NF-2025-1215',
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_produtos',
      descricao: 'Venda de impressoras multifuncionais',
      valor: 6800,
      dataMovimento: new Date('2025-12-12'),
      observacoes: 'Cliente: Clinica Saude Total - NF-2025-1212',
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'RECEITA' as const,
      categoria: 'vendas_servicos',
      descricao: 'Suporte tecnico emergencial',
      valor: 3500,
      dataMovimento: new Date('2025-12-10'),
      observacoes: 'Cliente: Restaurante Sabor & Arte - NF-2025-1210',
    },
    // DESPESAS
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'DESPESA' as const,
      categoria: 'salarios',
      descricao: 'Folha de pagamento - Janeiro/2026',
      valor: 85000,
      dataMovimento: new Date('2026-01-05'),
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'DESPESA' as const,
      categoria: 'fornecedores',
      descricao: 'Compra de estoque - Notebooks Dell',
      valor: 120000,
      dataMovimento: new Date('2026-01-02'),
      observacoes: 'Fornecedor: Dell Brasil - NF-FORN-2026-001',
    },
    {
      tenantId: tenant.id,
      contaId: contaItau.id,
      tipo: 'DESPESA' as const,
      categoria: 'marketing',
      descricao: 'Campanha Google Ads - Janeiro',
      valor: 15000,
      dataMovimento: new Date('2026-01-01'),
      observacoes: 'Fornecedor: Google Brasil',
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'DESPESA' as const,
      categoria: 'aluguel',
      descricao: 'Aluguel do galpao e escritorio - Janeiro',
      valor: 18500,
      dataMovimento: new Date('2026-01-02'),
      observacoes: 'Fornecedor: Imobiliaria Central',
    },
    {
      tenantId: tenant.id,
      contaId: contaCaixa.id,
      tipo: 'DESPESA' as const,
      categoria: 'energia',
      descricao: 'Conta de energia eletrica - Dezembro',
      valor: 4200,
      dataMovimento: new Date('2025-12-28'),
      observacoes: 'Fornecedor: CEMIG',
    },
    {
      tenantId: tenant.id,
      contaId: contaCaixa.id,
      tipo: 'DESPESA' as const,
      categoria: 'internet_telefone',
      descricao: 'Internet fibra + telefonia - Dezembro',
      valor: 1800,
      dataMovimento: new Date('2025-12-26'),
      observacoes: 'Fornecedor: Vivo Empresas',
    },
    {
      tenantId: tenant.id,
      contaId: contaBB.id,
      tipo: 'DESPESA' as const,
      categoria: 'impostos',
      descricao: 'ICMS sobre vendas - Dezembro',
      valor: 32000,
      dataMovimento: new Date('2025-12-20'),
    },
    {
      tenantId: tenant.id,
      contaId: contaItau.id,
      tipo: 'DESPESA' as const,
      categoria: 'fornecedores',
      descricao: 'Compra de perifericos - Estoque',
      valor: 28000,
      dataMovimento: new Date('2025-12-18'),
      observacoes: 'Fornecedor: Distribuidora Tech Parts - NF-FORN-2025-089',
    },
    {
      tenantId: tenant.id,
      contaId: contaCaixa.id,
      tipo: 'DESPESA' as const,
      categoria: 'manutencao',
      descricao: 'Manutencao veiculos da frota',
      valor: 3500,
      dataMovimento: new Date('2025-12-15'),
      observacoes: 'Fornecedor: Auto Center Premium',
    },
    {
      tenantId: tenant.id,
      contaId: contaCaixa.id,
      tipo: 'DESPESA' as const,
      categoria: 'transporte',
      descricao: 'Combustivel frota - Dezembro',
      valor: 4800,
      dataMovimento: new Date('2025-12-10'),
      observacoes: 'Fornecedor: Posto Shell Centro',
    },
  ]

  await prisma.transaction.createMany({
    data: movimentacoes,
  })
  console.log(`${movimentacoes.length} movimentacoes financeiras criadas.`)

  // ============================================
  // 5. OBJETIVOS OKR (3 objetivos com Key Results)
  // ============================================

  // Objetivo 1: Aumentar Faturamento
  const objetivo1 = await prisma.objective.create({
    data: {
      tenantId: tenant.id,
      responsavelId: carlos.id,
      titulo: 'Aumentar Faturamento',
      descricao: 'Crescimento de 20% no faturamento anual',
      periodoInicio: new Date('2026-01-01'),
      periodoFim: new Date('2026-12-31'),
      status: 'EM_ANDAMENTO',
      progresso: 65,
    },
  })

  await prisma.keyResult.createMany({
    data: [
      {
        objetivoId: objetivo1.id,
        titulo: 'Aumentar vendas de produtos em 25%',
        metrica: 'Percentual de crescimento',
        valorBaseline: 0,
        valorMeta: 25,
        valorAtual: 18,
        peso: 1,
        progresso: 72,
      },
      {
        objetivoId: objetivo1.id,
        titulo: 'Expandir base de clientes corporativos',
        metrica: 'Numero de novos clientes',
        valorBaseline: 50,
        valorMeta: 80,
        valorAtual: 68,
        peso: 1,
        progresso: 60,
      },
      {
        objetivoId: objetivo1.id,
        titulo: 'Aumentar ticket medio em 15%',
        metrica: 'Valor medio por venda',
        valorBaseline: 5000,
        valorMeta: 5750,
        valorAtual: 5400,
        peso: 1,
        progresso: 53,
      },
    ],
  })

  // Objetivo 2: Reduzir Inadimplencia
  const objetivo2 = await prisma.objective.create({
    data: {
      tenantId: tenant.id,
      responsavelId: ricardo.id,
      titulo: 'Reduzir Inadimplencia',
      descricao: 'Reduzir inadimplencia para 3%',
      periodoInicio: new Date('2026-01-01'),
      periodoFim: new Date('2026-06-30'),
      status: 'ATRASADO',
      progresso: 35,
    },
  })

  await prisma.keyResult.createMany({
    data: [
      {
        objetivoId: objetivo2.id,
        titulo: 'Reduzir prazo medio de recebimento',
        metrica: 'Dias',
        valorBaseline: 45,
        valorMeta: 30,
        valorAtual: 38,
        peso: 1,
        progresso: 47,
      },
      {
        objetivoId: objetivo2.id,
        titulo: 'Implementar sistema de cobranca automatica',
        metrica: 'Percentual implementado',
        valorBaseline: 0,
        valorMeta: 100,
        valorAtual: 25,
        peso: 1,
        progresso: 25,
      },
    ],
  })

  // Objetivo 3: Organizar Processos Internos
  const objetivo3 = await prisma.objective.create({
    data: {
      tenantId: tenant.id,
      responsavelId: fernanda.id,
      titulo: 'Organizar Processos Internos',
      descricao: 'Documentar e otimizar 100% dos processos',
      periodoInicio: new Date('2026-01-01'),
      periodoFim: new Date('2026-06-30'),
      status: 'EM_ANDAMENTO',
      progresso: 78,
    },
  })

  await prisma.keyResult.createMany({
    data: [
      {
        objetivoId: objetivo3.id,
        titulo: 'Documentar processos de vendas',
        metrica: 'Processos documentados',
        valorBaseline: 0,
        valorMeta: 10,
        valorAtual: 8,
        peso: 1,
        progresso: 80,
      },
      {
        objetivoId: objetivo3.id,
        titulo: 'Treinar equipe nos novos processos',
        metrica: 'Colaboradores treinados',
        valorBaseline: 0,
        valorMeta: 6,
        valorAtual: 5,
        peso: 1,
        progresso: 83,
      },
      {
        objetivoId: objetivo3.id,
        titulo: 'Reduzir tempo de atendimento',
        metrica: 'Minutos por atendimento',
        valorBaseline: 30,
        valorMeta: 15,
        valorAtual: 18,
        peso: 1,
        progresso: 80,
      },
    ],
  })
  console.log('3 objetivos OKR com Key Results criados.')

  // ============================================
  // 6. PROJETO DE CONSULTORIA COM TAREFAS
  // ============================================
  const projeto = await prisma.consultingProject.create({
    data: {
      tenantId: tenant.id,
      nome: 'Reestruturacao Financeira e Processos',
      descricao: 'Projeto de consultoria BMV para reestruturacao financeira e otimizacao de processos internos da TechStore',
      dataInicio: new Date('2025-10-15'),
      dataFim: new Date('2026-04-15'),
      status: 'EM_ANDAMENTO',
      progresso: 45,
    },
  })

  // Etapas do projeto
  const etapa1 = await prisma.consultingStage.create({
    data: {
      projetoId: projeto.id,
      nome: 'Diagnostico',
      ordem: 1,
      peso: 1,
      progresso: 100,
    },
  })

  const etapa2 = await prisma.consultingStage.create({
    data: {
      projetoId: projeto.id,
      nome: 'Planejamento',
      ordem: 2,
      peso: 1,
      progresso: 80,
    },
  })

  const etapa3 = await prisma.consultingStage.create({
    data: {
      projetoId: projeto.id,
      nome: 'Implementacao',
      ordem: 3,
      peso: 1.5,
      progresso: 30,
    },
  })

  const etapa4 = await prisma.consultingStage.create({
    data: {
      projetoId: projeto.id,
      nome: 'Monitoramento',
      ordem: 4,
      peso: 0.5,
      progresso: 0,
    },
  })

  // Tarefas do projeto
  await prisma.consultingTask.createMany({
    data: [
      {
        projetoId: projeto.id,
        etapaId: etapa1.id,
        responsavelId: carlos.id,
        titulo: 'Levantamento de processos atuais',
        descricao: 'Mapear todos os processos financeiros e operacionais existentes',
        status: 'CONCLUIDO',
        prioridade: 'ALTA',
        prazo: new Date('2025-11-01'),
        requerEvidencia: true,
      },
      {
        projetoId: projeto.id,
        etapaId: etapa1.id,
        responsavelId: ricardo.id,
        titulo: 'Analise de indicadores financeiros',
        descricao: 'Avaliar DRE, fluxo de caixa e principais KPIs',
        status: 'CONCLUIDO',
        prioridade: 'ALTA',
        prazo: new Date('2025-11-15'),
        requerEvidencia: true,
      },
      {
        projetoId: projeto.id,
        etapaId: etapa2.id,
        responsavelId: fernanda.id,
        titulo: 'Definicao de metas e OKRs',
        descricao: 'Estabelecer objetivos e resultados-chave para o proximo ano',
        status: 'CONCLUIDO',
        prioridade: 'ALTA',
        prazo: new Date('2025-12-01'),
        requerEvidencia: false,
      },
      {
        projetoId: projeto.id,
        etapaId: etapa2.id,
        responsavelId: carlos.id,
        titulo: 'Plano de acao para reducao de inadimplencia',
        descricao: 'Criar estrategias para reduzir a taxa de inadimplencia de 8.5% para 3%',
        status: 'EM_ANDAMENTO',
        prioridade: 'URGENTE',
        prazo: new Date('2025-12-15'),
        requerEvidencia: true,
      },
      {
        projetoId: projeto.id,
        etapaId: etapa3.id,
        responsavelId: bruno.id,
        titulo: 'Implantacao de sistema de cobranca',
        descricao: 'Configurar e implementar sistema automatizado de cobranca',
        status: 'EM_ANDAMENTO',
        prioridade: 'ALTA',
        prazo: new Date('2026-01-30'),
        requerEvidencia: true,
      },
      {
        projetoId: projeto.id,
        etapaId: etapa3.id,
        responsavelId: mariaClara.id,
        titulo: 'Treinamento da equipe financeira',
        descricao: 'Capacitar equipe nos novos processos e sistemas',
        status: 'A_FAZER',
        prioridade: 'MEDIA',
        prazo: new Date('2026-02-15'),
        requerEvidencia: false,
      },
      {
        projetoId: projeto.id,
        etapaId: etapa3.id,
        responsavelId: juliana.id,
        titulo: 'Criacao de dashboards gerenciais',
        descricao: 'Desenvolver paineis de controle para acompanhamento de indicadores',
        status: 'A_FAZER',
        prioridade: 'MEDIA',
        prazo: new Date('2026-02-28'),
        requerEvidencia: true,
      },
      {
        projetoId: projeto.id,
        etapaId: etapa4.id,
        responsavelId: carlos.id,
        titulo: 'Acompanhamento mensal de resultados',
        descricao: 'Monitorar evolucao dos indicadores e ajustar estrategias',
        status: 'A_FAZER',
        prioridade: 'MEDIA',
        prazo: new Date('2026-04-15'),
        requerEvidencia: true,
      },
    ],
  })
  console.log('1 projeto de consultoria com 4 etapas e 8 tarefas criado.')

  // ============================================
  // 7. PLANO DE CONTAS BASICO
  // ============================================
  const planoContas = [
    // ATIVO
    { codigo: '1', nome: 'ATIVO', tipo: 'ATIVO' as const, natureza: 'DEVEDORA' as const, nivel: 1 },
    { codigo: '1.1', nome: 'Ativo Circulante', tipo: 'ATIVO' as const, natureza: 'DEVEDORA' as const, nivel: 2 },
    { codigo: '1.1.1', nome: 'Caixa e Equivalentes', tipo: 'ATIVO' as const, natureza: 'DEVEDORA' as const, nivel: 3 },
    { codigo: '1.1.2', nome: 'Contas a Receber', tipo: 'ATIVO' as const, natureza: 'DEVEDORA' as const, nivel: 3 },
    { codigo: '1.1.3', nome: 'Estoques', tipo: 'ATIVO' as const, natureza: 'DEVEDORA' as const, nivel: 3 },
    { codigo: '1.2', nome: 'Ativo Nao Circulante', tipo: 'ATIVO' as const, natureza: 'DEVEDORA' as const, nivel: 2 },
    { codigo: '1.2.1', nome: 'Imobilizado', tipo: 'ATIVO' as const, natureza: 'DEVEDORA' as const, nivel: 3 },

    // PASSIVO
    { codigo: '2', nome: 'PASSIVO', tipo: 'PASSIVO' as const, natureza: 'CREDORA' as const, nivel: 1 },
    { codigo: '2.1', nome: 'Passivo Circulante', tipo: 'PASSIVO' as const, natureza: 'CREDORA' as const, nivel: 2 },
    { codigo: '2.1.1', nome: 'Fornecedores', tipo: 'PASSIVO' as const, natureza: 'CREDORA' as const, nivel: 3 },
    { codigo: '2.1.2', nome: 'Obrigacoes Trabalhistas', tipo: 'PASSIVO' as const, natureza: 'CREDORA' as const, nivel: 3 },
    { codigo: '2.1.3', nome: 'Obrigacoes Fiscais', tipo: 'PASSIVO' as const, natureza: 'CREDORA' as const, nivel: 3 },

    // PATRIMONIO LIQUIDO
    { codigo: '3', nome: 'PATRIMONIO LIQUIDO', tipo: 'PATRIMONIO_LIQUIDO' as const, natureza: 'CREDORA' as const, nivel: 1 },
    { codigo: '3.1', nome: 'Capital Social', tipo: 'PATRIMONIO_LIQUIDO' as const, natureza: 'CREDORA' as const, nivel: 2 },
    { codigo: '3.2', nome: 'Lucros Acumulados', tipo: 'PATRIMONIO_LIQUIDO' as const, natureza: 'CREDORA' as const, nivel: 2 },

    // RECEITA
    { codigo: '4', nome: 'RECEITAS', tipo: 'RECEITA' as const, natureza: 'CREDORA' as const, nivel: 1 },
    { codigo: '4.1', nome: 'Receita de Vendas', tipo: 'RECEITA' as const, natureza: 'CREDORA' as const, nivel: 2 },
    { codigo: '4.1.1', nome: 'Venda de Produtos', tipo: 'RECEITA' as const, natureza: 'CREDORA' as const, nivel: 3 },
    { codigo: '4.1.2', nome: 'Venda de Servicos', tipo: 'RECEITA' as const, natureza: 'CREDORA' as const, nivel: 3 },
    { codigo: '4.2', nome: 'Outras Receitas', tipo: 'RECEITA' as const, natureza: 'CREDORA' as const, nivel: 2 },

    // DESPESA
    { codigo: '5', nome: 'DESPESAS', tipo: 'DESPESA' as const, natureza: 'DEVEDORA' as const, nivel: 1 },
    { codigo: '5.1', nome: 'Despesas Operacionais', tipo: 'DESPESA' as const, natureza: 'DEVEDORA' as const, nivel: 2 },
    { codigo: '5.1.1', nome: 'Salarios e Encargos', tipo: 'DESPESA' as const, natureza: 'DEVEDORA' as const, nivel: 3 },
    { codigo: '5.1.2', nome: 'Aluguel', tipo: 'DESPESA' as const, natureza: 'DEVEDORA' as const, nivel: 3 },
    { codigo: '5.1.3', nome: 'Energia e Utilidades', tipo: 'DESPESA' as const, natureza: 'DEVEDORA' as const, nivel: 3 },
    { codigo: '5.1.4', nome: 'Marketing e Publicidade', tipo: 'DESPESA' as const, natureza: 'DEVEDORA' as const, nivel: 3 },
    { codigo: '5.2', nome: 'Despesas Administrativas', tipo: 'DESPESA' as const, natureza: 'DEVEDORA' as const, nivel: 2 },

    // CUSTO
    { codigo: '6', nome: 'CUSTOS', tipo: 'CUSTO' as const, natureza: 'DEVEDORA' as const, nivel: 1 },
    { codigo: '6.1', nome: 'Custo das Mercadorias Vendidas', tipo: 'CUSTO' as const, natureza: 'DEVEDORA' as const, nivel: 2 },
    { codigo: '6.2', nome: 'Custo dos Servicos Prestados', tipo: 'CUSTO' as const, natureza: 'DEVEDORA' as const, nivel: 2 },
  ]

  await prisma.chartOfAccount.createMany({
    data: planoContas.map((conta) => ({
      tenantId: tenant.id,
      ...conta,
      ativo: true,
    })),
  })
  console.log(`${planoContas.length} contas do plano de contas criadas.`)

  // ============================================
  // 8. CENTROS DE CUSTO (3 centros)
  // ============================================
  await prisma.costCenter.createMany({
    data: [
      {
        tenantId: tenant.id,
        codigo: 'CC001',
        nome: 'Comercial',
        descricao: 'Departamento de vendas e atendimento ao cliente',
        responsavel: 'Fernanda Lima',
        ativo: true,
      },
      {
        tenantId: tenant.id,
        codigo: 'CC002',
        nome: 'Administrativo',
        descricao: 'Departamento administrativo e financeiro',
        responsavel: 'Ricardo Santos',
        ativo: true,
      },
      {
        tenantId: tenant.id,
        codigo: 'CC003',
        nome: 'Suporte Tecnico',
        descricao: 'Departamento de suporte e servicos tecnicos',
        responsavel: 'Bruno Alves',
        ativo: true,
      },
    ],
  })
  console.log('3 centros de custo criados.')

  console.log('\n========================================')
  console.log('Seed concluido com sucesso!')
  console.log('========================================')
  console.log(`Tenant: ${tenant.nome}`)
  console.log(`Usuarios: ${usuarios.length}`)
  console.log(`Contas Bancarias: 3`)
  console.log(`Movimentacoes: ${movimentacoes.length}`)
  console.log(`Objetivos OKR: 3`)
  console.log(`Projeto de Consultoria: 1`)
  console.log(`Plano de Contas: ${planoContas.length} contas`)
  console.log(`Centros de Custo: 3`)
  console.log('========================================\n')
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
