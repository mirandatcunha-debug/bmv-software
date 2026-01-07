// Serviço base de API com tratamento de erros e interceptors

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestConfig extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

// Função para obter o tenantId do contexto (localStorage ou cookie)
function getTenantId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('tenantId')
}

// Função para obter o token de autorização
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('authToken')
}

// Base URL da API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

// Função para construir URL com query params
function buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })
  }

  return url.toString()
}

// Interceptor para adicionar headers padrão
function getDefaultHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  const authToken = getAuthToken()
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }

  const tenantId = getTenantId()
  if (tenantId) {
    headers['X-Tenant-Id'] = tenantId
  }

  return headers
}

// Função base para fazer fetch com tratamento de erro
async function fetchWithErrorHandling<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<T> {
  const { params, ...requestConfig } = config

  const url = buildUrl(endpoint, params)

  const response = await fetch(url, {
    ...requestConfig,
    headers: {
      ...getDefaultHeaders(),
      ...requestConfig.headers,
    },
  })

  if (!response.ok) {
    let errorData: unknown
    try {
      errorData = await response.json()
    } catch {
      errorData = await response.text()
    }

    const errorMessage =
      typeof errorData === 'object' && errorData !== null && 'message' in errorData
        ? String((errorData as { message: string }).message)
        : `Erro na requisição: ${response.status}`

    throw new ApiError(response.status, errorMessage, errorData)
  }

  // Retorna vazio se não houver conteúdo
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// Métodos HTTP
export const api = {
  get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, { method: 'GET', params })
  },

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    })
  },

  delete<T>(endpoint: string): Promise<T> {
    return fetchWithErrorHandling<T>(endpoint, { method: 'DELETE' })
  },
}

export default api
