import { useState, useEffect } from 'react'
import type React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Alert, AlertDescription } from './ui/alert'
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Save,
  X
} from 'lucide-react'
import { bookingsService, Booking, BookingStatus } from '../services/bookings.service'
import { chatService } from '../services/chat.service'
import { toast } from 'sonner'
import { useRouter } from '../hooks/useRouter'
import './pro-bookings.responsive.css'

const statusMap = {
  PENDING: { label: 'Pendente', color: 'yellow' as const },
  AWAITING_PAYMENT: { label: 'Aguardando pagamento', color: 'yellow' as const },
  CONFIRMED: { label: 'Confirmado', color: 'blue' as const },
  DONE: { label: 'Concluído', color: 'green' as const },
  CANCELLED: { label: 'Cancelado', color: 'red' as const }
}

const paymentFlowLabelMap: Record<string, string> = {
  INSTANT_BOOKING: 'Pagamento no ato',
  AFTER_PROVIDER_CONFIRMATION: 'Após confirmação profissional',
  NEGOTIATED_VIA_CHAT: 'Negociado via chat'
}

const formatPrice = (cents: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents / 100)
}

const formatDate = (dateStr: string) => {
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

const formatSchedulingCreatedAt = (iso?: string | null) => {
  if (!iso) return null
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return null
  }
}

