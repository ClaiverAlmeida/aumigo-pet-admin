import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { NotificationCenter, useNotifications, type Notification } from './notification-center'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Bell, 
  Settings, 
  Filter,
  Archive,
  Trash2,
  Download,
  Calendar,
  Pill,
  Star,
  Syringe,
  MessageSquare,
} from 'lucide-react'
import { toast } from 'sonner'
import { notificationsService } from '../services/notifications.service'
import { useRouter } from '../hooks/useRouter'
import { obterRotaProPorTipoNotificacao } from '../utils/pro-notification-routes'

type EntityFilterId = '' | 'booking' | 'reminder' | 'review' | 'vaccine' | 'chat'

const ENTITY_FILTERS: { id: EntityFilterId; label: string; icon: typeof Bell }[] = [
  { id: '', label: 'Todas', icon: Bell },
  { id: 'booking', label: 'Agendamentos', icon: Calendar },
  { id: 'reminder', label: 'Lembretes', icon: Pill },
  { id: 'review', label: 'Avaliações', icon: Star },
  { id: 'vaccine', label: 'Vacinas', icon: Syringe },
  { id: 'chat', label: 'Mensagens', icon: MessageSquare },
]

const KNOWN_ENTITY_TYPES: EntityFilterId[] = ['booking', 'reminder', 'review', 'vaccine', 'chat']

function isEntityFilterId(t: string): t is EntityFilterId {
  return (KNOWN_ENTITY_TYPES as string[]).includes(t)
}

