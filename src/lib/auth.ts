// Tipos de perfis de usuário
export type UserRole = 'ADMIN_BMV' | 'CONSULTOR_BMV' | 'GESTOR' | 'COLABORADOR' | 'CLIENTE'

// Tipo do usuário
export interface User {
    id: string
    nome: string
    email: string
    role: UserRole
    tenantId: string
    avatarUrl?: string
}

// Usuário mock para testes (GESTOR)
const mockUser: User = {
    id: '1',
    nome: 'João Silva',
    email: 'joao@empresa.com',
    role: 'GESTOR',
    tenantId: 'tenant-1',
}

// Retorna o usuário atual (mock por enquanto)
export function getCurrentUser(): User {
    return mockUser
}

// Verifica se pode ver todos os OKRs
export function canViewAllOKRs(role: UserRole): boolean {
    return ['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(role)
}

// Verifica se pode criar OKRs
export function canCreateOKR(role: UserRole): boolean {
    return ['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR'].includes(role)
}

// Verifica se pode criar tarefas
export function canCreateTask(role: UserRole): boolean {
    return ['ADMIN_BMV', 'CONSULTOR_BMV', 'GESTOR', 'COLABORADOR'].includes(role)
}

// Verifica se tem acesso ao módulo OKR
export function canAccessOKR(role: UserRole): boolean {
    return role !== 'CLIENTE'
}