import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Label } from '../ui/label'
import { Slider } from '../ui/slider'
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Play,
  Pause,
  Edit,
  Copy,
  Trash2,
  Calendar,
  Target,
  DollarSign,
  TrendingUp,
  Settings
} from 'lucide-react'

interface CampaignsListProps {
  onCreateCampaign: () => void
}

// Mock data das campanhas
const mockCampaigns = [
  {
    id: '1',
    name: 'Banho & Tosa - Dezembro',
    service: 'Banho & Tosa Completo',
    status: 'active',
    startDate: '2024-12-01',
    endDate: null,
    dailyBudgetCents: 2500,
    avgCpcCents: 185,
    clicks: 142,
    bookings: 12,
    spendCents: 2630,
    ctr: 3.2,
    createdAt: '2024-12-01'
  },
  {
    id: '2',
    name: 'Adestramento - Promoção',
    service: 'Adestramento Básico',
    status: 'active',
    startDate: '2024-12-05',
    endDate: '2024-12-20',
    dailyBudgetCents: 2000,
    avgCpcCents: 220,
    clicks: 89,
    bookings: 8,
    spendCents: 1958,
    ctr: 2.8,
    createdAt: '2024-12-05'
  },
  {
    id: '3',
    name: 'Consulta Veterinária',
    service: 'Consulta Veterinária',
    status: 'paused',
    startDate: '2024-11-20',
    endDate: '2024-12-15',
    dailyBudgetCents: 3000,
    avgCpcCents: 290,
    clicks: 67,
    bookings: 5,
    spendCents: 1943,
    ctr: 2.1,
    createdAt: '2024-11-20'
  },
  {
    id: '4',
    name: 'Hospedagem - Black Friday',
    service: 'Hospedagem (diária)',
    status: 'ended',
    startDate: '2024-11-23',
    endDate: '2024-11-30',
    dailyBudgetCents: 4000,
    avgCpcCents: 165,
    clicks: 234,
    bookings: 28,
    spendCents: 3861,
    ctr: 4.1,
    createdAt: '2024-11-23'
  }
]

const statusLabels = {
  active: { label: 'Ativa', color: 'bg-aumigo-mint' },
  paused: { label: 'Pausada', color: 'bg-yellow-500' },
  ended: { label: 'Finalizada', color: 'bg-aumigo-gray' },
  draft: { label: 'Rascunho', color: 'bg-muted-foreground' }
}

