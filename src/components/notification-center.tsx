import React, { useState, useEffect } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  Bell, 
  Calendar, 
  MessageCircle, 
  CreditCard, 
  Star, 
  UserPlus,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  Clock,
  MapPin,
  Phone,
  Mail,
  DollarSign,
  Heart,
  Settings
} from 'lucide-react'
import { toast } from 'sonner@2.0.3'

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
}

interface NotificationCenterProps {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onRemoveNotification: (id: string) => void
  onClearAll: () => void
}

export function NotificationCenter({ 
  notifications, 
  onMarkAsRead, 
  onMarkAllAsRead, 
  onRemoveNotification,
  onClearAll 
}: NotificationCenterProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')

  const unreadCount = notifications.filter(n => !n.read).length
  const importantCount = notifications.filter(n => n.priority === 'high' || n.priority === 'urgent').length

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read
      case 'important':
        return notification.priority === 'high' || notification.priority === 'urgent'
      default:
        return true
    }
  }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

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
              onClick={onMarkAllAsRead}
              className="text-aumigo-blue hover:text-aumigo-blue/80"
            >
              Marcar todas
            </Button>
          )}
        </div>

        {/* Filtros */}
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
            Não lidas ({unreadCount})
          </Button>
          <Button
            variant={filter === 'important' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('important')}
            className={filter === 'important' ? 'bg-aumigo-orange text-white' : ''}
          >
            Importantes ({importantCount})
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                {filter === 'all' && 'Nenhuma notificação'}
                {filter === 'unread' && 'Nenhuma notificação não lida'}
                {filter === 'important' && 'Nenhuma notificação importante'}
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
                    className={`p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-aumigo-orange/5 border-aumigo-orange/20' : 'bg-card'
                    }`}
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
                              onClick={() => onRemoveNotification(notification.id)}
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
                                onClick={notification.actions.primary.action}
                                className="h-7 text-xs bg-aumigo-orange hover:bg-aumigo-orange/90"
                              >
                                {notification.actions.primary.label}
                              </Button>
                            )}
                            {notification.actions?.secondary && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={notification.actions.secondary.action}
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
                              onClick={() => onMarkAsRead(notification.id)}
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
      {notifications.length > 0 && (
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

// Hook para gerenciar notificações
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Dados mock para demonstração
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'booking',
        priority: 'high',
        title: 'Novo Agendamento',
        description: 'Luna está agendada para banho e tosa amanhã às 14h.',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 min atrás
        read: false,
        clientName: 'Ana Costa',
        clientAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
        bookingId: 'book_123',
        actions: {
          primary: {
            label: 'Confirmar',
            action: () => toast.success('Agendamento confirmado!')
          },
          secondary: {
            label: 'Ver detalhes',
            action: () => console.log('Ver agendamento')
          }
        }
      },
      {
        id: '2',
        type: 'payment',
        priority: 'medium',
        title: 'Pagamento Recebido',
        description: 'Pagamento de R$ 85,00 foi processado com sucesso.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
        read: false,
        amount: 85.00
      },
      {
        id: '3',
        type: 'review',
        priority: 'low',
        title: 'Nova Avaliação',
        description: 'João Silva deixou uma avaliação de 5 estrelas para o banho do Max.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4h atrás
        read: true,
        clientName: 'João Silva',
        clientAvatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=40&h=40&fit=crop&crop=face',
        rating: 5
      },
      {
        id: '4',
        type: 'message',
        priority: 'medium',
        title: 'Nova Mensagem',
        description: 'Carlos Santos enviou uma mensagem sobre o atendimento do Buddy.',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6h atrás
        read: true,
        clientName: 'Carlos Santos',
        messagePreview: 'Olá, gostaria de reagendar o horário...'
      },
      {
        id: '5',
        type: 'system',
        priority: 'urgent',
        title: 'Documento Pendente',
        description: 'Seu comprovante de residência precisa ser atualizado.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
        read: false,
        actionRequired: true,
        actions: {
          primary: {
            label: 'Atualizar',
            action: () => console.log('Ir para KYC')
          }
        }
      }
    ]

    setNotifications(mockNotifications)
  }, [])

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date()
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    addNotification,
    unreadCount
  }
}