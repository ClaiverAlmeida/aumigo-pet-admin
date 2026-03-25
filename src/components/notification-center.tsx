import React, { useState, useEffect, useCallback, useRef } from 'react'
import { notificationsService } from '../services/notifications.service'
import {
  subscribeNewNotifications,
  subscribeNotificationMarkedRead,
  subscribeUnreadCountUpdated,
  type RealtimeNotificationPayload,
  type NotificationMarkedReadPayload,
} from '../services/socket.service'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { 
  Bell, 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  Star, 
  UserPlus,
  AlertTriangle,
  X,
  DollarSign,
  Settings
} from 'lucide-react'
import { cn } from './ui/utils'

export interface Notification {
  id: string
  type: 'booking' | 'message' | 'payment' | 'review' | 'system' | 'client' | 'emergency'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  timestamp: Date
  read: boolean
  actionRequired?: boolean
  clientName?: string
  clientAvatar?: string
  amount?: number
  bookingId?: string
  messagePreview?: string
  rating?: number
  actions?: {
    primary?: {
      label: string
      action: () => void
    }
    secondary?: {
      label: string
      action: () => void
    }
  }
  entityType?: string
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRemoveNotification: (id: string) => void
  onClearAll: () => void
  showInlineFilters?: boolean
  totalUnreadCount?: number
  emptyMessage?: string
  /** Com showInlineFilters false, use a quantidade total na conta para exibir o rodapé "Limpar todas" */
  totalCountForFooter?: number
  /** Clique no cartão (exceto remover / marcar lida / ações custom) — ex.: marcar lida e navegar */
  onNotificationOpen?: (notification: Notification) => void
}

export function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onRemoveNotification,
  onClearAll,
  showInlineFilters = true,
  totalUnreadCount,
  emptyMessage: emptyMessageProp,
  totalCountForFooter,
  onNotificationOpen,
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')

  const unreadInList = notifications.filter(n => !n.read).length
  const readCount = notifications.filter(n => n.read).length
  const headerUnreadCount = showInlineFilters
    ? unreadInList
    : (totalUnreadCount !== undefined ? totalUnreadCount : unreadInList)

  const filteredNotifications = (
    showInlineFilters
      ? notifications.filter(notification => {
          switch (filter) {
            case 'unread':
              return !notification.read
            case 'read':
              return notification.read
            default:
              return true
          }
        })
      : notifications
  ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getNotificationIcon = (type: Notification['type']) => {
    const iconMap = {
      booking: Calendar,
      message: MessageCircle,
      payment: CreditCard,
      review: Star,
      system: Settings,
      client: UserPlus,
      emergency: AlertTriangle
    }
    return iconMap[type] || Bell
  }

  const getNotificationColor = (type: Notification['type'], priority: Notification['priority']) => {
    if (priority === 'urgent' || priority === 'high') {
      return 'text-red-500'
    }
    
    const colorMap = {
      booking: 'text-aumigo-blue',
      message: 'text-aumigo-teal',
      payment: 'text-aumigo-mint',
      review: 'text-yellow-500',
      system: 'text-aumigo-gray',
      client: 'text-aumigo-orange',
      emergency: 'text-red-500'
    }
    return colorMap[type] || 'text-aumigo-gray'
  }

  const formatTimeAgo = (timestamp: Date) => {
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

  return (
    <Card className="w-full max-w-md">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-aumigo-orange" />
            <h2 className="font-semibold text-foreground">Notificações</h2>
            {headerUnreadCount > 0 && (
              <Badge className="bg-aumigo-orange text-white text-xs">
                {headerUnreadCount}
              </Badge>
            )}
          </div>
          {headerUnreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="text-aumigo-blue hover:text-aumigo-blue/80"
            >
              Marcar todas
            </Button>
          )}
        </div>

        {showInlineFilters && (
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-aumigo-orange text-white' : ''}
            >
              Todas ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className={filter === 'unread' ? 'bg-aumigo-orange text-white' : ''}
            >
              Não lidas ({unreadInList})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
              className={filter === 'read' ? 'bg-aumigo-orange text-white' : ''}
            >
              Lidas ({readCount})
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {emptyMessageProp ??
                  (showInlineFilters
                    ? (
                      <>
                        {filter === 'all' && 'Nenhuma notificação'}
                        {filter === 'unread' && 'Nenhuma notificação não lida'}
                        {filter === 'read' && 'Nenhuma notificação lida'}
                      </>
                    )
                    : 'Nenhuma notificação neste filtro')}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type)
                const iconColor = getNotificationColor(notification.type, notification.priority)
                
                return (
                  <div
                    key={notification.id}
                    role={onNotificationOpen ? 'button' : undefined}
                    tabIndex={onNotificationOpen ? 0 : undefined}
                    onClick={
                      onNotificationOpen
                        ? () => onNotificationOpen(notification)
                        : undefined
                    }
                    onKeyDown={
                      onNotificationOpen
                        ? (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              onNotificationOpen(notification)
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      !notification.read ? 'bg-aumigo-orange/5 border-aumigo-orange/20' : 'bg-card',
                      onNotificationOpen && 'cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aumigo-orange/40',
                      !onNotificationOpen && 'hover:bg-muted/50',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-full bg-background ${iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium text-sm text-foreground line-clamp-1">
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveNotification(notification.id)
                              }}
                              className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {notification.description}
                        </p>

                        {/* Informações adicionais baseadas no tipo */}
                        {notification.clientName && (
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={notification.clientAvatar} />
                              <AvatarFallback className="text-xs">
                                {notification.clientName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-foreground font-medium">
                              {notification.clientName}
                            </span>
                          </div>
                        )}

                        {notification.amount && (
                          <div className="flex items-center gap-1 mb-2">
                            <DollarSign className="h-3 w-3 text-aumigo-mint" />
                            <span className="text-xs font-medium text-aumigo-mint">
                              R$ {notification.amount.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {notification.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-foreground">
                              {notification.rating}/5
                            </span>
                          </div>
                        )}

                        {/* Ações da notificação */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {notification.actions?.primary && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  notification.actions?.primary?.action()
                                }}
                                className="h-7 text-xs bg-aumigo-orange hover:bg-aumigo-orange/90"
                              >
                                {notification.actions.primary.label}
                              </Button>
                            )}
                            {notification.actions?.secondary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  notification.actions?.secondary?.action()
                                }}
                                className="h-7 text-xs"
                              >
                                {notification.actions.secondary.label}
                              </Button>
                            )}
                          </div>
                          
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                onMarkAsRead(notification.id)
                              }}
                              className="h-7 text-xs text-aumigo-blue hover:text-aumigo-blue/80"
                            >
                              Marcar lida
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer com ações gerais */}
      {(showInlineFilters
        ? notifications.length > 0
        : (totalCountForFooter !== undefined ? totalCountForFooter > 0 : notifications.length > 0)) && (
        <div className="p-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={onClearAll}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Limpar Todas
          </Button>
        </div>
      )}
    </Card>
  )
}

