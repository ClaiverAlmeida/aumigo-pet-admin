import React from 'react'
import { NotificationCenter, useNotifications } from './notification-center'
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
  Download
} from 'lucide-react'
import { toast } from 'sonner'

export function ProNotifications() {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    unreadCount
  } = useNotifications()

  const handleExportNotifications = () => {
    toast.loading('Exportando histórico de notificações...')
    setTimeout(() => {
      toast.dismiss()
      toast.success('📥 Histórico exportado!', {
        description: 'Arquivo CSV baixado com sucesso.'
      })
    }, 2000)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 border-b bg-card flex-shrink-0 gap-4">
        <div className="min-w-0">
          <h1 className="text-foreground mb-2 text-lg sm:text-xl">Central de Notificações</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie todas as suas notificações e alertas importantes
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          <Badge className="bg-aumigo-orange text-white text-xs sm:text-sm">
            {unreadCount} não lidas
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            className="border-aumigo-blue text-aumigo-blue hover:bg-aumigo-blue hover:text-white text-xs sm:text-sm"
            onClick={handleExportNotifications}
          >
            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            <span className="hidden sm:inline">Exportar Histórico</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 sm:p-6 overflow-hidden">
        <Tabs defaultValue="notifications" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6">
            <TabsTrigger value="notifications" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Notificações</span>
              <span className="xs:hidden">Notif.</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Configurações</span>
              <span className="xs:hidden">Config.</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Archive className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">Histórico</span>
              <span className="xs:hidden">Hist.</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="h-full">
              <div className="flex justify-center h-full">
                <NotificationCenter
                  notifications={notifications}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                  onRemoveNotification={removeNotification}
                  onClearAll={clearAll}
                />
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4 sm:space-y-6">
              <div className="max-w-full lg:max-w-4xl mx-auto">
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
                        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
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
            <TabsContent value="history" className="space-y-4 sm:space-y-6">
              <div className="max-w-full mx-auto">
                <Card>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Archive className="h-4 w-4 sm:h-5 sm:w-5 text-aumigo-orange" />
                      Histórico de Notificações
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Visualize e gerencie o histórico completo das suas notificações
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex flex-col xs:flex-row gap-2">
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                          <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span className="hidden sm:inline">Filtrar por Tipo</span>
                          <span className="sm:hidden">Tipo</span>
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm">
                          <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                          <span className="hidden sm:inline">Filtrar por Data</span>
                          <span className="sm:hidden">Data</span>
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs sm:text-sm w-full xs:w-auto"
                        onClick={handleExportNotifications}
                      >
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        <span className="hidden sm:inline">Exportar CSV</span>
                        <span className="sm:hidden">Exportar</span>
                      </Button>
                    </div>

                    <div className="border rounded-lg p-4 sm:p-6">
                      <div className="text-center py-6 sm:py-8 text-muted-foreground">
                        <Archive className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm sm:text-base">Histórico detalhado em desenvolvimento</p>
                        <p className="text-xs sm:text-sm mt-1">Em breve você poderá visualizar e buscar em todo o histórico</p>
                      </div>
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