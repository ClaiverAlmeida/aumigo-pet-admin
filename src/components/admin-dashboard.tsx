import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  Users,
  UserCog,
  Building2,
  PawPrint,
  Store,
  ListChecks,
  Calendar,
  Star,
  Heart,
  CreditCard,
  MessageSquare,
  Bell,
  ArrowRight,
  Loader2,
  RefreshCw,
  BarChart3,
} from 'lucide-react'
import { dashboardService, type DashboardStats } from '../services/dashboard.service'

interface AdminDashboardProps {
  onNavigate: (page: string) => void
}

const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendentes',
  CONFIRMED: 'Confirmados',
  DONE: 'Concluídos',
  CANCELLED: 'Cancelados',
}

/** Card de métrica reutilizável */
function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor = 'text-aumigo-teal',
  onClick,
  loading,
}: {
  title: string
  value: number | string
  description?: string
  icon: React.ElementType
  iconColor?: string
  onClick?: () => void
  loading?: boolean
}) {
  const content = (
    <Card
      className={`transition-shadow ${onClick ? 'cursor-pointer hover:shadow-md' : ''} border-aumigo-teal/10`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-aumigo-gray">{title}</CardTitle>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-aumigo-gray" />
        ) : (
          <>
            <div className="text-2xl font-semibold text-aumigo-teal">{value}</div>
            {description && <p className="text-xs text-aumigo-gray mt-1">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
  return content
}

/** Seção do dashboard com título e grid de métricas */
function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-aumigo-teal">{title}</h2>
        {description && <p className="text-sm text-aumigo-gray">{description}</p>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children ?? null}
      </div>
    </div>
  )
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    const res = await dashboardService.getStats()
    setLoading(false)
    if (res.success && res.data) {
      setStats(res.data)
    } else {
      setError(res.error || 'Erro ao carregar dados')
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const s = stats
  const loadingState = loading && !s

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-aumigo-teal text-3xl mb-2 flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Dashboard
          </h1>
          <p className="text-aumigo-gray">
            Visão geral do sistema AuMigoPet. Dados brutos; lapidação (ex.: por cidade/estado) em versões futuras.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadStats} disabled={loading} className="shrink-0">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Atualizar
        </Button>
      </div>

      <section
        className="bg-orange-50"
        style={{
          border: '2px solid #fb923c',
          borderRadius: '16px',
          padding: '20px',
          boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
        }}
      >
        <h2 className="text-xl font-semibold text-aumigo-teal mb-3">
          🛠️ Bem-vindo ao Painel Administrativo
        </h2>
        <div className="space-y-3 text-sm text-aumigo-gray leading-relaxed">
          <p>
            Aqui você gerencia os principais módulos do sistema com visão administrativa completa.
          </p>
          <p>
            Use os atalhos e seções abaixo para acompanhar indicadores, ajustar configurações e manter a operação estável.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* 1. Usuários */}
      <Section
        title="Usuários"
        description="Tutores e profissionais na plataforma"
      >
        <MetricCard
          title="Tutores"
          value={s?.usuarios?.tutores ?? 0}
          description="Donos de pets"
          icon={Users}
          loading={loadingState}
          onClick={() => onNavigate('users')}
        />
        <MetricCard
          title="Profissionais"
          value={s?.usuarios?.profissionais ?? 0}
          description="Prestadores de serviço"
          icon={UserCog}
          iconColor="text-aumigo-orange"
          loading={loadingState}
          onClick={() => onNavigate('users')}
        />
      </Section>

      {/* 2. Empresas e catálogo */}
      <Section
        title="Empresas e catálogo"
        description="Empresas, serviços e itens do catálogo"
      >
        <MetricCard
          title="Empresas"
          value={s?.empresas ?? 0}
          description="Empresas cadastradas"
          icon={Building2}
          loading={loadingState}
        />
        <MetricCard
          title="Serviços"
          value={s?.pontosAtendimento ?? 0}
          description="Serviços cadastrados (ex.: Banho & Tosa)"
          icon={Store}
          loading={loadingState}
        />
        <MetricCard
          title="Itens no catálogo"
          value={s?.servicosCatalogo ?? 0}
          description="Itens/serviços oferecidos"
          icon={ListChecks}
          loading={loadingState}
        />
      </Section>

      {/* 3. Pets */}
      <Section title="Pets" description="Pets cadastrados na plataforma">
        <MetricCard
          title="Total de pets"
          value={s?.pets ?? 0}
          description="Pets ativos"
          icon={PawPrint}
          loading={loadingState}
        />
      </Section>

      {/* 4. Agendamentos */}
      <Section title="Agendamentos" description="Total e por status (futuro: por período)">
        <MetricCard
          title="Total de agendamentos"
          value={s?.agendamentos ?? 0}
          description="Todos os status"
          icon={Calendar}
          loading={loadingState}
        />
        {s?.agendamentosPorStatus &&
          Object.entries(s.agendamentosPorStatus).map(([status, count]) => (
            <div key={status}>
              <MetricCard
                title={BOOKING_STATUS_LABEL[status] ?? status}
                value={typeof count === 'number' ? count : 0}
                icon={Calendar}
                loading={loadingState}
              />
            </div>
          ))}
      </Section>

      {/* 5. Engajamento */}
      <Section title="Engajamento" description="Avaliações e favoritos">
        <MetricCard
          title="Avaliações"
          value={s?.avaliacoes ?? 0}
          description="Reviews no sistema"
          icon={Star}
          loading={loadingState}
        />
        <MetricCard
          title="Favoritos"
          value={s?.favoritos ?? 0}
          description="Profissionais favoritados"
          icon={Heart}
          loading={loadingState}
        />
      </Section>

      {/* 6. Operações */}
      <Section title="Operações" description="Pagamentos, suporte e notificações">
        <MetricCard
          title="Pagamentos"
          value={s?.pagamentos ?? 0}
          description="Total de transações"
          icon={CreditCard}
          loading={loadingState}
        />
        <MetricCard
          title="Tickets"
          value={s?.tickets ?? 0}
          description="Tickets de suporte"
          icon={MessageSquare}
          loading={loadingState}
        />
        <MetricCard
          title="Notificações"
          value={s?.notificacoes ?? 0}
          description="Notificações no sistema"
          icon={Bell}
          loading={loadingState}
        />
      </Section>

      {/* Ação rápida */}
      <Card className="border-aumigo-teal/20 bg-aumigo-teal/5">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-aumigo-gray">
              Acesse a listagem de tutores e profissionais para detalhes e filtros.
            </p>
            <Button
              variant="default"
              size="sm"
              className="bg-aumigo-teal hover:bg-aumigo-teal/90"
              onClick={() => onNavigate('users')}
            >
              Ver tutores e profissionais
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
