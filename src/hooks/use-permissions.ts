'use client'

import { useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  PerfilUsuario,
  Modulo,
  PermissoesAcao,
  verificarPermissao,
  obterPermissoesModulo,
  MATRIZ_PERMISSOES,
} from '@/types/permissions'

interface UsePermissionsReturn {
  // Perfil do usuário atual
  perfil: PerfilUsuario | undefined

  // Funções de verificação de permissão
  canView: (modulo: Modulo) => boolean
  canCreate: (modulo: Modulo) => boolean
  canEdit: (modulo: Modulo) => boolean
  canDelete: (modulo: Modulo) => boolean

  // Função para obter todas as permissões de um módulo
  getPermissions: (modulo: Modulo) => PermissoesAcao

  // Verificação genérica
  hasPermission: (modulo: Modulo, acao: 'view' | 'create' | 'edit' | 'delete') => boolean

  // Verificações de perfil
  isAdmin: boolean
  isGestor: boolean
  isColaborador: boolean
  isCliente: boolean

  // Verificação se tem acesso a qualquer ação do módulo
  hasAnyAccess: (modulo: Modulo) => boolean

  // Verificação de acesso total ao módulo
  hasFullAccess: (modulo: Modulo) => boolean
}

/**
 * Hook para verificar permissões do usuário atual
 *
 * @example
 * ```tsx
 * const { canView, canEdit, canDelete, isAdmin } = usePermissions()
 *
 * if (canView('financeiro')) {
 *   // Mostrar menu financeiro
 * }
 *
 * if (canEdit('okr.tarefas')) {
 *   // Mostrar botão de editar
 * }
 *
 * if (isAdmin) {
 *   // Mostrar área administrativa
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const { user } = useAuth()

  // Extrai o perfil do usuário (role vem do user_metadata)
  const perfil = useMemo(() => {
    if (!user?.role) return undefined
    return user.role.toUpperCase() as PerfilUsuario
  }, [user?.role])

  // Funções de verificação de permissão
  const canView = useMemo(() => {
    return (modulo: Modulo): boolean => verificarPermissao(perfil, modulo, 'view')
  }, [perfil])

  const canCreate = useMemo(() => {
    return (modulo: Modulo): boolean => verificarPermissao(perfil, modulo, 'create')
  }, [perfil])

  const canEdit = useMemo(() => {
    return (modulo: Modulo): boolean => verificarPermissao(perfil, modulo, 'edit')
  }, [perfil])

  const canDelete = useMemo(() => {
    return (modulo: Modulo): boolean => verificarPermissao(perfil, modulo, 'delete')
  }, [perfil])

  // Função para obter todas as permissões de um módulo
  const getPermissions = useMemo(() => {
    return (modulo: Modulo): PermissoesAcao => obterPermissoesModulo(perfil, modulo)
  }, [perfil])

  // Verificação genérica
  const hasPermission = useMemo(() => {
    return (modulo: Modulo, acao: 'view' | 'create' | 'edit' | 'delete'): boolean =>
      verificarPermissao(perfil, modulo, acao)
  }, [perfil])

  // Verificações de perfil
  const isAdmin = perfil === 'ADMIN'
  const isGestor = perfil === 'GESTOR'
  const isColaborador = perfil === 'COLABORADOR'
  const isCliente = perfil === 'CLIENTE'

  // Verifica se tem acesso a qualquer ação do módulo
  const hasAnyAccess = useMemo(() => {
    return (modulo: Modulo): boolean => {
      const permissions = obterPermissoesModulo(perfil, modulo)
      return permissions.view || permissions.create || permissions.edit || permissions.delete
    }
  }, [perfil])

  // Verifica se tem acesso total ao módulo
  const hasFullAccess = useMemo(() => {
    return (modulo: Modulo): boolean => {
      const permissions = obterPermissoesModulo(perfil, modulo)
      return permissions.view && permissions.create && permissions.edit && permissions.delete
    }
  }, [perfil])

  return {
    perfil,
    canView,
    canCreate,
    canEdit,
    canDelete,
    getPermissions,
    hasPermission,
    isAdmin,
    isGestor,
    isColaborador,
    isCliente,
    hasAnyAccess,
    hasFullAccess,
  }
}

/**
 * Hook para verificar permissões de um módulo específico
 * Útil para componentes que trabalham com um único módulo
 *
 * @example
 * ```tsx
 * const permissions = useModulePermissions('financeiro.movimentacoes')
 *
 * return (
 *   <div>
 *     {permissions.canCreate && <Button>Nova Movimentação</Button>}
 *     {permissions.canEdit && <Button>Editar</Button>}
 *     {permissions.canDelete && <Button>Excluir</Button>}
 *   </div>
 * )
 * ```
 */
export function useModulePermissions(modulo: Modulo) {
  const { canView, canCreate, canEdit, canDelete, getPermissions, hasAnyAccess, hasFullAccess } =
    usePermissions()

  return useMemo(
    () => ({
      canView: canView(modulo),
      canCreate: canCreate(modulo),
      canEdit: canEdit(modulo),
      canDelete: canDelete(modulo),
      permissions: getPermissions(modulo),
      hasAnyAccess: hasAnyAccess(modulo),
      hasFullAccess: hasFullAccess(modulo),
    }),
    [modulo, canView, canCreate, canEdit, canDelete, getPermissions, hasAnyAccess, hasFullAccess]
  )
}

/**
 * Função utilitária para verificar permissão fora de componentes React
 * Útil para guards de rota, middlewares, etc.
 *
 * @example
 * ```ts
 * if (checkPermission('ADMIN', 'configuracoes.usuarios', 'delete')) {
 *   // Permitir ação
 * }
 * ```
 */
export function checkPermission(
  perfil: PerfilUsuario | undefined,
  modulo: Modulo,
  acao: 'view' | 'create' | 'edit' | 'delete'
): boolean {
  return verificarPermissao(perfil, modulo, acao)
}

/**
 * Retorna lista de módulos que o perfil tem acesso
 */
export function getAccessibleModules(perfil: PerfilUsuario | undefined): Modulo[] {
  if (!perfil) return []

  const modulos: Modulo[] = []
  const permissoes = MATRIZ_PERMISSOES[perfil]

  if (permissoes) {
    for (const [modulo, acoes] of Object.entries(permissoes)) {
      if (acoes && (acoes.view || acoes.create || acoes.edit || acoes.delete)) {
        modulos.push(modulo as Modulo)
      }
    }
  }

  return modulos
}

export default usePermissions