export function CampaignsList({ onCreateCampaign }: CampaignsListProps) {
  const [campaigns, setCampaigns] = useState(mockCampaigns)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')
  const [editingCampaign, setEditingCampaign] = useState<any>(null)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         campaign.service.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    const matchesService = serviceFilter === 'all' || campaign.service === serviceFilter
    
    return matchesSearch && matchesStatus && matchesService
  })

  const handleStatusChange = (campaignId: string, newStatus: 'active' | 'paused') => {
    setCampaigns(campaigns.map(c => 
      c.id === campaignId ? { ...c, status: newStatus } : c
    ))
  }

  const handleDuplicate = (campaign: any) => {
    const newCampaign = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Cópia)`,
      status: 'draft',
      createdAt: new Date().toISOString()
    }
    setCampaigns([newCampaign, ...campaigns])
  }

  const handleDelete = (campaignId: string) => {
    setCampaigns(campaigns.filter(c => c.id !== campaignId))
  }

  const uniqueServices = [...new Set(campaigns.map(c => c.service))]

  return (
    <div className="space-y-6">
      {/* Header e Filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3>Todas as Campanhas</h3>
          <p className="text-sm text-muted-foreground">
            {filteredCampaigns.length} de {campaigns.length} campanhas
          </p>
        </div>
        
        <Button onClick={onCreateCampaign} className="bg-aumigo-orange hover:bg-aumigo-orange/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar campanhas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="paused">Pausadas</SelectItem>
                  <SelectItem value="ended">Finalizadas</SelectItem>
                </SelectContent>
              </Select>

              <Select value={serviceFilter} onValueChange={setServiceFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Serviço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os serviços</SelectItem>
                  {uniqueServices.map(service => (
                    <SelectItem key={service} value={service}>{service}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Campanhas */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Orçamento</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Resultados</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">{campaign.service}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatDate(campaign.startDate)}</p>
                      <p className="text-muted-foreground">
                        {campaign.endDate ? `até ${formatDate(campaign.endDate)}` : 'Sempre ativo'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{formatPrice(campaign.dailyBudgetCents)}/dia</p>
                      <p className="text-muted-foreground">
                        CPC: {formatPrice(campaign.avgCpcCents)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{campaign.clicks} cliques</p>
                      <p className="text-muted-foreground">CTR: {campaign.ctr}%</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p className="font-medium">{campaign.bookings} agendamentos</p>
                      <p className="text-muted-foreground">
                        {formatPrice(campaign.spendCents)} gasto
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${statusLabels[campaign.status as keyof typeof statusLabels].color} text-white`}>
                      {statusLabels[campaign.status as keyof typeof statusLabels].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {campaign.status === 'active' ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'paused')}>
                            <Pause className="w-4 h-4 mr-2" />
                            Pausar
                          </DropdownMenuItem>
                        ) : campaign.status === 'paused' ? (
                          <DropdownMenuItem onClick={() => handleStatusChange(campaign.id, 'active')}>
                            <Play className="w-4 h-4 mr-2" />
                            Reativar
                          </DropdownMenuItem>
                        ) : null}
                        
                        <DropdownMenuItem onClick={() => setEditingCampaign(campaign)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem onClick={() => handleDuplicate(campaign)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => handleDelete(campaign.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredCampaigns.length === 0 && (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">
                {campaigns.length === 0 ? 'Nenhuma campanha criada' : 'Nenhuma campanha encontrada'}
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                {campaigns.length === 0 
                  ? 'Crie sua primeira campanha para começar a impulsionar seus serviços'
                  : 'Tente ajustar os filtros para encontrar suas campanhas'}
              </p>
              {campaigns.length === 0 && (
                <Button onClick={onCreateCampaign} className="bg-aumigo-orange hover:bg-aumigo-orange/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeira Campanha
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sheet de Edição */}
      <Sheet open={!!editingCampaign} onOpenChange={() => setEditingCampaign(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Editar Campanha</SheetTitle>
            <SheetDescription>
              Faça ajustes na sua campanha. Mudanças de orçamento serão aplicadas no próximo ciclo.
            </SheetDescription>
          </SheetHeader>

          {editingCampaign && (
            <div className="mt-6">
              <Tabs defaultValue="budget" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="budget">Orçamento</TabsTrigger>
                  <TabsTrigger value="audience">Público</TabsTrigger>
                  <TabsTrigger value="creative">Criativo</TabsTrigger>
                </TabsList>

                <TabsContent value="budget" className="space-y-4">
                  <div>
                    <Label>Orçamento Diário</Label>
                    <div className="mt-2">
                      <Slider
                        value={[editingCampaign.dailyBudgetCents / 100]}
                        min={5}
                        max={100}
                        step={2.5}
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      R$ {(editingCampaign.dailyBudgetCents / 100).toFixed(2)} por dia
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="endDate">Data de Término</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={editingCampaign.endDate || ''}
                      className="mt-1"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="audience" className="space-y-4">
                  <div>
                    <Label>Raio de Alcance</Label>
                    <div className="mt-2">
                      <Slider
                        value={[5]}
                        min={1}
                        max={30}
                        step={1}
                        className="w-full"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">5 km</p>
                  </div>

                  <div>
                    <Label>Horários Preferenciais</Label>
                    <div className="mt-2 space-y-2">
                      {[
                        { id: 'morning', label: 'Manhã (6h-12h)' },
                        { id: 'afternoon', label: 'Tarde (12h-18h)' },
                        { id: 'evening', label: 'Noite (18h-22h)' }
                      ].map(slot => (
                        <div key={slot.id} className="flex items-center space-x-2">
                          <input type="checkbox" id={slot.id} />
                          <Label htmlFor={slot.id} className="text-sm">{slot.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="creative" className="space-y-4">
                  <div>
                    <Label htmlFor="message">Mensagem Promocional</Label>
                    <Input
                      id="message"
                      placeholder="Ex: Promoção especial hoje!"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Imagem Atual</Label>
                    <div className="mt-2 w-full h-32 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">Imagem do serviço</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2 mt-6">
                <Button className="flex-1 bg-aumigo-orange hover:bg-aumigo-orange/90">
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setEditingCampaign(null)}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}