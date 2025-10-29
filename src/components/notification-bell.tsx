import React, { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { ScrollArea } from './ui/scroll-area'
import { Bell, BellRing } from 'lucide-react'
import { NotificationCenter, useNotifications, type Notification } from './notification-center'
import { NotificationItem } from './notification-item'

interface NotificationBellProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
  onRemoveNotification?: (id: string) => void
  onClearAll?: () => void
  showFullCenter?: boolean
  maxPreview?: number
}

export function NotificationBell({
  notifications: externalNotifications,
  onMarkAsRead: externalMarkAsRead,
  onMarkAllAsRead: externalMarkAllAsRead,
  onRemoveNotification: externalRemoveNotification,
  onClearAll: externalClearAll,
  showFullCenter = false,
  maxPreview = 3
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Use external notifications or fallback to hook
  const {
    notifications: hookNotifications,
    markAsRead: hookMarkAsRead,
    markAllAsRead: hookMarkAllAsRead,
    removeNotification: hookRemoveNotification,
    clearAll: hookClearAll,
    unreadCount: hookUnreadCount
  } = useNotifications()

  const notifications = externalNotifications || hookNotifications
  const markAsRead = externalMarkAsRead || hookMarkAsRead
  const markAllAsRead = externalMarkAllAsRead || hookMarkAllAsRead
  const removeNotification = externalRemoveNotification || hookRemoveNotification
  const clearAll = externalClearAll || hookClearAll
  const unreadCount = externalNotifications 
    ? externalNotifications.filter(n => !n.read).length 
    : hookUnreadCount

  // Get recent notifications for preview
  const recentNotifications = notifications
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxPreview)

  const handleNotificationAction = (notificationId: string) => {
    // Navigate to relevant page based on notification
    // This would be implemented based on your routing system
    console.log('Navigate to notification details:', notificationId)
  }

  if (showFullCenter) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative p-2 hover:bg-aumigo-orange/10"
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
        </PopoverTrigger>
        <PopoverContent 
          className="w-[95vw] max-w-[400px] p-0" 
          align="end" 
          side="bottom"
          sideOffset={8}
        >
          <NotificationCenter
            notifications={notifications}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onRemoveNotification={removeNotification}
            onClearAll={clearAll}
          />
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="relative p-2 hover:bg-aumigo-orange/10"
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
      </PopoverTrigger>
      <PopoverContent 
        className="w-[95vw] max-w-[380px] p-0" 
        align="end" 
        side="bottom"
        sideOffset={8}
      >
        <div className="p-3 sm:p-4">
          {/* Header */}
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-aumigo-orange" />
              <h3 className="font-medium text-sm text-foreground">Notificações Recentes</h3>
              {unreadCount > 0 && (
                <Badge className="bg-aumigo-orange text-white text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  markAllAsRead()
                  setIsOpen(false)
                }}
                className="text-xs text-aumigo-blue hover:text-aumigo-blue/80 self-start xs:self-auto"
              >
                <span className="hidden sm:inline">Marcar todas como lidas</span>
                <span className="sm:hidden">Marcar lidas</span>
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {recentNotifications.length === 0 ? (
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 opacity-50" />
              <p className="text-xs sm:text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <ScrollArea className="max-h-[250px] sm:max-h-[300px]">
              <div className="space-y-1 sm:space-y-2">
                {recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 rounded-lg border transition-colors hover:bg-muted/50 cursor-pointer ${
                      !notification.read ? 'bg-aumigo-orange/5 border-aumigo-orange/20' : 'bg-card'
                    }`}
                    onClick={() => {
                      if (!notification.read) {
                        markAsRead(notification.id)
                      }
                      handleNotificationAction(notification.id)
                      setIsOpen(false)
                    }}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-xs text-foreground line-clamp-1 mb-1">
                          {notification.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-aumigo-orange rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Footer */}
          {notifications.length > maxPreview && (
            <div className="border-t mt-3 sm:mt-4 pt-2 sm:pt-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-aumigo-blue hover:text-aumigo-blue/80 text-xs sm:text-sm"
                onClick={() => {
                  // Navigate to full notifications page
                  console.log('Navigate to full notifications')
                  setIsOpen(false)
                }}
              >
                <span className="hidden sm:inline">Ver todas as notificações ({notifications.length})</span>
                <span className="sm:hidden">Ver todas ({notifications.length})</span>
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Helper function to format time
function formatTimeAgo(timestamp: Date) {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Agora'
  if (diffInMinutes < 60) return `${diffInMinutes}m`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays}d`
  
  return timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

// Simplified version for just the bell icon with count
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