export function ProNotifications() {
  const { navigate } = useRouter()
  const {
    notifications,
    historyNotifications,
    loading,
    historyLoading,
    loadHistory,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount
  } = useNotifications()

  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [entityType, setEntityType] = useState<EntityFilterId>('')
  const [initialEntityTypes, setInitialEntityTypes] = useState<EntityFilterId[]>([])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  useEffect(() => {
    const semFiltro = readFilter === 'all' && !entityType
    if (!semFiltro) return
    const tipos = Array.from(
      new Set(
        notifications
          .map((n) => n.entityType)
          .filter((t): t is string => Boolean(t))
          .filter(isEntityFilterId)
      )
    )
    setInitialEntityTypes(tipos)
  }, [notifications, entityType, readFilter])

  const visibleEntityFilters = useMemo(() => {
    const tiposNaLista = new Set(
      notifications.map((n) => n.entityType).filter((t): t is string => Boolean(t))
    )
    const tiposBase = new Set(initialEntityTypes)
    const tiposPresentes = tiposBase.size > 0 ? tiposBase : tiposNaLista
    return ENTITY_FILTERS.filter((f) => {
      if (f.id === '') return true
      if (entityType === f.id) return true
      return tiposPresentes.has(f.id)
    })
  }, [notifications, entityType, initialEntityTypes])

  const filteredForCenter = useMemo(() => {
    return notifications.filter((n) => {
      if (readFilter === 'unread' && n.read) return false
      if (readFilter === 'read' && !n.read) return false
      if (entityType && n.entityType !== entityType) return false
      return true
    })
  }, [notifications, readFilter, entityType])

  const listEmptyMessage = useMemo(() => {
    if (notifications.length === 0) return 'Nenhuma notificação'
    if (filteredForCenter.length === 0) return 'Nenhum resultado para os filtros selecionados'
    return undefined
  }, [notifications.length, filteredForCenter.length])

  const hasActiveFilters = readFilter !== 'all' || entityType !== ''

  const handleReadFilterChange = (next: 'unread' | 'read') => {
    setReadFilter((prev) => (prev === next ? 'all' : next))
  }

  const clearFilters = () => {
    setReadFilter('all')
    setEntityType('')
  }

  const PRO_CHAT_LOCAL_STORAGE_KEY = 'proChat:selectedTicketId'

  const handleNotificationOpen = useCallback(
    (n: Notification) => {
      if (!n.read) {
        void markAsRead(n.id)
      }

      // Notificação de mensagem (chat)
      if (n.entityType === 'chat' && n.bookingId) {
        try {
          localStorage.setItem(PRO_CHAT_LOCAL_STORAGE_KEY, n.bookingId)
        } catch {
          // ignore
        }
        navigate('/pro/chat')
        return
      }

      navigate(obterRotaProPorTipoNotificacao(n.entityType))
    },
    [markAsRead, navigate],
  )

  const handleExportNotifications = async () => {
    toast.loading('Carregando histórico completo...')
    const toExport = await loadHistory()
    if (toExport.length === 0) {
      toast.dismiss()
      toast.info('Nenhuma notificação para exportar')
      return
    }
    try {
      notificationsService.exportToCsv(toExport)
      toast.dismiss()
      toast.success('📥 Histórico exportado!', {
        description: 'Arquivo CSV com todo o período baixado.'
      })
    } catch {
      toast.dismiss()
      toast.error('Erro ao exportar notificações')
    }
  }

  return (
    <div className="w-full min-w-0 min-h-0 flex flex-col flex-1">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 lg:p-10 border-b bg-card flex-shrink-0 gap-4">
        <div className="min-w-0">
          <h1 className="text-foreground mb-2 text-xl sm:text-2xl font-semibold">Central de Notificações</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gerencie todas as suas notificações e alertas importantes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 flex-shrink-0">
          <Badge className="bg-aumigo-orange text-white text-xs sm:text-sm">
            {unreadCount} não lidas
          </Badge>
          {/* <Button 
            variant="outline" 
            size="sm"
            className="border-aumigo-blue text-aumigo-blue hover:bg-aumigo-blue hover:text-white text-xs sm:text-sm"
            onClick={handleExportNotifications}
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden sm:inline">Exportar Histórico</span>
            <span className="sm:hidden">Exportar</span>
          </Button> */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto min-h-0">
        <Tabs defaultValue="notifications" className="h-full flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 flex-shrink-0">
            <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Notificações</span>
              <span className="sm:hidden">Notif.</span>
            </TabsTrigger>
            {/* <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config.</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden">Hist.</span>
            </TabsTrigger> */}
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="h-full">
              <div className="flex flex-col items-center h-full w-full max-w-md mx-auto gap-4">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aumigo-orange" />
                  </div>
                ) : (
                  <>
                    <div className="w-full rounded-lg border border-border bg-card p-4 space-y-4 shrink-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Status
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="text-xs font-medium text-aumigo-blue hover:text-aumigo-blue/80"
                          >
                            Limpar filtros
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
                        <button
                          type="button"
                          onClick={() => handleReadFilterChange('unread')}
                          className={`h-10 rounded-lg text-sm font-medium transition-all ${
                            readFilter === 'unread'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'bg-transparent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Não lidas
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReadFilterChange('read')}
                          className={`h-10 rounded-lg text-sm font-medium transition-all ${
                            readFilter === 'read'
                              ? 'bg-background text-foreground shadow-sm'
                              : 'bg-transparent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          Lidas
                        </button>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                          Tipo
                        </p>
                        <div className="-mx-1 overflow-x-auto px-1 pb-1">
                          <div className="flex gap-2">
                            {visibleEntityFilters.map((f) => {
                              const Icon = f.icon
                              const isActive =
                                (f.id === '' && !entityType) || entityType === f.id
                              return (
                                <button
                                  key={f.id || 'all'}
                                  type="button"
                                  onClick={() => setEntityType(f.id)}
                                  className={`h-10 shrink-0 px-3 rounded-lg text-sm whitespace-nowrap flex items-center gap-2 transition-colors ${
                                    isActive
                                      ? 'bg-aumigo-orange text-white shadow-sm'
                                      : 'bg-background border border-border text-foreground hover:bg-muted'
                                  }`}
                                >
                                  <Icon className="h-4 w-4 shrink-0" />
                                  {f.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <NotificationCenter
                      notifications={filteredForCenter}
                      onMarkAsRead={markAsRead}
                      onMarkAllAsRead={markAllAsRead}
                      onRemoveNotification={removeNotification}
                      onClearAll={clearAll}
                      showInlineFilters={false}
                      totalUnreadCount={unreadCount}
                      totalCountForFooter={notifications.length}
                      emptyMessage={listEmptyMessage}
                      onNotificationOpen={handleNotificationOpen}
                    />
                  </>
                )}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 sm:space-y-6 overflow-auto">
              <div className="max-w-7xl mx-auto w-full">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-aumigo-orange" />
                      Configurações de Notificação
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Personalize como você recebe e visualiza suas notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Tipos de Notificação</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { label: 'Novos Agendamentos', color: 'bg-aumigo-blue' },
                            { label: 'Mensagens de Clientes', color: 'bg-aumigo-teal' },
                            { label: 'Atualizações de Pagamento', color: 'bg-aumigo-mint' },
                            { label: 'Novas Avaliações', color: 'bg-yellow-500' },
                            { label: 'Alertas do Sistema', color: 'bg-aumigo-orange' },
                            { label: 'Emergências', color: 'bg-red-500' }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${item.color}`} />
                              <span className="text-sm">{item.label}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base">Prioridades</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {[
                            { label: 'Urgente', color: 'bg-red-500', desc: 'Emergências' },
                            { label: 'Alta', color: 'bg-aumigo-orange', desc: 'Novos agendamentos' },
                            { label: 'Média', color: 'bg-aumigo-blue', desc: 'Mensagens e pagamentos' },
                            { label: 'Baixa', color: 'bg-aumigo-gray', desc: 'Atualizações gerais' }
                          ].map((item, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <Badge className={`${item.color} text-white`}>{item.label}</Badge>
                              <span className="text-sm text-muted-foreground">{item.desc}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm sm:text-base">Ações Disponíveis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <Button 
                            variant="outline" 
                            className="justify-start text-xs sm:text-sm"
                            onClick={() => toast.info('Configuração de filtros em desenvolvimento')}
                          >
                            <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="hidden sm:inline">Configurar Filtros</span>
                            <span className="sm:hidden">Filtros</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="justify-start text-xs sm:text-sm"
                            onClick={() => toast.info('Configuração de sons em desenvolvimento')}
                          >
                            <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="hidden sm:inline">Sons de Notificação</span>
                            <span className="sm:hidden">Sons</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="justify-start text-xs sm:text-sm"
                            onClick={markAllAsRead}
                          >
                            <Archive className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="hidden sm:inline">Marcar Todas como Lidas</span>
                            <span className="sm:hidden">Marcar Lidas</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            className="justify-start text-destructive text-xs sm:text-sm"
                            onClick={clearAll}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="hidden sm:inline">Limpar Todas</span>
                            <span className="sm:hidden">Limpar</span>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4 sm:space-y-6 overflow-auto">
              <div className="max-w-7xl mx-auto w-full">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-aumigo-orange" />
                      Histórico de Notificações
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Registro completo de todas as notificações recebidas. Limpar e marcar como lida continuam funcionando na aba Notificações. Exporte todo o período quando precisar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        {historyNotifications.length} notificações no histórico
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs sm:text-sm w-full sm:w-auto"
                        onClick={handleExportNotifications}
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                        <span className="sm:hidden">Exposdsdrtar</span>
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 sm:p-6">
                      {historyLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aumigo-orange" />
                        </div>
                      ) : historyNotifications.length === 0 ? (
                        <div className="text-center py-6 sm:py-8 text-muted-foreground">
                          <Archive className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm sm:text-base">Nenhuma notificação no histórico</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-[400px] overflow-auto">
                          {historyNotifications.map((n) => (
                            <div
                              key={n.id}
                              className={`p-3 rounded-lg border text-sm ${!n.read ? 'bg-aumigo-orange/5 border-aumigo-orange/20' : 'bg-muted/30'}`}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{n.title}</p>
                                  <p className="text-muted-foreground text-xs truncate">{n.description}</p>
                                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                    <span>{n.type}</span>
                                    {n.bookingId && <span>• ID: {n.bookingId}</span>}
                                    <span>• {n.timestamp.toLocaleString('pt-BR')}</span>
                                    {n.read ? <Badge variant="outline" className="text-[10px]">Lida</Badge> : <Badge className="text-[10px] bg-aumigo-orange">Não lida</Badge>}
                                  </div>
                                </div>
                                {!n.read && (
                                  <Button variant="ghost" size="sm" className="flex-shrink-0" onClick={() => markAsRead(n.id)}>
                                    Marcar lida
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}