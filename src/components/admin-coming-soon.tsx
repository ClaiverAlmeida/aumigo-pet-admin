import React from 'react'
import { Sparkles, BarChart3, Users, ArrowRight, Calendar, CreditCard, MessageSquare, Package, DollarSign, Receipt, FileCheck } from 'lucide-react'
import { Button } from './ui/button'

/** Rótulos amigáveis para cada id de página do menu admin */
const PAGE_LABELS: Record<string, string> = {
  kyc: 'KYC / Triagem',
  bookings: 'Agendamentos',
  incidents: 'Incidentes',
  rbac: 'Papéis & Permissões',
  companies: 'Empresas',
  'service-providers': 'Serviços',
  catalog: 'Itens no catálogo',
  payments: 'Pagamentos',
  payouts: 'Repasses',
  transactions: 'Transações',
  reviews: 'Avaliações',
  support: 'Suporte',
  webhooks: 'Integrações',
  logs: 'Logs & Auditoria',
}

/** Recursos já disponíveis (para a seção "Enquanto isso") */
const AVAILABLE_NOW = [
  { id: 'dashboard', label: 'Dashboard', description: 'Visão geral e métricas', icon: BarChart3 },
  { id: 'users', label: 'Tutores & Profissionais', description: 'Gestão de usuários', icon: Users },
]

/** Exemplos de recursos que virão (seção "Em breve") */
const COMING_SOON_EXAMPLES = [
  { label: 'Financeiro', short: 'Pagamentos e repasses', icon: CreditCard },
  { label: 'Repasses', short: 'Repasses de pagamento', icon: DollarSign },
  { label: 'Transações', short: 'Transações de pagamento', icon: Receipt },
  { label: 'KYC / Triagem', short: 'Gestão de KYC e triagem', icon: FileCheck },
]

interface AdminComingSoonProps {
  /** Id da rota/página (ex: 'kyc', 'bookings') para exibir o nome do recurso */
  pageId?: string
  /** Navegação para outras páginas (ex.: voltar ao dashboard) */
  onNavigate?: (page: string) => void
}

/**
 * Página padrão para recursos do admin que ainda não têm tela.
 * Comunica que o recurso estará disponível em uma próxima versão (V2, V3 etc.).
 */
export function AdminComingSoon({ pageId, onNavigate }: AdminComingSoonProps) {
  const featureName = pageId ? PAGE_LABELS[pageId] ?? pageId : null

  return (
    <div className="relative min-h-[80vh] overflow-hidden">
      {/* ========== FUNDO ========== */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(160deg, rgba(46,111,121,0.07) 0%, rgba(255,255,255,0) 35%, rgba(255,155,87,0.06) 100%)',
        }}
      />
      <div
        className="absolute inset-0 -z-10 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgb(46 111 121 / 0.07) 1px, transparent 0),
            radial-gradient(circle at 1px 1px, rgb(46 111 121 / 0.03) 1px, transparent 0)
          `,
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0, 14px 14px',
        }}
      />
      <div className="absolute top-1/5 -left-24 w-80 h-80 rounded-full bg-aumigo-teal/15 blur-[90px] -z-10 animate-pulse" style={{ animationDuration: '3.5s' }} />
      <div className="absolute bottom-1/5 -right-24 w-[22rem] h-[22rem] rounded-full bg-aumigo-orange/12 blur-[100px] -z-10 animate-pulse" style={{ animationDuration: '4.5s', animationDelay: '0.5s' }} />

      <div className="p-6 sm:p-8 max-w-4xl mx-auto space-y-8">
        {/* ========== HERO CARD ========== */}
        <div className="relative z-10">
          <div
            className="relative rounded-3xl border border-aumigo-teal/20 bg-white/85 backdrop-blur-xl shadow-2xl overflow-hidden"
            style={{
              boxShadow: '0 25px 50px -12px rgba(46, 111, 121, 0.12), 0 0 0 1px rgba(46, 111, 121, 0.05)',
            }}
          >
            <div
              className="h-1.5 w-full"
              style={{
                background: 'linear-gradient(90deg, #2e6f79 0%, #5ec4e7 50%, #ff9b57 100%)',
              }}
            />
            <div className="pt-10 pb-10 px-8 sm:px-12 text-center">
              <span className="inline-block px-4 py-2 mt-6 rounded-full text-xs font-semibold tracking-wide uppercase text-aumigo-teal bg-aumigo-teal/10 border border-aumigo-teal/20 mb-5">
                Próxima versão
              </span>
              <div className="flex justify-center mb-6 mt-6">
                <div
                  className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-aumigo-teal/20 to-aumigo-teal/5 border border-aumigo-teal/20"
                  style={{
                    boxShadow: '0 0 0 1px rgba(46, 111, 121, 0.08), 0 16px 32px -12px rgba(46, 111, 121, 0.2)',
                  }}
                >
                  <Sparkles className="h-10 w-10 text-aumigo-teal relative z-10" strokeWidth={1.5} />
                  <div className="absolute inset-0 rounded-2xl bg-aumigo-teal/10 blur-xl animate-pulse" style={{ animationDuration: '2.5s' }} />
                </div>
              </div>
              <h1
                className="text-3xl sm:text-4xl font-bold mb-2 tracking-tight text-aumigo-teal"
                style={{
                  background: 'linear-gradient(135deg, #2e6f79 0%, #3d8a94 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Em breve
              </h1>
              {featureName && (
                <p className="text-lg font-semibold text-aumigo-teal/90 mb-3">{featureName}</p>
              )}
              <p className="text-aumigo-gray text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-6">
                Este recurso estará disponível em uma próxima versão do AuMigoPet.
                Estamos evoluindo o painel para você.
              </p>
            </div>
          </div>
        </div>

        {/* ========== ENQUANTO ISSO ========== */}
        <section className="relative z-10">
          <h2 className="text-lg font-semibold text-aumigo-teal mb-4">Enquanto isso, você pode usar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVAILABLE_NOW.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate?.(item.id)}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-aumigo-teal/15 bg-white/70 hover:bg-white hover:border-aumigo-teal/25 hover:shadow-lg transition-all text-left"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-aumigo-teal/10 text-aumigo-teal group-hover:bg-aumigo-teal/15 transition-colors shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-aumigo-teal">{item.label}</p>
                    <p className="text-sm text-aumigo-gray">{item.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-aumigo-teal/50 group-hover:text-aumigo-teal group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              )
            })}
          </div>
        </section>

        {/* ========== RECURSOS EM BREVE ========== */}
        <section className="relative z-10">
          <h2 className="text-lg font-semibold text-aumigo-teal mb-4">Recursos em breve</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COMING_SOON_EXAMPLES.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-aumigo-teal/10 bg-white/50"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-aumigo-teal/10 text-aumigo-teal/80">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium text-aumigo-teal text-center">{item.label}</span>
                  <span className="text-xs text-aumigo-gray text-center leading-tight">{item.short}</span>
                </div>
              )
            })}
          </div>
        </section>

        {/* ========== CTA ========== */}
        {onNavigate && (
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={() => onNavigate('dashboard')}
              className="bg-aumigo-teal hover:bg-aumigo-teal/90 text-white shadow-md"
            >
              Voltar ao Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Rodapé sutil */}
        <div className="relative z-10 flex items-center justify-center gap-2 text-aumigo-teal/50 pt-4 pb-2">
          <div className="h-px w-12 bg-aumigo-teal/20 rounded-full" />
          <span className="text-xs font-medium">AuMigoPet Admin</span>
          <div className="h-px w-12 bg-aumigo-teal/20 rounded-full" />
        </div>
      </div>
    </div>
  )
}
