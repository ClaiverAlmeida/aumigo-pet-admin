import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { 
  TrendingUp, 
  Eye, 
  MousePointerClick, 
  DollarSign, 
  Calendar,
  Plus,
  AlertCircle,
  Lightbulb,
  Target,
  Users
} from 'lucide-react'

interface AdsOverviewProps {
  onCreateCampaign: () => void
}

// Mock data para métricas
const mockMetrics = {
  impressions: 12450,
  clicks: 387,
  ctr: 3.1,
  avgCpc: 1.85,
  todaySpend: 24.50,
  bookings: 31,
  activeCampaigns: 2
}

// Mock data para gráficos
const performanceData = [
  { date: '01/12', impressions: 1850, clicks: 58, spend: 18.5 },
  { date: '02/12', impressions: 2100, clicks: 67, spend: 22.3 },
  { date: '03/12', impressions: 1950, clicks: 61, spend: 19.8 },
  { date: '04/12', impressions: 2350, clicks: 74, spend: 26.1 },
  { date: '05/12', impressions: 2200, clicks: 71, spend: 24.5 },
  { date: '06/12', impressions: 2450, clicks: 82, spend: 28.7 },
  { date: '07/12', impressions: 2150, clicks: 69, spend: 23.2 }
]

const mockCampaigns = [
  {
    id: '1',
    name: 'Banho & Tosa - Dezembro',
    service: 'Banho & Tosa Completo',
    status: 'active',
    dailyBudget: 25.00,
    todaySpend: 18.50,
    clicks: 142,
    bookings: 12,
    ctr: 3.2
  },
  {
    id: '2',
    name: 'Adestramento - Promoção',
    service: 'Adestramento Básico',
    status: 'active',
    dailyBudget: 20.00,
    todaySpend: 6.00,
    clicks: 89,
    bookings: 8,
    ctr: 2.8
  }
]

const suggestions = [
  {
    icon: TrendingUp,
    title: 'Aumente o raio de alcance',
    description: 'Sua campanha "Banho & Tosa" tem bom desempenho. Considere aumentar o raio em +3 km.',
    action: 'Otimizar'
  },
  {
    icon: DollarSign,
    title: 'Orçamento disponível',
    description: 'Você tem R$ 15,00 não utilizados hoje. Considere aumentar o lance.',
    action: 'Ajustar'
  },
  {
    icon: Target,
    title: 'Novo serviço em alta',
    description: 'Serviços veterinários estão com alta demanda na sua região.',
    action: 'Criar campanha'
  }
]

export function AdsOverview({ onCreateCampaign }: AdsOverviewProps) {
  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid gap-4 md:grid-cols-4 lg:grid-cols-7">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Impressões</p>
                <p className="text-lg font-medium">{mockMetrics.impressions.toLocaleString()}</p>
              </div>
              <Eye className="w-5 h-5 text-aumigo-blue" />
            </div>
            <p className="text-xs text-green-600 mt-1">+12% vs ontem</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Cliques</p>
                <p className="text-lg font-medium">{mockMetrics.clicks}</p>
              </div>
              <MousePointerClick className="w-5 h-5 text-aumigo-orange" />
            </div>
            <p className="text-xs text-green-600 mt-1">+8% vs ontem</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">CTR</p>
                <p className="text-lg font-medium">{mockMetrics.ctr}%</p>
              </div>
              <TrendingUp className="w-5 h-5 text-aumigo-mint" />
            </div>
            <p className="text-xs text-green-600 mt-1">+0.3% vs ontem</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">CPC Médio</p>
                <p className="text-lg font-medium">R$ {mockMetrics.avgCpc.toFixed(2)}</p>
              </div>
              <DollarSign className="w-5 h-5 text-aumigo-teal" />
            </div>
            <p className="text-xs text-red-600 mt-1">+R$ 0,15 vs ontem</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Gasto Hoje</p>
                <p className="text-lg font-medium">R$ {mockMetrics.todaySpend.toFixed(2)}</p>
              </div>
              <DollarSign className="w-5 h-5 text-aumigo-gray" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">de R$ 45,00</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Agendamentos</p>
                <p className="text-lg font-medium">{mockMetrics.bookings}</p>
              </div>
              <Calendar className="w-5 h-5 text-aumigo-orange" />
            </div>
            <p className="text-xs text-green-600 mt-1">+5 vs ontem</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Campanhas</p>
                <p className="text-lg font-medium">{mockMetrics.activeCampaigns}</p>
              </div>
              <Target className="w-5 h-5 text-aumigo-blue" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">ativas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Gráfico de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance dos Últimos 7 Dias
            </CardTitle>
            <CardDescription>
              Impressões e cliques por dia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke="#5EC4E7" 
                  strokeWidth={2}
                  name="Impressões"
                />
                <Line 
                  type="monotone" 
                  dataKey="clicks" 
                  stroke="#FF9B57" 
                  strokeWidth={2}
                  name="Cliques"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campanhas Ativas */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Campanhas Ativas
                </CardTitle>
                <CardDescription>
                  Status e performance das suas campanhas
                </CardDescription>
              </div>
              <Button onClick={onCreateCampaign} size="sm" className="bg-aumigo-orange hover:bg-aumigo-orange/90">
                <Plus className="w-4 h-4 mr-2" />
                Nova
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCampaigns.map((campaign) => (
              <div key={campaign.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{campaign.name}</h4>
                    <p className="text-xs text-muted-foreground">{campaign.service}</p>
                  </div>
                  <Badge className="bg-aumigo-mint text-white">
                    Ativa
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Orçamento:</span>
                    <p className="font-medium">R$ {campaign.dailyBudget.toFixed(2)}/dia</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gasto hoje:</span>
                    <p className="font-medium">R$ {campaign.todaySpend.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CTR:</span>
                    <p className="font-medium">{campaign.ctr}%</p>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t">
                  <div className="flex gap-3 text-xs">
                    <span>{campaign.clicks} cliques</span>
                    <span>{campaign.bookings} agendamentos</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      Pausar
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 text-xs">
                      Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {mockCampaigns.length === 0 && (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">Nenhuma campanha ativa</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie sua primeira campanha para começar a impulsionar seus serviços
                </p>
                <Button onClick={onCreateCampaign} className="bg-aumigo-orange hover:bg-aumigo-orange/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sugestões do Assistente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Sugestões para Melhorar Performance
          </CardTitle>
          <CardDescription>
            Recomendações personalizadas baseadas nos seus dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {suggestions.map((suggestion, index) => {
              const Icon = suggestion.icon
              return (
                <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-aumigo-orange mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h4 className="font-medium text-sm">{suggestion.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {suggestion.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        {suggestion.action}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}