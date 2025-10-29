import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Checkbox } from '../../ui/checkbox'
import { Label } from '../../ui/label'
import { Separator } from '../../ui/separator'
import { Alert, AlertDescription } from '../../ui/alert'
import { ImageWithFallback } from '../../figma/ImageWithFallback'
import { 
  CheckCircle,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  Image as ImageIcon,
  Clock,
  Users,
  AlertCircle,
  Shield,
  Zap
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

interface StepReviewProps {
  data: CampaignData
  onSubmit: () => void
  isSubmitting: boolean
}

const objectiveLabels = {
  bookings: 'Mais Agendamentos',
  profile_visits: 'Mais Visitas ao Perfil',
  whatsapp_clicks: 'Mais Cliques no WhatsApp'
}

export function StepReview({ data, onSubmit, isSubmitting }: StepReviewProps) {
  const [acceptedPolicies, setAcceptedPolicies] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const dailyAmount = data.budget.dailyAmountCents / 100
  const maxCpc = data.budget.maxCpcCents ? (data.budget.maxCpcCents / 100) : null

  // Calcular estimativas finais
  const estimatedImpressions = Math.floor((dailyAmount * 1000) / 2)
  const estimatedClicks = Math.floor(estimatedImpressions * 0.03)
  const estimatedCpc = estimatedClicks > 0 ? dailyAmount / estimatedClicks : 0

  const canSubmit = acceptedPolicies && acceptedTerms && !isSubmitting

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const totalBudget = data.budget.endDate ? (() => {
    const startDate = new Date(data.budget.startDate)
    const endDate = new Date(data.budget.endDate)
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return days * dailyAmount
  })() : null

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <CheckCircle className="w-12 h-12 text-aumigo-orange mx-auto" />
        <h4>Revise sua campanha</h4>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Confira todos os detalhes antes de publicar sua campanha de anúncios.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Resumo da Campanha */}
        <div className="space-y-4">
          {/* Objetivo e Serviço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-5 h-5" />
                Objetivo e Serviço
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Objetivo:</span>
                <Badge variant="outline">
                  {data.objective ? objectiveLabels[data.objective] : 'Não definido'}
                </Badge>
              </div>
              <Separator />
              <div>
                <span className="text-sm text-muted-foreground">Serviço:</span>
                <p className="font-medium">{data.serviceName}</p>
              </div>
            </CardContent>
          </Card>

          {/* Público-Alvo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="w-5 h-5" />
                Público-Alvo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Raio:</span>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {data.audience.radiusKm} km
                </Badge>
              </div>
              
              {data.audience.timeWindows.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Horários preferenciais:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.audience.timeWindows.map((window, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {window.includes('weekend') ? 'Fins de semana' : window}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {data.audience.excludeAreas.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <span className="text-sm text-muted-foreground">Áreas excluídas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {data.audience.excludeAreas.map((area, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Criativo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ImageIcon className="w-5 h-5" />
                Criativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.creative.imageUrl && (
                <div>
                  <span className="text-sm text-muted-foreground">Imagem:</span>
                  <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border">
                    <img 
                      src={data.creative.imageUrl} 
                      alt="Imagem do anúncio" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
              
              {data.creative.message && (
                <>
                  {data.creative.imageUrl && <Separator />}
                  <div>
                    <span className="text-sm text-muted-foreground">Mensagem:</span>
                    <p className="font-medium italic">"{data.creative.message}"</p>
                  </div>
                </>
              )}

              {!data.creative.imageUrl && !data.creative.message && (
                <p className="text-sm text-muted-foreground">
                  Usando imagem e texto padrão do serviço
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Orçamento e Estimativas */}
        <div className="space-y-4">
          {/* Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="w-5 h-5" />
                Orçamento e Período
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Orçamento diário:</span>
                <Badge className="bg-aumigo-orange text-white">
                  R$ {dailyAmount.toFixed(2)}
                </Badge>
              </div>

              {maxCpc && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">CPC máximo:</span>
                  <Badge variant="outline">
                    R$ {maxCpc.toFixed(2)}
                  </Badge>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Início:</span>
                <span className="font-medium">{formatDate(data.budget.startDate)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Término:</span>
                <span className="font-medium">
                  {data.budget.endDate ? formatDate(data.budget.endDate) : 'Sempre ativo'}
                </span>
              </div>

              {totalBudget && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Orçamento total:</span>
                    <Badge variant="outline">
                      R$ {totalBudget.toFixed(2)}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Estimativas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-5 h-5" />
                Estimativas Diárias
              </CardTitle>
              <CardDescription>
                Projeções baseadas no seu orçamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-aumigo-orange">
                    {estimatedImpressions.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Impressões</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-aumigo-blue">
                    {estimatedClicks}
                  </div>
                  <div className="text-xs text-muted-foreground">Cliques</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-aumigo-mint">
                    R$ {estimatedCpc.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">CPC médio</div>
                </div>

                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="text-lg font-bold text-aumigo-teal">
                    {Math.floor(estimatedClicks * 0.08)}
                  </div>
                  <div className="text-xs text-muted-foreground">Agendamentos</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Aceitar Termos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="w-5 h-5" />
                Termos e Políticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="policies"
                    checked={acceptedPolicies}
                    onCheckedChange={(checked) => setAcceptedPolicies(checked as boolean)}
                  />
                  <Label htmlFor="policies" className="text-sm leading-5">
                    Li e aceito as <button type="button" className="text-aumigo-orange hover:underline">
                      Políticas de Anúncios
                    </button> do AuMigoPet
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-5">
                    Concordo com a cobrança automática do orçamento diário 
                    conforme configurado
                  </Label>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Você pode pausar, editar ou encerrar sua campanha a qualquer momento 
                  através do painel de controle.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botão de Criação */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full max-w-md bg-aumigo-orange hover:bg-aumigo-orange/90"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Criando Campanha...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Criar Campanha
            </>
          )}
        </Button>
      </div>

      {!canSubmit && !isSubmitting && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Aceite os termos e políticas para continuar
          </p>
        </div>
      )}
    </div>
  )
}