export function ProBookings() {
  const { navigate } = useRouter()
  const PAGE_SIZE = 10
  const PRO_CHAT_LOCAL_STORAGE_KEY = 'proChat:selectedTicketId'
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ bookingId: string; status: BookingStatus } | null>(null)
  const [pendingProviderAction, setPendingProviderAction] = useState<{ bookingId: string; approved: boolean } | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | BookingStatus,
    search: '',
    dateFrom: '',
    dateTo: ''
  })

  // Carregar agendamentos ao montar o componente
  useEffect(() => {
    loadBookings()
  }, [filters, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [filters.status, filters.search, filters.dateFrom, filters.dateTo])

  const loadBookings = async () => {
    setIsLoading(true)
    try {
      const result = await bookingsService.getAllByCompany({
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        page: currentPage,
        limit: PAGE_SIZE
      })

      if (result.success && result.data) {
        // O backend retorna { data: Booking[], pagination: {...} }
        const response = result.data as any
        const bookingsData = response.data || response
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : []
        setBookings(bookingsArray)
        const pagination = response.pagination || {}
        const nextTotalItems = Number(pagination.total ?? bookingsArray.length)
        const nextTotalPages = Number(
          pagination.totalPages ?? Math.max(1, Math.ceil(nextTotalItems / PAGE_SIZE))
        )
        setTotalItems(nextTotalItems)
        setTotalPages(nextTotalPages)
      } else {
        toast.error(result.error || 'Erro ao carregar agendamentos')
      }
    } catch (error: any) {
      toast.error('Erro ao carregar agendamentos')
      console.error('Erro ao carregar agendamentos:', error)
    } finally {
      setIsLoading(false)
    }
  }



  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    // Abrir diálogo de confirmação
    setPendingAction({ bookingId, status: newStatus })
    setPendingProviderAction(null)
    setShowConfirmDialog(true)
  }

  const handleProviderConfirmation = (bookingId: string, approved: boolean) => {
    setPendingProviderAction({ bookingId, approved })
    setPendingAction(null)
    setShowConfirmDialog(true)
  }

  const confirmStatusChange = async () => {
    if (pendingProviderAction) {
      try {
        const result = await bookingsService.providerConfirmation(
          pendingProviderAction.bookingId,
          pendingProviderAction.approved
        )
        if (result.success) {
          await loadBookings()
          if (pendingProviderAction.approved) {
            toast.success('Solicitação aprovada. O cliente seguirá para pagamento.')
          } else {
            toast.success('Solicitação recusada com sucesso.')
          }
        } else {
          toast.error(result.error || 'Erro ao processar solicitação')
        }
      } catch (error: any) {
        toast.error('Erro ao processar solicitação do agendamento')
        console.error('Erro ao processar solicitação:', error)
      } finally {
        setShowConfirmDialog(false)
        setPendingProviderAction(null)
      }
      return
    }

    if (!pendingAction) return

    const { bookingId, status: newStatus } = pendingAction

    try {
      const result = await bookingsService.update(bookingId, { status: newStatus })

      if (result.success && result.data) {
        setBookings(bookings.map(booking =>
          booking.id === bookingId ? result.data! : booking
        ))
        toast.success(`Agendamento ${newStatus === 'CONFIRMED' ? 'confirmado' : newStatus === 'DONE' ? 'concluído' : 'cancelado'} com sucesso!`)

        // Atualizar booking selecionado se for o mesmo
        if (selectedBooking?.id === bookingId) {
          setSelectedBooking(result.data)
        }
      } else {
        toast.error(result.error || 'Erro ao atualizar status')
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar status do agendamento')
      console.error('Erro ao atualizar status:', error)
    } finally {
      setShowConfirmDialog(false)
      setPendingAction(null)
      setPendingProviderAction(null)
    }
  }

  const handleOpenBookingChat = async (bookingId: string) => {
    const res = await chatService.openByBooking(bookingId)
    if (!res.success || !res.data?.data?.id) {
      toast.error(res.error || 'Não foi possível abrir o chat do agendamento')
      return
    }
    try {
      localStorage.setItem(PRO_CHAT_LOCAL_STORAGE_KEY, res.data.data.id)
    } catch {
      // ignore
    }
    navigate('/pro/chat')
  }

  // Filtrar localmente (aplicar todos os filtros)
  const filteredBookings = bookings.filter(booking => {
    // Filtro de busca (nome, pet ou serviço)
    if (filters.search &&
      !booking.customerName?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !booking.petName?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !booking.serviceName?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // Filtro de status
    if (filters.status !== 'all' && booking.status !== filters.status) {
      return false
    }

    // Filtro de data (dateFrom)
    if (filters.dateFrom) {
      try {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0]
        const filterDateFrom = new Date(filters.dateFrom).toISOString().split('T')[0]
        if (bookingDate < filterDateFrom) {
          return false
        }
      } catch {
        // Se houver erro ao comparar datas, mantém o booking
      }
    }

    // Filtro de data (dateTo)
    if (filters.dateTo) {
      try {
        const bookingDate = new Date(booking.date).toISOString().split('T')[0]
        const filterDateTo = new Date(filters.dateTo).toISOString().split('T')[0]
        if (bookingDate > filterDateTo) {
          return false
        }
      } catch {
        // Se houver erro ao comparar datas, mantém o booking
      }
    }

    return true
  })
    .sort((a, b) => {
      // Ordenar por data e hora mais recente primeiro
      try {
        // Combinar date e time para criar um timestamp completo
        const dateA = new Date(a.date)
        const timeA = a.time ? a.time.split(':') : ['0', '0']
        dateA.setHours(parseInt(timeA[0]) || 0, parseInt(timeA[1]) || 0, 0, 0)

        const dateB = new Date(b.date)
        const timeB = b.time ? b.time.split(':') : ['0', '0']
        dateB.setHours(parseInt(timeB[0]) || 0, parseInt(timeB[1]) || 0, 0, 0)

        // Ordenar decrescente (mais recente primeiro)
        return dateB.getTime() - dateA.getTime()
      } catch {
        // Em caso de erro, manter ordem original
        return 0
      }
    })

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length
  const pendingProviderApprovalCount = bookings.filter(
    b => b.status === 'PENDING' && b.paymentFlowType === 'AFTER_PROVIDER_CONFIRMATION'
  ).length
  const today = new Date().toISOString().split('T')[0]
  const todayCount = bookings.filter(b => {
    try {
      const bookingDate = new Date(b.date).toISOString().split('T')[0]
      return bookingDate === today
    } catch {
      return false
    }
  }).length

  return (
    <div className="w-full min-w-0 p-3 sm:p-6 lg:p-10 space-y-5 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold">Agendamentos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {totalItems} agendamento(s) encontrado(s)
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 w-full sm:w-auto">
          <Badge variant="outline" className="justify-center sm:justify-start">
            {pendingCount} Pendente(s)
          </Badge>
          <Badge variant="outline" className="justify-center sm:justify-start">
            {pendingProviderApprovalCount} Aguardando aprovação
          </Badge>
          <Badge variant="outline" className="justify-center sm:justify-start">
            {todayCount} Hoje
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4 shrink-0đ" />
            Filtros
          </CardTitle>
          <CardDescription>Busque e filtre agendamentos por status e data</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, pet ou serviço..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8 w-full min-h-[42px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value: string) => setFilters({ ...filters, status: value as 'all' | BookingStatus })}>
                <SelectTrigger className="w-full min-h-[42px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="AWAITING_PAYMENT">Aguardando pagamento</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="DONE">Concluído</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date-from">Data de</Label>
              <Input
                className="w-full min-h-[42px]"
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="date-to">Data até</Label>
              <Input
                className="w-full min-h-[42px]"
                id="date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card>
        <CardContent className="p-4 sm:p-6 overflow-hidden">
          <div className="bookings-mobile space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Carregando agendamentos...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Nenhum agendamento encontrado</div>
            ) : (
              filteredBookings.map((booking) => {
                const agendandoEm = formatSchedulingCreatedAt(booking.createdAt)
                return (
                <Card
                  key={booking.id}
                  className="border border-border/70 cursor-pointer"
                  onClick={() => {
                    setSelectedBooking(booking)
                    setIsDetailDialogOpen(true)
                  }}
                >
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={booking.customer?.profilePicture} />
                        <AvatarFallback>{(booking.customerName || 'C')[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{booking.customerName || 'Cliente'}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {booking.petName || 'Pet'} {booking.pet?.breed ? `(${booking.pet.breed})` : ''}
                        </p>
                        <p className="text-sm font-medium mt-2 truncate">
                          {booking.serviceName || booking.service?.name || 'Serviço'}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-2 mt-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(booking.date)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {booking.time}
                          </span>
                          <span className="font-medium">{formatPrice(booking.price)}</span>
                        </div>
                        {agendandoEm ? (
                          <p className="text-xs text-muted-foreground mt-1">
                            Agendando em: {agendandoEm}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant={
                          booking.status === 'CONFIRMED' ? 'default' :
                            booking.status === 'DONE' ? 'default' :
                              booking.status === 'CANCELLED' ? 'destructive' : 'secondary'
                        }
                        className={
                          booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                            booking.status === 'DONE' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                              booking.status === 'AWAITING_PAYMENT' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''
                        }
                      >
                        {statusMap[booking.status].label}
                      </Badge>

                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {booking.status === 'PENDING' && booking.paymentFlowType === 'AFTER_PROVIDER_CONFIRMATION' ? (
                          <>
                            <Button
                              type="button"
                              size="sm"
                              className="min-h-[36px]"
                              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                event.stopPropagation()
                                handleProviderConfirmation(booking.id, true)
                              }}
                            >
                              Aprovar
                            </Button>
                          </>
                        ) : booking.status === 'PENDING' ? (
                          <Button
                            type="button"
                            size="sm"
                            className="min-h-[36px]"
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                              event.stopPropagation()
                              handleStatusChange(booking.id, 'CONFIRMED')
                            }}
                          >
                            Confirmar
                          </Button>
                        ) : null}
                        {booking.status === 'CONFIRMED' ? (
                          <Button
                            type="button"
                            size="sm"
                            className="min-h-[36px]"
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                              event.stopPropagation()
                              handleStatusChange(booking.id, 'DONE')
                            }}
                          >
                            Concluir
                          </Button>
                        ) : null}
                        {booking.status !== 'CANCELLED' && booking.status !== 'DONE' ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="min-h-[36px]"
                            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                              event.stopPropagation()
                              if (booking.status === 'PENDING' && booking.paymentFlowType === 'AFTER_PROVIDER_CONFIRMATION') {
                                handleProviderConfirmation(booking.id, false)
                                return
                              }
                              handleStatusChange(booking.id, 'CANCELLED')
                            }}
                          >
                            {booking.status === 'PENDING' ? 'Recusar' : 'Cancelar'}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    {booking.paymentFlowType && (
                      <p className="text-xs text-muted-foreground">
                        Fluxo: {paymentFlowLabelMap[booking.paymentFlowType] || booking.paymentFlowType}
                      </p>
                    )}
                  </CardContent>
                </Card>
                )
              })
            )}
          </div>

          <div className="bookings-desktop overflow-x-auto -mx-2 sm:mx-0">
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente & Pet</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Data & Hora</TableHead>
                  <TableHead>Fluxo de pagamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">Carregando agendamentos...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const agendandoEm = formatSchedulingCreatedAt(booking.createdAt)
                    return (
                    <TableRow
                      key={booking.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedBooking(booking)
                        setIsDetailDialogOpen(true)
                      }}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={booking.customer?.profilePicture} />
                            <AvatarFallback>{(booking.customerName || 'C')[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{booking.customerName || 'Cliente'}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.petName || 'Pet'} {booking.pet?.breed ? `(${booking.pet.breed})` : ''}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{booking.serviceName || booking.service?.name || 'Serviço'}</p>
                          {booking.address && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Domicílio
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(booking.date)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{booking.time}</span>
                        </div>
                        {agendandoEm ? (
                          <p className="text-xs text-muted-foreground mt-1.5">
                            Agendando em: {agendandoEm}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {booking.paymentFlowType
                            ? (paymentFlowLabelMap[booking.paymentFlowType] || booking.paymentFlowType)
                            : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === 'CONFIRMED' ? 'default' :
                              booking.status === 'DONE' ? 'default' :
                                booking.status === 'CANCELLED' ? 'destructive' : 'secondary'
                          }
                          className={
                            booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' :
                              booking.status === 'DONE' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                booking.status === 'AWAITING_PAYMENT' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' :
                                  booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''
                          }
                        >
                          {statusMap[booking.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{formatPrice(booking.price)}</span>
                      </TableCell>
                      <TableCell
                        onClick={(event: React.MouseEvent<HTMLTableCellElement>) => {
                          event.stopPropagation()
                        }}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                event.stopPropagation()
                              }}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedBooking(booking)
                              setIsDetailDialogOpen(true)
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { void handleOpenBookingChat(booking.id) }}>
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Abrir chat
                            </DropdownMenuItem>
                            {booking.status === 'PENDING' && (
                              booking.paymentFlowType === 'AFTER_PROVIDER_CONFIRMATION' ? (
                                <>
                                  <DropdownMenuItem onClick={() => handleProviderConfirmation(booking.id, true)}>
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Aprovar solicitação
                                  </DropdownMenuItem>
                                </>
                              ) : (
                                <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Confirmar
                                </DropdownMenuItem>
                              )
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'DONE')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Marcar Concluído
                              </DropdownMenuItem>
                            )}
                            {booking.status !== 'CANCELLED' && booking.status !== 'DONE' && (
                              <DropdownMenuItem
                                onClick={() => {
                                  if (booking.status === 'PENDING' && booking.paymentFlowType === 'AFTER_PROVIDER_CONFIRMATION') {
                                    handleProviderConfirmation(booking.id, false)
                                    return
                                  }
                                  handleStatusChange(booking.id, 'CANCELLED')
                                }}
                                className="text-destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {booking.status === 'PENDING' ? 'Recusar' : 'Cancelar'}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t pt-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages} • {totalItems} resultado(s)
              </p>
              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto min-h-[40px]"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1 || isLoading}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto min-h-[40px]"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages || isLoading}
                >
                  Próxima
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        {selectedBooking && (
          <BookingDetailDialog
            booking={selectedBooking}
            onClose={() => setIsDetailDialogOpen(false)}
            onStatusChange={handleStatusChange}
            onProviderConfirmation={handleProviderConfirmation}
            onOpenChat={handleOpenBookingChat}
            onUpdate={loadBookings}
          />
        )}
      </Dialog>

      {/* Dialog de Confirmação */}
      {showConfirmDialog && (pendingAction || pendingProviderAction) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Alert className="max-w-md w-full shadow-xl border-2 bg-background">
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-lg mb-2">
                    {pendingProviderAction
                      ? (pendingProviderAction.approved ? 'Aprovar Solicitação' : 'Recusar Solicitação')
                      : pendingAction?.status === 'CONFIRMED' ? 'Confirmar Agendamento' :
                        pendingAction?.status === 'DONE' ? 'Concluir Agendamento' :
                          pendingAction?.status === 'CANCELLED' ? 'Cancelar Agendamento' :
                            'Confirmar Ação'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pendingProviderAction?.approved &&
                      'Ao aprovar, o cliente receberá a etapa de pagamento para concluir o agendamento.'}
                    {pendingProviderAction && !pendingProviderAction.approved &&
                      'Tem certeza que deseja recusar esta solicitação? O agendamento será cancelado.'}
                    {!pendingProviderAction && pendingAction?.status === 'CONFIRMED' &&
                      'Tem certeza que deseja confirmar este agendamento?'}
                    {!pendingProviderAction && pendingAction?.status === 'DONE' &&
                      'Tem certeza que deseja marcar este agendamento como concluído?'}
                    {!pendingProviderAction && pendingAction?.status === 'CANCELLED' &&
                      'Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.'}
                  </p>
                </div>
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setShowConfirmDialog(false)
                      setPendingAction(null)
                      setPendingProviderAction(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={confirmStatusChange}
                    variant={
                      pendingProviderAction && !pendingProviderAction.approved
                        ? 'destructive'
                        : pendingAction?.status === 'CANCELLED'
                          ? 'destructive'
                          : 'default'
                    }
                    className="w-full sm:w-auto"
                  >
                    {pendingProviderAction
                      ? (pendingProviderAction.approved ? 'Aprovar' : 'Confirmar Recusa')
                      : pendingAction?.status === 'CONFIRMED' ? 'Confirmar' :
                        pendingAction?.status === 'DONE' ? 'Concluir' :
                          pendingAction?.status === 'CANCELLED' ? 'Confirmar Cancelamento' :
                            'Confirmar'}
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}

interface BookingDetailDialogProps {
  booking: Booking
  onClose: () => void
  onStatusChange: (bookingId: string, status: BookingStatus) => void
  onProviderConfirmation: (bookingId: string, approved: boolean) => void
  onOpenChat: (bookingId: string) => Promise<void>
  onUpdate?: () => void // Callback para recarregar lista após atualização
}

function BookingDetailDialog({ booking, onClose, onStatusChange, onProviderConfirmation, onOpenChat, onUpdate }: BookingDetailDialogProps) {
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<BookingStatus | null>(null)
  const [isEditingDateTime, setIsEditingDateTime] = useState(false)
  const [editedDate, setEditedDate] = useState(() => {
    const date = new Date(booking.date)
    return date.toISOString().split('T')[0]
  })
  const [editedTime, setEditedTime] = useState(booking.time)
  const [showTutorApprovalMessage, setShowTutorApprovalMessage] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState<{ src: string; title: string } | null>(null)
  const canEditDateTime = booking.status === 'PENDING'
  const isProviderApprovalPending =
    booking.status === 'PENDING' && booking.paymentFlowType === 'AFTER_PROVIDER_CONFIRMATION'
  const customerPhoto = booking.customer?.profilePicture
  const petPhoto = booking.pet?.avatar

  const handleCancel = () => {
    setPendingStatus('CANCELLED')
    setShowConfirmDialog(true)
  }

  const handleConfirmClick = (status: BookingStatus) => {
    setPendingStatus(status)
    setShowConfirmDialog(true)
  }

  const confirmAction = () => {
    if (pendingStatus) {
      if (pendingStatus === 'CANCELLED') {
        setShowCancelForm(false)
        setCancelReason('')
      }
      onStatusChange(booking.id, pendingStatus)
      setShowConfirmDialog(false)
      setPendingStatus(null)
      onClose()
    }
  }

  const handleSaveDateTime = async () => {
    if (!canEditDateTime) {
      toast.error('Data e horário só podem ser editados quando o agendamento está pendente.')
      return
    }
    setIsSaving(true)
    try {
      const dateTime = new Date(`${editedDate}T${editedTime}:00`)
      const result = await bookingsService.update(booking.id, {
        date: dateTime.toISOString(),
        time: editedTime,
      })

      if (result.success) {
        toast.success('Data e horário atualizados com sucesso!')
        setIsEditingDateTime(false)
        setShowTutorApprovalMessage(true)
        onUpdate?.() // Recarregar lista se callback fornecido
      } else {
        toast.error(result.error || 'Erro ao atualizar data e horário')
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar data e horário')
      console.error('Erro ao atualizar data e horário:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setEditedDate(() => {
      const date = new Date(booking.date)
      return date.toISOString().split('T')[0]
    })
    setEditedTime(booking.time)
    setIsEditingDateTime(false)
  }

  return (
    <DialogContent
      className="left-[50%] top-4 w-[95vw] max-w-[95vw] translate-x-[-50%] translate-y-0 overflow-y-auto overflow-x-hidden sm:top-[50%] sm:w-auto sm:max-w-2xl sm:translate-y-[-50%]"
      style={{ maxHeight: '90vh', WebkitOverflowScrolling: 'touch' as any }}
    >
      <DialogHeader>
        <DialogTitle>Detalhes do Agendamento</DialogTitle>
        <DialogDescription>
          Criado em {new Date(booking.createdAt).toLocaleDateString('pt-BR')}
        </DialogDescription>
        <div className="flex items-center">
          <Badge
            style={{ width: '100%' }}
            variant={
              booking.status === 'CONFIRMED' ? 'default' :
                booking.status === 'DONE' ? 'default' :
                  booking.status === 'CANCELLED' ? 'destructive' : 'secondary'
            }
            className={
              booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                booking.status === 'DONE' ? 'bg-green-100 text-green-700' :
                  booking.status === 'AWAITING_PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''
            }
          >
            {statusMap[booking.status].label}
          </Badge>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {/* Informações do Cliente */}
        <div className="grid gap-4 grid-cols-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cliente</CardTitle>

            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className={`rounded-md transition-opacity ${customerPhoto ? 'cursor-zoom-in hover:opacity-90' : 'cursor-default'}`}
                  onClick={() => {
                    if (!customerPhoto) return
                    setImagePreview({ src: customerPhoto, title: '' })
                  }}
                >
                  <Avatar className="h-16 w-16 rounded-md flex-shrink-0">
                    <AvatarImage src={customerPhoto} className="object-cover" />
                    <AvatarFallback>{(booking.customerName || booking.customer?.name || 'C')[0]}</AvatarFallback>
                  </Avatar>
                </button>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{booking.customerName || booking.customer?.name || 'Cliente'}</p>
                  {booking.customer?.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Phone className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{booking.customer.phone}</span>
                    </div>
                  )}
                  {booking.customer?.email && (
                    <div className="flex items-start gap-1 text-sm text-muted-foreground mt-1">
                      <Mail className="w-3 h-3 flex-shrink-0 mt-0.5" />
                      <span className="break-words break-all">{booking.customer.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  className={`rounded-md transition-opacity ${petPhoto ? 'cursor-zoom-in hover:opacity-90' : 'cursor-default'}`}
                  onClick={() => {
                    if (!petPhoto) return
                    setImagePreview({ src: petPhoto, title: '' })
                  }}
                >
                  <Avatar className="h-16 w-16 rounded-md flex-shrink-0">
                    <AvatarImage src={petPhoto} className="object-cover" />
                    <AvatarFallback>{(booking.petName || booking.pet?.name || 'P')[0]}</AvatarFallback>
                  </Avatar>
                </button>
                <div>
                <p className="font-medium">{booking.petName || booking.pet?.name || 'Pet'}</p>
                {booking.pet?.species && (
                  <p className="text-sm text-muted-foreground capitalize">
                    {booking.pet.species === 'DOG' ? 'Cachorro' :
                      booking.pet.species === 'CAT' ? 'Gato' :
                        booking.pet.species === 'BIRD' ? 'Pássaro' :
                          booking.pet.species === 'FISH' ? 'Peixe' :
                            booking.pet.species === 'RABBIT' ? 'Coelho' :
                              booking.pet.species === 'HAMSTER' ? 'Hamster' :
                                booking.pet.species}
                  </p>
                )}
                {booking.pet?.breed && (
                  <p className="text-sm text-muted-foreground">Raça: {booking.pet.breed}</p>
                )}
                </div>
              </div>
              {(booking.pet?.gender || booking.pet?.weight || booking.pet?.birthDate) && (
                <div className="space-y-1 pt-2 border-t">
                  {booking.pet?.gender && booking.pet.gender !== 'UNKNOWN' && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>
                        {booking.pet.gender === 'MALE' ? 'Macho' :
                          booking.pet.gender === 'FEMALE' ? 'Fêmea' :
                            booking.pet.gender}
                      </span>
                    </div>
                  )}
                  {booking.pet?.weight && (
                    <div className="text-sm text-muted-foreground">
                      Peso: {booking.pet.weight.toFixed(2)} kg
                    </div>
                  )}
                  {booking.pet?.birthDate && (
                    <div className="text-sm text-muted-foreground">
                      Nascimento: {formatDate(booking.pet.birthDate)}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Serviço */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Serviço</Label>
                <p className="font-medium">{booking.serviceName || booking.service?.name || 'Serviço'}</p>
              </div>
              <div>
                <Label>Valor</Label>
                <p className="font-medium">{formatPrice(booking.price)}</p>
              </div>
            </div>

            <div className="rounded-lg border border-border/70 bg-muted/20 p-3 sm:p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Data e horário</p>
                {!isEditingDateTime && canEditDateTime && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingDateTime(true)}
                    className="h-8 px-2"
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Sugerir nova data e horário
                  </Button>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Data</Label>
                  {isEditingDateTime ? (
                    <Input
                      type="date"
                      value={editedDate}
                      onChange={(e) => setEditedDate(e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <p className="font-medium inline-flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {formatDate(booking.date)}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>Horário</Label>
                  {isEditingDateTime ? (
                    <Input
                      type="time"
                      value={editedTime}
                      onChange={(e) => setEditedTime(e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    <p className="font-medium inline-flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      {booking.time}
                    </p>
                  )}
                </div>
              </div>
              {!canEditDateTime && (
                <p className="text-xs text-muted-foreground">
                  A edição de data e horário fica disponível apenas para agendamentos pendentes.
                </p>
              )}
              {showTutorApprovalMessage && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                  Data e horário sugeridos enviados para aprovação do tutor/cliente.
                </p>
              )}
            </div>
            {isEditingDateTime && (
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveDateTime}
                  disabled={isSaving}
                >
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            )}

            {(booking.address || booking.city) && (
              <div>
                <Label>Endereço {booking.address ? '(Domicílio)' : ''}</Label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    {booking.address && <p className="font-medium">{booking.address}</p>}
                    {(booking.city || booking.state) && (
                      <p className="text-sm text-muted-foreground">
                        {[booking.city, booking.state].filter(Boolean).join(', ')}
                        {booking.zipCode && ` - ${booking.zipCode}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}



            {booking.notes && (
              <div>
                <Label>Observações</Label>
                <p className="text-sm bg-muted p-3 rounded-md">{booking.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert de Confirmação para Confirmar/Concluir */}
        {showConfirmDialog && pendingStatus && pendingStatus !== 'CANCELLED' && (
          <Alert className="border-2 border-blue-200 bg-blue-50">
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-base mb-2">
                    {pendingStatus === 'CONFIRMED' ? 'Confirmar Agendamento' :
                      pendingStatus === 'DONE' ? 'Concluir Agendamento' :
                        'Confirmar Ação'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pendingStatus === 'CONFIRMED' &&
                      'Tem certeza que deseja confirmar este agendamento?'}
                    {pendingStatus === 'DONE' &&
                      'Tem certeza que deseja marcar este agendamento como concluído?'}
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowConfirmDialog(false)
                      setPendingStatus(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={confirmAction}
                  >
                    {pendingStatus === 'CONFIRMED' ? 'Confirmar' :
                      pendingStatus === 'DONE' ? 'Concluir' :
                        'Confirmar'}
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Ações */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Fechar
          </Button>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => { void onOpenChat(booking.id) }}
              className="w-full sm:w-auto"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Abrir chat
            </Button>

            {isProviderApprovalPending ? (
              <Button
                onClick={() => {
                  onProviderConfirmation(booking.id, true)
                  onClose()
                }}
                className="w-full sm:w-auto"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprovar solicitação
              </Button>
            ) : booking.status === 'PENDING' ? (
              <Button onClick={() => handleConfirmClick('CONFIRMED')} className="w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            ) : null}

            {booking.status === 'CONFIRMED' && (
              <Button onClick={() => handleConfirmClick('DONE')} className="w-full sm:w-auto">
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir
              </Button>
            )}

            {booking.status !== 'CANCELLED' && booking.status !== 'DONE' && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (isProviderApprovalPending) {
                    onProviderConfirmation(booking.id, false)
                    onClose()
                    return
                  }
                  setShowCancelForm(true)
                }}
                className="w-full sm:w-auto"
              >
                <XCircle className="w-4 h-4 mr-2" />
                {booking.status === 'PENDING' ? 'Recusar' : 'Cancelar'}
              </Button>
            )}
          </div>
        </div>

        {/* Formulário de Cancelamento */}
        {showCancelForm && (
          <Alert>
            <AlertDescription>
              <div className="space-y-3">
                <Label htmlFor="cancel-reason">Motivo do cancelamento</Label>
                <Textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Informe o motivo do cancelamento..."
                />
                <div className="flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowCancelForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleCancel}>
                    Confirmar Cancelamento
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

      </div>
      {imagePreview && (
        <div
          className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImagePreview(null)}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(event: React.MouseEvent<HTMLDivElement>) => event.stopPropagation()}
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="absolute top-2 right-2 bg-white/95"
              onClick={() => setImagePreview(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="rounded-lg overflow-hidden border border-white/20 bg-black">
              <img
                src={imagePreview.src}
                alt={imagePreview.title}
                className="w-full max-h-[80vh] object-contain"
              />
            </div>
            <p className="text-white/90 text-sm mt-2">{imagePreview.title}</p>
          </div>
        </div>
      )}
    </DialogContent>
  )
}