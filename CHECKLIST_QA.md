# Checklist de QA - BM&V Software

## Informações do Teste

| Campo | Valor |
|-------|-------|
| **Data do Teste** | ___/___/______ |
| **Testador** | __________________ |
| **Ambiente** | [ ] Local [ ] Staging [ ] Produção |
| **Navegador** | __________________ |
| **Versão do App** | __________________ |

---

## Fluxo 1: Cadastro e Login

### 1.1 Cadastro de Novo Usuário
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 1.1.1 | Cadastro com dados válidos | 1. Acessar /cadastro<br>2. Preencher nome, email, senha<br>3. Clicar em cadastrar | Usuário criado e redirecionado para seleção de plano | [ ] Pass [ ] Fail | |
| 1.1.2 | Cadastro com email já existente | 1. Tentar cadastrar com email já registrado | Mensagem de erro informando email já cadastrado | [ ] Pass [ ] Fail | |
| 1.1.3 | Cadastro com senha fraca | 1. Usar senha com menos de 6 caracteres | Validação deve impedir cadastro | [ ] Pass [ ] Fail | |
| 1.1.4 | Cadastro com email inválido | 1. Usar formato de email inválido | Validação deve impedir cadastro | [ ] Pass [ ] Fail | |

### 1.2 Login
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 1.2.1 | Login com credenciais válidas | 1. Acessar /login<br>2. Inserir email e senha corretos<br>3. Clicar em entrar | Redirecionado ao dashboard | [ ] Pass [ ] Fail | |
| 1.2.2 | Login com senha incorreta | 1. Inserir email correto e senha errada | Mensagem de erro | [ ] Pass [ ] Fail | |
| 1.2.3 | Login com email não cadastrado | 1. Inserir email inexistente | Mensagem de erro | [ ] Pass [ ] Fail | |
| 1.2.4 | Logout | 1. Clicar em logout no menu | Sessão encerrada e redirecionado ao login | [ ] Pass [ ] Fail | |
| 1.2.5 | Persistência de sessão | 1. Fazer login<br>2. Fechar navegador<br>3. Reabrir | Sessão deve permanecer ativa | [ ] Pass [ ] Fail | |

---

## Fluxo 2: Financeiro Básico

### 2.1 Dashboard Financeiro
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 2.1.1 | Visualizar resumo financeiro | 1. Acessar dashboard | Cards de resumo (receitas, despesas, saldo) visíveis | [ ] Pass [ ] Fail | |
| 2.1.2 | Health Score exibido | 1. Verificar widget HealthScoreCard | Score de saúde financeira calculado corretamente | [ ] Pass [ ] Fail | |
| 2.1.3 | Gráfico de fluxo de caixa | 1. Verificar gráfico no dashboard | Gráfico renderiza com dados corretos | [ ] Pass [ ] Fail | |

### 2.2 Contas Bancárias
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 2.2.1 | Listar contas | 1. Acessar /financeiro/contas | Lista de contas exibida | [ ] Pass [ ] Fail | |
| 2.2.2 | Criar nova conta | 1. Clicar em nova conta<br>2. Preencher dados<br>3. Salvar | Conta criada com sucesso | [ ] Pass [ ] Fail | |
| 2.2.3 | Editar conta existente | 1. Clicar em editar<br>2. Alterar dados<br>3. Salvar | Dados atualizados | [ ] Pass [ ] Fail | |
| 2.2.4 | Excluir conta | 1. Clicar em excluir<br>2. Confirmar | Conta removida (se sem movimentações) | [ ] Pass [ ] Fail | |

### 2.3 Transferências
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 2.3.1 | Realizar transferência | 1. Acessar /financeiro/transferencias<br>2. Selecionar origem e destino<br>3. Informar valor | Transferência registrada em ambas contas | [ ] Pass [ ] Fail | |
| 2.3.2 | Transferência com saldo insuficiente | 1. Tentar transferir valor maior que saldo | Alerta de saldo insuficiente | [ ] Pass [ ] Fail | |

---

