import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Switch } from './ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Alert, AlertDescription } from './ui/alert'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { servicesService, Service as BackendService } from '../services/services.service'
import { serviceProvidersService, ServiceProvider as BackendProvider } from '../services/service-providers.service'
import { companiesService, Company } from '../services/companies.service'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Clock,
  DollarSign,
  Upload,
  Eye,
  EyeOff,
  ImageIcon,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react'

// Interface para o frontend (mantém compatibilidade com UI)
interface Service {
  id: string
  title: string
  description: string
  price: number
  duration: number
  active: boolean
  imageUrl?: string
  providerId?: string
}

// Mapeamento de categorias do mock para ServiceCategory enum
const categoryMapping: Record<string, string> = {
  'banho_tosa': 'GROOMING',
  'adestramento': 'TRAINING',
  'veterinario': 'VETERINARY',
  'hospedagem': 'HOTEL'
}

const categoryReverseMapping: Record<string, string> = {
  'GROOMING': 'banho_tosa',
  'TRAINING': 'adestramento',
  'VETERINARY': 'veterinario',
  'HOTEL': 'hospedagem',
  'PET_SHOP': 'banho_tosa',
  'FARMACY': 'veterinario',
  'WALKER': 'adestramento',
  'HOSPITAL': 'veterinario',
  'OTHER': 'veterinario'
}

const categories = {
  banho_tosa: 'Banho & Tosa',
  adestramento: 'Adestramento', 
  veterinario: 'Veterinário',
  hospedagem: 'Hospedagem'
}

// Mapear Service do backend para formato do frontend
const mapBackendToFrontend = (backend: BackendService): Service & { providerId?: string } => ({
  id: backend.id,
  title: backend.name,
  description: backend.description || '',
  price: backend.price ? Math.round(backend.price * 100) : 0,
  duration: backend.duration || 60,
  active: backend.isActive,
  imageUrl: backend.imageUrl,
  providerId: backend.providerId
})

// Mapear Service do frontend para formato do backend
// companyId será adicionado automaticamente pelo backend
const mapFrontendToBackend = (frontend: Partial<Service>, providerId: string) => ({
  name: frontend.title || '',
  description: frontend.description || undefined,
  price: frontend.price ? frontend.price / 100 : undefined,
  duration: frontend.duration || undefined,
  isActive: frontend.active ?? true,
  imageUrl: frontend.imageUrl || undefined,
  providerId, // Obrigatório
})

// Mapeamento de ServiceCategory enum para labels
const serviceCategoryLabels: Record<string, string> = {
  'VETERINARY': 'Veterinária',
  'PET_SHOP': 'Pet Shop',
  'FARMACY': 'Farmácia',
  'HOTEL': 'Hospedagem',
  'GROOMING': 'Banho & Tosa',
  'WALKER': 'Passeador',
  'TRAINING': 'Adestramento',
  'HOSPITAL': 'Hospital Veterinário',
  'OTHER': 'Outro'
}

interface Provider {
  id: string
  name: string
  category: string
  description?: string
  servicesCount?: number
  address?: string
  addressNumber?: string
  city?: string
  state?: string
  zipCode?: string
  phone?: string
  email?: string
  website?: string
  offersDelivery?: boolean
  offersHomeService?: boolean
}

