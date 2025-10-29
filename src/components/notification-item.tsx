import React from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
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
  DollarSign
} from 'lucide-react'

interface NotificationItemProps {
  id: string
  type: 'booking' | 'message' | 'payment' | 'review' | 'system' | 'client' | 'emergency'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  description: string
  timestamp: Date
  read?: boolean
  compact?: boolean
  showActions?: boolean
  clientName?: string
  clientAvatar?: string
  amount?: number
  rating?: number
  onMarkAsRead?: () => void
  onRemove?: () => void
  onAction?: () => void
}

export function NotificationItem({
  id,
  type,
  priority,
  title,
  description,
  timestamp,
  read = true,
  compact = false,
  showActions = true,
  clientName,
  clientAvatar,
  amount,
  rating,
  onMarkAsRead,
  onRemove,
  onAction
}: NotificationItemProps) {

  const getNotificationIcon = () => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-4 w-4" />
      case 'message':
        return <MessageCircle className="h-4 w-4" />
      case 'payment':
        return <CreditCard className="h-4 w-4" />
      case 'review':
        return <Star className="h-4 w-4" />
      case 'client':
        return <UserPlus className="h-4 w-4" />
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getNotificationColor = () => {
    if (priority === 'urgent') return 'text-red-500'
    if (priority === 'high') return 'text-aumigo-orange'
    
    switch (type) {
      case 'booking':
        return 'text-aumigo-blue'
      case 'message':
        return 'text-aumigo-teal'
      case 'payment':
        return 'text-aumigo-mint'
      case 'review':
        return 'text-yellow-500'
      case 'client':
        return 'text-aumigo-blue'
      case 'emergency':
        return 'text-red-500'
      default:
        return 'text-aumigo-gray'
    }
  }

  const getBackgroundColor = () => {
    if (!read) {
      if (priority === 'urgent') return 'bg-red-50 border-red-200'
      if (priority === 'high') return 'bg-aumigo-orange/10 border-aumigo-orange/30'
      return 'bg-aumigo-blue/5 border-aumigo-blue/30'
    }
    return 'bg-background hover:bg-muted/50'
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${diffInMinutes}min`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    return `${Math.floor(diffInMinutes / 1440)}d`
  }

  if (compact) {
    return (
      <div className={`flex items-start gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-colors ${getBackgroundColor()}`}>
        <div className={`flex-shrink-0 ${getNotificationColor()} mt-0.5`}>
          {getNotificationIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-1">
            <p className={`text-xs sm:text-sm font-medium truncate ${!read ? 'text-foreground' : 'text-muted-foreground'}`}>
              {title}
            </p>
            <span className="text-xs text-muted-foreground flex-shrink-0 self-start xs:self-auto">
              {formatTimeAgo(timestamp)}
            </span>
          </div>
          <p className={`text-xs truncate mt-0.5 ${!read ? 'text-foreground' : 'text-muted-foreground'}`}>
            {description}
          </p>
          {/* Client name for mobile */}
          {clientName && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {clientName}
            </p>
          )}
          {/* Amount for mobile */}
          {amount && (
            <div className="flex items-center gap-1 mt-1">
              <DollarSign className="h-3 w-3 text-aumigo-mint" />
              <span className="text-xs font-medium text-aumigo-mint">
                R$ {amount.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-start gap-1 flex-shrink-0">
          {!read && (
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-aumigo-orange rounded-full mt-1"></div>
          )}
          {showActions && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
              onClick={onRemove}
            >
              <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={`transition-all hover:shadow-sm ${getBackgroundColor()}`}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex gap-2 sm:gap-3">
          {/* Icon */}
          <div className={`flex-shrink-0 ${getNotificationColor()}`}>
            {getNotificationIcon()}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2 mb-1">
              <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className={`font-medium text-xs sm:text-sm ${!read ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {title}
                </span>
                {priority === 'urgent' && (
                  <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Urgente</Badge>
                )}
                {priority === 'high' && (
                  <Badge className="bg-aumigo-orange/10 text-aumigo-orange border-aumigo-orange/30 text-xs">Alta</Badge>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 self-start">
                <span className="text-xs text-muted-foreground">
                  {formatTimeAgo(timestamp)}
                </span>
                {showActions && onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                    onClick={onRemove}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            <p className={`text-xs sm:text-sm mb-2 ${!read ? 'text-foreground' : 'text-muted-foreground'} line-clamp-2`}>
              {description}
            </p>

            {/* Client Info */}
            {clientName && (
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6">
                  <AvatarImage src={clientAvatar} />
                  <AvatarFallback className="text-xs bg-aumigo-blue/20 text-aumigo-teal">
                    {clientName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs sm:text-sm text-muted-foreground truncate">{clientName}</span>
              </div>
            )}

            {/* Amount */}
            {amount && (
              <div className="flex items-center gap-1 mb-2">
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-aumigo-mint" />
                <span className="text-xs sm:text-sm font-medium text-aumigo-mint">
                  R$ {amount.toFixed(2)}
                </span>
              </div>
            )}

            {/* Rating */}
            {rating && (
              <div className="flex items-center gap-1 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 sm:h-4 sm:w-4 ${
                        i < rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">({rating}/5)</span>
              </div>
            )}

            {/* Actions */}
            {showActions && (onMarkAsRead || onAction) && (
              <div className="flex flex-col xs:flex-row gap-2 mt-3">
                {onAction && (
                  <Button
                    size="sm"
                    className="bg-aumigo-orange hover:bg-aumigo-orange/90 text-xs sm:text-sm flex-1 xs:flex-none"
                    onClick={onAction}
                  >
                    Ver Detalhes
                  </Button>
                )}
                {!read && onMarkAsRead && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs sm:text-sm flex-1 xs:flex-none"
                    onClick={onMarkAsRead}
                  >
                    Marcar como lida
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Unread Indicator */}
          {!read && (
            <div className="w-2 h-2 bg-aumigo-orange rounded-full flex-shrink-0 mt-1"></div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}