## Fluxo 3: Contas a Receber/Pagar

### 3.1 Contas a Receber
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 3.1.1 | Listar contas a receber | 1. Acessar módulo financeiro | Lista filtrada por status (pendente/recebido) | [ ] Pass [ ] Fail | |
| 3.1.2 | Criar conta a receber | 1. Nova conta<br>2. Preencher cliente, valor, vencimento<br>3. Salvar | Conta criada | [ ] Pass [ ] Fail | |
| 3.1.3 | Baixar conta (recebimento) | 1. Selecionar conta pendente<br>2. Registrar recebimento | Status atualizado para "Recebido" | [ ] Pass [ ] Fail | |
| 3.1.4 | Filtrar por período | 1. Aplicar filtro de data | Lista filtrada corretamente | [ ] Pass [ ] Fail | |
| 3.1.5 | Indicador de inadimplência | 1. Verificar contas vencidas | Indicador visual de atraso | [ ] Pass [ ] Fail | |

### 3.2 Contas a Pagar
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 3.2.1 | Listar contas a pagar | 1. Acessar módulo financeiro | Lista filtrada por status | [ ] Pass [ ] Fail | |
| 3.2.2 | Criar conta a pagar | 1. Nova conta<br>2. Preencher fornecedor, valor, vencimento<br>3. Salvar | Conta criada | [ ] Pass [ ] Fail | |
| 3.2.3 | Baixar conta (pagamento) | 1. Selecionar conta<br>2. Registrar pagamento | Status atualizado para "Pago" | [ ] Pass [ ] Fail | |
| 3.2.4 | Alerta de vencimento próximo | 1. Verificar contas próximas ao vencimento | Alerta visual exibido | [ ] Pass [ ] Fail | |

### 3.3 Relatórios Financeiros
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 3.3.1 | Exportar relatório PDF | 1. Acessar relatórios<br>2. Selecionar período<br>3. Exportar PDF | Arquivo PDF gerado corretamente | [ ] Pass [ ] Fail | |
| 3.3.2 | Exportar relatório Excel | 1. Acessar relatórios<br>2. Exportar Excel | Arquivo XLSX gerado corretamente | [ ] Pass [ ] Fail | |

---

## Fluxo 4: Upgrade de Plano

### 4.1 Trial
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 4.1.1 | TrialCountdown exibido | 1. Logar com conta trial | Contador de dias restantes visível | [ ] Pass [ ] Fail | |
| 4.1.2 | Limites do trial | 1. Verificar limite de usuários (2)<br>2. Verificar limite de clientes (10) | Limites aplicados corretamente | [ ] Pass [ ] Fail | |

### 4.2 Processo de Upgrade
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 4.2.1 | Acessar página de upgrade | 1. Clicar em "Fazer Upgrade" | Página /checkout/[plano] carrega | [ ] Pass [ ] Fail | |
| 4.2.2 | Selecionar plano Starter | 1. Selecionar plano Starter<br>2. Prosseguir | Redirecionado ao pagamento | [ ] Pass [ ] Fail | |
| 4.2.3 | Selecionar plano Pro | 1. Selecionar plano Pro<br>2. Prosseguir | Redirecionado ao pagamento | [ ] Pass [ ] Fail | |
| 4.2.4 | Selecionar plano Enterprise | 1. Selecionar Enterprise | Formulário de contato ou pagamento | [ ] Pass [ ] Fail | |
| 4.2.5 | Pagamento com sucesso | 1. Completar pagamento (MercadoPago) | Redirecionado a /pagamento/sucesso | [ ] Pass [ ] Fail | |
| 4.2.6 | Webhook de pagamento | 1. Simular webhook MercadoPago | Plano atualizado automaticamente | [ ] Pass [ ] Fail | |

### 4.3 Componentes de Upgrade
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 4.3.1 | UpgradeBanner | 1. Verificar banner em conta trial | Banner promovendo upgrade visível | [ ] Pass [ ] Fail | |
| 4.3.2 | FeatureLockedModal | 1. Tentar acessar feature bloqueada | Modal explicando necessidade de upgrade | [ ] Pass [ ] Fail | |

