import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { CampaignWizard } from './ads/campaign-wizard'
import { AdsOverview } from './ads/ads-overview'
import { CampaignsList } from './ads/campaigns-list'
import { AdsBilling } from './ads/ads-billing'
import { AdsPolicies } from './ads/ads-policies'
import { 
  Plus,
  TrendingUp,
  DollarSign,
  Target,
  BarChart3,
  CreditCard,
  Shield
} from 'lucide-react'

export function ProAds() {
  const [activeTab, setActiveTab] = useState('overview')
  const [showWizard, setShowWizard] = useState(false)

  if (showWizard) {
    return (
      <CampaignWizard 
        onClose={() => setShowWizard(false)}
        onComplete={() => {
          setShowWizard(false)
          setActiveTab('campaigns')
        }}
      />
    )
  }

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>ADS - Impulsionamento</h2>
          <p className="text-muted-foreground">
            Aumente a visibilidade dos seus serviços e conquiste mais clientes
          </p>
        </div>
        
        <Button onClick={() => setShowWizard(true)} className="bg-aumigo-orange hover:bg-aumigo-orange/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Campanhas
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="policies" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Políticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <AdsOverview onCreateCampaign={() => setShowWizard(true)} />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsList onCreateCampaign={() => setShowWizard(true)} />
        </TabsContent>

        <TabsContent value="billing">
          <AdsBilling />
        </TabsContent>

        <TabsContent value="policies">
          <AdsPolicies />
        </TabsContent>
      </Tabs>
    </div>
  )
}