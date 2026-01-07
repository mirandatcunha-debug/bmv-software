# Regras de Alertas da IA

Definição de regras para geração automática de alertas e insights pelo sistema.

---

## 1. Tipos de Alerta

| Tipo | Cor | Ícone | Prioridade | Ação Esperada |
|------|-----|-------|------------|---------------|
| CRÍTICO | Vermelho | ⚠️ | Máxima | Ação imediata necessária |
| ATENÇÃO | Amarelo/Laranja | ⚡ | Alta | Monitorar e planejar ação |
| SUGESTÃO | Azul | 💡 | Média | Considerar implementação |
| POSITIVO | Verde | ✅ | Baixa | Celebrar/manter o bom trabalho |

---

## 2. Regras de Alerta CRÍTICO

Disparar quando houver risco iminente ao negócio.

### 2.1 Financeiro

| Condição | Mensagem Modelo | Dados Necessários |
|----------|-----------------|-------------------|
| Saldo de caixa < 0 | "Saldo de caixa negativo em R$ {valor}. Risco de inadimplência com fornecedores." | saldo_caixa |
| Saldo caixa < despesas fixas 15 dias | "Saldo atual cobre apenas {dias} dias de operação. Ação urgente necessária." | saldo_caixa, despesas_fixas_diarias |
| Inadimplência > 10% | "Inadimplência em {percentual}% - {quantidade} clientes com atraso > 30 dias. Risco de perda elevado." | taxa_inadimplencia, qtd_inadimplentes |
| Previsão caixa negativo em 30 dias | "Projeção indica saldo negativo em {data}. Déficit previsto de R$ {valor}." | projecao_fluxo_caixa |
| Liquidez corrente < 0.8 | "Liquidez corrente em {valor} - empresa não consegue honrar compromissos de curto prazo." | liquidez_corrente |
| [PREENCHER] | [Mensagem] | [Dados] |

### 2.2 Operacional

| Condição | Mensagem Modelo | Dados Necessários |
|----------|-----------------|-------------------|
| Estoque zerado de produto importante | "Estoque de {produto} zerado. Risco de perda de vendas." | estoque_produto, classificacao_abc |
| Atraso > 7 dias em entrega crítica | "Entrega para {cliente} atrasada há {dias} dias. Risco de perda do cliente." | entregas_atrasadas |
| [PREENCHER] | [Mensagem] | [Dados] |

### 2.3 Tributário

| Condição | Mensagem Modelo | Dados Necessários |
|----------|-----------------|-------------------|
| Imposto vencido não pago | "Imposto {nome} vencido há {dias} dias. Multa acumulando." | impostos_pendentes |
| Declaração em atraso | "Declaração {nome} não enviada. Prazo era {data}." | obrigacoes_acessorias |
| [PREENCHER] | [Mensagem] | [Dados] |

### Exemplos de Mensagens CRÍTICO

```
❌ CRÍTICO: Inadimplência em 8,5% - 12 clientes com atraso superior a 30 dias.
   Valor em risco: R$ 45.000,00. Ação de cobrança urgente recomendada.

❌ CRÍTICO: Saldo de caixa negativo previsto para 15/03.
   Déficit estimado: R$ 32.000,00. Necessário renegociar prazos ou buscar capital.

❌ CRÍTICO: ICMS de Janeiro vencido há 5 dias.
   Multa atual: R$ 850,00 (aumenta 0,33% ao dia).
```

---

## 3. Regras de Alerta ATENÇÃO

Disparar quando houver situação que requer monitoramento próximo.

### 3.1 Financeiro

| Condição | Mensagem Modelo | Dados Necessários |
|----------|-----------------|-------------------|
| Inadimplência entre 5% e 10% | "Inadimplência em {percentual}% - tendência de alta nos últimos {periodo}." | taxa_inadimplencia, historico |
| Despesa categoria +30% vs média | "Despesas com {categoria} aumentaram {percentual}% este mês vs média dos últimos 3 meses." | despesas_categoria, media_historica |
| Margem bruta caiu >5pp | "Margem bruta caiu de {anterior}% para {atual}% - analisar precificação e custos." | margem_bruta, historico |
| Concentração de receita >50% em 3 clientes | "Top 3 clientes representam {percentual}% da receita. Risco de dependência." | receita_por_cliente |
| Liquidez corrente entre 0.8 e 1.2 | "Liquidez corrente em {valor} - margem apertada para imprevistos." | liquidez_corrente |
| Ciclo financeiro aumentou >15 dias | "Ciclo financeiro aumentou de {anterior} para {atual} dias. Maior necessidade de capital de giro." | ciclo_financeiro, historico |
| [PREENCHER] | [Mensagem] | [Dados] |

### 3.2 Comercial

