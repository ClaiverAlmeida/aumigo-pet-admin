import React, { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ScrollArea } from './ui/scroll-area'
import { Search, Users, Briefcase, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { AdminTutorDetail } from './admin-tutor-detail'
import { AdminProfessionalDetail } from './admin-professional-detail'
import {
  usersService,
  type TutorListItem,
  type ProfessionalListItem,
  type PaginatedResponse,
} from '../services/users.service'

const DEFAULT_LIMIT = 10

const initialPagination = {
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
}

interface AdminUsersProps {
  onNavigate: (page: string) => void
}

type ViewMode = 'list' | 'tutor' | 'professional'

export function AdminUsers({ onNavigate }: AdminUsersProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [selectedTutorId, setSelectedTutorId] = useState<string | null>(null)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(null)
  const [searchTutores, setSearchTutores] = useState('')
  const [searchProfissionais, setSearchProfissionais] = useState('')

  const [tutoresResponse, setTutoresResponse] = useState<PaginatedResponse<TutorListItem>>({
    data: [],
    pagination: initialPagination,
  })
  const [profissionaisResponse, setProfissionaisResponse] = useState<PaginatedResponse<ProfessionalListItem>>({
    data: [],
    pagination: initialPagination,
  })
  const [loadingTutores, setLoadingTutores] = useState(true)
  const [loadingProfissionais, setLoadingProfissionais] = useState(true)
  const [errorTutores, setErrorTutores] = useState<string | null>(null)
  const [errorProfissionais, setErrorProfissionais] = useState<string | null>(null)

  const { data: tutoresData, pagination: tutoresPagination } = tutoresResponse
  const { data: profissionaisData, pagination: profissionaisPagination } = profissionaisResponse

  const loadTutores = useCallback(async (page: number, search: string) => {
    setLoadingTutores(true)
    setErrorTutores(null)
    const res = await usersService.getTutores(page, DEFAULT_LIMIT, search || undefined)
    setLoadingTutores(false)
    if (res.success && res.data) setTutoresResponse(res.data)
    else setErrorTutores(res.error || 'Erro ao carregar tutores')
  }, [])

  const loadProfissionais = useCallback(async (page: number, search: string) => {
    setLoadingProfissionais(true)
    setErrorProfissionais(null)
    const res = await usersService.getProfissionais(page, DEFAULT_LIMIT, search || undefined)
    setLoadingProfissionais(false)
    if (res.success && res.data) setProfissionaisResponse(res.data)
    else setErrorProfissionais(res.error || 'Erro ao carregar profissionais')
  }, [])

  useEffect(() => {
    loadTutores(tutoresPagination.page, searchTutores)
  }, [tutoresPagination.page, searchTutores, loadTutores])

  useEffect(() => {
    loadProfissionais(profissionaisPagination.page, searchProfissionais)
  }, [profissionaisPagination.page, searchProfissionais, loadProfissionais])

  const handleSelectTutor = (tutor: TutorListItem) => {
    setSelectedTutorId(tutor.id)
    setViewMode('tutor')
  }

  const handleSelectProfessional = (pro: ProfessionalListItem) => {
    setSelectedProfessionalId(pro.id)
    setViewMode('professional')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedTutorId(null)
    setSelectedProfessionalId(null)
  }

  const handleTutoresPageChange = (page: number) => {
    if (page < 1 || page > tutoresPagination.totalPages) return
    setTutoresResponse((prev) => ({ ...prev, pagination: { ...prev.pagination, page } }))
  }

  const handleProfissionaisPageChange = (page: number) => {
    if (page < 1 || page > profissionaisPagination.totalPages) return
    setProfissionaisResponse((prev) => ({ ...prev, pagination: { ...prev.pagination, page } }))
  }

  if (viewMode === 'tutor' && selectedTutorId) {
    return (
      <AdminTutorDetail
        tutorId={selectedTutorId}
        onBack={handleBackToList}
      />
    )
  }

  if (viewMode === 'professional' && selectedProfessionalId) {
    return (
      <AdminProfessionalDetail
        professionalId={selectedProfessionalId}
        onBack={handleBackToList}
      />
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-aumigo-teal text-2xl sm:text-3xl font-semibold mb-1 sm:mb-2">Tutores & Profissionais</h1>
        <p className="text-aumigo-gray text-sm sm:text-base">Gerencie tutores (donos de pets) e profissionais da plataforma</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Lista Tutores */}
        <Card className="border-aumigo-teal/20 shadow-sm">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-lg bg-aumigo-teal/10 shrink-0">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-aumigo-teal" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-aumigo-teal text-lg sm:text-xl">Tutores</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Donos de pets cadastrados na plataforma</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs sm:text-sm w-fit shrink-0">
                {tutoresPagination.total} total
              </Badge>
            </div>
            <div className="mt-3 flex h-9 items-center gap-2 rounded-md border border-aumigo-teal/20 bg-background px-3 focus-within:border-aumigo-teal focus-within:ring-2 focus-within:ring-aumigo-teal/20">
              <Search className="h-4 w-4 shrink-0 text-aumigo-gray" aria-hidden />
              <Input
                placeholder="Buscar por nome ou e-mail..."
                value={searchTutores}
                onChange={(e) => {
                  setSearchTutores(e.target.value)
                  setTutoresResponse((prev) => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }))
                }}
                className="h-auto min-h-0 flex-1 border-0 bg-transparent p-0 pl-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {errorTutores && (
              <p className="px-4 py-3 text-sm text-red-600">{errorTutores}</p>
            )}
            <ScrollArea className="min-h-[220px] h-[280px] sm:min-h-[260px] sm:h-[300px] px-3 sm:px-4">
              <div className="space-y-2 pb-4">
                {loadingTutores ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
                  </div>
                ) : (
                tutoresData.map((tutor) => (
                  <button
                    key={tutor.id}
                    type="button"
                    onClick={() => handleSelectTutor(tutor)}
                    className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-transparent hover:border-aumigo-teal/30 hover:bg-aumigo-teal/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-aumigo-teal/20 shrink-0">
                        <AvatarImage src={tutor.profilePicture ?? undefined} />
                        <AvatarFallback className="bg-aumigo-teal/10 text-aumigo-teal text-xs sm:text-sm">
                          {tutor.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-aumigo-teal truncate text-sm sm:text-base">{tutor.name}</p>
                        <p className="text-xs sm:text-sm text-aumigo-gray truncate">{tutor.email}</p>
                        {tutor.city && (
                          <p className="text-xs text-aumigo-gray mt-0.5 truncate">
                            {tutor.city}, {tutor.state} · {tutor.petsCount} pet(s)
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                      <Badge
                        variant={tutor.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={`text-xs ${tutor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}`}
                      >
                        {tutor.status === 'ACTIVE' ? 'Ativo' : tutor.status === 'INACTIVE' ? 'Inativo' : 'Suspenso'}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-aumigo-teal shrink-0" />
                    </div>
                  </button>
                ))
                )}
              </div>
            </ScrollArea>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-aumigo-teal/10 px-3 sm:px-4 py-3">
              <span className="text-xs sm:text-sm text-aumigo-gray order-2 sm:order-1">
                Página {tutoresPagination.page} de {tutoresPagination.totalPages || 1}
              </span>
              <div className="flex gap-1 order-1 sm:order-2 justify-end sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTutoresPageChange(tutoresPagination.page - 1)}
                  disabled={!tutoresPagination.hasPreviousPage}
                  className="h-8 w-9 sm:w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTutoresPageChange(tutoresPagination.page + 1)}
                  disabled={!tutoresPagination.hasNextPage}
                  className="h-8 w-9 sm:w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista Profissionais */}
        <Card className="border-aumigo-orange/20 shadow-sm">
          <CardHeader className="pb-4 px-4 sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-2 rounded-lg bg-aumigo-orange/10 shrink-0">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-aumigo-orange" />
                </div>
                <div className="min-w-0">
                  <CardTitle className="text-aumigo-teal text-lg sm:text-xl">Profissionais</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">Prestadores de serviço e empresas</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs sm:text-sm w-fit shrink-0">
                {profissionaisPagination.total} total
              </Badge>
            </div>
            <div className="mt-3 flex h-9 items-center gap-2 rounded-md border border-aumigo-teal/20 bg-background px-3 focus-within:border-aumigo-teal focus-within:ring-2 focus-within:ring-aumigo-teal/20">
              <Search className="h-4 w-4 shrink-0 text-aumigo-gray" aria-hidden />
              <Input
                placeholder="Buscar por nome, e-mail ou empresa..."
                value={searchProfissionais}
                onChange={(e) => {
                  setSearchProfissionais(e.target.value)
                  setProfissionaisResponse((prev) => ({ ...prev, pagination: { ...prev.pagination, page: 1 } }))
                }}
                className="h-auto min-h-0 flex-1 border-0 bg-transparent p-0 pl-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {errorProfissionais && (
              <p className="px-4 py-3 text-sm text-red-600">{errorProfissionais}</p>
            )}
            <ScrollArea className="min-h-[220px] h-[280px] sm:min-h-[260px] sm:h-[300px] px-3 sm:px-4">
              <div className="space-y-2 pb-4">
                {loadingProfissionais ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-aumigo-orange" />
                  </div>
                ) : (
                profissionaisData.map((pro) => (
                  <button
                    key={pro.id}
                    type="button"
                    onClick={() => handleSelectProfessional(pro)}
                    className="w-full flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl border border-transparent hover:border-aumigo-orange/30 hover:bg-aumigo-orange/5 transition-all text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 w-full sm:w-auto">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border-2 border-aumigo-orange/20 shrink-0">
                        <AvatarImage src={pro.profilePicture ?? undefined} />
                        <AvatarFallback className="bg-aumigo-orange/10 text-aumigo-orange text-xs sm:text-sm">
                          {pro.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-aumigo-teal truncate text-sm sm:text-base">{pro.name}</p>
                        <p className="text-xs sm:text-sm text-aumigo-gray truncate">{pro.companyName}</p>
                        <p className="text-xs text-aumigo-gray mt-0.5 truncate">{pro.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto shrink-0">
                      <Badge
                        variant={pro.status === 'ACTIVE' ? 'default' : 'secondary'}
                        className={`text-xs ${pro.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : pro.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : ''}`}
                      >
                        {pro.status === 'ACTIVE' ? 'Ativo' : pro.status === 'INACTIVE' ? 'Inativo' : 'Suspenso'}
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-aumigo-orange shrink-0" />
                    </div>
                  </button>
                ))
                )}
              </div>
            </ScrollArea>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-aumigo-teal/10 px-3 sm:px-4 py-3">
              <span className="text-xs sm:text-sm text-aumigo-gray order-2 sm:order-1">
                Página {profissionaisPagination.page} de {profissionaisPagination.totalPages || 1}
              </span>
              <div className="flex gap-1 order-1 sm:order-2 justify-end sm:justify-start">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProfissionaisPageChange(profissionaisPagination.page - 1)}
                  disabled={!profissionaisPagination.hasPreviousPage}
                  className="h-8 w-9 sm:w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProfissionaisPageChange(profissionaisPagination.page + 1)}
                  disabled={!profissionaisPagination.hasNextPage}
                  className="h-8 w-9 sm:w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
