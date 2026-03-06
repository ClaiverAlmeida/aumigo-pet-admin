import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Loader2,
  Wallet,
  RefreshCw,
  History,
  ListOrdered,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { companiesService, type CompanyBalance } from '../services/companies.service'
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

const formatDateShort = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–'

function getCurrentMonthStr(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function getMonthRange(monthStr: string): { startDate: string; endDate: string } {
  const [y, m] = monthStr.split('-').map(Number)
  const startDate = `${y}-${String(m).padStart(2, '0')}-01`
  const lastDay = new Date(y, m, 0).getDate()
  const endDate = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  return { startDate, endDate }
}

const PAGE_SIZE = 10

export function ProFinance() {
  const [companyId, setCompanyId] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState<string>('')
  const [monthFilter, setMonthFilter] = useState<string>(() => getCurrentMonthStr())
  const [balance, setBalance] = useState<CompanyBalance | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingCompany, setLoadingCompany] = useState(true)
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
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null)

  const [requestLoading, setRequestLoading] = useState(false)
  const [requestMessage, setRequestMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [valorSaque, setValorSaque] = useState<string>('')

  const { startDate: rangeStart, endDate: rangeEnd } = getMonthRange(monthFilter)
  const monthLabel = monthFilter ? new Date(monthFilter + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : ''

  useEffect(() => {
    let cancelled = false
    setLoadingCompany(true)
    companiesService.getMyCompany().then((res) => {
      if (cancelled) return
      setLoadingCompany(false)
      if (res.success && res.data) {
        const data = res.data as { id?: string; name?: string }
        const id = data?.id ?? null
        setCompanyId(id)
        setCompanyName((data as { name?: string })?.name ?? '')
      } else {
        setCompanyId(null)
      }
    })
    return () => { cancelled = true }
  }, [])

  const loadBalance = async () => {
    if (!companyId) return
    setLoading(true)
    setError(null)
    const res = await companiesService.getCompanyBalance(companyId, rangeStart, rangeEnd)
    setLoading(false)
    if (res.success && res.data) {
      setBalance(res.data)
      setError(null)
    } else {
      setError(res.error ?? 'Erro ao carregar saldo')
      setBalance(null)
    }
  }

  const loadPayments = async (page: number) => {
    if (!companyId) return
    setLoadingPayments(true)
    const res = await financeService.getPaymentsByCompany(companyId, page, PAGE_SIZE, rangeStart, rangeEnd)
    setLoadingPayments(false)
    if (res.success && res.data) {
      setPayments(res.data.data)
      setPaymentsTotal(res.data.pagination?.total ?? 0)
    } else {
      setPayments([])
      setPaymentsTotal(0)
    }
  }

  const loadPayouts = async (page: number) => {
    if (!companyId) return
    setLoadingPayouts(true)
    const res = await financeService.getPayoutsByCompany(companyId, page, PAGE_SIZE, rangeStart, rangeEnd)
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
    if (companyId) {
      loadBalance()
      setPaymentsPage(1)
      setPayoutsPage(1)
    } else {
      setBalance(null)
      setError(null)
    }
  }, [companyId, monthFilter])

  useEffect(() => {
    if (companyId && paymentsPage > 0) loadPayments(paymentsPage)
  }, [companyId, paymentsPage, monthFilter])

  useEffect(() => {
    if (companyId && payoutsPage > 0) loadPayouts(payoutsPage)
  }, [companyId, payoutsPage, monthFilter])

  const handleViewReceipt = async (p: PayoutItem) => {
    if (p.receiptUrl) {
      window.open(p.receiptUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (p.asaasTransferId) {
      setLoadingReceiptId(p.id)
      const res = await financeService.getPayoutReceipt(p.id)
      setLoadingReceiptId(null)
      if (res.success && res.receiptUrl) {
        window.open(res.receiptUrl, '_blank', 'noopener,noreferrer')
        loadPayouts(payoutsPage)
      } else {
        setError(res.error ?? 'Comprovante ainda não disponível. Tente novamente em instantes.')
      }
      return
    }
    setError('Comprovante disponível apenas para repasses pagos via plataforma.')
  }

  const handleRequestPayout = async () => {
    setRequestMessage(null)
    const amount = valorSaque.trim() ? parseFloat(valorSaque.replace(',', '.')) : undefined
    if (amount != null && (isNaN(amount) || amount <= 0)) {
      setRequestMessage({ type: 'error', text: 'Informe um valor válido para o saque.' })
      return
    }
    if (amount != null && balance && amount > balance.saldoDisponivel) {
      setRequestMessage({ type: 'error', text: 'Valor não pode ser maior que o saldo disponível.' })
      return
    }
    setRequestLoading(true)
    const res = await financeService.requestPayout(amount)
    setRequestLoading(false)
    if (res.success && res.data) {
      setRequestMessage({ type: 'success', text: `Saque solicitado: ${res.data.reference}. Aguarde a liberação.` })
      setValorSaque('')
      if (balance) setBalance({ ...balance, saldoDisponivel: Math.max(0, balance.saldoDisponivel - res.data.amountReais), hasPendingPayout: true })
      loadBalance()
    } else {
      setRequestMessage({ type: 'error', text: res.error ?? 'Erro ao solicitar saque' })
    }
  }

  const hasPendingPayout = balance?.hasPendingPayout === true
  const canRequestPayout = balance && balance.saldoDisponivel > 0 && !hasPendingPayout && !requestLoading

  if (loadingCompany) {
    return (
      <div className="p-4 sm:p-6 flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
      </div>
    )
  }

  if (!companyId) {
    return (
      <div className="p-4 sm:p-6 max-w-2xl mx-auto">
        <Card className="border-aumigo-teal/10">
          <CardContent className="py-8 sm:py-10 text-center text-aumigo-gray px-4">
            <p className="font-medium">Nenhuma empresa vinculada ao seu usuário.</p>
            <p className="text-sm mt-1">Entre em contato com o suporte para vincular sua empresa.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-aumigo-teal">Financeiro</h1>
        <p className="text-sm text-aumigo-gray mt-1 line-clamp-2 sm:line-clamp-none">
          Visão da sua empresa: saldo e histórico do mês · {companyName}
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

      {/* Solicitar saque */}
      <Card className="border-aumigo-teal/20 bg-aumigo-teal/5">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-base flex items-center gap-2 text-aumigo-teal">
            <Wallet className="h-4 w-4 shrink-0" />
            Solicitar saque
          </CardTitle>
          <CardDescription className="text-sm">
            Saldo disponível para saque. Após solicitar, o repasse será analisado e liberado pela administração.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 px-4 sm:px-6">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm text-aumigo-gray">Disponível:</span>
            <span className="text-lg sm:text-xl font-semibold text-aumigo-teal">
              {balance ? formatCurrency(balance.saldoDisponivel) : '–'}
            </span>
          </div>
          {!hasPendingPayout && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-aumigo-gray">Valor do saque (opcional)</label>
              <input
                type="text"
                inputMode="decimal"
                placeholder={balance ? `Máx: ${formatCurrency(balance.saldoDisponivel)}` : 'Valor em R$'}
                value={valorSaque}
                onChange={(e) => setValorSaque(e.target.value)}
                className="w-full rounded-lg border border-aumigo-teal/20 bg-white px-3 py-2.5 text-base text-aumigo-teal focus:border-aumigo-teal focus:outline-none focus:ring-1 focus:ring-aumigo-teal min-h-[44px]"
              />
              <p className="text-xs text-aumigo-gray">Deixe em branco para sacar o saldo disponível inteiro.</p>
            </div>
          )}
          {hasPendingPayout && (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              Há um saque em andamento. Aguarde a conclusão para solicitar outro.
            </p>
          )}
          <Button
            onClick={handleRequestPayout}
            disabled={!canRequestPayout}
            className="bg-aumigo-teal hover:bg-aumigo-teal/90 text-white shrink-0 w-full sm:w-auto min-h-[44px] touch-manipulation disabled:opacity-60"
          >
            {requestLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Solicitar saque
          </Button>
          {requestMessage && (
            <p className={`text-sm ${requestMessage.type === 'success' ? 'text-green-700' : 'text-red-600'}`}>
              {requestMessage.text}
            </p>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div>
      )}

      {loading && !balance ? (
        <div className="flex justify-center py-12 sm:py-16">
          <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
        </div>
      ) : balance && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="border-aumigo-teal/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aumigo-gray">Saldo bruto</CardTitle>
                <CreditCard className="h-5 w-5 text-aumigo-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-aumigo-teal">{formatCurrency(balance.saldoBruto)}</div>
                <p className="text-xs text-aumigo-gray mt-1">{balance.totalPagamentos} pagamento(s) recebido(s)</p>
              </CardContent>
            </Card>

            <Card className="border-aumigo-teal/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aumigo-gray">Taxas</CardTitle>
                <Receipt className="h-5 w-5 text-aumigo-orange" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-aumigo-orange">{formatCurrency(balance.taxas)}</div>
                {(balance.taxaGateway != null || balance.taxaPlataforma != null) && (
                  <div className="text-xs text-aumigo-gray mt-2 space-y-0.5">
                    <p>Taxa gateway: {formatCurrency(balance.taxaGateway ?? 0)}</p>
                    <p>Taxa plataforma (10%): {formatCurrency(balance.taxaPlataforma ?? 0)}</p>
                  </div>
                )}
                <Collapsible className="mt-2" open={showFeeDetails} onOpenChange={setShowFeeDetails}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-aumigo-teal hover:text-aumigo-teal/80 p-0">
                      Ver detalhes
                      {showFeeDetails ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 pt-3 border-t border-aumigo-teal/10 text-xs text-aumigo-gray space-y-2">
                      <p><strong className="text-aumigo-teal">Taxa do gateway</strong> — Cobrada por transação conforme o meio de pagamento.</p>
                      <p><strong className="text-aumigo-teal">Taxa da plataforma (10%)</strong> — Sobre o valor bruto de cada pagamento.</p>
                      <p>O <strong>saldo líquido</strong> é o bruto menos as taxas; o <strong>saldo disponível</strong> é o líquido menos o já repassado.</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>

            <Card className="border-aumigo-teal/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aumigo-gray">Saldo líquido</CardTitle>
                <TrendingUp className="h-5 w-5 text-aumigo-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-aumigo-teal">{formatCurrency(balance.saldoLiquido)}</div>
                <p className="text-xs text-aumigo-gray mt-1">Após descontar taxas</p>
              </CardContent>
            </Card>

            <Card className="border-aumigo-teal/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-aumigo-gray">Saldo disponível</CardTitle>
                <DollarSign className="h-5 w-5 text-aumigo-teal" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-aumigo-teal">{formatCurrency(balance.saldoDisponivel)}</div>
                <p className="text-xs text-aumigo-gray mt-1">
                  Líquido menos repasses ({balance.totalRepasses} repasse(s) – {formatCurrency(balance.totalRepassado)})
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-aumigo-teal/10">
            <CardHeader>
              <CardTitle className="text-base">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-aumigo-gray space-y-1">
              <p><strong className="text-aumigo-teal">Saldo bruto</strong> = total recebido dos agendamentos pagos no período.</p>
              <p><strong className="text-aumigo-teal">Taxas</strong> = taxa do gateway + taxa da plataforma (10% sobre o bruto).</p>
              <p><strong className="text-aumigo-teal">Saldo líquido</strong> = bruto menos taxas.</p>
              <p><strong className="text-aumigo-teal">Saldo disponível</strong> = líquido menos o que já foi repassado.</p>
            </CardContent>
          </Card>

          <Card className="border-aumigo-teal/10">
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <History className="h-4 w-4 shrink-0" />
                  Histórico
                </CardTitle>
                <p className="text-sm text-aumigo-gray mt-0.5">Transações e repasses da sua empresa · {monthLabel}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { loadBalance(); setPaymentsPage(1); setPayoutsPage(1); loadPayments(1); loadPayouts(1); }} disabled={loading} className="w-full sm:w-auto min-h-[40px] touch-manipulation">
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <Tabs defaultValue="transactions" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4 h-auto min-h-[44px] p-1">
                  <TabsTrigger value="transactions" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 touch-manipulation">
                    <Receipt className="h-4 w-4 shrink-0" />
                    <span className="truncate">Transações</span>
                    {paymentsTotal > 0 && <Badge variant="secondary" className="text-xs shrink-0">{paymentsTotal}</Badge>}
                  </TabsTrigger>
                  <TabsTrigger value="payouts" className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2.5 touch-manipulation">
                    <ListOrdered className="h-4 w-4 shrink-0" />
                    <span className="truncate">Repasses</span>
                    {payoutsTotal > 0 && <Badge variant="secondary" className="text-xs shrink-0">{payoutsTotal}</Badge>}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="transactions" className="space-y-3">
                  {loadingPayments ? (
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-aumigo-teal" /></div>
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
                          <span className="text-aumigo-gray order-2 sm:order-1">{paymentsTotal} registro(s) · Página {paymentsPage}</span>
                          <div className="flex gap-1 order-1 sm:order-2">
                            <Button variant="outline" size="sm" disabled={paymentsPage <= 1 || loadingPayments} onClick={() => setPaymentsPage((p) => Math.max(1, p - 1))} className="min-h-[40px] min-w-[40px] touch-manipulation">
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled={paymentsPage * PAGE_SIZE >= paymentsTotal || loadingPayments} onClick={() => setPaymentsPage((p) => p + 1)} className="min-h-[40px] min-w-[40px] touch-manipulation">
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
                    <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-aumigo-teal" /></div>
                  ) : payouts.length === 0 ? (
                    <p className="text-sm text-aumigo-gray py-6 text-center">Nenhum repasse encontrado.</p>
                  ) : (
                    <>
                      <div className="rounded-md border border-aumigo-teal/10 overflow-x-auto -mx-1 sm:mx-0">
                        <Table className="min-w-[600px]">
                          <TableHeader>
                            <TableRow className="border-aumigo-teal/10">
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Data</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Referência</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Valor</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Status</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Agendado</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm">Pago em</TableHead>
                              <TableHead className="text-aumigo-teal text-xs sm:text-sm text-right">Comprovante</TableHead>
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
                                <TableCell className="text-xs sm:text-sm py-3">{formatDateShort(p.scheduledFor)}</TableCell>
                                <TableCell className="text-xs sm:text-sm py-3">{p.paidAt ? formatDateShort(p.paidAt) : '–'}</TableCell>
                                <TableCell className="text-right py-3">
                                  {p.status === 'PAID' && (p.receiptUrl || p.asaasTransferId) ? (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs text-aumigo-teal hover:bg-aumigo-teal/10"
                                      onClick={() => handleViewReceipt(p)}
                                      disabled={loadingReceiptId === p.id}
                                    >
                                      {loadingReceiptId === p.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <>
                                          <FileText className="h-3.5 w-3.5 mr-1" />
                                          {p.receiptUrl ? 'Ver comprovante' : 'Buscar comprovante'}
                                        </>
                                      )}
                                    </Button>
                                  ) : (
                                    '–'
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      {payoutsTotal > PAGE_SIZE && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm pt-2">
                          <span className="text-aumigo-gray order-2 sm:order-1">{payoutsTotal} registro(s) · Página {payoutsPage}</span>
                          <div className="flex gap-1 order-1 sm:order-2">
                            <Button variant="outline" size="sm" disabled={payoutsPage <= 1 || loadingPayouts} onClick={() => setPayoutsPage((p) => Math.max(1, p - 1))} className="min-h-[40px] min-w-[40px] touch-manipulation">
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" disabled={payoutsPage * PAGE_SIZE >= payoutsTotal || loadingPayouts} onClick={() => setPayoutsPage((p) => p + 1)} className="min-h-[40px] min-w-[40px] touch-manipulation">
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
    </div>
  )
}