export function ProServices() {
  const { user } = useAuth()
  const [providers, setProviders] = useState<Provider[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isProviderDialogOpen, setIsProviderDialogOpen] = useState(false)
  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [companyData, setCompanyData] = useState<Company | null>(null)

  // Função para buscar providers
  const fetchProviders = async () => {
    const providersResult = await serviceProvidersService.list()
    if (providersResult.success && providersResult.data) {
      let providersArray: BackendProvider[] = []
      if (Array.isArray(providersResult.data)) {
        providersArray = providersResult.data
      } else if (providersResult.data && typeof providersResult.data === 'object' && 'data' in providersResult.data) {
        const paginated = providersResult.data as { data: BackendProvider[]; pagination: any }
        if (Array.isArray(paginated.data)) {
          providersArray = paginated.data
        }
      }
      setProviders(providersArray.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description,
        servicesCount: p.servicesCount,
        address: (p as any).address,
        addressNumber: (p as any).addressNumber,
        city: (p as any).city,
        state: (p as any).state,
        zipCode: (p as any).zipCode,
        phone: (p as any).phone,
        email: (p as any).email,
        website: (p as any).website,
        offersDelivery: (p as any).offersDelivery,
        offersHomeService: (p as any).offersHomeService,
        useCompanyAddress: (p as any).useCompanyAddress ?? true,
        useCompanyContact: (p as any).useCompanyContact ?? true,
      })))
    }
  }

  // Função para buscar services
  const fetchServices = async () => {
    const servicesResult = await servicesService.list()
    if (servicesResult.success && servicesResult.data) {
      let servicesArray: BackendService[] = []
      if (Array.isArray(servicesResult.data)) {
        servicesArray = servicesResult.data
      } else if (servicesResult.data && typeof servicesResult.data === 'object' && 'data' in servicesResult.data) {
        const paginated = servicesResult.data as { data: BackendService[]; pagination: any }
        if (Array.isArray(paginated.data)) {
          servicesArray = paginated.data
        }
      }
      setServices(servicesArray.map(mapBackendToFrontend))
    }
  }

  // Buscar dados da empresa ao carregar a página
  useEffect(() => {
    const loadCompanyData = async () => {
      const result = await companiesService.getMyCompany()
      if (result.success && result.data) {
        setCompanyData(result.data)
      }
    }
    loadCompanyData()
  }, [])

  // Buscar providers e services - backend filtra automaticamente pela companyId do usuário logado
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        await Promise.all([fetchProviders(), fetchServices()])
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err)
        setError(err.message || 'Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  // Filtrar services por provider selecionado
  const filteredServices = selectedProviderId 
    ? services.filter(s => {
        // Buscar service no backend para verificar providerId
        // Por enquanto, mostrar todos e filtrar depois quando tiver providerId no frontend
        return true
      })
    : services

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const handleSaveProvider = async (providerData: Partial<Provider> & { useCompanyAddress?: boolean; useCompanyContact?: boolean }) => {
    try {
      const backendData: any = {
        name: providerData.name || '',
        category: providerData.category || 'OTHER',
        description: providerData.description,
        offersDelivery: (providerData as any)?.offersDelivery || false,
        offersHomeService: (providerData as any)?.offersHomeService || false,
        // Salvar os flags
        useCompanyAddress: (providerData as any)?.useCompanyAddress ?? true,
        useCompanyContact: (providerData as any)?.useCompanyContact ?? true,
      }

      // Só enviar dados de localização se NÃO estiver usando dados da empresa
      // Se useCompanyAddress = true, não envia os campos (mantém valores existentes no banco)
      if (!providerData.useCompanyAddress) {
        backendData.address = (providerData as any)?.address || null
        backendData.addressNumber = (providerData as any)?.addressNumber || null
        backendData.city = (providerData as any)?.city || null
        backendData.state = (providerData as any)?.state || null
        backendData.zipCode = (providerData as any)?.zipCode || null
      }
      // Se useCompanyAddress = true, não inclui os campos - não anula valores existentes

      // Só enviar dados de contato se NÃO estiver usando dados da empresa
      // Se useCompanyContact = true, não envia os campos (mantém valores existentes no banco)
      if (!providerData.useCompanyContact) {
        backendData.phone = (providerData as any)?.phone || null
        backendData.email = (providerData as any)?.email || null
        backendData.website = (providerData as any)?.website || null
      }
      // Se useCompanyContact = true, não inclui os campos - não anula valores existentes

      if (editingProvider) {
        const result = await serviceProvidersService.update(editingProvider.id, backendData)
        if (result.success && result.data) {
          // Recarregar providers para garantir dados atualizados
          await fetchProviders()
          toast.success('Serviço atualizado com sucesso!')
        } else {
          toast.error(result.error || 'Erro ao atualizar serviço')
        }
      } else {
        const result = await serviceProvidersService.create(backendData)
        if (result.success && result.data) {
          // Recarregar providers para garantir dados atualizados
          await fetchProviders()
          toast.success('Serviço criado com sucesso!')
        } else {
          toast.error(result.error || 'Erro ao criar serviço')
        }
      }
      
      setEditingProvider(null)
      setIsProviderDialogOpen(false)
    } catch (err) {
      toast.error('Erro ao salvar serviço')
    }
  }

  const handleSaveService = async (serviceData: Partial<Service> & { providerId?: string }) => {
    if (!serviceData.providerId) {
      toast.error('Selecione um provider')
      return
    }

    try {
      const backendData = mapFrontendToBackend(serviceData, serviceData.providerId)

      if (editingService) {
        const result = await servicesService.update(editingService.id, backendData)
        if (result.success && result.data) {
          setServices(services.map(s => 
            s.id === editingService.id ? mapBackendToFrontend(result.data!) : s
          ))
          // Recarregar providers para atualizar o contador
          await fetchProviders()
          toast.success('Serviço atualizado com sucesso!')
        } else {
          toast.error(result.error || 'Erro ao atualizar serviço')
        }
      } else {
        const result = await servicesService.create(backendData)
        if (result.success && result.data) {
          setServices([...services, mapBackendToFrontend(result.data)])
          // Recarregar providers para atualizar o contador
          await fetchProviders()
          toast.success('Serviço criado com sucesso!')
        } else {
          toast.error(result.error || 'Erro ao criar serviço')
        }
      }
      
      setEditingService(null)
      setIsServiceDialogOpen(false)
    } catch (err) {
      toast.error('Erro ao salvar serviço')
    }
  }

  const handleDeleteProvider = async (providerId: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço? Todos os itens associados serão excluídos.')) {
      return
    }

    try {
      const result = await serviceProvidersService.delete(providerId)
      if (result.success) {
        // Recarregar providers e services para garantir dados atualizados
        await Promise.all([fetchProviders(), fetchServices()])
        toast.success('Serviço excluído com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao excluir serviço')
      }
    } catch (err) {
      toast.error('Erro ao excluir serviço')
    }
  }

  const handleDelete = async (serviceId: string) => {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
      return
    }

    try {
      const result = await servicesService.delete(serviceId)
      
      if (result.success) {
        setServices(services.filter(s => s.id !== serviceId))
        // Recarregar providers para atualizar o contador
        await fetchProviders()
        toast.success('Item excluído com sucesso!')
      } else {
        toast.error(result.error || 'Erro ao excluir item')
      }
    } catch (err) {
      toast.error('Erro ao excluir item')
    }
  }

  const toggleActive = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    try {
      const result = await servicesService.toggleActive(serviceId, !service.active)
      
      if (result.success && result.data) {
        setServices(services.map(s => 
          s.id === serviceId ? mapBackendToFrontend(result.data!) : s
        ))
        toast.success(`Item ${!service.active ? 'ativado' : 'desativado'} com sucesso!`)
      } else {
        toast.error(result.error || 'Erro ao alterar status do item')
      }
    } catch (err) {
      toast.error('Erro ao alterar status do item')
    }
  }

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-aumigo-orange" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Meus Serviços</h2>
          <p className="text-muted-foreground">Gerencie serviços e itens da sua empresa</p>
        </div>
      </div>

      {/* Seção de Providers */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Serviços oferecidos</CardTitle>
              <CardDescription>
                {providers.length} serviço(s) cadastrado(s)
              </CardDescription>
            </div>
            <Dialog open={isProviderDialogOpen} onOpenChange={(open) => {
              setIsProviderDialogOpen(open)
              if (!open) {
                setEditingProvider(null)
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingProvider(null)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Serviço
                </Button>
              </DialogTrigger>
              <ProviderDialog 
                provider={editingProvider}
                companyData={companyData}
                onSave={handleSaveProvider}
                onClose={() => {
                  setEditingProvider(null)
                  setIsProviderDialogOpen(false)
                }}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {providers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Crie um serviço primeiro para depois adicionar itens
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setIsProviderDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro serviço
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <Card key={provider.id} className="cursor-pointer hover:border-aumigo-orange transition-colors"
                  onClick={() => setSelectedProviderId(selectedProviderId === provider.id ? null : provider.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <Badge variant="outline" className="mt-2">
                          {serviceCategoryLabels[provider.category] || provider.category}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            setEditingProvider(provider)
                            setIsProviderDialogOpen(true)
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProvider(provider.id)
                            }}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {provider.description && (
                      <p className="text-sm text-muted-foreground mb-2">{provider.description}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {provider.servicesCount || 0} serviço(s) cadastrado(s)
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Services */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Catálogo de Itens de Serviço</CardTitle>
              <CardDescription>
                {filteredServices.length} serviço(s) cadastrado(s), {filteredServices.filter(s => s.active).length} ativo(s)
                {selectedProviderId && ` (filtrado por serviço)`}
              </CardDescription>
            </div>
            <Dialog open={isServiceDialogOpen} onOpenChange={(open) => {
              setIsServiceDialogOpen(open)
              if (!open) {
                setEditingService(null)
              }
            }}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => {
                    setEditingService(null)
                    if (providers.length === 0) {
                      toast.error('Crie um serviço primeiro antes de adicionar itens')
                      return
                    }
                  }}
                  disabled={providers.length === 0}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Item
                </Button>
              </DialogTrigger>
              <ServiceDialog 
                service={editingService}
                providers={providers}
                onSave={handleSaveService}
                onClose={() => {
                  setEditingService(null)
                  setIsServiceDialogOpen(false)
                }}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredServices.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
              {providers.length === 0 ? (
                <p className="text-sm text-muted-foreground mt-2">
                  Crie um provider primeiro para depois adicionar serviços
                </p>
              ) : (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsServiceDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro serviço
                </Button>
              )}
            </div>
          ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {service.imageUrl && (
                        <ImageWithFallback
                          src={service.imageUrl}
                          alt={service.title}
                          width={48}
                          height={48}
                          className="rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-medium">{service.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {service.description && service.description.length > 50
                            ? `${service.description.substring(0, 50)}...`
                            : service.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {(() => {
                        const provider = providers.find(p => p.id === service.providerId)
                        return provider?.name || 'N/A'
                      })()}
                    </Badge>
                  </TableCell>
              
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatPrice(service.price)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.duration}min
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={service.active}
                        onCheckedChange={() => toggleActive(service.id)}
                      />
                      {service.active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            setEditingService(service)
                            setIsServiceDialogOpen(true)
                          }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(service.id)
                            }}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface ProviderDialogProps {
  provider: Provider | null
  companyData: Company | null
  onSave: (provider: Partial<Provider>) => void
  onClose: () => void
}

function ProviderDialog({ provider, companyData, onSave, onClose }: ProviderDialogProps) {
  // Estado inicial: se for criação, usar dados da empresa; se for edição, usar dados do provider
  const [formData, setFormData] = useState(() => {
    if (provider) {
      // Edição: usar dados do provider
      return {
        name: provider.name || '',
        category: provider.category || 'OTHER',
        description: provider.description || '',
        address: (provider as any)?.address || '',
        addressNumber: (provider as any)?.addressNumber || '',
        city: (provider as any)?.city || '',
        state: (provider as any)?.state || '',
        zipCode: (provider as any)?.zipCode || '',
        phone: (provider as any)?.phone || '',
        email: (provider as any)?.email || '',
        website: (provider as any)?.website || '',
        offersDelivery: (provider as any)?.offersDelivery || false,
        offersHomeService: (provider as any)?.offersHomeService || false,
      }
    } else {
      // Criação: campos vazios (serão preenchidos se necessário)
      return {
        name: '',
        category: 'OTHER',
        description: '',
        address: '',
        addressNumber: '',
        city: '',
        state: '',
        zipCode: '',
        phone: '',
        email: '',
        website: '',
        offersDelivery: false,
        offersHomeService: false,
      }
    }
  })

  // Estados para controlar se usa dados da empresa (vem do banco ou default true)
  const [useCompanyAddress, setUseCompanyAddress] = useState(
    provider ? ((provider as any)?.useCompanyAddress ?? true) : true
  )
  const [useCompanyContact, setUseCompanyContact] = useState(
    provider ? ((provider as any)?.useCompanyContact ?? true) : true
  )

  // Atualizar formData quando o provider mudar (edição)
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        category: provider.category || 'OTHER',
        description: provider.description || '',
        address: (provider as any)?.address || '',
        addressNumber: (provider as any)?.addressNumber || '',
        city: (provider as any)?.city || '',
        state: (provider as any)?.state || '',
        zipCode: (provider as any)?.zipCode || '',
        phone: (provider as any)?.phone || '',
        email: (provider as any)?.email || '',
        website: (provider as any)?.website || '',
        offersDelivery: (provider as any)?.offersDelivery || false,
        offersHomeService: (provider as any)?.offersHomeService || false,
      })
      // Atualizar flags do banco
      setUseCompanyAddress((provider as any)?.useCompanyAddress ?? true)
      setUseCompanyContact((provider as any)?.useCompanyContact ?? true)
    }
  }, [provider])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      useCompanyAddress,
      useCompanyContact,
    })
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {provider ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <DialogDescription>
          Crie um serviço para organizar seus itens por tipo
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="provider-name">Nome do Serviço</Label>
          <Input
            id="provider-name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Banho & Tosa, Farmácia, Passeios..."
            required
          />
        </div>

        <div>
          <Label htmlFor="provider-category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(serviceCategoryLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="provider-description">Descrição (opcional)</Label>
          <Textarea
            id="provider-description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva o tipo de serviços deste provider..."
            rows={3}
          />
        </div>

        {/* Checkbox para usar endereço da empresa */}
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Switch
            id="use-company-address"
            checked={useCompanyAddress}
            onCheckedChange={(checked) => {
              setUseCompanyAddress(checked)
            }}
          />
          <Label htmlFor="use-company-address" className="font-medium">
            Usar endereço da empresa
          </Label>
        </div>

        {/* Campos de Localização - Mostrar apenas se NÃO usar dados da empresa */}
        {!useCompanyAddress && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="provider-zipCode">CEP</Label>
              <Input
                id="provider-zipCode"
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider-address">Endereço</Label>
              <Input
                id="provider-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Rua, Avenida, etc."
              />
            </div>
            <div>
              <Label htmlFor="provider-address-number">Número</Label>
              <Input
                id="provider-address-number"
                value={formData.addressNumber || ''}
                onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                placeholder="Número"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider-city">Cidade</Label>
              <Input
                id="provider-city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Cidade"
              />
            </div>
            <div>
              <Label htmlFor="provider-state">Estado</Label>
              <Input
                id="provider-state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="Estado (ex: SP, RJ)"
                maxLength={2}
              />
            </div>
          </div>
        </div>
        )}

        {/* Checkbox para usar contato da empresa */}
        <div className="flex items-center space-x-2 pb-2 border-b pt-4">
          <Switch
            id="use-company-contact"
            checked={useCompanyContact}
            onCheckedChange={(checked) => {
              setUseCompanyContact(checked)
            }}
          />
          <Label htmlFor="use-company-contact" className="font-medium">
            Usar contato da empresa
          </Label>
        </div>

        {/* Campos de Contato - Mostrar apenas se NÃO usar dados da empresa */}
        {!useCompanyContact && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="provider-phone">Telefone</Label>
              <Input
                id="provider-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <Label htmlFor="provider-email">Email</Label>
              <Input
                id="provider-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contato@exemplo.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="provider-website">Website (opcional)</Label>
            <Input
              id="provider-website"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://www.exemplo.com"
            />
          </div>
        </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="provider-offersDelivery"
              checked={formData.offersDelivery}
              onCheckedChange={(checked) => setFormData({ ...formData, offersDelivery: checked })}
            />
            <Label htmlFor="provider-offersDelivery">Oferece entrega</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="provider-offersHomeService"
              checked={formData.offersHomeService}
              onCheckedChange={(checked) => setFormData({ ...formData, offersHomeService: checked })}
            />
            <Label htmlFor="provider-offersHomeService">Oferece atendimento domiciliar</Label>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {provider ? 'Atualizar' : 'Criar'} Serviço
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}

interface ServiceDialogProps {
  service: Service | null
  providers: Provider[]
  onSave: (service: Partial<Service> & { providerId: string }) => void
  onClose: () => void
}

function ServiceDialog({ service, providers, onSave, onClose }: ServiceDialogProps) {
  const [formData, setFormData] = useState({
    providerId: service?.providerId || '',
    title: service?.title || '',
    description: service?.description || '',
    price: service ? (service.price / 100).toString() : '',
    duration: service?.duration?.toString() || '',
    active: service?.active ?? true,
    imageUrl: service?.imageUrl || ''
  })
  
  const [imagePreview, setImagePreview] = useState<string>(service?.imageUrl || '')
  const [imageError, setImageError] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Atualizar formData quando o service mudar (edição)
  useEffect(() => {
    if (service) {
      setFormData({
        providerId: service.providerId || '',
        title: service.title || '',
        description: service.description || '',
        price: service.price ? (service.price / 100).toString() : '',
        duration: service.duration ? service.duration.toString() : '',
        active: service.active ?? true,
        imageUrl: service.imageUrl || ''
      })
      setImagePreview(service.imageUrl || '')
    } else {
      // Limpar formulário quando criar novo
      setFormData({
        providerId: providers.length > 0 ? providers[0].id : '',
        title: '',
        description: '',
        price: '',
        duration: '',
        active: true,
        imageUrl: ''
      })
      setImagePreview('')
    }
  }, [service, providers])

  const validateImageDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const isValid = img.width === 800 && img.height === 800
        resolve(isValid)
      }
      img.onerror = () => resolve(false)
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setImageError('Por favor, selecione um arquivo de imagem válido.')
      return
    }

    // Verificar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError('A imagem deve ter no máximo 5MB.')
      return
    }

    setIsUploadingImage(true)
    setImageError('')

    try {
      // Validar dimensões
      const isValidSize = await validateImageDimensions(file)
      if (!isValidSize) {
        setImageError('A imagem deve ter exatamente 800x800 pixels.')
        setIsUploadingImage(false)
        return
      }

      // Converter para base64 para preview (em produção, seria enviado para um servidor)
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setImagePreview(result)
        setFormData({ ...formData, imageUrl: result })
        setIsUploadingImage(false)
      }
      reader.onerror = () => {
        setImageError('Erro ao processar a imagem.')
        setIsUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setImageError('Erro ao validar a imagem.')
      setIsUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImagePreview('')
    setFormData({ ...formData, imageUrl: '' })
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.providerId) {
      toast.error('Selecione um provider')
      return
    }
    
    onSave({
      providerId: formData.providerId,
      title: formData.title,
      description: formData.description,
      price: Math.round(parseFloat(formData.price) * 100),
      duration: parseInt(formData.duration),
      active: formData.active,
      imageUrl: formData.imageUrl || undefined
    })
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {service ? 'Editar Item' : 'Novo Item'}
        </DialogTitle>
        <DialogDescription>
          Preencha as informações do seu serviço
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="provider">
            Serviço <span className="text-red-500">*</span>
          </Label>
          <Select 
            value={formData.providerId} 
            onValueChange={(value) => setFormData({ ...formData, providerId: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um serviço" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name} ({serviceCategoryLabels[provider.category] || provider.category})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Selecione o serviço que oferece este item
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label htmlFor="title">Título do Item</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Cabine 1 - Banho Completo"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva detalhadamente seu item..."
            rows={3}
          />
        </div>

        {/* Upload de Imagem */}
        <div className="space-y-4">
          <Label>Imagem do Item</Label>
          <p className="text-sm text-muted-foreground">
            Adicione uma imagem representativa do seu item (800x800 pixels, máximo 5MB)
          </p>
          
          {imagePreview ? (
            <div className="relative">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-border">
                <img 
                  src={imagePreview} 
                  alt="Preview do item" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg hover:border-aumigo-orange transition-colors">
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="text-xs"
                >
                  {isUploadingImage ? 'Carregando...' : 'Selecionar'}
                </Button>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {imageError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{imageError}</AlertDescription>
            </Alert>
          )}
          
          {imagePreview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploadingImage ? 'Carregando...' : 'Alterar Imagem'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Preço (R$)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0,00"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="60"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
          />
          <Label htmlFor="active">Item ativo (visível para clientes)</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {service ? 'Atualizar' : 'Criar'} Item
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}