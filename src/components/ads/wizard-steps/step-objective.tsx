import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'
import { 
  Calendar,
  MessageCircle,
  Eye,
  TrendingUp
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

interface StepObjectiveProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

const objectives = [
  {
    id: 'bookings',
    title: 'Mais Agendamentos',
    description: 'Atraia clientes interessados em agendar seus serviços',
    icon: Calendar,
    badge: 'Recomendado',
    benefits: ['Otimizado para conversões', 'Público qualificado', 'ROI mensurável'],
    suggestedBudget: 'R$ 25-40/dia'
  },
  {
    id: 'profile_visits',
    title: 'Mais Visitas ao Perfil',
    description: 'Aumente o conhecimento da sua marca e serviços',
    icon: Eye,
    badge: 'Branding',
    benefits: ['Maior visibilidade', 'Reconhecimento da marca', 'Alcance amplo'],
    suggestedBudget: 'R$ 15-25/dia'
  },
  {
    id: 'whatsapp_clicks',
    title: 'Mais Cliques no WhatsApp',
    description: 'Facilite o contato direto com potenciais clientes',
    icon: MessageCircle,
    badge: 'Interação',
    benefits: ['Contato direto', 'Vendas consultivas', 'Relacionamento'],
    suggestedBudget: 'R$ 20-35/dia'
  }
] as const

export function StepObjective({ data, onUpdate }: StepObjectiveProps) {
  const handleObjectiveSelect = (objective: 'bookings' | 'profile_visits' | 'whatsapp_clicks') => {
    onUpdate({ objective })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <TrendingUp className="w-12 h-12 text-aumigo-orange mx-auto" />
        <h4>Qual é o seu objetivo principal?</h4>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Escolha o que deseja alcançar com seus anúncios. Isso nos ajudará a otimizar 
          sua campanha para os melhores resultados.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {objectives.map((objective) => {
          const Icon = objective.icon
          const isSelected = data.objective === objective.id
          
          return (
            <Card 
              key={objective.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected 
                  ? 'ring-2 ring-aumigo-orange border-aumigo-orange bg-aumigo-orange/5' 
                  : 'hover:border-aumigo-orange/50'
              }`}
              onClick={() => handleObjectiveSelect(objective.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <Icon className={`w-6 h-6 ${isSelected ? 'text-aumigo-orange' : 'text-muted-foreground'}`} />
                  <Badge variant={objective.badge === 'Recomendado' ? 'default' : 'secondary'} className="text-xs">
                    {objective.badge}
                  </Badge>
                </div>
                <CardTitle className="text-base">{objective.title}</CardTitle>
                <CardDescription className="text-sm">
                  {objective.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Benefícios:</p>
                  <ul className="space-y-1">
                    {objective.benefits.map((benefit, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                        <div className="w-1 h-1 bg-aumigo-orange rounded-full" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Orçamento sugerido: <span className="font-medium text-foreground">{objective.suggestedBudget}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {data.objective && (
        <div className="p-4 bg-aumigo-orange/10 border border-aumigo-orange/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-aumigo-orange rounded-full" />
            <span className="text-sm font-medium">Objetivo selecionado</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Sua campanha será otimizada para <span className="font-medium">
              {objectives.find(obj => obj.id === data.objective)?.title}
            </span>. 
            Você poderá ajustar estratégias e orçamentos nos próximos passos.
          </p>
        </div>
      )}
    </div>
  )
}