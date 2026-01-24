import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Calendar } from './ui/calendar'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Alert, AlertDescription } from './ui/alert'
import { 
  Clock, 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon,
  Save,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { openingHoursService, WeeklyAvailability as BackendWeeklyAvailability } from '../services/opening-hours.service'
import { toast } from 'sonner'

interface TimeSlot {
  start: string
  end: string
}

interface WeeklyAvailability {
  [key: number]: {
    active: boolean
    slots: TimeSlot[]
  }
}

interface Exception {
  date: string
  off: boolean
  reason?: string
}

const weekDays = [
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
  { id: 0, name: 'Domingo', short: 'Dom' }
]

// Estrutura vazia padrão
const getEmptyAvailability = (): WeeklyAvailability => ({
  0: { active: false, slots: [] }, // Domingo
  1: { active: false, slots: [] }, // Segunda
  2: { active: false, slots: [] }, // Terça
  3: { active: false, slots: [] }, // Quarta
  4: { active: false, slots: [] }, // Quinta
  5: { active: false, slots: [] }, // Sexta
  6: { active: false, slots: [] }, // Sábado
})

export function ProAvailability() {
  const [availability, setAvailability] = useState<WeeklyAvailability>(getEmptyAvailability())
  const [exceptions, setExceptions] = useState<Exception[]>([])
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isExceptionDialogOpen, setIsExceptionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Converter formato do backend (string keys) para frontend (number keys)
  const convertBackendToFrontend = (backend: BackendWeeklyAvailability): WeeklyAvailability => {
    const frontend: WeeklyAvailability = {}
    for (const [key, value] of Object.entries(backend)) {
      frontend[Number(key)] = value
    }
    // Garantir que todos os dias existam
    for (let i = 0; i <= 6; i++) {
      if (!frontend[i]) {
        frontend[i] = { active: false, slots: [] }
      }
    }
    return frontend
  }

  // Converter formato do frontend (number keys) para backend (string keys)
  const convertFrontendToBackend = (frontend: WeeklyAvailability): BackendWeeklyAvailability => {
    const backend: BackendWeeklyAvailability = {}
    for (const [key, value] of Object.entries(frontend)) {
      backend[String(key)] = value
    }
    return backend
  }

  // Carregar horários ao montar o componente
  useEffect(() => {
    loadOpeningHours()
  }, [])

  const loadOpeningHours = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await openingHoursService.getOpeningHours()
      if (result.success && result.data) {
        const frontendFormat = convertBackendToFrontend(result.data)
        setAvailability(frontendFormat)
      } else {
        setError(result.error || 'Erro ao carregar horários')
        // Usar estrutura vazia se não houver dados
        setAvailability(getEmptyAvailability())
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar horários')
      setAvailability(getEmptyAvailability())
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const backendFormat = convertFrontendToBackend(availability)
      const result = await openingHoursService.updateOpeningHours(backendFormat)
      
      if (result.success) {
        toast.success('Horários atualizados com sucesso!')
        // Atualizar com os dados retornados do backend
        if (result.data) {
          const frontendFormat = convertBackendToFrontend(result.data)
          setAvailability(frontendFormat)
        }
      } else {
        const errorMsg = result.error || 'Erro ao salvar horários'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao salvar horários'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDayActive = (dayId: number) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        active: !prev[dayId]?.active
      }
    }))
  }

  const addTimeSlot = (dayId: number) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        active: true,
        slots: [...(prev[dayId]?.slots || []), { start: '09:00', end: '17:00' }]
      }
    }))
  }

  const updateTimeSlot = (dayId: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        slots: prev[dayId].slots.map((slot, index) =>
          index === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }))
  }

  const removeTimeSlot = (dayId: number, slotIndex: number) => {
    setAvailability(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        slots: prev[dayId].slots.filter((_, index) => index !== slotIndex)
      }
    }))
  }

  const addException = (date: Date, reason: string) => {
    const dateStr = date.toISOString().split('T')[0]
    setExceptions(prev => [
      ...prev.filter(e => e.date !== dateStr),
      { date: dateStr, off: true, reason }
    ])
    setIsExceptionDialogOpen(false)
    setSelectedDate(undefined)
  }

  const removeException = (date: string) => {
    setExceptions(prev => prev.filter(e => e.date !== date))
  }

  if (isLoading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground">Carregando horários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Agenda & Disponibilidade</h2>
          <p className="text-muted-foreground">Configure seus horários de atendimento</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={loadOpeningHours} disabled={isLoading}>
            <Clock className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Disponibilidade Semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Horários Semanais</CardTitle>
            <CardDescription>Configure seus horários padrão para cada dia da semana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weekDays.map((day) => (
              <div key={day.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={availability[day.id]?.active || false}
                      onCheckedChange={() => toggleDayActive(day.id)}
                    />
                    <div>
                      <p className="font-medium">{day.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {availability[day.id]?.active 
                          ? `${availability[day.id]?.slots.length || 0} período(s)`
                          : 'Indisponível'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {availability[day.id]?.active && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => addTimeSlot(day.id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Período
                    </Button>
                  )}
                </div>

                {availability[day.id]?.active && (
                  <div className="space-y-2 pl-10">
                    {availability[day.id]?.slots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateTimeSlot(day.id, index, 'start', e.target.value)}
                          className="w-24"
                        />
                        <span className="text-muted-foreground">até</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateTimeSlot(day.id, index, 'end', e.target.value)}
                          className="w-24"
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeTimeSlot(day.id, index)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Exceções - Ocultado temporariamente */}
        {/* <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exceções</CardTitle>
              <CardDescription>Dias específicos com horários diferentes ou folgas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {exceptions.map((exception) => (
                  <div key={exception.date} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <p className="font-medium">
                        {new Date(exception.date).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">{exception.reason}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Folga</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeException(exception.date)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Dialog open={isExceptionDialogOpen} onOpenChange={setIsExceptionDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Exceção
                    </Button>
                  </DialogTrigger>
                  <ExceptionDialog
                    onAdd={addException}
                    onClose={() => setIsExceptionDialogOpen(false)}
                  />
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {/* Preview de Slots */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Próximos Horários</CardTitle>
              <CardDescription>Preview dos seus horários disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {['2025-09-06', '2025-09-07', '2025-09-08'].map((date) => {
                  const dayOfWeek = new Date(date).getDay()
                  const dayAvailability = availability[dayOfWeek]
                  
                  return (
                    <div key={date} className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">
                          {new Date(date).toLocaleDateString('pt-BR', { 
                            weekday: 'long', 
                            day: '2-digit',
                            month: '2-digit' 
                          })}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        {dayAvailability?.active && dayAvailability.slots.length > 0 ? (
                          dayAvailability.slots.map((slot, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {slot.start}-{slot.end}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="secondary">Indisponível</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

interface ExceptionDialogProps {
  onAdd: (date: Date, reason: string) => void
  onClose: () => void
}

function ExceptionDialog({ onAdd, onClose }: ExceptionDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [reason, setReason] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedDate) {
      onAdd(selectedDate, reason)
      setSelectedDate(undefined)
      setReason('')
    }
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Adicionar Exceção</DialogTitle>
        <DialogDescription>
          Defina uma data específica como folga ou com horário especial
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Data</Label>
          <div className="flex justify-center pt-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="reason">Motivo (opcional)</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Feriado, Férias, Compromisso pessoal"
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!selectedDate}>
            Adicionar
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}