import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Slider } from '../../ui/slider'
import { Badge } from '../../ui/badge'
import { Checkbox } from '../../ui/checkbox'
import { Input } from '../../ui/input'
import { Button } from '../../ui/button'
import { 
  MapPin,
  Clock,
  Briefcase,
  Target,
  Plus,
  X
} from 'lucide-react'

interface CampaignData {
  objective: 'bookings' | 'profile_visits' | 'whatsapp_clicks' | null
  serviceId: string | null
  serviceName: string
  audience: {
    radiusKm: number
    timeWindows: string[]
    excludeAreas: string[]
  }
  creative: {
    message: string
    imageUrl: string
  }
  budget: {
    dailyAmountCents: number
    startDate: string
    endDate: string | null
    maxCpcCents: number | null
  }
}

interface StepAudienceProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

// Mock data de serviços
const mockServices = [
  { id: '1', name: 'Banho & Tosa Completo', category: 'banho_tosa', price: 'R$ 80,00' },
  { id: '2', name: 'Adestramento Básico', category: 'adestramento', price: 'R$ 150,00' },
  { id: '3', name: 'Consulta Veterinária', category: 'veterinario', price: 'R$ 120,00' },
  { id: '4', name: 'Hospedagem (diária)', category: 'hospedagem', price: 'R$ 60,00' }
]

const timeSlots = [
  { id: 'morning', label: 'Manhã (6h-12h)', value: '06:00-12:00' },
  { id: 'afternoon', label: 'Tarde (12h-18h)', value: '12:00-18:00' },
  { id: 'evening', label: 'Noite (18h-22h)', value: '18:00-22:00' },
  { id: 'weekend', label: 'Fins de semana', value: 'weekend' }
]

export function StepAudience({ data, onUpdate }: StepAudienceProps) {
  const [newExcludeArea, setNewExcludeArea] = useState('')

  const handleServiceSelect = (serviceId: string) => {
    const service = mockServices.find(s => s.id === serviceId)
    onUpdate({ 
      serviceId,
      serviceName: service?.name || ''
    })
  }

  const handleRadiusChange = (value: number[]) => {
    onUpdate({
      audience: {
        ...data.audience,
        radiusKm: value[0]
      }
    })
  }

  const handleTimeWindowToggle = (timeValue: string, checked: boolean) => {
    const currentWindows = data.audience.timeWindows
    const newWindows = checked
      ? [...currentWindows, timeValue]
      : currentWindows.filter(tw => tw !== timeValue)
    
    onUpdate({
      audience: {
        ...data.audience,
        timeWindows: newWindows
      }
    })
  }

  const addExcludeArea = () => {
    if (newExcludeArea.trim()) {
      onUpdate({
        audience: {
          ...data.audience,
          excludeAreas: [...data.audience.excludeAreas, newExcludeArea.trim()]
        }
      })
      setNewExcludeArea('')
    }
  }

  const removeExcludeArea = (index: number) => {
    onUpdate({
      audience: {
        ...data.audience,
        excludeAreas: data.audience.excludeAreas.filter((_, i) => i !== index)
      }
    })
  }

  const estimatedReach = Math.floor((data.audience.radiusKm * data.audience.radiusKm * 150) / (data.audience.excludeAreas.length + 1))

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Target className="w-12 h-12 text-aumigo-orange mx-auto" />
        <h4>Defina seu público e serviço</h4>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Escolha qual serviço será promovido e configure o público-alvo da sua campanha.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Seleção do Serviço */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-5 h-5" />
              Serviço a ser promovido
            </CardTitle>
            <CardDescription>
              Selecione qual serviço você deseja impulsionar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="service">Serviço</Label>
              <Select value={data.serviceId || ''} onValueChange={handleServiceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {mockServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{service.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {service.price}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {data.serviceId && (
              <div className="p-3 bg-aumigo-orange/10 border border-aumigo-orange/20 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-aumigo-orange rounded-full" />
                  <span className="text-sm font-medium">Serviço selecionado</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.serviceName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alcance Geográfico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="w-5 h-5" />
              Alcance Geográfico
            </CardTitle>
            <CardDescription>
              Defina a distância máxima a partir do seu endereço
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Raio de alcance: {data.audience.radiusKm} km</Label>
              <div className="mt-2">
                <Slider
                  value={[data.audience.radiusKm]}
                  onValueChange={handleRadiusChange}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 km</span>
                <span>30 km</span>
              </div>
            </div>

            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm">Alcance estimado:</span>
                <Badge variant="outline">
                  ~{estimatedReach.toLocaleString()} pessoas
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Horários preferenciais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-5 h-5" />
            Horários Preferenciais
          </CardTitle>
          <CardDescription>
            Selecione quando seu anúncio deve aparecer com mais frequência (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            {timeSlots.map((slot) => (
              <div key={slot.id} className="flex items-center space-x-2">
                <Checkbox
                  id={slot.id}
                  checked={data.audience.timeWindows.includes(slot.value)}
                  onCheckedChange={(checked) => 
                    handleTimeWindowToggle(slot.value, checked as boolean)
                  }
                />
                <Label htmlFor={slot.id} className="text-sm">
                  {slot.label}
                </Label>
              </div>
            ))}
          </div>
          
          {data.audience.timeWindows.length === 0 && (
            <p className="text-xs text-muted-foreground mt-2">
              Nenhum horário selecionado = anúncios exibidos em todos os horários
            </p>
          )}
        </CardContent>
      </Card>

      {/* Exclusões (opcional) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Exclusões (Opcional)</CardTitle>
          <CardDescription>
            Bairros ou regiões onde você não quer que seus anúncios apareçam
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Ex: Centro, Bairro Alto, CEP 01234-000"
              value={newExcludeArea}
              onChange={(e) => setNewExcludeArea(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addExcludeArea()}
            />
            <Button 
              type="button" 
              variant="outline" 
              onClick={addExcludeArea}
              disabled={!newExcludeArea.trim()}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {data.audience.excludeAreas.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">Áreas excluídas:</Label>
              <div className="flex flex-wrap gap-2">
                {data.audience.excludeAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {area}
                    <button
                      type="button"
                      onClick={() => removeExcludeArea(index)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}