// Mapeia notificação da API para o formato do componente
function mapApiToNotification(api: { id: string; title: string; message: string; entityType?: string; entityId?: string; isRead: boolean; createdAt: string }): Notification {
  const typeMap: Record<string, Notification['type']> = {
    booking: 'booking',
    chat: 'message',
    reminder: 'system',
    review: 'review',
    vaccine: 'system',
    user: 'client',
    system: 'system',
    sharedTutor: 'client',
  }
  return {
    id: api.id,
    type: typeMap[api.entityType || ''] || 'system',
    priority: 'medium',
    title: api.title,
    description: api.message,
    timestamp: new Date(api.createdAt),
    read: api.isRead,
    bookingId: api.entityId,
    entityType: api.entityType,
  }
}

// Hook para gerenciar notificações (conectado à API)
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [historyNotifications, setHistoryNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const lastRealtimeReloadRef = useRef<number>(0)

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    // Busca notificações ativas (exclui as que foram removidas/limpas)
    const result = await notificationsService.getAll({ limit: 500 })
    if (result.success && result.data) {
      setNotifications(result.data.notifications.map(mapApiToNotification))
    }
    setLoading(false)
  }, [])

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true)
    // Busca histórico completo incluindo removidas/limpas para exportação
    const result = await notificationsService.getAll({ limit: 2000, includeDeleted: true })
    if (result.success && result.data) {
      const mapped = result.data.notifications.map(mapApiToNotification)
      setHistoryNotifications(mapped)
      setHistoryLoading(false)
      return mapped
    }
    setHistoryLoading(false)
    return []
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // ============================================================================
  // 🔔 Realtime: novas notificações + contador + mudanças de "lida"
  // ============================================================================
  useEffect(() => {
    const reloadThrottled = () => {
      const now = Date.now()
      if (now - lastRealtimeReloadRef.current < 2000) return
      lastRealtimeReloadRef.current = now
      void loadNotifications()
    }

    const unsubNew = subscribeNewNotifications((payload: RealtimeNotificationPayload) => {
      const mapped = mapApiToNotification(payload as any)

      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === mapped.id)
        if (exists) return prev.map((n) => (n.id === mapped.id ? mapped : n))
        return [mapped, ...prev]
      })

      setHistoryNotifications((prev) => {
        const exists = prev.some((n) => n.id === mapped.id)
        if (exists) return prev.map((n) => (n.id === mapped.id ? mapped : n))
        return [mapped, ...prev]
      })
    })

    const unsubUnread = subscribeUnreadCountUpdated(() => {
      reloadThrottled()
    })

    const unsubMarked = subscribeNotificationMarkedRead((payload: NotificationMarkedReadPayload) => {
      setNotifications((prev) => prev.map((n) => (n.id === payload.notificationId ? { ...n, read: true } : n)))
      setHistoryNotifications((prev) =>
        prev.map((n) => (n.id === payload.notificationId ? { ...n, read: true } : n)),
      )
    })

    return () => {
      unsubNew()
      unsubUnread()
      unsubMarked()
    }
  }, [loadNotifications])

  const markAsRead = useCallback(async (id: string) => {
    const result = await notificationsService.markAsRead(id)
    if (result.success) {
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      )
      setHistoryNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      )
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    const result = await notificationsService.markAllAsRead()
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }
  }, [])

  const removeNotification = useCallback(async (id: string) => {
    const result = await notificationsService.remove(id)
    if (result.success) {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }
  }, [])

  const clearAll = useCallback(async () => {
    const result = await notificationsService.clearAll()
    if (result.success) {
      setNotifications([])
    }
  }, [])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    historyNotifications,
    loading,
    historyLoading,
    loadNotifications,
    loadHistory,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    addNotification,
    unreadCount,
  }
}