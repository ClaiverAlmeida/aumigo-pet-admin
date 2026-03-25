import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { useRouter } from '../hooks/useRouter'
import {
  bookingsService,
  type Booking,
  type CompanyOperationalDashboard,
} from '../services/bookings.service'
import {
  DollarSign,
  Star,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'

const alerts: any[] = []

function formatBRLFromCents(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100)
}

export function ProOverview() {
  const { navigate } = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState<CompanyOperationalDashboard | null>(null)
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
      const formatLocalYmd = (d: Date) => {
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }
      const dateFrom = formatLocalYmd(todayStart)
      const dateTo = formatLocalYmd(todayStart)

      const [bookingsTodayResult, pendingBookingsResult, dashboardResult] = await Promise.all([
        bookingsService.getAllByCompany({
          dateFrom,
          dateTo,
          limit: 10,
        }),
        bookingsService.getAllByCompany({
          status: 'PENDING',
          limit: 100,
        }),
        bookingsService.getCompanyDashboard(),
      ])

      if (dashboardResult.success && dashboardResult.data) {
        setDashboard(dashboardResult.data)
        const r = dashboardResult.data.reviewsAllTime
        if (r.count > 0 && r.averageRating != null) {
          setKpisData((prev) => ({
            ...prev,
            notaMedia: String(r.averageRating),
          }))
        } else {
          setKpisData((prev) => ({ ...prev, notaMedia: '-' }))
        }
      } else {
        setDashboard(null)
      }

      if (bookingsTodayResult.success && bookingsTodayResult.data) {
        const responseData = bookingsTodayResult.data as any
        const bookings = Array.isArray(responseData)
          ? responseData
          : (responseData.data || [])
        const transformedBookings = bookings.slice(0, 5).map((booking: Booking) => ({
          id: booking.id,
          time: booking.time || '00:00',
          service: booking.serviceName || booking.service?.name || 'Serviço',
          pet: booking.petName || booking.pet?.name || 'Pet',
          tutor: booking.customerName || booking.customer?.name || 'Cliente',
          avatar:
            (booking.customer as { profilePicture?: string } | undefined)?.profilePicture ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.customerName || booking.customer?.name || 'Cliente')}&background=random`,
          status: booking.status,
        }))
        setUpcomingBookings(transformedBookings)
        const confirmedCount = bookings.filter((b: Booking) => b.status === 'CONFIRMED').length
        setKpisData((prev) => ({ ...prev, confirmadosHoje: confirmedCount }))
      }

      if (pendingBookingsResult.success && pendingBookingsResult.data) {
        const responseData = pendingBookingsResult.data as any
        const pendingBookings = Array.isArray(responseData)
          ? responseData
          : (responseData.data || [])
        const novosPedidos = responseData.pagination?.total || pendingBookings.length
        setKpisData((prev) => ({ ...prev, novosPedidos }))
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const refMonth = dashboard?.referenceMonth
  const performanceMonthLabel = refMonth
    ? new Date(refMonth.year, refMonth.month - 1, 1).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const netCents = dashboard?.paymentsCurrentMonthCents.net ?? 0
  const grossCents = dashboard?.paymentsCurrentMonthCents.gross ?? 0
  const platformFeeCents = dashboard?.paymentsCurrentMonthCents.platformFee ?? 0
  const revDelta = dashboard?.deltas.revenueNetPercentVsPreviousMonth ?? null
  const b = dashboard?.bookingsInMonth
  const reviewsMonth = dashboard?.reviewsInMonth
  const satisfactionPercent =
    reviewsMonth && reviewsMonth.count > 0 && reviewsMonth.averageRating != null
      ? Math.round((reviewsMonth.averageRating / 5) * 100)
      : 0

  const kpis = [
    {
      title: 'Novos Pedidos',
      value: kpisData.novosPedidos.toString(),
      footnote: 'pendentes em aberto (empresa)',
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Confirmados Hoje',
      value: kpisData.confirmadosHoje.toString(),
      footnote: 'com data de hoje',
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      title: 'Ganhos (Mês)',
      value: formatBRLFromCents(netCents),
      footnote: 'Valor líquido (pagamentos pagos no mês)',
      showTrend: revDelta !== null,
      trendValue: revDelta,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Nota Média',
      value: kpisData.notaMedia,
      footnote:
        dashboard && dashboard.reviewsAllTime.count > 0
          ? `${dashboard.reviewsAllTime.count} avaliação(ões) no total`
          : 'média das avaliações recebidas',
      icon: Star,
      color: 'text-yellow-500',
    },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          const isEmptyKpi = kpi.title === 'Nota Média' && kpi.value === '-'
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
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground mt-1">
                      {kpi.showTrend && kpi.trendValue !== undefined && kpi.trendValue !== null && (
                        <span
                          className={`flex items-center ${kpi.trendValue >= 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {kpi.trendValue >= 0 ? (
                            <TrendingUp className="h-3 w-3 mr-1 shrink-0" />
                          ) : (
                            <TrendingDown className="h-3 w-3 mr-1 shrink-0" />
                          )}
                          {kpi.trendValue >= 0 ? '+' : ''}
                          {kpi.trendValue}% vs. mês anterior
                        </span>
                      )}
                      <span>{kpi.footnote}</span>
                      {kpi.title === 'Ganhos (Mês)' && netCents === 0 && !loading && (
                        <span>Nenhum pagamento pago no período.</span>
                      )}
                      {isEmptyKpi && (
                        <span className="text-muted-foreground">Ainda não há avaliações.</span>
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
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription>Seus atendimentos de hoje</CardDescription>
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
                      <p className="font-medium text-sm text-foreground">
                        {booking.pet} - {booking.service}
                      </p>
                      <p className="text-xs text-muted-foreground">{booking.tutor}</p>
                    </div>
                    <Badge
                      variant={
                        booking.status === 'CONFIRMED'
                          ? 'default'
                          : booking.status === 'PENDING'
                            ? 'secondary'
                            : booking.status === 'DONE'
                              ? 'outline'
                              : 'destructive'
                      }
                      className={
                        booking.status === 'CONFIRMED'
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : booking.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : booking.status === 'DONE'
                              ? 'bg-blue-100 text-blue-800 border-blue-200'
                              : 'bg-red-100 text-red-800 border-red-200'
                      }
                    >
                      {booking.status === 'CONFIRMED'
                        ? 'Confirmado'
                        : booking.status === 'PENDING'
                          ? 'Pendente'
                          : booking.status === 'DONE'
                            ? 'Concluído'
                            : booking.status === 'CANCELLED'
                              ? 'Cancelado'
                              : booking.status}
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

        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Performance Mensal</CardTitle>
            <CardDescription className="capitalize">{performanceMonthLabel}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Agendamentos (concluídos / total)</span>
                <span className="text-foreground">
                  {loading || !b ? '—' : `${b.done}/${b.total}`}
                </span>
              </div>
              <Progress value={loading || !b ? 0 : b.appointmentsProgressPercent} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Taxa de aprovação</span>
                <span className="text-foreground">
                  {loading || !b ? '—' : `${b.approvalRatePercent}%`}
                </span>
              </div>
              <Progress value={loading || !b ? 0 : b.approvalRatePercent} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Satisfação (mês)</span>
                <span className="text-foreground">
                  {loading || !reviewsMonth || reviewsMonth.count === 0
                    ? '—'
                    : `${reviewsMonth.averageRating?.toFixed(1) ?? '—'} / 5`}
                </span>
              </div>
              <Progress value={loading ? 0 : satisfactionPercent} className="h-2" />
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Receita bruta (paga)</span>
                <span className="font-medium text-foreground">
                  {loading ? '—' : formatBRLFromCents(grossCents)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Taxa da plataforma</span>
                <span className="text-muted-foreground">
                  {loading ? '—' : `− ${formatBRLFromCents(platformFeeCents)}`}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span className="text-foreground">Valor líquido</span>
                <span className="text-foreground">
                  {loading ? '—' : formatBRLFromCents(netCents)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
