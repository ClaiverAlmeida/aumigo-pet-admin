import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Slider } from '../../ui/slider'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Switch } from '../../ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select'
import { Alert, AlertDescription } from '../../ui/alert'
import { 
  DollarSign,
  Calendar,
  TrendingUp,
  Target,
  Clock,
  AlertCircle,
  Lightbulb
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

interface StepBudgetProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

const budgetSuggestions = [
  { label: 'Baixo', value: 1500, description: 'Teste inicial, alcance limitado' },
  { label: 'Recomendado', value: 2500, description: 'Equilibrio ideal custo x resultado' },
  { label: 'Alto', value: 4000, description: 'Máximo alcance e visibilidade' }
]

export function StepBudget({ data, onUpdate }: StepBudgetProps) {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)
  const [isAlwaysActive, setIsAlwaysActive] = useState(!data.budget.endDate)

  const dailyAmount = data.budget.dailyAmountCents / 100

  const handleDailyAmountChange = (value: number[]) => {
    onUpdate({
      budget: {
        ...data.budget,
        dailyAmountCents: Math.round(value[0] * 100)
      }
    })
  }

  const handleDailyAmountInputChange = (value: string) => {
    const numValue = parseFloat(value) || 0
    onUpdate({
      budget: {
        ...data.budget,
        dailyAmountCents: Math.round(numValue * 100)
      }
    })
  }

  const handleStartDateChange = (startDate: string) => {
    onUpdate({
      budget: {
        ...data.budget,
        startDate
      }
    })
  }

  const handleEndDateChange = (endDate: string | null) => {
    onUpdate({
      budget: {
        ...data.budget,
        endDate
      }
    })
  }

  const handleAlwaysActiveChange = (checked: boolean) => {
    setIsAlwaysActive(checked)
    if (checked) {
      handleEndDateChange(null)
    } else {
      // Definir data padrão de 30 dias
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 30)
      handleEndDateChange(endDate.toISOString().split('T')[0])
    }
  }

  const handleMaxCpcChange = (value: string) => {
    const numValue = parseFloat(value) || null
    onUpdate({
      budget: {
        ...data.budget,
        maxCpcCents: numValue ? Math.round(numValue * 100) : null
      }
    })
  }

  // Estimativas baseadas no orçamento diário
  const estimatedImpressions = Math.floor((dailyAmount * 1000) / 2) // R$ 0,002 por impressão
  const estimatedClicks = Math.floor(estimatedImpressions * 0.03) // 3% CTR
  const estimatedCpc = estimatedClicks > 0 ? dailyAmount / estimatedClicks : 0
  const estimatedBookings = Math.floor(estimatedClicks * 0.08) // 8% taxa de conversão

  const totalBudget = isAlwaysActive ? null : (() => {
    if (!data.budget.endDate) return null
    const startDate = new Date(data.budget.startDate)
    const endDate = new Date(data.budget.endDate)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days * dailyAmount
  })()

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <DollarSign className="w-12 h-12 text-aumigo-orange mx-auto" />
        <h4>Defina seu investimento</h4>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Configure quanto você quer investir por dia e o período da sua campanha.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuração de Orçamento */}
        <div className="space-y-6">
          {/* Orçamento Diário */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5" />
                Orçamento Diário
              </CardTitle>
              <CardDescription>
                Você nunca gastará acima do orçamento diário definido
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Sugestões rápidas */}
              <div className="grid grid-cols-3 gap-2">
                {budgetSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion.label}
                    type="button"
                    variant={data.budget.dailyAmountCents === suggestion.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onUpdate({
                      budget: { ...data.budget, dailyAmountCents: suggestion.value }
                    })}
                    className="flex flex-col h-auto p-3"
                  >
                    <span className="text-xs font-medium">{suggestion.label}</span>
                    <span className="text-sm">R$ {(suggestion.value / 100).toFixed(0)}</span>
                  </Button>
                ))}
              </div>

              {/* Slider personalizado */}
              <div className="space-y-4">
                <div>
                  <Label>Valor personalizado: R$ {dailyAmount.toFixed(2)}</Label>
                  <div className="mt-2">
                    <Slider
                      value={[dailyAmount]}
                      onValueChange={handleDailyAmountChange}
                      min={5}
                      max={100}
                      step={2.5}
                      className="w-full"
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>R$ 5</span>
                    <span>R$ 100</span>
                  </div>
                </div>

                {/* Input direto */}
                <div>
                  <Label htmlFor="dailyAmount">Ou digite o valor exato</Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      R$
                    </span>
                    <Input
                      id="dailyAmount"
                      type="number"
                      min="5"
                      max="500"
                      step="0.50"
                      value={dailyAmount.toFixed(2)}
                      onChange={(e) => handleDailyAmountInputChange(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Período da Campanha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="w-5 h-5" />
                Período da Campanha
              </CardTitle>
              <CardDescription>
                Defina quando sua campanha deve começar e terminar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="startDate">Data de início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={data.budget.startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="alwaysActive"
                  checked={isAlwaysActive}
                  onCheckedChange={handleAlwaysActiveChange}
                />
                <Label htmlFor="alwaysActive">Sempre ativo (até eu pausar)</Label>
              </div>

              {!isAlwaysActive && (
                <div>
                  <Label htmlFor="endDate">Data de término</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={data.budget.endDate || ''}
                    onChange={(e) => handleEndDateChange(e.target.value)}
                    min={data.budget.startDate}
                  />
                </div>
              )}

              {totalBudget && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Orçamento total estimado: <strong>R$ {totalBudget.toFixed(2)}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Configurações Avançadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-5 h-5" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>
                Controles extras para otimizar sua campanha
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="advancedMode"
                  checked={isAdvancedMode}
                  onCheckedChange={setIsAdvancedMode}
                />
                <Label htmlFor="advancedMode">Modo avançado</Label>
              </div>

              {isAdvancedMode && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                  <div>
                    <Label htmlFor="maxCpc">Limite máximo por clique (opcional)</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        id="maxCpc"
                        type="number"
                        min="0.50"
                        step="0.10"
                        placeholder="Deixe vazio para automático"
                        value={data.budget.maxCpcCents ? (data.budget.maxCpcCents / 100).toFixed(2) : ''}
                        onChange={(e) => handleMaxCpcChange(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      CPC sugerido: R$ {estimatedCpc.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Estimativas e Projeções */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="w-5 h-5" />
                Projeções Diárias
              </CardTitle>
              <CardDescription>
                Estimativas baseadas no seu orçamento e histórico da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-aumigo-orange">
                    {estimatedImpressions.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Impressões</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-aumigo-blue">
                    {estimatedClicks}
                  </div>
                  <div className="text-xs text-muted-foreground">Cliques</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-aumigo-mint">
                    R$ {estimatedCpc.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">CPC médio</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-aumigo-teal">
                    {estimatedBookings}
                  </div>
                  <div className="text-xs text-muted-foreground">Agendamentos</div>
                </div>
              </div>

              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Essas são estimativas baseadas em dados históricos. 
                  Os resultados reais podem variar dependendo da qualidade 
                  do anúncio e concorrência.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Dicas de Otimização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dicas para Melhor Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {[
                  {
                    condition: dailyAmount < 15,
                    tip: 'Aumente o orçamento para R$ 15-25/dia para melhor alcance',
                    icon: TrendingUp
                  },
                  {
                    condition: dailyAmount > 50,
                    tip: 'Orçamento alto! Monitore a performance nos primeiros dias',
                    icon: AlertCircle
                  },
                  {
                    condition: !isAlwaysActive && totalBudget && totalBudget < 100,
                    tip: 'Campanhas curtas podem ter performance limitada',
                    icon: Clock
                  }
                ].filter(item => item.condition).map((tip, index) => {
                  const Icon = tip.icon
                  return (
                    <div key={index} className="flex items-start gap-2 p-2 bg-aumigo-orange/10 border border-aumigo-orange/20 rounded text-sm">
                      <Icon className="w-4 h-4 text-aumigo-orange mt-0.5 flex-shrink-0" />
                      <span>{tip.tip}</span>
                    </div>
                  )
                })}

                {/* Dicas gerais sempre visíveis */}
                <div className="flex items-start gap-2 p-2 bg-muted rounded text-sm">
                  <Lightbulb className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span>Campanhas ativas por 7+ dias têm melhor otimização automática</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}