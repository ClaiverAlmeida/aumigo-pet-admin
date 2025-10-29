import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Badge } from '../ui/badge'
import { StepObjective } from './wizard-steps/step-objective'
import { StepAudience } from './wizard-steps/step-audience'
import { StepCreative } from './wizard-steps/step-creative'
import { StepBudget } from './wizard-steps/step-budget'
import { StepReview } from './wizard-steps/step-review'
import { 
  ArrowLeft,
  ArrowRight,
  X,
  Target,
  Users,
  Image,
  DollarSign,
  CheckCircle
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

const initialData: CampaignData = {
  objective: null,
  serviceId: null,
  serviceName: '',
  audience: {
    radiusKm: 5,
    timeWindows: [],
    excludeAreas: []
  },
  creative: {
    message: '',
    imageUrl: ''
  },
  budget: {
    dailyAmountCents: 2000, // R$ 20,00
    startDate: new Date().toISOString().split('T')[0],
    endDate: null,
    maxCpcCents: null
  }
}

interface CampaignWizardProps {
  onClose: () => void
  onComplete: () => void
}

const steps = [
  { id: 1, title: 'Objetivo', icon: Target, description: 'Defina o que deseja alcançar' },
  { id: 2, title: 'Público & Serviço', icon: Users, description: 'Escolha seu serviço e público-alvo' },
  { id: 3, title: 'Criativos', icon: Image, description: 'Configure a aparência do seu anúncio' },
  { id: 4, title: 'Orçamento', icon: DollarSign, description: 'Defina seu investimento e período' },
  { id: 5, title: 'Revisão', icon: CheckCircle, description: 'Revise e publique sua campanha' }
]

export function CampaignWizard({ onClose, onComplete }: CampaignWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [campaignData, setCampaignData] = useState<CampaignData>(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateCampaignData = (updates: Partial<CampaignData>) => {
    setCampaignData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simular criação da campanha
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      onComplete()
    } catch (error) {
      console.error('Erro ao criar campanha:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return campaignData.objective !== null
      case 2:
        return campaignData.serviceId !== null
      case 3:
        return campaignData.creative.message.length > 0
      case 4:
        return campaignData.budget.dailyAmountCents > 0
      case 5:
        return true
      default:
        return false
    }
  }

  const progress = (currentStep / steps.length) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <StepObjective data={campaignData} onUpdate={updateCampaignData} />
      case 2:
        return <StepAudience data={campaignData} onUpdate={updateCampaignData} />
      case 3:
        return <StepCreative data={campaignData} onUpdate={updateCampaignData} />
      case 4:
        return <StepBudget data={campaignData} onUpdate={updateCampaignData} />
      case 5:
        return <StepReview data={campaignData} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Nova Campanha de Anúncios</CardTitle>
              <CardDescription>
                Siga o passo a passo para criar sua campanha de impulsionamento
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress */}
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Passo {currentStep} de {steps.length}</span>
              <span>{Math.round(progress)}% concluído</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps Navigator */}
          <div className="flex items-center justify-center gap-4 mt-4 overflow-x-auto">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id
              
              return (
                <div key={step.id} className="flex items-center gap-2 flex-shrink-0">
                  <div className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors
                    ${isActive ? 'bg-aumigo-orange text-white' : 
                      isCompleted ? 'bg-aumigo-mint text-white' : 
                      'bg-muted text-muted-foreground'}
                  `}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              )
            })}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium">{steps[currentStep - 1].title}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {steps[currentStep - 1].description}
              </p>
            </div>

            {renderStepContent()}
          </div>
        </CardContent>

        {/* Navigation Footer */}
        <div className="border-t p-6 flex justify-between items-center bg-muted/30">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {currentStep}/{steps.length}
            </Badge>
          </div>

          {currentStep < steps.length ? (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-aumigo-orange hover:bg-aumigo-orange/90"
            >
              Próximo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-aumigo-orange hover:bg-aumigo-orange/90"
            >
              {isSubmitting ? 'Criando...' : 'Criar Campanha'}
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}