---

## Fluxo 5: Features por Plano

### 5.1 Plano Trial
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 5.1.1 | Dashboard acessível | 1. Acessar /dashboard | Acesso permitido | [ ] Pass [ ] Fail | |
| 5.1.2 | Financeiro básico | 1. Acessar módulos financeiros básicos | Acesso permitido | [ ] Pass [ ] Fail | |
| 5.1.3 | Cadastros | 1. Acessar clientes, colaboradores | Acesso permitido (limite 10 clientes) | [ ] Pass [ ] Fail | |
| 5.1.4 | Limite de análises IA | 1. Verificar contador de análises | Limite de 3 análises aplicado | [ ] Pass [ ] Fail | |
| 5.1.5 | OKR bloqueado | 1. Tentar acessar /processos/okrs | FeatureLockedModal exibido | [ ] Pass [ ] Fail | |
| 5.1.6 | Consultoria bloqueada | 1. Tentar acessar /consultoria | FeatureLockedModal exibido | [ ] Pass [ ] Fail | |

### 5.2 Plano Starter
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 5.2.1 | Relatórios básicos | 1. Acessar relatórios | Acesso permitido | [ ] Pass [ ] Fail | |
| 5.2.2 | Limite de usuários (5) | 1. Tentar adicionar 6º usuário | Bloqueio com upgrade prompt | [ ] Pass [ ] Fail | |
| 5.2.3 | Limite de clientes (50) | 1. Verificar limite de cadastros | Limite aplicado | [ ] Pass [ ] Fail | |

### 5.3 Plano Pro
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 5.3.1 | Financeiro avançado | 1. Acessar recursos avançados | Acesso permitido | [ ] Pass [ ] Fail | |
| 5.3.2 | OKR | 1. Acessar /processos/okrs | Acesso permitido | [ ] Pass [ ] Fail | |
| 5.3.3 | Consultoria | 1. Acessar /consultoria | Acesso permitido | [ ] Pass [ ] Fail | |
| 5.3.4 | Integração API | 1. Verificar acesso a integrações | Acesso permitido | [ ] Pass [ ] Fail | |
| 5.3.5 | Simulador de cenários | 1. Acessar simulador IA | Funcionalidade disponível | [ ] Pass [ ] Fail | |

### 5.4 Plano Enterprise
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 5.4.1 | Multi-tenant | 1. Verificar gestão de múltiplas empresas | Funcionalidade disponível | [ ] Pass [ ] Fail | |
| 5.4.2 | Suporte prioritário | 1. Verificar canal de suporte | Canal dedicado visível | [ ] Pass [ ] Fail | |
| 5.4.3 | Personalização | 1. Verificar opções de customização | Opções avançadas disponíveis | [ ] Pass [ ] Fail | |
| 5.4.4 | Análises IA ilimitadas | 1. Verificar contador | Sem limite de análises | [ ] Pass [ ] Fail | |

---

## Fluxo 6: LGPD

### 6.1 Páginas Públicas
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 6.1.1 | Política de Privacidade | 1. Acessar /privacidade | Página carrega com todas as seções | [ ] Pass [ ] Fail | |
| 6.1.2 | Termos de Uso | 1. Acessar /termos | Página carrega corretamente | [ ] Pass [ ] Fail | |
| 6.1.3 | Links no rodapé | 1. Verificar links para LGPD no footer | Links funcionais | [ ] Pass [ ] Fail | |

### 6.2 Direitos do Titular
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 6.2.1 | Acesso aos dados | 1. Verificar opção de solicitar dados | Funcionalidade disponível | [ ] Pass [ ] Fail | |
| 6.2.2 | Correção de dados | 1. Editar dados pessoais em /configuracoes/conta | Dados atualizados | [ ] Pass [ ] Fail | |
| 6.2.3 | Exclusão de conta | 1. Verificar opção de excluir conta | Opção disponível com confirmação | [ ] Pass [ ] Fail | |
| 6.2.4 | Portabilidade | 1. Solicitar exportação de dados | Exportação disponível | [ ] Pass [ ] Fail | |
| 6.2.5 | Email DPO visível | 1. Verificar contato do DPO | privacidade@bmvconsultoria.com.br visível | [ ] Pass [ ] Fail | |

