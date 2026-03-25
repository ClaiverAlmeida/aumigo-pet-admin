import React from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Bell, BellRing } from 'lucide-react'
import { useNotifications, type Notification } from './notification-center'
import { useRouter } from '../hooks/useRouter'

interface NotificationBellProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onRemoveNotification?: (id: string) => void
  onClearAll?: () => void
  /** Mantido por compatibilidade; o sino sempre abre a Central de Notificações */
  showFullCenter?: boolean
  maxPreview?: number
}

export function NotificationBell({
  notifications: externalNotifications,
}: NotificationBellProps) {
  const { navigate, currentPath } = useRouter()
  const { unreadCount: hookUnreadCount } = useNotifications()

  const unreadCount = externalNotifications
    ? externalNotifications.filter(n => !n.read).length
    : hookUnreadCount

  const goToNotificationsCenter = () => {
    const target = currentPath.startsWith('/admin')
      ? '/admin/notifications'
      : '/pro/notifications'
    navigate(target)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button"
      className="relative p-2 hover:bg-aumigo-orange/10"
      onClick={goToNotificationsCenter}
      aria-label="Abrir central de notificações"
    >
      {unreadCount > 0 ? (
        <BellRing className="h-5 w-5 text-aumigo-orange" />
      ) : (
        <Bell className="h-5 w-5 text-aumigo-gray" />
      )}
      {unreadCount > 0 && (
        <Badge className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center bg-aumigo-orange text-white text-xs">
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      )}
    </Button>
  )
}

export function NotificationBadge({ count }: { count: number }) {
  return (
    <div className="relative">
      {count > 0 ? (
        <BellRing className="h-5 w-5 text-aumigo-orange" />
      ) : (
        <Bell className="h-5 w-5 text-aumigo-gray" />
      )}
      {count > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 min-w-[20px] p-0 flex items-center justify-center bg-aumigo-orange text-white text-xs">
          {count > 99 ? '99+' : count}
        </Badge>
      )}
    </div>
  )
}
