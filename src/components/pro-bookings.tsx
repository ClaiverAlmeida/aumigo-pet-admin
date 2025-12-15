import { useState } from 'react'
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
  Search
} from 'lucide-react'

type BookingStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED'

interface Booking {
  id: string
  tutorName: string
  tutorAvatar: string
  tutorPhone: string
  tutorEmail: string
  petName: string
  petBreed: string
  service: string
  date: string
  time: string
  status: BookingStatus
  price: number
  address?: {
    street: string
    city: string
  }
  notes?: string
  createdAt: string
}

const mockBookings: Booking[] = [
  {
    id: '1',
    tutorName: 'João Silva',
    tutorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
    tutorPhone: '(11) 99999-9999',
    tutorEmail: 'joao@email.com',
    petName: 'Max',
    petBreed: 'Golden Retriever',
    service: 'Dr. Ana Veterinária',
    date: '2025-09-06',
    time: '09:00',
    status: 'PENDING',
    price: 8000,
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo - SP'
    },
    notes: 'Pet muito dócil, primeira vez na consulta veterinária',
    createdAt: '2025-09-05'
  },
  {
    id: '2',
    tutorName: 'Ana Costa',
    tutorAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
    tutorPhone: '(11) 88888-8888',
    tutorEmail: 'ana@email.com',
    petName: 'Luna',
    petBreed: 'Border Collie',
    service: 'Adestramento',
    date: '2025-09-06',
    time: '14:00',
    status: 'CONFIRMED',
    price: 15000,
    notes: 'Pet com problema de ansiedade de separação',
    createdAt: '2025-09-03'
  },
  {
    id: '3',
    tutorName: 'Carlos Santos',
    tutorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    tutorPhone: '(11) 77777-7777',
    tutorEmail: 'carlos@email.com',
    petName: 'Buddy',
    petBreed: 'Labrador',
    service: 'Consulta Veterinária',
    date: '2025-09-05',
    time: '16:00',
    status: 'DONE',
    price: 12000,
    createdAt: '2025-09-01'
  }
]

const statusMap = {
  PENDING: { label: 'Pendente', color: 'yellow' as const },
  CONFIRMED: { label: 'Confirmado', color: 'blue' as const },
  DONE: { label: 'Concluído', color: 'green' as const },
  CANCELLED: { label: 'Cancelado', color: 'red' as const }
}

export function ProBookings() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: ''
  })

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  const handleStatusChange = (bookingId: string, newStatus: BookingStatus) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ))
  }

  const filteredBookings = bookings.filter(booking => {
    if (filters.status !== 'all' && booking.status !== filters.status) return false
    if (filters.search && 
        !booking.tutorName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !booking.petName.toLowerCase().includes(filters.search.toLowerCase()) &&
        !booking.service.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.dateFrom && booking.date < filters.dateFrom) return false
    if (filters.dateTo && booking.date > filters.dateTo) return false
    return true
  })

  const pendingCount = bookings.filter(b => b.status === 'PENDING').length
  const todayCount = bookings.filter(b => b.date === '2025-09-06').length

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
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
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
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={booking.tutorAvatar} />
                        <AvatarFallback>{booking.tutorName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{booking.tutorName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.petName} ({booking.petBreed})
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{booking.service}</p>
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
                        <DropdownMenuItem onClick={() => {}}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Chat
                        </DropdownMenuItem>
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
              ))}
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
          />
        )}
      </Dialog>
    </div>
  )
}

interface BookingDetailDialogProps {
  booking: Booking
  onClose: () => void
  onStatusChange: (bookingId: string, status: BookingStatus) => void
}

function BookingDetailDialog({ booking, onClose, onStatusChange }: BookingDetailDialogProps) {
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)

  const handleCancel = () => {
    onStatusChange(booking.id, 'CANCELLED')
    setShowCancelForm(false)
    onClose()
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
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={booking.tutorAvatar} />
                  <AvatarFallback>{booking.tutorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{booking.tutorName}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {booking.tutorPhone}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="w-3 h-3" />
                    {booking.tutorEmail}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pet</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-medium">{booking.petName}</p>
                <p className="text-sm text-muted-foreground">{booking.petBreed}</p>
              </div>
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
                <p className="font-medium">{booking.service}</p>
              </div>
              <div>
                <Label>Valor</Label>
                <p className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.price / 100)}</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Data</Label>
                <p className="font-medium">{new Date(booking.date).toLocaleDateString('pt-BR')}</p>
              </div>
              <div>
                <Label>Horário</Label>
                <p className="font-medium">{booking.time}</p>
              </div>
            </div>

            {booking.address && (
              <div>
                <Label>Endereço (Domicílio)</Label>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{booking.address.street}</p>
                    <p className="text-sm text-muted-foreground">{booking.address.city}</p>
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

        {/* Ações */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
            
            {booking.status === 'PENDING' && (
              <Button onClick={() => onStatusChange(booking.id, 'CONFIRMED')}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirmar
              </Button>
            )}
            
            {booking.status === 'CONFIRMED' && (
              <Button onClick={() => onStatusChange(booking.id, 'DONE')}>
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