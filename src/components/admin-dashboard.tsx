import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Progress } from './ui/progress'
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Users,
  Calendar,
  CreditCard,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Webhook,
  Shield,
  Activity,
  BarChart3
} from 'lucide-react'

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

interface KPICard {
  title: string
  value: string
  change: string
  changeType: 'up' | 'down' | 'neutral'
  icon: any
  description: string
  clickAction?: string
}

interface AlertItem {
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  action: string
  actionPage: string
  timestamp: string
}

const kpiCards: KPICard[] = [
  {
    title: 'GMV Hoje',
    value: 'R$ 45.230',
    change: '+12,5%',
    changeType: 'up',
    icon: DollarSign,
    description: 'vs. ontem',
    clickAction: 'payments'
  },
  {
    title: 'Take Rate',
    value: '18,7%',
    change: '+0,3%',
    changeType: 'up',
    icon: TrendingUp,
    description: 'média mensal',
    clickAction: 'analytics'
  },
  {
    title: 'Pedidos Hoje',
    value: '234',
    change: '+8,2%',
    changeType: 'up',
    icon: Calendar,
    description: 'vs. ontem',
    clickAction: 'bookings'
  },
  {
    title: 'Chargebacks',
    value: '12',
    change: '+2',
    changeType: 'down',
    icon: CreditCard,
    description: 'últimos 7 dias',
    clickAction: 'incidents'
  }
]

const alerts: AlertItem[] = [
  {
    type: 'critical',
    title: 'Webhooks com erro',
    message: '8 webhooks falhando há mais de 30min',
    action: 'Verificar',
    actionPage: 'webhooks',
    timestamp: '5 min atrás'
  },
  {
    type: 'critical',
    title: 'KYC parado',
    message: '12 documentos aguardando triagem há mais de 48h',
    action: 'Triar',
    actionPage: 'kyc',
    timestamp: '1 hora atrás'
  },
  {
    type: 'warning',
    title: 'Pagamentos a conciliar',
    message: 'R$ 8.450 em pagamentos não conciliados',
    action: 'Conciliar',
    actionPage: 'payments',
    timestamp: '2 horas atrás'
  },
  {
    type: 'info',
    title: 'Relatório semanal',
    message: 'Relatório de performance disponível',
    action: 'Ver',
    actionPage: 'analytics',
    timestamp: '3 horas atrás'
  }
]

interface QueueItem {
  title: string
  count: number
  priority: 'high' | 'medium' | 'low'
  sla: string
  slaStatus: 'ok' | 'warning' | 'critical'
  page: string
}

const operationalQueues: QueueItem[] = [
  {
    title: 'KYC Pendente',
    count: 12,
    priority: 'high',
    sla: '2h restantes',
    slaStatus: 'warning',
    page: 'kyc'
  },
  {
    title: 'Aprovações de Serviço',
    count: 5,
    priority: 'medium',
    sla: '4h restantes',
    slaStatus: 'ok',
    page: 'approvals'
  },
  {
    title: 'Tickets de Suporte',
    count: 8,
    priority: 'medium',
    sla: '1h restantes',
    slaStatus: 'critical',
    page: 'support'
  },
  {
    title: 'Incidentes Ativos',
    count: 2,
    priority: 'high',
    sla: 'SLA vencido',
    slaStatus: 'critical',
    page: 'incidents'
  }
]

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'info':
        return <CheckCircle className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getSLAColor = (status: string) => {
    switch (status) {
      case 'ok':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'critical':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500'
      case 'medium':
        return 'border-l-yellow-500'
      case 'low':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-aumigo-teal text-3xl mb-2">Dashboard Administrativo</h1>
          <p className="text-aumigo-gray">Visão executiva e operacional da plataforma AuMigoPet</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-700">Sistema operacional</span>
          </div>
          <Badge variant="outline" className="text-gray-600">
            <Clock className="mr-1 h-3 w-3" />
            Atualizado há 2 min
          </Badge>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => kpi.clickAction && onNavigate(kpi.clickAction)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-aumigo-gray">{kpi.title}</CardTitle>
              <kpi.icon className="h-5 w-5 text-aumigo-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-aumigo-teal mb-1">{kpi.value}</div>
              <div className="flex items-center space-x-1 text-sm">
                {getChangeIcon(kpi.changeType)}
                <span className={`${
                  kpi.changeType === 'up' ? 'text-green-600' : 
                  kpi.changeType === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {kpi.change}
                </span>
                <span className="text-aumigo-gray">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Alertas Críticos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-aumigo-teal">
                <AlertCircle className="h-5 w-5" />
                Alertas do Sistema
              </CardTitle>
              <CardDescription>
                Situações que requerem atenção imediata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm text-aumigo-teal">{alert.title}</p>
                      <span className="text-xs text-aumigo-gray">{alert.timestamp}</span>
                    </div>
                    <p className="text-sm text-aumigo-gray mb-2">{alert.message}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-xs"
                      onClick={() => onNavigate(alert.actionPage)}
                    >
                      {alert.action}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Filas Operacionais */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-aumigo-teal">
                <Activity className="h-5 w-5" />
                Filas de Triagem
              </CardTitle>
              <CardDescription>
                Itens aguardando processamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {operationalQueues.map((queue, index) => (
                <div 
                  key={index} 
                  className={`p-4 border-l-4 ${getPriorityColor(queue.priority)} bg-gray-50 rounded-r-lg cursor-pointer hover:bg-gray-100 transition-colors`}
                  onClick={() => onNavigate(queue.page)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm text-aumigo-teal">{queue.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {queue.count}
                    </Badge>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded ${getSLAColor(queue.slaStatus)}`}>
                    {queue.sla}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Performance Operacional */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aumigo-teal">
              <BarChart3 className="h-5 w-5" />
              SLAs de Operação
            </CardTitle>
            <CardDescription>
              Performance das principais operações nas últimas 24h
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-aumigo-gray">Triagem KYC</span>
                <span className="text-sm text-aumigo-teal">87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-aumigo-gray">Aprovação de Serviços</span>
                <span className="text-sm text-aumigo-teal">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-aumigo-gray">Suporte a Usuários</span>
                <span className="text-sm text-aumigo-teal">73%</span>
              </div>
              <Progress value={73} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-aumigo-gray">Conciliação Financeira</span>
                <span className="text-sm text-aumigo-teal">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-aumigo-teal">
              <Shield className="h-5 w-5" />
              Status dos Sistemas
            </CardTitle>
            <CardDescription>
              Saúde dos principais componentes da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'API Principal', status: 'ok', uptime: '99.9%' },
              { name: 'Pagamentos', status: 'ok', uptime: '99.8%' },
              { name: 'Webhooks', status: 'warning', uptime: '94.2%' },
              { name: 'Chat/Notificações', status: 'ok', uptime: '99.5%' },
              { name: 'Upload de Arquivos', status: 'ok', uptime: '98.9%' },
              { name: 'Banco de Dados', status: 'ok', uptime: '100%' }
            ].map((system, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    system.status === 'ok' ? 'bg-green-400' : 
                    system.status === 'warning' ? 'bg-yellow-400' : 'bg-red-400'
                  }`}></div>
                  <span className="text-sm text-aumigo-gray">{system.name}</span>
                </div>
                <span className="text-sm text-aumigo-teal">{system.uptime}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}