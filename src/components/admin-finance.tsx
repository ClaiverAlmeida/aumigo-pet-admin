import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Badge } from './ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import {
  CreditCard,
  DollarSign,
  Receipt,
  TrendingUp,
  Loader2,
  RefreshCw,
  Building2,
  ArrowRight,
  History,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react'
import { companiesService, type CompanyBalance, type Company } from '../services/companies.service'
import {
  financeService,
  type PaymentItem,
  type PayoutItem,
  getPaymentStatusLabel,
  getPayoutStatusLabel,
  getPaymentMethodLabel,
} from '../services/finance.service'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–'

/** Retorna YYYY-MM do mês atual */
function getCurrentMonthStr(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** De YYYY-MM retorna { startDate, endDate } em YYYY-MM-DD */
function getMonthRange(monthStr: string): { startDate: string; endDate: string } {
  const [y, m] = monthStr.split('-').map(Number)
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { startDate, endDate }
}

interface AdminFinanceProps {
  onNavigate: (page: string) => void
}

/**
 * Tela de Financeiro do painel administrativo.
 * Visão do super admin: lista todas as empresas e exibe saldo da empresa selecionada.
 * (A visão profissional, para a empresa ver seu próprio saldo, ficará no painel Pro.)
 */
const PAGE_SIZE = 10

export function AdminFinance({ onNavigate }: AdminFinanceProps) {
  const [monthFilter, setMonthFilter] = useState<string>(() => getCurrentMonthStr())
  const [globalBalance, setGlobalBalance] = useState<CompanyBalance | null>(null)
  const [loadingGlobal, setLoadingGlobal] = useState(true)
  const [balance, setBalance] = useState<CompanyBalance | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [payments, setPayments] = useState<PaymentItem[]>([])
  const [payouts, setPayouts] = useState<PayoutItem[]>([])
  const [paymentsPage, setPaymentsPage] = useState(1)
  const [payoutsPage, setPayoutsPage] = useState(1)
  const [paymentsTotal, setPaymentsTotal] = useState(0)
  const [payoutsTotal, setPayoutsTotal] = useState(0)
  const [loadingPayments, setLoadingPayments] = useState(false)
  const [loadingPayouts, setLoadingPayouts] = useState(false)
  const [showFeeDetails, setShowFeeDetails] = useState(false)
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false)

  const loadBalance = async (companyId: string, startDate?: string, endDate?: string) => {
    setLoading(true)
    setError(null)
    const res = await companiesService.getCompanyBalance(companyId, startDate, endDate)
    setLoading(false)
    if (res.success && res.data) {
      setBalance(res.data)
    } else {
      setError(res.error || 'Erro ao carregar saldo')
      setBalance(null)
    }
  }

  const loadCompanies = async () => {
    setLoadingCompanies(true)
    setError(null)
    const res = await companiesService.listCompanies(1, 200)
    setLoadingCompanies(false)
    if (res.success && res.data?.data) {
      const list = res.data.data
      setCompanies(list)
      const urlCompanyId =
        typeof window !== 'undefined'
          ? new URLSearchParams(window.location.search).get('companyId')
          : null
      if (urlCompanyId && list.some((c) => c.id === urlCompanyId)) {
        setSelectedCompanyId(urlCompanyId)
      } else if (list.length > 0 && !selectedCompanyId) {
        setSelectedCompanyId(list[0].id)
      }
    }
  }

  const loadGlobalBalance = async (startDate?: string, endDate?: string) => {
    setLoadingGlobal(true)
    const res = await companiesService.getGlobalBalance(startDate, endDate)
    setLoadingGlobal(false)
    if (res.success && res.data) setGlobalBalance(res.data)
    else setGlobalBalance(null)
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  const { startDate: rangeStart, endDate: rangeEnd } = getMonthRange(monthFilter)

  useEffect(() => {
    loadGlobalBalance(rangeStart, rangeEnd)
  }, [monthFilter])

  const loadPayments = async (companyId: string, page: number, startDate?: string, endDate?: string) => {
    setLoadingPayments(true)
    const res = await financeService.getPaymentsByCompany(companyId, page, PAGE_SIZE, startDate, endDate)
    setLoadingPayments(false)
    if (res.success && res.data) {
      setPayments(res.data.data)
      setPaymentsTotal(res.data.pagination?.total ?? 0)
    } else {
      setPayments([])
      setPaymentsTotal(0)
    }
  }

  const loadPayouts = async (companyId: string, page: number, startDate?: string, endDate?: string) => {
    setLoadingPayouts(true)
    const res = await financeService.getPayoutsByCompany(companyId, page, PAGE_SIZE, startDate, endDate)
    setLoadingPayouts(false)
    if (res.success && res.data) {
      setPayouts(res.data.data)
      setPayoutsTotal(res.data.pagination?.total ?? 0)
    } else {
      setPayouts([])
      setPayoutsTotal(0)
    }
  }

  useEffect(() => {
    if (selectedCompanyId) {
      loadBalance(selectedCompanyId, rangeStart, rangeEnd)
      setPaymentsPage(1)
      setPayoutsPage(1)
    } else {
      setBalance(null)
      setError(null)
      setPayments([])
      setPayouts([])
      setPaymentsTotal(0)
      setPayoutsTotal(0)
    }
  }, [selectedCompanyId, monthFilter])

  useEffect(() => {
    if (selectedCompanyId && paymentsPage > 0) loadPayments(selectedCompanyId, paymentsPage, rangeStart, rangeEnd)
  }, [selectedCompanyId, paymentsPage, monthFilter])

  useEffect(() => {
    if (selectedCompanyId && payoutsPage > 0) loadPayouts(selectedCompanyId, payoutsPage, rangeStart, rangeEnd)
  }, [selectedCompanyId, payoutsPage, monthFilter])

  const monthLabel = monthFilter
    ? new Date(monthFilter + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    : ''

  const selectedCompany = companies.find((c) => c.id === selectedCompanyId)

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-aumigo-teal">Financeiro</h1>
        <p className="text-sm text-aumigo-gray mt-1 line-clamp-2 sm:line-clamp-none">
          Visão do sistema: totais gerais e saldo por empresa (bruto, taxas, líquido e repasses)
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 mt-3 sm:mt-4">
          <label className="text-sm font-medium text-aumigo-gray">Mês</label>
          <input
            type="month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="rounded-lg border border-aumigo-teal/20 bg-white px-3 py-2.5 text-base sm:text-sm text-aumigo-teal focus:border-aumigo-teal focus:outline-none focus:ring-1 focus:ring-aumigo-teal w-full sm:w-auto min-h-[44px] touch-manipulation"
          />
          <span className="text-sm text-aumigo-gray capitalize">{monthLabel}</span>
        </div>
      </div>

      {/* Visão geral: totais de todas as empresas */}
      <Card className="border-aumigo-teal/20 bg-aumigo-teal/5">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-base font-semibold text-aumigo-teal">
            Visão geral — Todas as empresas
          </CardTitle>
          <p className="text-xs text-aumigo-gray mt-0.5">
            Saldos e taxas somados de todo o sistema · {monthLabel}
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loadingGlobal ? (
            <div className="flex items-center gap-2 py-6 text-aumigo-gray">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Carregando totais…</span>
            </div>
          ) : globalBalance ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-lg border border-aumigo-teal/10 bg-white p-4">
                <p className="text-xs font-medium text-aumigo-gray">Saldo bruto total</p>
                <p className="text-xl font-semibold text-aumigo-teal mt-1">
                  {formatCurrency(globalBalance.saldoBruto)}
                </p>
                <p className="text-xs text-aumigo-gray mt-1">
                  {globalBalance.totalPagamentos} pagamento(s)
                </p>
              </div>
              <div className="rounded-lg border border-aumigo-teal/10 bg-white p-4">
                <p className="text-xs font-medium text-aumigo-gray">Taxas totais</p>
                <p className="text-xl font-semibold text-aumigo-orange mt-1">
                  {formatCurrency(globalBalance.taxas)}
                </p>
                {(globalBalance.taxaGateway != null || globalBalance.taxaPlataforma != null) && (
                  <p className="text-xs text-aumigo-gray mt-1">
                    Gateway: {formatCurrency(globalBalance.taxaGateway ?? 0)} · Plataforma: {formatCurrency(globalBalance.taxaPlataforma ?? 0)}
                  </p>
                )}
              </div>
              <div className="rounded-lg border border-aumigo-teal/10 bg-white p-4">
                <p className="text-xs font-medium text-aumigo-gray">Saldo líquido total</p>
                <p className="text-xl font-semibold text-aumigo-teal mt-1">
                  {formatCurrency(globalBalance.saldoLiquido)}
                </p>
              </div>
              <div className="rounded-lg border border-aumigo-teal/10 bg-white p-4">
                <p className="text-xs font-medium text-aumigo-gray">Saldo disponível total</p>
                <p className="text-xl font-semibold text-aumigo-teal mt-1">
                  {formatCurrency(globalBalance.saldoDisponivel)}
                </p>
                <p className="text-xs text-aumigo-gray mt-1">
                  {globalBalance.totalRepasses} repasse(s) — {formatCurrency(globalBalance.totalRepassado)} repassado(s)
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-aumigo-gray py-2">Nenhum dado de saldo disponível.</p>
          )}
        </CardContent>
      </Card>
      <Card className="border-aumigo-teal/10">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-aumigo-gray space-y-1 px-4 sm:px-6">
              <p>
                <strong className="text-aumigo-teal">Saldo bruto</strong> = total recebido dos
                agendamentos pagos.
              </p>
              <p>
                <strong className="text-aumigo-teal">Taxas</strong> = taxa do gateway de pagamento (por transação) + taxa da plataforma (10% sobre o bruto).
              </p>
              <p>
                <strong className="text-aumigo-teal">Saldo líquido</strong> = bruto menos taxas.
              </p>
              <p>
                <strong className="text-aumigo-teal">Saldo disponível</strong> = líquido menos o
                que já foi repassado para a empresa.
              </p>
            </CardContent>
          </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm font-medium text-aumigo-gray">Saldo por empresa</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2 w-full sm:w-auto">
          <Popover open={companyDropdownOpen} onOpenChange={setCompanyDropdownOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={loadingCompanies || companies.length === 0}
                className="w-full sm:w-[280px] md:w-[320px] justify-between border-aumigo-teal/20 text-aumigo-teal hover:bg-aumigo-teal/5 min-h-[44px] touch-manipulation"
              >
                <span className="flex items-center gap-2 truncate">
                  <Building2 className="h-4 w-4 shrink-0 text-aumigo-teal" />
                  {selectedCompany ? selectedCompany.name : 'Selecione uma empresa'}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[280px] max-w-[95vw] sm:w-[320px] p-0" align="start">
              <Command className="rounded-lg border-0 shadow-none">
                <CommandInput placeholder="Buscar empresa..." className="h-9" />
                <CommandList>
                  <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                  <CommandGroup>
                    {companies.map((c) => (
                      <CommandItem
                        key={c.id}
                        value={c.name}
                        onSelect={() => {
                          setSelectedCompanyId(c.id)
                          setCompanyDropdownOpen(false)
                        }}
                        className="cursor-pointer"
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedCompanyId === c.id ? 'opacity-100' : 'opacity-0'}`} />
                        <span className="truncate">{c.name}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            onClick={() => selectedCompanyId && loadBalance(selectedCompanyId, rangeStart, rangeEnd)}
            disabled={loading || !selectedCompanyId}
            className="border-aumigo-teal/20 w-full sm:w-10 min-h-[44px] sm:min-h-[40px] touch-manipulation"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {loadingCompanies && (
        <div className="flex items-center gap-2 text-sm text-aumigo-gray">
          <Loader2 className="h-4 w-4 animate-spin" />
          Carregando empresas…
        </div>
      )}

      {!loadingCompanies && companies.length === 0 && (
        <Card className="border-aumigo-teal/10">
          <CardContent className="py-10 text-center text-aumigo-gray">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nenhuma empresa cadastrada</p>
            <p className="text-sm mt-1">Cadastre empresas para visualizar o financeiro.</p>
            <Button
              variant="outline"
              className="mt-4 border-aumigo-teal/20 text-aumigo-teal"
              onClick={() => onNavigate('companies')}
            >
              Ir para Empresas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {!loadingCompanies && companies.length > 0 && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {!loadingCompanies && companies.length > 0 && loading && !balance && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
        </div>
      )}

      {!loadingCompanies && companies.length > 0 && balance && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-aumigo-teal/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aumigo-gray">
                  Saldo bruto
                </CardTitle>
                <CreditCard className="h-5 w-5 text-aumigo-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-aumigo-teal">
                  {formatCurrency(balance.saldoBruto)}
                </div>
                <p className="text-xs text-aumigo-gray mt-1">
                  {balance.totalPagamentos} pagamento(s) recebido(s)
                </p>
              </CardContent>
            </Card>

            <Card className="border-aumigo-teal/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aumigo-gray">
                  Taxas
                </CardTitle>
                <Receipt className="h-5 w-5 text-aumigo-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-aumigo-orange">
                  {formatCurrency(balance.taxas)}
                </div>
                {(balance.taxaGateway != null || balance.taxaPlataforma != null) && (
                  <div className="text-xs text-aumigo-gray mt-2 space-y-0.5">
                    <p>Taxa gateway: {formatCurrency(balance.taxaGateway ?? 0)}</p>
                    <p>Taxa plataforma (10%): {formatCurrency(balance.taxaPlataforma ?? 0)}</p>
                  </div>
                )}
                {balance.taxaGateway == null && balance.taxaPlataforma == null && (
                  <p className="text-xs text-aumigo-gray mt-1">Total das taxas</p>
                )}
                <Collapsible className="mt-2" open={showFeeDetails} onOpenChange={setShowFeeDetails}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-aumigo-teal hover:text-aumigo-teal/80 p-0">
                      Ver detalhes
                      {showFeeDetails ? (
                        <ChevronUp className="ml-1 h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="ml-1 h-3.5 w-3.5" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 pt-3 border-t border-aumigo-teal/10 text-xs text-aumigo-gray space-y-2">
                      <p>
                        <strong className="text-aumigo-teal">Taxa do gateway de pagamento</strong> — Cobrada por transação conforme o meio de pagamento: valor fixo por PIX e boleto; no cartão, valor fixo + percentual sobre o bruto. Esse custo é repassado pelo provedor de pagamento.
                      </p>
                      <p>
                        <strong className="text-aumigo-teal">Taxa da plataforma (10%)</strong> — Percentual sobre o valor bruto de cada pagamento, retido pela plataforma para custeio e manutenção do serviço.
                      </p>
                      <p>
                        O <strong>saldo líquido</strong> é o valor bruto menos a soma das duas taxas; o <strong>saldo disponível</strong> é o líquido menos o que já foi repassado para a empresa.
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            <Card className="border-aumigo-teal/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aumigo-gray">
                  Saldo líquido
                </CardTitle>
                <TrendingUp className="h-5 w-5 text-aumigo-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-aumigo-teal">
                  {formatCurrency(balance.saldoLiquido)}
                </div>
                <p className="text-xs text-aumigo-gray mt-1">Após descontar taxas</p>
              </CardContent>
            </Card>

            <Card className="border-aumigo-teal/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aumigo-gray">
                  Saldo disponível
                </CardTitle>
                <DollarSign className="h-5 w-5 text-aumigo-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-aumigo-teal">
                  {formatCurrency(balance.saldoDisponivel)}
                </div>
                <p className="text-xs text-aumigo-gray mt-1">
                  Líquido menos repasses ({balance.totalRepasses} repasse(s) –{' '}
                  {formatCurrency(balance.totalRepassado)})
                </p>
              </CardContent>
            </Card>
          </div>

         
          <Card className="border-aumigo-teal/10">
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4 shrink-0" />
                Histórico
              </CardTitle>
              <p className="text-sm text-aumigo-gray">Transações e repasses da empresa selecionada</p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Tabs defaultValue="transactions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 h-auto min-h-[44px] p-1">
                  <TabsTrigger value="transactions" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 touch-manipulation">
                    <Receipt className="h-4 w-4 shrink-0" />
                    <span className="truncate">Transações</span>
                    {paymentsTotal > 0 && (
                      <Badge variant="secondary" className="text-xs shrink-0">{paymentsTotal}</Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="payouts" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 touch-manipulation">
                    <ListOrdered className="h-4 w-4 shrink-0" />
                    <span className="truncate">Repasses</span>
                    {payoutsTotal > 0 && (
                      <Badge variant="secondary" className="text-xs shrink-0">{payoutsTotal}</Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-3">
                  {loadingPayments ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-aumigo-teal" />
                    </div>
                  ) : payments.length === 0 ? (
                    <p className="text-sm text-aumigo-gray py-6 text-center">Nenhuma transação encontrada.</p>
                  ) : (
                    <>
                      <div className="rounded-md border border-aumigo-teal/10 overflow-x-auto -mx-1 sm:mx-0">
                        <Table className="min-w-[640px]">
                          <TableHeader>
                            <TableRow className="border-aumigo-teal/10">
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Data</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Valor</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Taxa gateway</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Taxa plataforma</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Líquido</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Status</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Método</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Cliente</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.map((p) => (
                              <TableRow key={p.id} className="border-aumigo-teal/5">
                                <TableCell className="text-xs sm:text-sm py-3">{formatDate(p.createdAt)}</TableCell>
                                <TableCell className="font-medium text-sm py-3">{formatCurrency(p.amountReais ?? p.amount / 100)}</TableCell>
                                <TableCell className="text-aumigo-orange text-xs sm:text-sm py-3">{formatCurrency(p.gatewayFeeReais ?? 0)}</TableCell>
                                <TableCell className="text-aumigo-orange text-xs sm:text-sm py-3">{formatCurrency(p.platformFeeReais ?? 0)}</TableCell>
                                <TableCell className="text-sm py-3">{formatCurrency(p.netAmountReais ?? p.netAmount / 100)}</TableCell>
                                <TableCell className="py-3">
                                  <Badge variant={p.status === 'PAID' ? 'default' : 'secondary'} className="text-xs">
                                    {getPaymentStatusLabel(p.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm py-3">{getPaymentMethodLabel(p.method)}</TableCell>
                                <TableCell className="text-xs sm:text-sm py-3">{p.customer?.name ?? '–'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {paymentsTotal > PAGE_SIZE && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm pt-2">
                          <span className="text-aumigo-gray order-2 sm:order-1">
                            {paymentsTotal} registro(s) · Página {paymentsPage}
                          </span>
                          <div className="flex gap-1 order-1 sm:order-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={paymentsPage <= 1 || loadingPayments}
                              onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))}
                              className="min-h-[40px] min-w-[40px] touch-manipulation"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={paymentsPage * PAGE_SIZE >= paymentsTotal || loadingPayments}
                              onClick={() => setPaymentsPage((p) => p + 1)}
                              className="min-h-[40px] min-w-[40px] touch-manipulation"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="payouts" className="space-y-3">
                  {loadingPayouts ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-aumigo-teal" />
                    </div>
                  ) : payouts.length === 0 ? (
                    <p className="text-sm text-aumigo-gray py-6 text-center">Nenhum repasse encontrado.</p>
                  ) : (
                    <>
                      <div className="rounded-md border border-aumigo-teal/10 overflow-x-auto -mx-1 sm:mx-0">
                        <Table className="min-w-[520px]">
                          <TableHeader>
                            <TableRow className="border-aumigo-teal/10">
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Data</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Referência</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Valor</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Status</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Agendado</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Pago em</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payouts.map((p) => (
                              <TableRow key={p.id} className="border-aumigo-teal/5">
                                <TableCell className="text-xs sm:text-sm py-3">{formatDate(p.createdAt)}</TableCell>
                                <TableCell className="font-mono text-xs sm:text-sm py-3">{p.reference}</TableCell>
                                <TableCell className="font-medium text-sm py-3">{formatCurrency(p.netAmountReais ?? p.netAmount / 100)}</TableCell>
                                <TableCell className="py-3">
                                  <Badge variant={p.status === 'PAID' ? 'default' : 'secondary'} className="text-xs">
                                    {getPayoutStatusLabel(p.status)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-xs sm:text-sm py-3">{formatDate(p.scheduledFor)}</TableCell>
                                <TableCell className="text-xs sm:text-sm py-3">{formatDate(p.paidAt ?? '')}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {payoutsTotal > PAGE_SIZE && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm pt-2">
                          <span className="text-aumigo-gray order-2 sm:order-1">
                            {payoutsTotal} registro(s) · Página {payoutsPage}
                          </span>
                          <div className="flex gap-1 order-1 sm:order-2">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={payoutsPage <= 1 || loadingPayouts}
                              onClick={() => setPayoutsPage((p) => Math.max(1, p - 1))}
                              className="min-h-[40px] min-w-[40px] touch-manipulation"
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={payoutsPage * PAGE_SIZE >= payoutsTotal || loadingPayouts}
                              onClick={() => setPayoutsPage((p) => p + 1)}
                              className="min-h-[40px] min-w-[40px] touch-manipulation"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {companies.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-2 pt-4">
          <Button
            variant="outline"
            className="border-aumigo-teal/20 text-aumigo-teal w-full sm:w-auto min-h-[44px] touch-manipulation"
            onClick={() => onNavigate('companies')}
          >
            <Building2 className="h-4 w-4 mr-2" />
            Empresas
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="border-aumigo-teal/20 text-aumigo-teal w-full sm:w-auto min-h-[44px] touch-manipulation"
            onClick={() => onNavigate('dashboard')}
          >
            Voltar ao Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