| Condição | Mensagem Modelo | Dados Necessários |
|----------|-----------------|-------------------|
| Vendas -15% vs mesmo período ano anterior | "Vendas {percentual}% abaixo do mesmo período do ano anterior." | vendas_atual, vendas_ano_anterior |
| Ticket médio caiu >10% | "Ticket médio caiu de R$ {anterior} para R$ {atual} (-{percentual}%)." | ticket_medio, historico |
| Taxa conversão caiu >20% | "Taxa de conversão caiu de {anterior}% para {atual}%." | taxa_conversao, historico |
| [PREENCHER] | [Mensagem] | [Dados] |

### 3.3 Operacional

| Condição | Mensagem Modelo | Dados Necessários |
|----------|-----------------|-------------------|
| Estoque <30% do normal | "Estoque de {categoria} em {percentual}% do nível normal. Considerar reposição." | estoque_atual, estoque_normal |
| Turnover >20% no trimestre | "Turnover de {percentual}% no trimestre. Avaliar clima organizacional." | turnover, periodo |
| [PREENCHER] | [Mensagem] | [Dados] |

### Exemplos de Mensagens ATENÇÃO

```
⚡ ATENÇÃO: Despesas com Marketing aumentaram 45% este mês
   comparado à média dos últimos 3 meses (R$ 15.000 vs R$ 10.300).

⚡ ATENÇÃO: Ciclo financeiro aumentou de 35 para 52 dias.
   Necessidade adicional de capital de giro estimada em R$ 28.000.

⚡ ATENÇÃO: Vendas 12% abaixo do mesmo período do ano passado.
   Tendência de queda pelo terceiro mês consecutivo.
```

---

## 4. Regras de SUGESTÃO

Disparar quando a IA identificar oportunidades de melhoria.

### 4.1 Oportunidades Financeiras

| Condição | Mensagem Modelo | Impacto Estimado |
|----------|-----------------|------------------|
| Saldo parado > 20% do faturamento mensal | "Saldo de R$ {valor} parado em conta. Considerar aplicação ou antecipação de fornecedores com desconto." | Rendimento ou desconto |
| PMP < PMR por >30 dias | "Empresa paga em {pmp} dias mas recebe em {pmr} dias. Renegociar prazos pode liberar R$ {valor} de caixa." | Capital de giro |
| Fornecedor com preço 15% acima mercado | "Fornecedor {nome} com preço {percentual}% acima de alternativas. Potencial economia de R$ {valor}/mês." | Economia |
| Fluxo indica folga em período futuro | "Previsão indica sobra de caixa em {periodo}. Oportunidade para investimento ou quitação antecipada." | Oportunidade |
| [PREENCHER] | [Mensagem] | [Impacto] |

### 4.2 Oportunidades Comerciais

| Condição | Mensagem Modelo | Impacto Estimado |
|----------|-----------------|------------------|
| Cliente inativo há 90+ dias | "{quantidade} clientes inativos há mais de 90 dias. Campanha de reativação pode gerar R$ {valor}." | Receita potencial |
| Produto com margem >média + upsell potencial | "Produto {nome} tem margem de {percentual}% e baixa penetração. Oportunidade de upselling." | Receita incremental |
| Sazonalidade detectada | "Histórico indica aumento de {percentual}% em {periodo}. Preparar estoque e equipe." | Planejamento |
| [PREENCHER] | [Mensagem] | [Impacto] |

### 4.3 Oportunidades Tributárias

| Condição | Mensagem Modelo | Impacto Estimado |
|----------|-----------------|------------------|
| Possível economia com mudança de regime | "Simulação indica economia de R$ {valor}/ano com mudança para {regime}." | Economia anual |
| Créditos não aproveitados | "Identificados R$ {valor} em créditos de {imposto} não aproveitados." | Recuperação |
| [PREENCHER] | [Mensagem] | [Impacto] |

### Exemplos de Mensagens SUGESTÃO

```
💡 SUGESTÃO: Fluxo de caixa prevê saldo positivo de R$ 85.000 em Março.
   Oportunidade para quitar financiamento com desconto de R$ 3.200.

💡 SUGESTÃO: 28 clientes inativos há mais de 90 dias.
   Campanha de reativação pode recuperar ~R$ 42.000 em vendas.

💡 SUGESTÃO: Prazo médio de pagamento atual é 25 dias.
   Renegociar para 45 dias pode liberar R$ 67.000 de capital de giro.
```

---

## 5. Regras de POSITIVO

Disparar quando houver boas notícias ou conquistas a celebrar.

### 5.1 Financeiro

| Condição | Mensagem Modelo |
|----------|-----------------|
| Receita +15% vs mês anterior | "Receita cresceu {percentual}% este mês! De R$ {anterior} para R$ {atual}." |
| Inadimplência caiu >2pp | "Inadimplência reduziu de {anterior}% para {atual}%! Cobrança efetiva." |
| Margem melhorou >3pp | "Margem bruta subiu de {anterior}% para {atual}%! Boa gestão de custos." |
| Meta de OKR atingida | "Meta '{okr_nome}' atingida! Parabéns à equipe!" |
| Fluxo de caixa positivo por X meses | "Caixa positivo pelo {quantidade}º mês consecutivo! Estabilidade financeira." |
| [PREENCHER] | [Mensagem] |

