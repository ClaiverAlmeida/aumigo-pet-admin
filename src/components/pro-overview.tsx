import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
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

const kpis = [
  {
    title: 'Novos Pedidos',
    value: '12',
    change: '+5',
    changeType: 'increase' as const,
    icon: Users,
    color: 'text-blue-600'
  },
  {
    title: 'Confirmados Hoje',
    value: '8',
    change: '+2',
    changeType: 'increase' as const,
    icon: CheckCircle,
    color: 'text-green-600'
  },
  {
    title: 'Ganhos (Mês)',
    value: 'R$ 3.450',
    change: '+15%',
    changeType: 'increase' as const,
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Nota Média',
    value: '4.8',
    change: '+0.2',
    changeType: 'increase' as const,
    icon: Star,
    color: 'text-yellow-500'
  }
]

const upcomingBookings = [
  {
    id: 1,
    time: '09:00',
    service: 'Banho & Tosa',
    pet: 'Max',
    tutor: 'João Silva',
    avatar: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: 2,
    time: '11:30',
    service: 'Adestramento',
    pet: 'Luna',
    tutor: 'Ana Costa',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face'
  },
  {
    id: 3,
    time: '14:00',
    service: 'Consulta Veterinária',
    pet: 'Buddy',
    tutor: 'Carlos Santos',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
  }
]

const alerts = [
  {
    type: 'warning' as const,
    title: 'Documento Pendente',
    description: 'Seu comprovante de residência está em análise.',
    action: 'Ver KYC'
  },
  {
    type: 'info' as const,
    title: 'Perfil Incompleto',
    description: 'Complete seu perfil para aparecer melhor nas buscas.',
    action: 'Completar'
  }
]

export function ProOverview() {
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
                <div className="text-2xl font-bold text-foreground">{kpi.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span className="text-green-600">{kpi.change}</span>
                  <span className="ml-1">vs. mês anterior</span>
                </div>
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
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="font-mono text-sm font-medium bg-primary/10 px-2 py-1 rounded text-primary">
                    {booking.time}
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={booking.avatar} />
                    <AvatarFallback>{booking.tutor[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground">{booking.pet} - {booking.service}</p>
                    <p className="text-xs text-muted-foreground">{booking.tutor}</p>
                  </div>
                  <Badge variant="outline">Confirmado</Badge>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              Ver Todos os Agendamentos
            </Button>
          </CardContent>
        </Card>

        {/* Performance Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Performance Mensal</CardTitle>
            <CardDescription>Setembro 2025</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Agendamentos</span>
                <span className="text-foreground">85/100</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Taxa de Aprovação</span>
                <span className="text-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-foreground">Satisfação</span>
                <span className="text-foreground">4.8/5.0</span>
              </div>
              <Progress value={96} className="h-2" />
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Receita Total</span>
                <span className="font-medium text-foreground">R$ 3.450</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-foreground">Taxa da Plataforma</span>
                <span className="text-muted-foreground">- R$ 345</span>
              </div>
              <div className="flex justify-between text-sm font-medium border-t pt-2">
                <span className="text-foreground">Valor Líquido</span>
                <span className="text-foreground">R$ 3.105</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}