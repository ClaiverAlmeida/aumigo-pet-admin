import { useState, useEffect } from 'react'
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
  Pencil,
  Save,
  X
} from 'lucide-react'
import { bookingsService, Booking, BookingStatus } from '../services/bookings.service'
import { toast } from 'sonner'

const statusMap = {
  PENDING: { label: 'Pendente', color: 'yellow' as const },
  CONFIRMED: { label: 'Confirmado', color: 'blue' as const },
  DONE: { label: 'Concluído', color: 'green' as const },
  CANCELLED: { label: 'Cancelado', color: 'red' as const }
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

export function ProBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ bookingId: string; status: BookingStatus } | null>(null)
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | BookingStatus,
    search: '',
    dateFrom: '',
    dateTo: ''
  })

  // Carregar agendamentos ao montar o componente
  useEffect(() => {
    loadBookings()
  }, [filters])

  const loadBookings = async () => {
    setIsLoading(true)
    try {
      const result = await bookingsService.getAll({
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        limit: 100
      })

      if (result.success && result.data) {
        // O backend retorna { data: Booking[], pagination: {...} }
        const response = result.data as any
        const bookingsData = response.data || response
        const bookingsArray = Array.isArray(bookingsData) ? bookingsData : []
        setBookings(bookingsArray)
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
    setShowConfirmDialog(true)
  }

  const confirmStatusChange = async () => {
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
    }
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
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Agendamentos</h2>
          <p className="text-muted-foreground">
            {filteredBookings.length} agendamento(s) encontrado(s)
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline">
            {pendingCount} Pendente(s)
          </Badge>
          <Badge variant="outline">
            {todayCount} Hoje
          </Badge>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome, pet ou serviço..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value as 'all' | BookingStatus })}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="DONE">Concluído</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="date-from">Data de</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="date-to">Data até</Label>
              <Input
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
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente & Pet</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Data & Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">Carregando agendamentos...</p>
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum agendamento encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.customer?.avatar} />
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
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''
                      }
                    >
                      {statusMap[booking.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatPrice(booking.price)}</span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
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
                        {/* <DropdownMenuItem onClick={() => {}}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </DropdownMenuItem> */}
                        {booking.status === 'PENDING' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'CONFIRMED')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirmar
                          </DropdownMenuItem>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(booking.id, 'DONE')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Marcar Concluído
                          </DropdownMenuItem>
                        )}
                        {booking.status !== 'CANCELLED' && booking.status !== 'DONE' && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(booking.id, 'CANCELLED')}
                            className="text-destructive"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancelar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        {selectedBooking && (
          <BookingDetailDialog 
            booking={selectedBooking}
            onClose={() => setIsDetailDialogOpen(false)}
            onStatusChange={handleStatusChange}
            onUpdate={loadBookings}
          />
        )}
      </Dialog>

      {/* Dialog de Confirmação */}
      {showConfirmDialog && pendingAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Alert className="max-w-md w-full shadow-xl border-2 bg-background">
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-lg mb-2">
                    {pendingAction.status === 'CONFIRMED' ? 'Confirmar Agendamento' : 
                     pendingAction.status === 'DONE' ? 'Concluir Agendamento' : 
                     pendingAction.status === 'CANCELLED' ? 'Cancelar Agendamento' : 
                     'Confirmar Ação'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {pendingAction.status === 'CONFIRMED' && 
                      'Tem certeza que deseja confirmar este agendamento?'}
                    {pendingAction.status === 'DONE' && 
                      'Tem certeza que deseja marcar este agendamento como concluído?'}
                    {pendingAction.status === 'CANCELLED' && 
                      'Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.'}
                  </p>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirmDialog(false)
                      setPendingAction(null)
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={confirmStatusChange}
                    variant={pendingAction.status === 'CANCELLED' ? 'destructive' : 'default'}
                  >
                    {pendingAction.status === 'CONFIRMED' ? 'Confirmar' : 
                     pendingAction.status === 'DONE' ? 'Concluir' : 
                     pendingAction.status === 'CANCELLED' ? 'Confirmar Cancelamento' : 
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
  onUpdate?: () => void // Callback para recarregar lista após atualização
}

function BookingDetailDialog({ booking, onClose, onStatusChange, onUpdate }: BookingDetailDialogProps) {
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
  const [isSaving, setIsSaving] = useState(false)

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
        onUpdate?.() // Recarregar lista se callback fornecido
        onClose()
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
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Detalhes do Agendamento</DialogTitle>
        <DialogDescription>
          ID: {booking.id} • Criado em {new Date(booking.createdAt).toLocaleDateString('pt-BR')}
        </DialogDescription>
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
                <Avatar className="flex-shrink-0">
                  <AvatarImage src={booking.customer?.id} />
                  <AvatarFallback>{(booking.customerName || booking.customer?.name || 'C')[0]}</AvatarFallback>
                </Avatar>
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
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label>Data</Label>
                  {!isEditingDateTime && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingDateTime(true)}
                      className="h-6 px-2"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {isEditingDateTime ? (
                  <Input
                    type="date"
                    value={editedDate}
                    onChange={(e) => setEditedDate(e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <p className="font-medium">{formatDate(booking.date)}</p>
                )}
              </div>
              <div>
                <Label>Horário</Label>
                {isEditingDateTime ? (
                  <Input
                    type="time"
                    value={editedTime}
                    onChange={(e) => setEditedTime(e.target.value)}
                    className="w-full mt-1"
                  />
                ) : (
                  <p className="font-medium">{booking.time}</p>
                )}
              </div>
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

            <div>
              <Label>Status</Label>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={
                    booking.status === 'CONFIRMED' ? 'default' :
                    booking.status === 'DONE' ? 'default' :
                    booking.status === 'CANCELLED' ? 'destructive' : 'secondary'
                  }
                  className={
                    booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'DONE' ? 'bg-green-100 text-green-700' :
                    booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' : ''
                  }
                >
                  {statusMap[booking.status].label}
                </Badge>
              </div>
            </div>

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
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          
          <div className="flex gap-2">
            {/* <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button> */}
            
            {booking.status === 'PENDING' && (
              <Button onClick={() => handleConfirmClick('CONFIRMED')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            )}
            
            {booking.status === 'CONFIRMED' && (
              <Button onClick={() => handleConfirmClick('DONE')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Concluir
              </Button>
            )}
            
            {booking.status !== 'CANCELLED' && booking.status !== 'DONE' && (
              <Button 
                variant="destructive"
                onClick={() => setShowCancelForm(true)}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar
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
    </DialogContent>
  )
}