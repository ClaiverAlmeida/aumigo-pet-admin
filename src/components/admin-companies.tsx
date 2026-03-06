import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Building2, ArrowRight, Loader2, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'
import { AdminCompanyDetail } from './admin-company-detail'
import { companiesService, type CompanyListItem } from '../services/companies.service'

const PAGE_SIZE = 10

interface AdminCompaniesProps {
  onNavigate: (page: string, params?: { companyId?: string }) => void
}

type ViewMode = 'list' | 'detail'

export function AdminCompanies({ onNavigate }: AdminCompaniesProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedCompany, setSelectedCompany] = useState<CompanyListItem | null>(null)

  const [activeList, setActiveList] = useState<CompanyListItem[]>([])
  const [inactiveList, setInactiveList] = useState<CompanyListItem[]>([])
  const [activePagination, setActivePagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
  const [inactivePagination, setInactivePagination] = useState({ page: 1, limit: PAGE_SIZE, total: 0, totalPages: 1 })
  const [loadingActive, setLoadingActive] = useState(true)
  const [loadingInactive, setLoadingInactive] = useState(true)

  const loadActive = useCallback(async (page: number) => {
    setLoadingActive(true)
    const res = await companiesService.listCompaniesForAdmin(true, page, PAGE_SIZE)
    setLoadingActive(false)
    if (res.success && res.data) {
      setActiveList(res.data.data)
      setActivePagination(res.data.pagination)
    } else {
      setActiveList([])
    }
  }, [])

  const loadInactive = useCallback(async (page: number) => {
    setLoadingInactive(true)
    const res = await companiesService.listCompaniesForAdmin(false, page, PAGE_SIZE)
    setLoadingInactive(false)
    if (res.success && res.data) {
      setInactiveList(res.data.data)
      setInactivePagination(res.data.pagination)
    } else {
      setInactiveList([])
    }
  }, [])

  useEffect(() => {
    loadActive(activePagination.page)
  }, [activePagination.page, loadActive])

  useEffect(() => {
    loadInactive(inactivePagination.page)
  }, [inactivePagination.page, loadInactive])

  const handleSelectCompany = (company: CompanyListItem) => {
    setSelectedCompany(company)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedCompany(null)
  }

  const handleNavigateToTransactions = (companyId: string) => {
    onNavigate('transactions', { companyId })
  }

  if (viewMode === 'detail' && selectedCompany) {
    return (
      <AdminCompanyDetail
        company={selectedCompany}
        onBack={handleBackToList}
        onNavigateToTransactions={handleNavigateToTransactions}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-aumigo-teal text-2xl sm:text-3xl font-semibold mb-1 sm:mb-2 flex items-center gap-2">
          <Building2 className="h-7 w-7 shrink-0" />
          Empresas
        </h1>
        <p className="text-aumigo-gray text-sm sm:text-base">
          Empresas cadastradas e ativas, e inativas. Clique para ver dados e transações.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Empresas ativas */}
        <Card className="border-aumigo-teal/20 shadow-sm">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-lg bg-aumigo-teal/10 shrink-0">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-aumigo-teal" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-aumigo-teal text-lg sm:text-xl">Empresas ativas</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Cadastradas e ativas no sistema</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs sm:text-sm w-fit shrink-0">
                {activePagination.total} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="min-h-[220px] h-[320px] sm:min-h-[260px] sm:h-[360px] px-3 sm:px-4">
              <div className="space-y-2 pb-4">
                {loadingActive ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
                  </div>
                ) : (
                  activeList.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => handleSelectCompany(company)}
                      className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-transparent hover:border-aumigo-teal/30 hover:bg-aumigo-teal/5 transition-all text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-aumigo-teal truncate text-sm sm:text-base">{company.name}</p>
                        {company.city && (
                          <p className="text-xs text-aumigo-gray truncate">
                            {company.city}
                            {company.state ? `, ${company.state}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-aumigo-gray mt-0.5">
                          {company.usersCount} usuário(s) · {company.serviceProvidersCount} serviço(s)
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-aumigo-teal"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleNavigateToTransactions(company.id)
                          }}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Transações
                        </Button>
                        <ArrowRight className="h-4 w-4 text-aumigo-teal" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
            {activePagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 border-t border-aumigo-teal/10 px-3 sm:px-4 py-3">
                <span className="text-xs sm:text-sm text-aumigo-gray">
                  Página {activePagination.page} de {activePagination.totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivePagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={activePagination.page <= 1}
                    className="h-8 w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivePagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={activePagination.page >= activePagination.totalPages}
                    className="h-8 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empresas inativas */}
        <Card className="border-aumigo-orange/20 shadow-sm">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-lg bg-aumigo-orange/10 shrink-0">
                  <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-aumigo-orange" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-aumigo-teal text-lg sm:text-xl">Empresas inativas</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Com exclusão lógica (deletedAt)</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs sm:text-sm w-fit shrink-0">
                {inactivePagination.total} total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="min-h-[220px] h-[320px] sm:min-h-[260px] sm:h-[360px] px-3 sm:px-4">
              <div className="space-y-2 pb-4">
                {loadingInactive ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
                  </div>
                ) : inactiveList.length === 0 ? (
                  <p className="text-sm text-aumigo-gray py-8 text-center">Nenhuma empresa inativa.</p>
                ) : (
                  inactiveList.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => handleSelectCompany(company)}
                      className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-transparent hover:border-aumigo-teal/30 hover:bg-aumigo-teal/5 transition-all text-left"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-aumigo-teal truncate text-sm sm:text-base">{company.name}</p>
                        {company.city && (
                          <p className="text-xs text-aumigo-gray truncate">
                            {company.city}
                            {company.state ? `, ${company.state}` : ''}
                          </p>
                        )}
                        <p className="text-xs text-aumigo-gray mt-0.5">
                          {company.usersCount} usuário(s) · {company.serviceProvidersCount} profissional(is)
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-aumigo-teal shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </ScrollArea>
            {inactivePagination.totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 border-t border-aumigo-teal/10 px-3 sm:px-4 py-3">
                <span className="text-xs sm:text-sm text-aumigo-gray">
                  Página {inactivePagination.page} de {inactivePagination.totalPages}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInactivePagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={inactivePagination.page <= 1}
                    className="h-8 w-9"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInactivePagination((p) => ({ ...p, page: p.page + 1 }))}
                    disabled={inactivePagination.page >= inactivePagination.totalPages}
                    className="h-8 w-9"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
