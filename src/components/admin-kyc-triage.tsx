import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'
import { Textarea } from './ui/textarea'
import {
  CheckCircle2,
  FileCheck,
  FileWarning,
  Loader2,
  Search,
  XCircle,
  ExternalLink,
  RefreshCcw,
} from 'lucide-react'
import { kycDocumentsService, type KycDocument } from '../services/kyc-documents.service'
import { companiesService } from '../services/companies.service'
import { filesService } from '../services/files.service'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

type AdminKycStatusFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'

interface AdminKycTriageProps {
  onNavigate: (page: string) => void
}

interface GroupedKycByCompany {
  companyId: string
  companyName: string
  companyCity?: string | null
  companyState?: string | null
  companyCnpj?: string | null
  documents: KycDocument[]
}

type ViewMode = 'list' | 'detail'

const mapTypeToLabel = (type: string): string => {
  switch (type) {
    case 'CNPJ':
      return 'CNPJ / CPF profissional'
    case 'RG':
      return 'Documento com foto (RG / CNH)'
    case 'PROOF_OF_ADDRESS':
      return 'Comprovante de residência'
    case 'BANK_PROOF':
      return 'Comprovante de conta bancária'
    case 'CRMV':
      return 'CRMV'
    default:
      return 'Documento'
  }
}

const mapStatusToBadge = (status: 'PENDING' | 'APPROVED' | 'REJECTED') => {
  if (status === 'APPROVED') {
    return { label: 'Aprovado', className: 'bg-emerald-100 text-emerald-800' }
  }
  if (status === 'REJECTED') {
    return { label: 'Rejeitado', className: 'bg-red-100 text-red-800' }
  }
  return { label: 'Pendente', className: 'bg-amber-100 text-amber-800' }
}

const formatDateTime = (iso: string) => {
  try {
    return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return iso
  }
}