### 5.2 Comercial

| Condição | Mensagem Modelo |
|----------|-----------------|
| Novo cliente estratégico | "Novo cliente {nome} fechado! Potencial de R$ {valor}/ano." |
| Ticket médio +10% | "Ticket médio aumentou para R$ {valor}! Estratégia de upselling funcionando." |
| Taxa conversão +15% | "Taxa de conversão subiu para {percentual}%! Equipe comercial performando bem." |
| [PREENCHER] | [Mensagem] |

### 5.3 Operacional

| Condição | Mensagem Modelo |
|----------|-----------------|
| Produtividade +20% | "Produtividade aumentou {percentual}% este mês! Processos otimizados." |
| Zero reclamações no período | "Nenhuma reclamação de cliente registrada em {periodo}! Qualidade excelente." |
| [PREENCHER] | [Mensagem] |

### Exemplos de Mensagens POSITIVO

```
✅ POSITIVO: Receita de Serviços cresceu 23% comparado ao mesmo período
   do ano anterior! Estratégia de fidelização dando resultado.

✅ POSITIVO: Inadimplência reduziu de 8,5% para 6,2% este mês!
   Régua de cobrança automatizada está funcionando.

✅ POSITIVO: Meta de 'Organizar Processos Internos' atingiu 78%!
   Parabéns à equipe administrativa.
```

---

## 6. Lógica de Priorização

### Ordem de Exibição

1. CRÍTICO (mais recente primeiro)
2. ATENÇÃO (mais recente primeiro)
3. POSITIVO (mais recente primeiro)
4. SUGESTÃO (por impacto estimado)

### Limite de Alertas Visíveis

| Dashboard | Máximo |
|-----------|--------|
| Principal | 5 alertas |
| Financeiro | 8 alertas |
| Lista completa | Todos |

### Regras de Não-Duplicação

- Não repetir mesmo alerta em menos de 24h
- Se condição CRÍTICA persistir, lembrar a cada 48h
- Marcar como "visto" após usuário interagir
- [PREENCHER - Outras regras]

---

## 7. Dados Necessários para Cálculo

### Variáveis Financeiras

```typescript
interface DadosFinanceiros {
  saldo_caixa: number;
  despesas_fixas_mensais: number;
  receita_mes_atual: number;
  receita_mes_anterior: number;
  receita_mesmo_mes_ano_anterior: number;
  taxa_inadimplencia: number;
  qtd_clientes_inadimplentes: number;
  valor_inadimplente: number;
  liquidez_corrente: number;
  liquidez_seca: number;
  margem_bruta: number;
  margem_liquida: number;
  ciclo_financeiro: number;
  pmp: number; // prazo médio pagamento
  pmr: number; // prazo médio recebimento
  // [PREENCHER - Outros campos]
}
```

### Variáveis de Despesas

```typescript
interface DespesasPorCategoria {
  categoria: string;
  valor_atual: number;
  media_3_meses: number;
  variacao_percentual: number;
}
```

### Variáveis Comerciais

```typescript
interface DadosComerciais {
  vendas_mes: number;
  ticket_medio: number;
  taxa_conversao: number;
  qtd_clientes_ativos: number;
  qtd_clientes_inativos_90d: number;
  concentracao_receita_top3: number;
  // [PREENCHER - Outros campos]
}
```

---

## 8. Configuração de Thresholds

### Thresholds Padrão (Ajustáveis por Empresa)

```typescript
const thresholds = {
  critico: {
    inadimplencia: 10,        // %
    liquidez_corrente: 0.8,
    dias_caixa_minimo: 15,
  },
  atencao: {
    inadimplencia: 5,         // %
    liquidez_corrente: 1.2,
    variacao_despesa: 30,     // %
    variacao_margem: -5,      // pp
    concentracao_receita: 50, // %
  },
  positivo: {
    crescimento_receita: 15,  // %
    reducao_inadimplencia: 2, // pp
    aumento_margem: 3,        // pp
  },
  // [PREENCHER - Outros thresholds]
};
```

---

## 9. Templates de Mensagem

### Estrutura Padrão

```
[EMOJI] [TIPO]: [Título curto e direto]
[Contexto com números específicos]
[Recomendação de ação - quando aplicável]
```

### Boas Práticas

- Sempre incluir números específicos
- Usar linguagem direta e objetiva
- Incluir comparação (antes/depois, meta/atual)
- Sugerir ação quando possível
- Não usar jargões técnicos excessivos
- [PREENCHER - Outras práticas BMV]

---

*Última atualização: Janeiro/2026*
*Responsável: [PREENCHER - Nome do responsável]*
