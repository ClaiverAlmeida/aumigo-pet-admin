import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from './ui/command'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import { Badge } from './ui/badge'
import {
  DollarSign,
  Loader2,
  RefreshCw,
  Building2,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Wallet,
  MoreHorizontal,
  CircleDollarSign,
  XCircle,
  Clock,
  Zap,
  Eye,
  FileText,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { companiesService, type Company, type CompanyPayoutDetails } from '../services/companies.service'
import {
  financeService,
  type PayoutItem,
  getPayoutStatusLabel,
} from '../services/finance.service'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '–'

const formatDateTime = (dateStr: string) =>
  dateStr ? new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–'

const PAGE_SIZE = 15
const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos' },
  { value: 'PENDING_APPROVAL', label: 'Aguardando liberação' },
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'PROCESSING', label: 'Processando' },
  { value: 'PAID', label: 'Pago' },
  { value: 'FAILED', label: 'Falhou' },
]

interface AdminRepassesProps {
  onNavigate: (page: string) => void
}

/**
 * Tela dedicada a Repasses no admin: listagem, filtros e liberação de saques solicitados pelos profissionais.
 */
export function AdminRepasses({ onNavigate }: AdminRepassesProps) {
  const [payouts, setPayouts] = useState<PayoutItem[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<Company[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [companyFilterId, setCompanyFilterId] = useState<string | null>(null)
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [executingId, setExecutingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [payoutDetailsOpen, setPayoutDetailsOpen] = useState(false)
  const [payoutDetailsCompanyId, setPayoutDetailsCompanyId] = useState<string | null>(null)
  const [payoutDetailsCompanyName, setPayoutDetailsCompanyName] = useState<string>('')
  const [payoutDetailsLoading, setPayoutDetailsLoading] = useState(false)
  const [payoutDetailsData, setPayoutDetailsData] = useState<CompanyPayoutDetails | null>(null)
  const [payoutDetailsError, setPayoutDetailsError] = useState<string | null>(null)
  const [loadingReceiptId, setLoadingReceiptId] = useState<string | null>(null)

  const PAYOUT_STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'SCHEDULED', label: 'Liberar (Agendado)' },
    { value: 'PROCESSING', label: 'Processando' },
    { value: 'PAID', label: 'Marcar como pago' },
    { value: 'FAILED', label: 'Marcar como falhou' },
  ]

  const loadCompanies = async () => {
    setLoadingCompanies(true)
    const res = await companiesService.listCompanies(1, 200)
    setLoadingCompanies(false)
    if (res.success && res.data?.data) {
      setCompanies(res.data.data)
    }
  }

  const loadPayouts = async (page: number) => {
    setLoading(true)
    setError(null)
    const res = await financeService.listPayoutsForAdmin({
      status: statusFilter === 'all' ? undefined : statusFilter,
      companyId: companyFilterId || undefined,
      page,
      limit: PAGE_SIZE,
    })
    setLoading(false)
    if (res.success && res.data) {
      setPayouts(res.data.data)
      const pag = res.data.pagination ?? { page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 }
      setPagination(pag)
    } else {
      setPayouts([])
      setError(res.error ?? 'Erro ao carregar repasses')
    }
  }

  useEffect(() => {
    loadCompanies()
  }, [])

  useEffect(() => {
    loadPayouts(pagination.page)
  }, [statusFilter, companyFilterId, pagination.page])

  const handleApprove = async (id: string) => {
    setApprovingId(id)
    setError(null)
    const res = await financeService.approvePayout(id)
    setApprovingId(null)
    if (res.success) {
      loadPayouts(pagination.page)
    } else {
      setError(res.error ?? 'Erro ao liberar repasse')
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setStatusUpdatingId(id)
    setError(null)
    const res = await financeService.updatePayoutStatus(id, newStatus)
    setStatusUpdatingId(null)
    if (res.success) {
      loadPayouts(pagination.page)
    } else {
      setError(res.error ?? 'Erro ao atualizar status')
    }
  }

  const handleExecutePayout = async (id: string) => {
    setExecutingId(id)
    setError(null)
    const res = await financeService.executePayout(id)
    setExecutingId(null)
    if (res.success) {
      loadPayouts(pagination.page)
    } else {
      setError(res.error ?? 'Erro ao realizar pagamento')
    }
  }

  const handleOpenPayoutDetails = (companyId: string, companyName: string) => {
    setPayoutDetailsCompanyId(companyId)
    setPayoutDetailsCompanyName(companyName)
    setPayoutDetailsData(null)
    setPayoutDetailsError(null)
    setPayoutDetailsOpen(true)
  }

  useEffect(() => {
    if (!payoutDetailsOpen || !payoutDetailsCompanyId) return
    let cancelled = false
    setPayoutDetailsLoading(true)
    setPayoutDetailsError(null)
    companiesService.getCompanyPayoutDetails(payoutDetailsCompanyId).then((res) => {
      if (cancelled) return
      setPayoutDetailsLoading(false)
      if (res.success) {
        setPayoutDetailsData(res.data ?? null)
        setPayoutDetailsError(null)
      } else {
        setPayoutDetailsData(null)
        setPayoutDetailsError(res.error ?? 'Erro ao carregar dados')
      }
    })
    return () => { cancelled = true }
  }, [payoutDetailsOpen, payoutDetailsCompanyId])

  const selectedCompany = companies.find((c) => c.id === companyFilterId)

  const hasPixData = (d: CompanyPayoutDetails | null) =>
    d?.payoutPixKey && String(d.payoutPixKey).trim() && d?.payoutPixKeyType
  const hasBankData = (d: CompanyPayoutDetails | null) =>
    d?.payoutBankCode && d?.payoutBankAgency && d?.payoutBankAccount && d?.payoutBankAccountDigit &&
    d?.payoutBankOwnerName && d?.payoutBankCpfCnpj && d?.payoutBankAccountType

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
        loadPayouts(pagination.page)
      } else {
        setError(res.error ?? 'Comprovante ainda não disponível. Tente novamente em instantes.')
      }
      return
    }
    setError('Comprovante disponível apenas para repasses pagos via plataforma.')
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-aumigo-teal">Repasses</h1>
        <p className="text-sm text-aumigo-gray mt-1 line-clamp-2 sm:line-clamp-none">
          Gestão e liberação de saques solicitados pelos profissionais. Aprove repasses aguardando liberação para agendar o pagamento.
        </p>
      </div>

      <Card className="border-aumigo-teal/10">
        <CardHeader className="pb-2 px-4 sm:px-6">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4 shrink-0" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end px-4 sm:px-6">
          <div className="space-y-1 w-full sm:w-auto">
            <label className="text-xs font-medium text-aumigo-gray">Status</label>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPagination((prev) => ({ ...prev, page: 1 }))
              }}
            >
              <SelectTrigger className="w-full sm:w-[200px] border-aumigo-teal/20 min-h-[44px] touch-manipulation">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-full sm:w-auto">
            <label className="text-xs font-medium text-aumigo-gray">Empresa</label>
            <Popover open={companyDropdownOpen} onOpenChange={setCompanyDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full sm:w-[280px] justify-between border-aumigo-teal/20 text-aumigo-teal hover:bg-aumigo-teal/5 min-h-[44px] touch-manipulation"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 shrink-0 text-aumigo-teal" />
                    {selectedCompany ? selectedCompany.name : 'Todas'}
                  </span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] min-w-[260px] max-w-[95vw] sm:w-[280px] p-0" align="start">
                <Command className="rounded-lg border-0 shadow-none">
                  <CommandInput placeholder="Buscar empresa..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Nenhuma empresa encontrada.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        value="todas"
                        onSelect={() => {
                          setCompanyFilterId(null)
                          setCompanyDropdownOpen(false)
                          setPagination((prev) => ({ ...prev, page: 1 }))
                        }}
                        className="cursor-pointer"
                      >
                        <Check className={`mr-2 h-4 w-4 ${!companyFilterId ? 'opacity-100' : 'opacity-0'}`} />
                        Todas
                      </CommandItem>
                      {companies.map((c) => (
                        <CommandItem
                          key={c.id}
                          value={c.name}
                          onSelect={() => {
                            setCompanyFilterId(c.id)
                            setCompanyDropdownOpen(false)
                            setPagination((prev) => ({ ...prev, page: 1 }))
                          }}
                          className="cursor-pointer"
                        >
                          <Check className={`mr-2 h-4 w-4 ${companyFilterId === c.id ? 'opacity-100' : 'opacity-0'}`} />
                          <span className="truncate">{c.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadPayouts(pagination.page)}
            disabled={loading}
            className="border-aumigo-teal/20 mt-6 w-full sm:w-auto min-h-[44px] sm:min-h-[36px] touch-manipulation"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <Card className="border-aumigo-teal/10">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base">Lista de repasses</CardTitle>
          <p className="text-sm text-aumigo-gray">
            {pagination.total} registro(s)
          </p>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {loading && payouts.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-aumigo-gray">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : payouts.length === 0 ? (
            <p className="text-sm text-aumigo-gray py-8 text-center">Nenhum repasse encontrado.</p>
          ) : (
            <>
              <div className="rounded-md border border-aumigo-teal/10 overflow-x-auto -mx-1 sm:mx-0">
                <Table className="min-w-[680px]">
                  <TableHeader>
                    <TableRow className="border-aumigo-teal/10">
                      <TableHead className="text-aumigo-teal text-xs sm:text-sm">Empresa</TableHead>
                      <TableHead className="text-aumigo-teal text-xs sm:text-sm">Referência</TableHead>
                      <TableHead className="text-aumigo-teal text-xs sm:text-sm">Valor líquido</TableHead>
                      <TableHead className="text-aumigo-teal text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-aumigo-teal text-xs sm:text-sm">Solicitado em</TableHead>
                      <TableHead className="text-aumigo-teal text-xs sm:text-sm">Agendado</TableHead>
                      <TableHead className="text-aumigo-teal text-xs sm:text-sm">Pago em</TableHead>
                      <TableHead className="text-aumigo-teal text-xs sm:text-sm text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((p) => (
                      <TableRow key={p.id} className="border-aumigo-teal/5">
                        <TableCell className="text-xs sm:text-sm font-medium py-3">
                          {p.company?.name ?? '–'}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-aumigo-gray py-3">{p.reference}</TableCell>
                        <TableCell className="font-medium text-aumigo-teal text-sm py-3">
                          {formatCurrency(p.netAmountReais ?? p.netAmount / 100)}
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge
                            variant={p.status === 'PENDING_APPROVAL' ? 'secondary' : p.status === 'PAID' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {getPayoutStatusLabel(p.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-aumigo-gray py-3">{formatDateTime(p.createdAt)}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-3">{formatDate(p.scheduledFor)}</TableCell>
                        <TableCell className="text-xs sm:text-sm text-aumigo-gray py-3">
                          {p.paidAt ? formatDate(p.paidAt) : '–'}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          {(approvingId === p.id || statusUpdatingId === p.id || executingId === p.id || loadingReceiptId === p.id) ? (
                            <Loader2 className="h-4 w-4 animate-spin inline-block text-aumigo-teal" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="min-h-[40px] touch-manipulation border-aumigo-teal/20 text-aumigo-teal"
                                >
                                  <MoreHorizontal className="h-4 w-4 mr-1" />
                                  Ações
                                  <ChevronDown className="h-4 w-4 ml-1" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="min-w-[240px]">
                                {p.company?.id && (
                                  <DropdownMenuItem
                                    onClick={() => handleOpenPayoutDetails(p.company!.id, p.company!.name ?? 'Empresa')}
                                    className="cursor-pointer"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Ver dados de pagamento
                                  </DropdownMenuItem>
                                )}
                                {p.status === 'PAID' && (p.receiptUrl || p.asaasTransferId) && (
                                  <DropdownMenuItem
                                    onClick={() => handleViewReceipt(p)}
                                    disabled={loadingReceiptId === p.id}
                                    className="cursor-pointer"
                                  >
                                    {loadingReceiptId === p.id ? (
                                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : (
                                      <FileText className="h-4 w-4 mr-2" />
                                    )}
                                    {p.receiptUrl ? 'Ver comprovante' : 'Buscar comprovante'}
                                  </DropdownMenuItem>
                                )}
                                {(p.status === 'PENDING_APPROVAL' || p.status === 'SCHEDULED') && (
                                  <>
                                    {p.company?.hasPayoutData ? (
                                      <DropdownMenuItem
                                        onClick={() => handleExecutePayout(p.id)}
                                        className="cursor-pointer text-aumigo-teal font-medium"
                                      >
                                        <Zap className="h-4 w-4 mr-2" />
                                        Realizar pagamento via plataforma (PIX/TED)
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem disabled className="opacity-70">
                                        <Zap className="h-4 w-4 mr-2" />
                                        Realizar pagamento (cadastre PIX/conta na empresa)
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                                {p.status === 'PENDING_APPROVAL' && (
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(p.id)}
                                    className="cursor-pointer"
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Apenas liberar (agendado)
                                  </DropdownMenuItem>
                                )}
                                {PAYOUT_STATUS_OPTIONS.filter(
                                  (opt) => opt.value !== p.status && !(p.status === 'PENDING_APPROVAL' && opt.value === 'SCHEDULED'),
                                ).map((opt) => (
                                  <DropdownMenuItem
                                    key={opt.value}
                                    onClick={() => handleUpdateStatus(p.id, opt.value)}
                                    className="cursor-pointer"
                                    variant={opt.value === 'FAILED' ? 'destructive' : 'default'}
                                  >
                                    {opt.value === 'PAID' && <CircleDollarSign className="h-4 w-4 mr-2" />}
                                    {opt.value === 'FAILED' && <XCircle className="h-4 w-4 mr-2" />}
                                    {opt.value === 'PROCESSING' && <Loader2 className="h-4 w-4 mr-2" />}
                                    {opt.value === 'SCHEDULED' && p.status !== 'PENDING_APPROVAL' && <Clock className="h-4 w-4 mr-2" />}
                                    {opt.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm mt-4">
                  <span className="text-aumigo-gray order-2 sm:order-1">
                    {pagination.total} registro(s) · Página {pagination.page}
                  </span>
                  <div className="flex gap-1 order-1 sm:order-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1 || loading}
                      onClick={() => setPagination((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      className="min-h-[40px] min-w-[40px] touch-manipulation"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages || loading}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="min-h-[40px] min-w-[40px] touch-manipulation"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
        <Button
          variant="outline"
          className="border-aumigo-teal/20 text-aumigo-teal w-full sm:w-auto min-h-[44px] touch-manipulation"
          onClick={() => onNavigate('finance')}
        >
          <DollarSign className="h-4 w-4 mr-2" />
          Financeiro
        </Button>
        <Button
          variant="outline"
          className="border-aumigo-teal/20 text-aumigo-teal w-full sm:w-auto min-h-[44px] touch-manipulation"
          onClick={() => onNavigate('dashboard')}
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>

      <Dialog open={payoutDetailsOpen} onOpenChange={(open) => { setPayoutDetailsOpen(open); if (!open) setPayoutDetailsCompanyId(null) }}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-aumigo-teal">Dados para pagamento — {payoutDetailsCompanyName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {payoutDetailsLoading && (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
              </div>
            )}
            {!payoutDetailsLoading && payoutDetailsError && (
              <p className="text-sm text-destructive">{payoutDetailsError}</p>
            )}
            {!payoutDetailsLoading && !payoutDetailsError && payoutDetailsData && (
              <>
                {hasPixData(payoutDetailsData) ? (
                  <div className="rounded-lg border border-aumigo-teal/20 bg-muted/30 p-4 space-y-2">
                    <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">PIX</p>
                    <p><span className="text-aumigo-gray">Tipo:</span> {payoutDetailsData.payoutPixKeyType}</p>
                    <p className="break-all"><span className="text-aumigo-gray">Chave:</span> {payoutDetailsData.payoutPixKey}</p>
                  </div>
                ) : null}
                {hasBankData(payoutDetailsData) ? (
                  <div className="rounded-lg border border-aumigo-teal/20 bg-muted/30 p-4 space-y-2">
                    <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Conta bancária (TED)</p>
                    <p><span className="text-aumigo-gray">Banco:</span> {payoutDetailsData.payoutBankCode}</p>
                    <p><span className="text-aumigo-gray">Agência:</span> {payoutDetailsData.payoutBankAgency}</p>
                    <p><span className="text-aumigo-gray">Conta:</span> {payoutDetailsData.payoutBankAccount}-{payoutDetailsData.payoutBankAccountDigit}</p>
                    <p><span className="text-aumigo-gray">Titular:</span> {payoutDetailsData.payoutBankOwnerName}</p>
                    <p><span className="text-aumigo-gray">CPF/CNPJ:</span> {payoutDetailsData.payoutBankCpfCnpj}</p>
                    <p><span className="text-aumigo-gray">Tipo:</span> {payoutDetailsData.payoutBankAccountType === 'CONTA_CORRENTE' ? 'Conta corrente' : 'Conta poupança'}</p>
                  </div>
                ) : null}
                {!hasPixData(payoutDetailsData) && !hasBankData(payoutDetailsData) && (
                  <p className="text-sm text-aumigo-gray">Nenhum dado de pagamento cadastrado para esta empresa.</p>
                )}
              </>
            )}
            {!payoutDetailsLoading && !payoutDetailsError && !payoutDetailsData && (
              <p className="text-sm text-aumigo-gray">Nenhum dado de pagamento cadastrado para esta empresa.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
