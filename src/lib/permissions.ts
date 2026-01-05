// Tipos de perfil de usuário
export type UserRole = 'ADMIN_BMV' | 'CONSULTOR_BMV' | 'GESTOR' | 'COLABORADOR' | 'CLIENTE'

// Verifica se o usuário é Administrador BM&V
export function isAdmin(role: string | null | undefined): boolean {
  return role === 'ADMIN_BMV'
}

// Verifica se o usuário é Consultor BM&V
export function isConsultor(role: string | null | undefined): boolean {
  return role === 'CONSULTOR_BMV'
}

// Verifica se o usuário é Gestor
export function isGestor(role: string | null | undefined): boolean {
  return role === 'GESTOR'
}

// Verifica se o usuário é Colaborador
export function isColaborador(role: string | null | undefined): boolean {
  return role === 'COLABORADOR'
}

// Verifica se o usuário pode gerenciar usuários (ADMIN_BMV ou GESTOR)
export function canManageUsers(role: string | null | undefined): boolean {
  return role === 'ADMIN_BMV' || role === 'GESTOR'
}

// Verifica se o usuário pode gerenciar empresas (apenas ADMIN_BMV)
export function canManageTenants(role: string | null | undefined): boolean {
  return role === 'ADMIN_BMV'
}

// Verifica se o usuário pode acessar múltiplos tenants (ADMIN_BMV ou CONSULTOR_BMV)
export function canAccessMultipleTenants(role: string | null | undefined): boolean {
  return role === 'ADMIN_BMV' || role === 'CONSULTOR_BMV'
}

// Verifica se o usuário tem acesso de escrita
export function canWrite(role: string | null | undefined): boolean {
  return role !== 'CLIENTE'
}

// Verifica se o usuário pode aprovar itens
export function canApprove(role: string | null | undefined): boolean {
  return role === 'ADMIN_BMV' || role === 'CONSULTOR_BMV' || role === 'GESTOR'
}

// Labels para exibição dos perfis
export const roleLabels: Record<UserRole, string> = {
  ADMIN_BMV: 'Administrador BM&V',
  CONSULTOR_BMV: 'Consultor BM&V',
  GESTOR: 'Gestor',
  COLABORADOR: 'Colaborador',
  CLIENTE: 'Cliente',
}

// Cores para badges dos perfis
export const roleColors: Record<UserRole, { bg: string; text: string }> = {
  ADMIN_BMV: { bg: 'bg-purple-100', text: 'text-purple-700' },
  CONSULTOR_BMV: { bg: 'bg-blue-100', text: 'text-blue-700' },
  GESTOR: { bg: 'bg-green-100', text: 'text-green-700' },
  COLABORADOR: { bg: 'bg-slate-100', text: 'text-slate-700' },
  CLIENTE: { bg: 'bg-amber-100', text: 'text-amber-700' },
}

// Perfis que podem ser atribuídos por cada tipo de usuário
export function getAssignableRoles(currentUserRole: string | null | undefined): UserRole[] {
  if (currentUserRole === 'ADMIN_BMV') {
    return ['CONSULTOR_BMV', 'GESTOR', 'COLABORADOR', 'CLIENTE']
  }
  if (currentUserRole === 'GESTOR') {
    return ['COLABORADOR', 'CLIENTE']
  }
  return []
}
