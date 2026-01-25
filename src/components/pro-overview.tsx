import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { useRouter } from '../hooks/useRouter'
import { bookingsService, type Booking } from '../services/bookings.service'
import { serviceProvidersService } from '../services/service-providers.service'
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Users, 
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

const alerts: any[] = []

export function ProOverview() {
  const { navigate } = useRouter()
  const [loading, setLoading] = useState(true)
  const [kpisData, setKpisData] = useState({
    novosPedidos: 0,
    confirmadosHoje: 0,
    notaMedia: '-',
  })
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      
      const dateFrom = todayStart.toISOString().split('T')[0]
      const dateTo = todayEnd.toISOString().split('T')[0]

      // Buscar todos os bookings de hoje (qualquer status)
      const bookingsTodayResult = await bookingsService.getAll({
        dateFrom,
        dateTo,
        limit: 10
      })

      // Buscar novos pedidos (PENDING) - buscar com limite maior para contar
      const pendingBookingsResult = await bookingsService.getAll({
        status: 'PENDING',
        limit: 100 // Limite razoável para contar
      })

      // Buscar service providers para pegar nota média
      const providersResult = await serviceProvidersService.list()

      // Processar dados de agendamentos de hoje
      if (bookingsTodayResult.success && bookingsTodayResult.data) {
        const responseData = bookingsTodayResult.data as any
        const bookings = Array.isArray(responseData) 
          ? responseData 
          : (responseData.data || [])
        
        const confirmedToday = bookings.length

        // Transformar bookings para o formato esperado
        const transformedBookings = bookings.slice(0, 5).map((booking: Booking) => ({
          id: booking.id,
          time: booking.time || '00:00',
          service: booking.serviceName || booking.service?.name || 'Serviço',
          pet: booking.petName || booking.pet?.name || 'Pet',
          tutor: booking.customerName || booking.customer?.name || 'Cliente',
          avatar: booking.customer?.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customerName || booking.customer?.name || 'Cliente')}&background=random`,
          status: booking.status
        }))

        setUpcomingBookings(transformedBookings)
        
        // Contar apenas os confirmados para o KPI
        const confirmedCount = bookings.filter((b: Booking) => b.status === 'CONFIRMED').length
        setKpisData(prev => ({ ...prev, confirmadosHoje: confirmedCount }))
      }

      // Processar novos pedidos (PENDING)
      if (pendingBookingsResult.success && pendingBookingsResult.data) {
        const responseData = pendingBookingsResult.data as any
        const pendingBookings = Array.isArray(responseData)
          ? responseData
          : (responseData.data || [])
        
        // Se tiver paginação, usar total, senão contar array
        const novosPedidos = responseData.pagination?.total || pendingBookings.length
        setKpisData(prev => ({ ...prev, novosPedidos }))
      }

      // Processar nota média dos providers
      if (providersResult.success && providersResult.data) {
        const responseData = providersResult.data as any
        const providers = Array.isArray(responseData)
          ? responseData
          : (responseData.data || [])
        
        // Pegar a primeira nota média disponível (ou calcular média de todas)
        if (providers.length > 0) {
          const ratings = providers
            .map((p: any) => {
              const rating = p.averageRating || p.rating
              return rating ? parseFloat(rating.toString()) : 0
            })
            .filter((r: number) => r > 0)
          
          if (ratings.length > 0) {
            const avgRating = (ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length).toFixed(1)
            setKpisData(prev => ({ ...prev, notaMedia: avgRating }))
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular KPIs dinâmicos
  const kpis = [
    {
      title: 'Novos Pedidos',
      value: kpisData.novosPedidos.toString(),
      change: '0',
      changeType: 'increase' as const,
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Confirmados Hoje',
      value: kpisData.confirmadosHoje.toString(),
      change: '0',
      changeType: 'increase' as const,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Ganhos (Mês)',
      value: 'R$ 0',
      change: '0%',
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Nota Média',
      value: kpisData.notaMedia,
      change: '0',
      changeType: 'increase' as const,
      icon: Star,
      color: 'text-yellow-500'
    }
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Alertas */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.type === 'warning' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <div>
                  <strong>{alert.title}</strong> - {alert.description}
                </div>
                <Button variant="outline" size="sm">
                  {alert.action}
                </Button>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-2xl font-bold text-foreground animate-pulse">...</div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      {kpi.value !== '-' && kpi.value !== '0' && kpi.value !== 'R$ 0' && (
                        <>
                          <TrendingUp className="h-3 w-3 mr-1" />
                          <span className="text-green-600">{kpi.change}</span>
                          <span className="ml-1">vs. mês anterior</span>
                        </>
                      )}
                      {(kpi.value === '-' || kpi.value === '0' || kpi.value === 'R$ 0') && (
                        <span className="text-muted-foreground">Sem dados ainda</span>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        {/* Próximos Agendamentos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription>
              Seus atendimentos de hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-16 bg-muted rounded"></div>
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-sm text-muted-foreground">Nenhum agendamento hoje</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="font-mono text-sm font-medium bg-primary/10 px-2 py-1 rounded text-primary">
                      {booking.time}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={booking.avatar} />
                      <AvatarFallback>{(booking.tutor || 'C')[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{booking.pet} - {booking.service}</p>
                      <p className="text-xs text-muted-foreground">{booking.tutor}</p>
                    </div>
                    <Badge 
                      variant={
                        booking.status === 'CONFIRMED' ? 'default' :
                        booking.status === 'PENDING' ? 'secondary' :
                        booking.status === 'DONE' ? 'outline' :
                        'destructive'
                      }
                      className={
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800 border-green-200' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        booking.status === 'DONE' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        'bg-red-100 text-red-800 border-red-200'
                      }
                    >
                      {booking.status === 'CONFIRMED' ? 'Confirmado' :
                       booking.status === 'PENDING' ? 'Pendente' :
                       booking.status === 'DONE' ? 'Concluído' :
                       booking.status === 'CANCELLED' ? 'Cancelado' :
                       booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            <Button className="w-full mt-4" variant="outline" onClick={() => navigate('/pro/bookings')}>
              Ver Todos os Agendamentos
            </Button>
          </CardContent>
        </Card>

        {/* Performance Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Performance Mensal</CardTitle>
            <CardDescription>{new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Agendamentos</span>
                <span className="text-foreground">0/0</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Taxa de Aprovação</span>
                <span className="text-foreground">0%</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Satisfação</span>
                <span className="text-foreground">-</span>
              </div>
              <Progress value={0} className="h-2" />
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Receita Total</span>
                <span className="font-medium text-foreground">R$ 0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Taxa da Plataforma</span>
                <span className="text-muted-foreground">- R$ 0</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span className="text-foreground">Valor Líquido</span>
                <span className="text-foreground">R$ 0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}