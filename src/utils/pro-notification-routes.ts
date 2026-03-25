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
