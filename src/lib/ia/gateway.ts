import { Plano } from '@/lib/feature-flags'

// Cache em memória com TTL
interface CacheEntry {
  content: string
  timestamp: number
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hora em milissegundos

// Controle de uso por tenant
const usageCounter = new Map<string, { count: number; resetAt: number }>()

type TipoIA = 'analise_financeira' | 'tarefa' | 'insight' | 'default'

interface ChamarIAParams {
  prompt: string
  tenantId: string
  userId: string
  tipo: TipoIA
  plano?: Plano
}

interface ChamarIAResponse {
  content: string
  provider: 'cache' | 'mock' | 'openai' | 'anthropic'
  cached: boolean
  usage?: {
    current: number
    limit: number
    remaining: number
  }
}

/**
 * Gera uma chave única para o cache baseada no prompt e tipo
 */
function gerarCacheKey(tenantId: string, prompt: string, tipo: TipoIA): string {
  const normalizedPrompt = prompt.toLowerCase().trim().slice(0, 200)
  return `${tenantId}:${tipo}:${normalizedPrompt}`
}

/**
 * Verifica se uma entrada do cache ainda é válida
 */
function cacheValido(entry: CacheEntry): boolean {
  return Date.now() < entry.expiresAt
}

/**
 * Limpa entradas expiradas do cache
 */
function limparCacheExpirado(): void {
  const now = Date.now()
  const entries = Array.from(cache.entries())
  entries.forEach(([key, entry]) => {
    if (now >= entry.expiresAt) {
      cache.delete(key)
    }
  })
}

/**
 * Obtém o contador de uso do tenant (reset diário)
 */
function getUsageCounter(tenantId: string): { count: number; resetAt: number } {
  const now = Date.now()
  const existing = usageCounter.get(tenantId)

  // Reset à meia-noite
  const resetAt = new Date()
  resetAt.setHours(24, 0, 0, 0)
  const resetTimestamp = resetAt.getTime()

  if (!existing || now >= existing.resetAt) {
    const newCounter = { count: 0, resetAt: resetTimestamp }
    usageCounter.set(tenantId, newCounter)
    return newCounter
  }

  return existing
}

/**
 * Incrementa o contador de uso
 */
function incrementUsage(tenantId: string): void {
  const counter = getUsageCounter(tenantId)
  counter.count++
  usageCounter.set(tenantId, counter)
}

/**
 * Verifica se o tenant pode fazer mais chamadas de IA
 */
function verificarLimiteUso(tenantId: string, plano: Plano): { allowed: boolean; current: number; limit: number } {
  const counter = getUsageCounter(tenantId)

  // Limites de chamadas de IA por dia por plano
  const limitesIA: Record<Plano, number> = {
    trial: 10,
    basico: 50,
    pro: 200,
    enterprise: -1, // ilimitado
  }

  const limit = limitesIA[plano]

  if (limit === -1) {
    return { allowed: true, current: counter.count, limit: -1 }
  }

  return {
    allowed: counter.count < limit,
    current: counter.count,
    limit,
  }
}

/**
 * Gera resposta mock baseada no tipo
 */
function gerarRespostaMock(prompt: string, tipo: TipoIA): string {
  const promptLower = prompt.toLowerCase()

  switch (tipo) {
    case 'analise_financeira':
      if (promptLower.includes('inadimplência') || promptLower.includes('inadimplencia')) {
        return `## Análise de Inadimplência

**Situação Atual:**
Com base nos dados apresentados, identificamos alguns pontos de atenção:

1. **Concentração de Risco:** Os maiores valores em atraso estão concentrados em poucos clientes
2. **Tendência:** A inadimplência tem se mantido estável nos últimos meses

**Recomendações:**
- Implementar política de cobrança preventiva para títulos próximos do vencimento
- Considerar renegociação com os principais devedores
- Avaliar critérios de concessão de crédito para novos clientes

**Próximos Passos:**
1. Entrar em contato com os top 5 devedores
2. Revisar limites de crédito
3. Automatizar lembretes de vencimento`
      }

      if (promptLower.includes('fluxo') || promptLower.includes('caixa')) {
        return `## Análise de Fluxo de Caixa

**Situação Atual:**
O fluxo de caixa apresenta variações típicas do período analisado.

**Pontos de Atenção:**
- Verificar concentração de vencimentos em datas específicas
- Avaliar sazonalidade das receitas
- Considerar reserva de emergência

**Recomendações:**
1. Distribuir melhor os vencimentos de contas a pagar
2. Antecipar cobranças quando possível
3. Manter reserva mínima equivalente a 2 meses de despesas fixas`
      }

      return `## Análise Financeira

Com base nos dados fornecidos, seguem as principais observações:

**Pontos Positivos:**
- Estrutura financeira adequada para o porte da empresa
- Indicadores dentro de parâmetros aceitáveis

**Pontos de Atenção:**
- Monitorar de perto o fluxo de caixa
- Avaliar oportunidades de otimização de custos

**Recomendações:**
1. Manter controle rigoroso de contas a receber
2. Negociar melhores prazos com fornecedores
3. Revisar periodicamente os indicadores financeiros`

    case 'tarefa':
      return `## Sugestões para a Tarefa

**Análise:**
Esta tarefa requer atenção aos seguintes pontos:

**Etapas Sugeridas:**
1. Definir claramente o escopo e entregáveis
2. Identificar recursos necessários
3. Estabelecer marcos de acompanhamento
4. Validar com stakeholders

**Riscos Potenciais:**
- Dependências externas
- Prazo apertado
- Recursos limitados

**Dicas:**
- Divida em subtarefas menores
- Documente decisões importantes
- Comunique progressos regularmente`

    case 'insight':
      return `## Insights Identificados

**Observações:**
Com base na análise dos dados disponíveis:

1. **Padrão Identificado:** Existem oportunidades de melhoria nos processos atuais
2. **Tendência:** Os indicadores mostram evolução positiva
3. **Oportunidade:** Automatização de tarefas repetitivas pode trazer ganhos

**Ações Sugeridas:**
- Revisar processos críticos
- Implementar melhorias incrementais
- Monitorar resultados das mudanças`

    default:
      return `## Resposta

Analisei sua solicitação e seguem minhas considerações:

${prompt.length > 50 ? 'Com base no contexto fornecido, ' : ''}recomendo uma abordagem estruturada para resolver esta questão.

**Sugestões:**
1. Avaliar o cenário atual
2. Identificar prioridades
3. Implementar ações de forma gradual
4. Medir resultados e ajustar

Posso ajudar com mais detalhes em algum ponto específico?`
  }
}

/**
 * Gateway principal para chamadas de IA
 */
export async function chamarIA({
  prompt,
  tenantId,
  userId,
  tipo,
  plano = 'basico',
}: ChamarIAParams): Promise<ChamarIAResponse> {
  // Limpar cache expirado periodicamente
  if (Math.random() < 0.1) {
    limparCacheExpirado()
  }

  // Verificar limite de uso
  const { allowed, current, limit } = verificarLimiteUso(tenantId, plano)

  if (!allowed) {
    throw new Error(`Limite de uso de IA atingido. Seu plano permite ${limit} consultas por dia.`)
  }

  // Verificar cache
  const cacheKey = gerarCacheKey(tenantId, prompt, tipo)
  const cachedEntry = cache.get(cacheKey)

  if (cachedEntry && cacheValido(cachedEntry)) {
    return {
      content: cachedEntry.content,
      provider: 'cache',
      cached: true,
      usage: {
        current,
        limit,
        remaining: limit === -1 ? -1 : limit - current,
      },
    }
  }

  // TODO: Integrar com OpenAI/Anthropic
  // Por enquanto, usar mock
  const content = gerarRespostaMock(prompt, tipo)

  // Salvar no cache
  cache.set(cacheKey, {
    content,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL,
  })

  // Incrementar uso
  incrementUsage(tenantId)

  return {
    content,
    provider: 'mock',
    cached: false,
    usage: {
      current: current + 1,
      limit,
      remaining: limit === -1 ? -1 : limit - current - 1,
    },
  }
}

/**
 * Obtém estatísticas de uso de IA do tenant
 */
export function getIAUsageStats(tenantId: string, plano: Plano): {
  current: number
  limit: number
  remaining: number
  resetAt: Date
} {
  const counter = getUsageCounter(tenantId)

  const limitesIA: Record<Plano, number> = {
    trial: 10,
    basico: 50,
    pro: 200,
    enterprise: -1,
  }

  const limit = limitesIA[plano]

  return {
    current: counter.count,
    limit,
    remaining: limit === -1 ? -1 : Math.max(0, limit - counter.count),
    resetAt: new Date(counter.resetAt),
  }
}

/**
 * Limpa o cache manualmente (útil para testes)
 */
export function limparCache(): void {
  cache.clear()
}

/**
 * Obtém tamanho atual do cache
 */
export function getCacheSize(): number {
  return cache.size
}
