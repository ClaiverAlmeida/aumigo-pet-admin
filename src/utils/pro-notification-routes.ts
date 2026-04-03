/**
 * Rota Admin (`/admin/...`) para o mesmo entityType — usar quando a Central está no painel administrativo.
 */
export function obterRotaAdminPorTipoNotificacao(entityType?: string): string {
  if (!entityType) {
    return '/admin/dashboard'
  }
  switch (entityType) {
    case 'booking':
      return '/admin/payments'
    case 'review':
      return '/admin/dashboard'
    case 'payout':
      return '/admin/payouts'
    case 'kyc':
      return '/admin/kyc'
    case 'reminder':
    case 'vaccine':
      return '/admin/dashboard'
    case 'sharedTutor':
      return '/admin/users'
    case 'chat':
      return '/admin/dashboard'
    case 'user':
    case 'system':
    case 'pet':
    default:
      return '/admin/dashboard'
  }
}

/**
 * Rota Pro (`/pro/...`) associada ao entityType da notificação (alinhado ao backend ENTITY_TYPES).
 */
export function obterRotaProPorTipoNotificacao(entityType?: string): string {
  if (!entityType) {
    return '/pro/overview'
  }
  switch (entityType) {
    case 'booking':
      return '/pro/bookings'
    case 'review':
      return '/pro/reviews'
    case 'payout':
      return '/pro/finance'
    case 'kyc':
      return '/pro/kyc'
    case 'reminder':
    case 'vaccine':
      return '/pro/overview'
    case 'sharedTutor':
      return '/pro/settings'
    case 'user':
    case 'system':
    case 'pet':
    default:
      return '/pro/overview'
  }
}