export function AdminKycTriage({ onNavigate }: AdminKycTriageProps) {
  const [statusFilter, setStatusFilter] = useState<AdminKycStatusFilter>('PENDING')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [documents, setDocuments] = useState<KycDocument[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedCompanyName, setSelectedCompanyName] = useState<string | null>(null)
  const [selectedCompanyMeta, setSelectedCompanyMeta] = useState<{
    name?: string
    cnpj?: string
    city?: string
    state?: string
    address?: string
    addressNumber?: string
    zipCode?: string
    contactEmail?: string
    contactPhone?: string
    usersCount?: number
    serviceProvidersCount?: number
    payoutPixKey?: string | null
    payoutPixKeyType?: string | null
    payoutBankCode?: string | null
    payoutBankAgency?: string | null
    payoutBankAccount?: string | null
    payoutBankAccountDigit?: string | null
    payoutBankOwnerName?: string | null
    payoutBankCpfCnpj?: string | null
    payoutBankAccountType?: string | null
  } | null>(null)
  const [loadingCompanyMeta, setLoadingCompanyMeta] = useState(false)
  const [loadingPayoutMeta, setLoadingPayoutMeta] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  } | null>(null)

  const PAGE_SIZE = 50

  const loadDocuments = async (filter: AdminKycStatusFilter, pageNum: number = 1) => {
    setLoading(true)
    try {
      const filters: { status?: string; page?: number; limit?: number } = {
        page: pageNum,
        limit: PAGE_SIZE,
      }
      if (filter !== 'ALL') {
        filters.status = filter
      }

      const res = await kycDocumentsService.list(filters)
      if (res.success && res.data) {
        const body = res.data as { data?: KycDocument[]; pagination?: typeof pagination }
        let list: KycDocument[] = []
        if (Array.isArray(body.data)) {
          list = body.data
        } else if (Array.isArray(res.data)) {
          list = res.data as KycDocument[]
        }
        setDocuments(list)
        if (body.pagination) {
          setPagination(body.pagination)
        } else {
          setPagination({
            page: pageNum,
            limit: PAGE_SIZE,
            total: list.length,
            totalPages: list.length < PAGE_SIZE ? 1 : Math.ceil(list.length / PAGE_SIZE),
            hasNextPage: list.length >= PAGE_SIZE,
            hasPreviousPage: pageNum > 1,
          })
        }
      } else {
        toast.error((res as any).error || 'Erro ao carregar documentos de KYC.')
        setDocuments([])
        setPagination(null)
      }
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao carregar documentos de KYC.')
      setDocuments([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    void loadDocuments(statusFilter, 1)
  }, [statusFilter])

  const companies: GroupedKycByCompany[] = useMemo(() => {
    const safeDocs = Array.isArray(documents) ? documents : []
    const byCompany = new Map<string, GroupedKycByCompany>()
    for (const doc of safeDocs) {
      const companyId = doc.companyId || 'sem-company'
      const companyName = doc.companyName || 'Empresa não informada'
      if (!byCompany.has(companyId)) {
        byCompany.set(companyId, {
          companyId,
          companyName,
          companyCity: doc.companyCity ?? null,
          companyState: doc.companyState ?? null,
          companyCnpj: doc.companyCnpj ?? null,
          documents: [],
        })
      }
      byCompany.get(companyId)!.documents.push(doc)
    }

    let result = Array.from(byCompany.values())
    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(company =>
        company.companyName.toLowerCase().includes(term),
      )
    }

    // Ordenar por nome da empresa
    result.sort((a, b) => a.companyName.localeCompare(b.companyName, 'pt-BR'))
    return result
  }, [documents, search])

  // Seleciona automaticamente a primeira empresa quando a lista muda
  useEffect(() => {
    if (!selectedCompanyId && companies.length > 0) {
      setSelectedCompanyId(companies[0].companyId)
      setSelectedCompanyName(companies[0].companyName)
    } else if (
      selectedCompanyId &&
      companies.length > 0 &&
      !companies.some(c => c.companyId === selectedCompanyId)
    ) {
      setSelectedCompanyId(companies[0].companyId)
      setSelectedCompanyName(companies[0].companyName)
    } else if (companies.length === 0) {
      setSelectedCompanyId(null)
      setSelectedCompanyName(null)
    }
  }, [companies, selectedCompanyId])

  const documentsForSelectedCompany: KycDocument[] = useMemo(() => {
    const safeDocs = Array.isArray(documents) ? documents : []
    if (!selectedCompanyId) return []
    return safeDocs.filter(doc => (doc.companyId || 'sem-company') === selectedCompanyId)
  }, [documents, selectedCompanyId])

  // Carregar metadados extras da empresa selecionada (cidade/estado, etc.)
  useEffect(() => {
    const loadCompanyMeta = async () => {
      if (!selectedCompanyId) {
        setSelectedCompanyMeta(null)
        return
      }
      setLoadingCompanyMeta(true)
      try {
        const res = await companiesService.getCompanyDetailForAdmin(selectedCompanyId)
        if (res.success && res.data) {
          setSelectedCompanyMeta({
            name: res.data.name || undefined,
            cnpj: res.data.cnpj || undefined,
            city: res.data.city || undefined,
            state: res.data.state || undefined,
            address: res.data.address || undefined,
            addressNumber: res.data.addressNumber || undefined,
            zipCode: res.data.zipCode || undefined,
            contactEmail: res.data.contactEmail || undefined,
            contactPhone: res.data.contactPhone || undefined,
            usersCount: res.data.usersCount,
            serviceProvidersCount: res.data.serviceProvidersCount,
          })
        } else {
          setSelectedCompanyMeta(null)
        }
      } catch {
        setSelectedCompanyMeta(null)
      } finally {
        setLoadingCompanyMeta(false)
      }
    }

    const loadPayoutMeta = async () => {
      if (!selectedCompanyId) return
      setLoadingPayoutMeta(true)
      try {
        const res = await companiesService.getCompanyPayoutDetails(selectedCompanyId)
        if (res.success && res.data) {
          setSelectedCompanyMeta(prev => ({
            ...(prev || {}),
            payoutPixKey: res.data?.payoutPixKey ?? null,
            payoutPixKeyType: res.data?.payoutPixKeyType ?? null,
            payoutBankCode: res.data?.payoutBankCode ?? null,
            payoutBankAgency: res.data?.payoutBankAgency ?? null,
            payoutBankAccount: res.data?.payoutBankAccount ?? null,
            payoutBankAccountDigit: res.data?.payoutBankAccountDigit ?? null,
            payoutBankOwnerName: res.data?.payoutBankOwnerName ?? null,
            payoutBankCpfCnpj: res.data?.payoutBankCpfCnpj ?? null,
            payoutBankAccountType: res.data?.payoutBankAccountType ?? null,
          }))
        }
      } finally {
        setLoadingPayoutMeta(false)
      }
    }

    if (viewMode === 'detail') {
      void loadCompanyMeta()
      void loadPayoutMeta()
    }
  }, [selectedCompanyId, viewMode])

  const summaryForSelectedCompany = useMemo(() => {
    const docs = documentsForSelectedCompany
    const total = docs.length
    const pending = docs.filter(d => d.status === 'PENDING').length
    const approved = docs.filter(d => d.status === 'APPROVED').length
    const rejected = docs.filter(d => d.status === 'REJECTED').length
    return { total, pending, approved, rejected }
  }, [documentsForSelectedCompany])

  const handleApprove = async (doc: KycDocument) => {
    try {
      const res = await kycDocumentsService.approve(doc.id)
      if (!res.success) {
        toast.error((res as any).error || 'Erro ao aprovar documento.')
        return
      }
      toast.success('Documento aprovado com sucesso.')
      void loadDocuments(statusFilter, page)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao aprovar documento.')
    }
  }

  const handleReject = async (doc: KycDocument, feedback: string) => {
    try {
      const res = await kycDocumentsService.reject(doc.id, feedback)
      if (!res.success) {
        toast.error((res as any).error || 'Erro ao rejeitar documento.')
        return
      }
      toast.success('Documento rejeitado com sucesso.')
      void loadDocuments(statusFilter, page)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao rejeitar documento.')
    }
  }

  const pendingCount = documents.filter(doc => doc.status === 'PENDING').length
  // VIEW: Detalhe de empresa (aprovação de documentos) – página separada
  if (viewMode === 'detail' && selectedCompanyId) {
    const company = companies.find(c => c.companyId === selectedCompanyId) || null

    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <header className="rounded-lg border bg-card px-4 py-3 sm:px-5 sm:py-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                className="text-xs font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                onClick={() => {
                  setViewMode('list')
                  setSelectedCompanyId(null)
                }}
              >
                <span aria-hidden>←</span>
                Voltar para triagem
              </button>
              <h1 className="text-lg font-semibold text-foreground mt-2 truncate">
                {selectedCompanyMeta?.name || selectedCompanyName || 'Empresa'}
              </h1>
              <p className="text-xs text-muted-foreground mt-1">
                Revise os documentos e aprove ou rejeite cada item.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => loadDocuments(statusFilter, page)}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Atualizando...
                </>
              ) : (
                <>
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Atualizar
                </>
              )}
            </Button>
          </div>
        </header>

        {company && (
          <Card className="border shadow-sm">
            <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
              {loadingCompanyMeta && (
                <p className="text-sm text-muted-foreground">Carregando dados da empresa...</p>
              )}
              {selectedCompanyMeta && (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 text-sm">
                  <div>
                    <dt className="text-muted-foreground font-medium">CNPJ</dt>
                    <dd className="mt-0.5 text-foreground">{selectedCompanyMeta.cnpj || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Endereço</dt>
                    <dd className="mt-0.5 text-foreground">
                      {selectedCompanyMeta.address || '—'}
                      {selectedCompanyMeta.addressNumber ? `, ${selectedCompanyMeta.addressNumber}` : ''}
                      {(selectedCompanyMeta.city || selectedCompanyMeta.state) && (
                        <> · {selectedCompanyMeta.city}
                        {selectedCompanyMeta.state ? `, ${selectedCompanyMeta.state}` : ''}
                        {selectedCompanyMeta.zipCode ? ` ${selectedCompanyMeta.zipCode}` : ''}</>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Contato</dt>
                    <dd className="mt-0.5 text-foreground">
                      {selectedCompanyMeta.contactEmail || '—'}
                      {selectedCompanyMeta.contactPhone && ` · ${selectedCompanyMeta.contactPhone}`}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground font-medium">Serviços</dt>
                    <dd className="mt-0.5 text-foreground">
                      {(selectedCompanyMeta.serviceProvidersCount ?? 0)} Serviço(s)
                    </dd>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4 pt-2 border-t">
                    <dt className="text-muted-foreground font-medium">Dados para repasse</dt>
                    <dd className="mt-0.5 text-foreground">
                      {loadingPayoutMeta ? (
                        'Carregando...'
                      ) : (
                        <span className="inline-block">
                          {selectedCompanyMeta.payoutPixKey ? (
                            <>PIX ({selectedCompanyMeta.payoutPixKeyType || '—'}): {selectedCompanyMeta.payoutPixKey}</>
                          ) : (
                            'PIX não configurado'
                          )}
                          {selectedCompanyMeta.payoutBankCode && (
                            <> · TED: Banco {selectedCompanyMeta.payoutBankCode}
                            {selectedCompanyMeta.payoutBankAgency && ` Ag. ${selectedCompanyMeta.payoutBankAgency}`}
                            {selectedCompanyMeta.payoutBankAccount && ` Conta ${selectedCompanyMeta.payoutBankAccount}${selectedCompanyMeta.payoutBankAccountDigit ? `-${selectedCompanyMeta.payoutBankAccountDigit}` : ''}`}</>
                          )}
                          {selectedCompanyMeta.payoutBankOwnerName && (
                            <> · Titular: {selectedCompanyMeta.payoutBankOwnerName}</>
                          )}
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              )}
              <p className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                {summaryForSelectedCompany.total} documento(s) · {summaryForSelectedCompany.pending} pendente(s) · {summaryForSelectedCompany.approved} aprovado(s) · {summaryForSelectedCompany.rejected} rejeitado(s)
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="border shadow-sm">
          <CardHeader className="pb-3 px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Documentos</h2>
              <span className="text-sm text-muted-foreground">
                {documentsForSelectedCompany.length} enviado(s)
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : documentsForSelectedCompany.length === 0 ? (
              <p className="px-4 sm:px-6 py-8 text-sm text-muted-foreground">
                Nenhum documento encontrado para essa empresa nos filtros atuais.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left font-medium py-3 px-4">Tipo</th>
                      <th className="text-left font-medium py-3 px-4 hidden sm:table-cell">Enviado em</th>
                      <th className="text-left font-medium py-3 px-4">Status</th>
                      <th className="text-right font-medium py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {documentsForSelectedCompany
                      .slice()
                      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                      .map(doc => {
                        const statusInfo = mapStatusToBadge(doc.status)
                        const isApproved = doc.status === 'APPROVED'
                        return (
                          <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30">
                            <td className="py-3 px-4">
                              <p className="font-medium text-foreground">{mapTypeToLabel(doc.type)}</p>
                              <p className="text-xs text-muted-foreground sm:hidden mt-0.5">
                                {formatDateTime(doc.createdAt)}
                              </p>
                              {doc.feedback && doc.status === 'REJECTED' && (
                                <p className="text-xs text-red-600 mt-1 line-clamp-2" title={doc.feedback}>
                                  <span className="font-medium">Motivo:</span> {doc.feedback}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                              {formatDateTime(doc.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`text-xs ${statusInfo.className}`}>
                                {statusInfo.label}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2 flex-wrap">
                                {(doc.file?.url || doc.fileId) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-xs gap-1"
                                    onClick={() => {
                                      const url = doc.file?.url || filesService.getDownloadUrl(doc.fileId)
                                      window.open(url, '_blank', 'noopener,noreferrer')
                                    }}
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    Ver arquivo
                                  </Button>
                                )}
                                {!isApproved && (
                                  <>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="h-8 min-w-0 border border-emerald-300 bg-background text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400"
                                      onClick={() => handleApprove(doc)}
                                    >
                                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                      <span className="text-xs">Aprovar</span>
                                    </Button>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button
                                          type="button"
                                          size="sm"
                                          variant="outline"
                                          className="h-8 min-w-0 border border-red-300 bg-background text-red-700 hover:bg-red-50 hover:border-red-400"
                                        >
                                          <XCircle className="h-3.5 w-3.5 shrink-0" />
                                          <span className="text-xs">Rejeitar</span>
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Rejeitar documento</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Descreva o motivo da rejeição. O profissional verá essa mensagem.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <div className="space-y-2 py-2">
                                          <Textarea
                                            placeholder="Ex.: Documento ilegível, foto cortada, dados divergentes..."
                                            className="min-h-[100px] text-sm"
                                          />
                                        </div>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                          <AlertDialogAction
                                            className="bg-red-600 hover:bg-red-700 text-white"
                                            onClick={event => {
                                              const form = (event.currentTarget.closest('[data-slot="alert-dialog-content"]') ?? undefined) as HTMLElement | undefined
                                              const textarea = form?.querySelector('textarea') as HTMLTextAreaElement | null
                                              const value = textarea?.value?.trim() ?? ''
                                              if (!value) {
                                                toast.error('Informe um motivo para rejeitar o documento.')
                                                return
                                              }
                                              void handleReject(doc, value)
                                            }}
                                          >
                                            Rejeitar documento
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // VIEW: Lista de empresas (triagem) – sem documentos
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-aumigo-teal text-2xl sm:text-3xl font-semibold mb-1 sm:mb-2">
            KYC / Triagem de Profissionais
          </h1>
          <p className="text-aumigo-gray text-sm sm:text-base max-w-2xl">
            Selecione uma empresa que tenha enviado documentos para iniciar a triagem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => loadDocuments(statusFilter, page)}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <RefreshCcw className="h-3 w-3" />
                Atualizar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[2fr,3fr]">
        {/* Filtros e resumo */}
        <Card className="border-aumigo-teal/20 shadow-sm">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-aumigo-teal/10">
                  <FileCheck className="h-4 w-4 text-aumigo-teal" />
                </div>
                <div>
                  <CardTitle className="text-aumigo-teal text-lg sm:text-xl">
                    Fila de KYC
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Filtre por status e busque por empresa
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant={pendingCount > 0 ? 'secondary' : 'outline'}
                className="text-xs sm:text-sm"
              >
                {pendingCount} pendente(s)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6 pb-5">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'PENDING' as AdminKycStatusFilter, label: 'Pendentes', icon: FileWarning },
                { id: 'APPROVED' as AdminKycStatusFilter, label: 'Aprovados', icon: CheckCircle2 },
                { id: 'REJECTED' as AdminKycStatusFilter, label: 'Rejeitados', icon: XCircle },
                { id: 'ALL' as AdminKycStatusFilter, label: 'Todos', icon: FileCheck },
              ].map(option => {
                const Icon = option.icon
                const isActive = statusFilter === option.id
                return (
                  <Button
                    key={option.id}
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    className={`gap-1 ${isActive ? 'bg-aumigo-teal text-white' : ''}`}
                    onClick={() => setStatusFilter(option.id)}
                  >
                    <Icon className="h-3 w-3" />
                    {option.label}
                  </Button>
                )
              })}
            </div>

            <div className="flex h-9 items-center gap-2 rounded-md border border-aumigo-teal/20 bg-background px-3 focus-within:border-aumigo-teal focus-within:ring-2 focus-within:ring-aumigo-teal/20">
              <Search className="h-4 w-4 shrink-0 text-aumigo-gray" aria-hidden />
              <Input
                placeholder="Buscar por nome da empresa..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-auto min-h-0 flex-1 border-0 bg-transparent p-0 pl-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de empresas */}
        <Card className="border-aumigo-orange/20 shadow-sm">
          <CardHeader className="pb-4 px-4 sm:px-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-aumigo-teal text-lg sm:text-xl">
                Empresas na triagem
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Clique em uma empresa para abrir a página de aprovação de documentos.
              </CardDescription>
            <Badge variant="secondary" className="text-xs sm:text-sm w-fit">
              {companies.length} empresa(s)
            </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-aumigo-orange" />
              </div>
            ) : companies.length === 0 ? (
              <p className="px-4 sm:px-6 py-8 text-sm text-aumigo-gray">
                Nenhuma empresa com documentos para os filtros selecionados.
              </p>
            ) : (
              <>
                <ScrollArea className="max-h-[520px] px-3 sm:px-4 pb-4">
                  <div className="flex flex-col gap-4">
                    {companies.map(company => {
                    const pending = company.documents.filter(d => d.status === 'PENDING').length
                    const approved = company.documents.filter(d => d.status === 'APPROVED').length
                    const rejected = company.documents.filter(d => d.status === 'REJECTED').length
                    const total = company.documents.length
                    const hasRejected = rejected > 0
                    const hasPending = pending > 0
                    const allApproved = total > 0 && approved === total
                    const borderColor = hasRejected
                      ? '#dc2626'
                      : hasPending
                        ? '#d97706'
                        : allApproved
                          ? '#059669'
                          : '#9ca3af'
                    const badgeStyle = hasRejected
                      ? { backgroundColor: '#fee2e2', color: '#b91c1c' }
                      : hasPending
                        ? { backgroundColor: '#fef3c7', color: '#b45309' }
                        : allApproved
                          ? { backgroundColor: '#d1fae5', color: '#047857' }
                          : { backgroundColor: '#f3f4f6', color: '#6b7280' }
                    const badgeLabel = hasRejected
                      ? 'Rejeitado'
                      : hasPending
                        ? 'Pendente'
                        : allApproved
                          ? 'Aprovado'
                          : '—'
                    return (
                      <button
                        key={company.companyId}
                        type="button"
                        onClick={() => {
                          setSelectedCompanyId(company.companyId)
                          setViewMode('detail')
                        }}
                        className="w-full px-3 flex items-start sm:items-center justify-between gap-3 rounded-lg border border-border bg-card pl-3 pr-3 py-3 text-left transition-colors cursor-pointer hover:bg-muted/40"
                        style={{ borderLeftWidth: 4, borderLeftStyle: 'solid', borderLeftColor: borderColor }}
                      >
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-semibold text-foreground truncate">
                            {company.companyName}
                          </span>
                          {(company.companyCity || company.companyState || company.companyCnpj) && (
                            <p className="text-xs text-muted-foreground mt-0.5 truncate">
                              {[company.companyCity, company.companyState].filter(Boolean).join(', ')}
                              {([company.companyCity, company.companyState].filter(Boolean).length > 0 && company.companyCnpj) ? ' · ' : ''}
                              {company.companyCnpj ? `CNPJ ${company.companyCnpj.replace(/\D/g, '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')}` : ''}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1.5 text-xs text-muted-foreground">
                            <span>{total} documento(s)</span>
                            <span>·</span>
                            <span>{pending} pendente(s)</span>
                            <span>·</span>
                            <span>{approved} aprovado(s)</span>
                            <span>·</span>
                            <span>{rejected} rejeitado(s)</span>
                          </div>
                        </div>
                        <span
                          className="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium"
                          style={badgeStyle}
                        >
                          {badgeLabel}
                        </span>
                      </button>
                    )
                  })}
                  </div>
                </ScrollArea>
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-between gap-2 border-t px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPreviousPage || loading}
                      onClick={() => {
                        const nextPage = page - 1
                        setPage(nextPage)
                        void loadDocuments(statusFilter, nextPage)
                      }}
                    >
                      Anterior
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Página {pagination.page} de {pagination.totalPages}
                      {pagination.total > 0 && (
                        <span className="ml-1">
                          ({pagination.total} documento(s))
                        </span>
                      )}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage || loading}
                      onClick={() => {
                        const nextPage = page + 1
                        setPage(nextPage)
                        void loadDocuments(statusFilter, nextPage)
                      }}
                    >
                      Próxima
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