### 6.3 Consentimento
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 6.3.1 | Aceite de termos no cadastro | 1. Verificar checkbox de aceite | Checkbox obrigatório presente | [ ] Pass [ ] Fail | |
| 6.3.2 | Banner de cookies | 1. Acessar site como novo visitante | Banner de cookies exibido (se aplicável) | [ ] Pass [ ] Fail | |

---

## Fluxo 7: Responsividade

### 7.1 Desktop (1920x1080)
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 7.1.1 | Dashboard | 1. Verificar layout em 1920x1080 | Layout correto, widgets visíveis | [ ] Pass [ ] Fail | |
| 7.1.2 | Sidebar | 1. Verificar navegação | Menu lateral completo | [ ] Pass [ ] Fail | |
| 7.1.3 | Tabelas | 1. Verificar tabelas de dados | Colunas visíveis sem scroll horizontal | [ ] Pass [ ] Fail | |

### 7.2 Tablet (768x1024)
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 7.2.1 | Dashboard | 1. Redimensionar para 768px | Layout adaptado | [ ] Pass [ ] Fail | |
| 7.2.2 | Sidebar | 1. Verificar comportamento do menu | Menu colapsável ou hamburguer | [ ] Pass [ ] Fail | |
| 7.2.3 | Formulários | 1. Testar preenchimento de forms | Campos acessíveis | [ ] Pass [ ] Fail | |

### 7.3 Mobile (375x667)
| # | Cenário | Passos | Esperado | Status | Observações |
|---|---------|--------|----------|--------|-------------|
| 7.3.1 | Login | 1. Acessar /login em mobile | Formulário responsivo | [ ] Pass [ ] Fail | |
| 7.3.2 | Dashboard | 1. Acessar dashboard | Widgets empilhados verticalmente | [ ] Pass [ ] Fail | |
| 7.3.3 | Navegação | 1. Verificar menu | Menu hamburguer funcional | [ ] Pass [ ] Fail | |
| 7.3.4 | Tabelas | 1. Verificar tabelas | Scroll horizontal ou layout adaptado | [ ] Pass [ ] Fail | |
| 7.3.5 | Modais | 1. Abrir modais (ex: FeatureLockedModal) | Modal ocupa tela corretamente | [ ] Pass [ ] Fail | |
| 7.3.6 | Touch targets | 1. Verificar áreas clicáveis | Botões com tamanho adequado (min 44px) | [ ] Pass [ ] Fail | |

---

## Resumo da Execução

| Fluxo | Total Testes | Pass | Fail | % Aprovação |
|-------|--------------|------|------|-------------|
| Fluxo 1: Cadastro e Login | 9 | | | |
| Fluxo 2: Financeiro Básico | 9 | | | |
| Fluxo 3: Contas a Receber/Pagar | 11 | | | |
| Fluxo 4: Upgrade de Plano | 8 | | | |
| Fluxo 5: Features por Plano | 14 | | | |
| Fluxo 6: LGPD | 8 | | | |
| Fluxo 7: Responsividade | 12 | | | |
| **TOTAL** | **71** | | | |

---

## Bugs Encontrados

| # | Fluxo | Cenário | Descrição do Bug | Severidade | Screenshot |
|---|-------|---------|------------------|------------|------------|
| 1 | | | | [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo | |
| 2 | | | | [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo | |
| 3 | | | | [ ] Crítico [ ] Alto [ ] Médio [ ] Baixo | |

---

## Assinaturas

| Papel | Nome | Data | Assinatura |
|-------|------|------|------------|
| Testador | | | |
| Aprovador | | | |

---

*Documento gerado em: ___/___/______*
*Versão do checklist: 1.0*
