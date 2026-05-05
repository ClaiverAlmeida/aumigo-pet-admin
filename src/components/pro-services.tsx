import React, { useState, useEffect } from 'react'
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
import { PhotoCropUpload } from './PhotoCropUpload'
import { ServiceBannerCropField } from './ServiceBannerCropField'
import './pro-services.catalog.css'
import { servicesService, Service as BackendService } from '../services/services.service'
import { serviceProvidersService, ServiceProvider as BackendProvider } from '../services/service-providers.service'
import { companiesService, Company } from '../services/companies.service'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'sonner'
import { lookupCep } from '../utils/viacep'
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
  Loader2,
  MapPin,
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
  'hospedagem': 'HOTEL',
  'transporte_pet': 'TRANSPORT',
  'pet_sitter': 'PET_SITTER'
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
  'TRANSPORT': 'transporte_pet',
  'PET_SITTER': 'pet_sitter',
  'OTHER': 'veterinario'
}

const categories = {
  banho_tosa: 'Banho & Tosa',
  adestramento: 'Adestramento',
  veterinario: 'Veterinário',
  hospedagem: 'Hospedagem',
  transporte_pet: 'Transporte pet',
  pet_sitter: 'Pet Sitter'
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
  price:
    typeof frontend.price === 'number' && !Number.isNaN(frontend.price)
      ? frontend.price / 100
      : undefined,
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
  'TRANSPORT': 'Transporte pet',
  'PET_SITTER': 'Pet Sitter',
  'OTHER': 'Outro'
}

interface Provider {
  id: string
  name: string
  category: string
  description?: string
  banner?: string
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
        banner: (p as any).banner,
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

  const filteredServices = selectedProviderId
    ? services.filter((s) => s.providerId === selectedProviderId)
    : services

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const isNegotiatedCatalogFlow = companyData?.paymentFlowType === 'NEGOTIATED_VIA_CHAT'

  const formatCatalogPriceLabel = (cents: number) => {
    if (isNegotiatedCatalogFlow && (!cents || cents === 0)) return 'A consultar'
    return formatPrice(cents)
  }

  const handleSaveProvider = async (providerData: Partial<Provider> & { useCompanyAddress?: boolean; useCompanyContact?: boolean }) => {
    try {
      const backendData: any = {
        name: providerData.name || '',
        category: providerData.category || 'OTHER',
        description: providerData.description,
        banner: (providerData as any)?.banner || undefined,
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
      <div className="p-4 sm:p-6 lg:p-10 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-aumigo-orange" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div
      className="w-full min-w-0 max-w-7xl mx-auto overflow-x-hidden p-3 pb-[max(1rem,env(safe-area-inset-bottom,0px))] sm:p-6 lg:p-10 space-y-5 sm:space-y-6"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-semibold break-words">Meus Serviços</h2>
          <p className="text-sm text-muted-foreground mt-1 break-words">Gerencie serviços e itens da sua empresa</p>
        </div>
      </div>

      {/* Seção de Providers */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl break-words">Serviços oferecidos</CardTitle>
              <CardDescription className="break-words">
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
                <Button onClick={() => setEditingProvider(null)} className="w-full sm:w-auto">
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
        <CardContent className="p-3 sm:p-6 overflow-hidden">
          {providers.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">Nenhum serviço cadastrado ainda.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Crie um serviço primeiro para depois adicionar itens
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setEditingProvider(null)
                  setIsProviderDialogOpen(true)
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar primeiro serviço
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {providers.map((provider) => (
                <Card
                  key={provider.id}
                  className={`min-w-0 cursor-pointer transition-colors hover:border-aumigo-orange ${selectedProviderId === provider.id ? 'ring-2 ring-aumigo-orange/50 border-aumigo-orange/40' : ''
                    }`}
                  onClick={() => setSelectedProviderId(selectedProviderId === provider.id ? null : provider.id)}
                >
                  <CardHeader className="space-y-0 p-3 sm:p-6">
                    <div className="flex flex-row items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base sm:text-lg break-words pr-1">{provider.name}</CardTitle>
                        <Badge variant="outline" className="mt-2 max-w-full whitespace-normal text-left h-auto py-1">
                          {serviceCategoryLabels[provider.category] || provider.category}
                        </Badge>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" className="h-9 w-9 shrink-0 touch-manipulation" aria-label="Mais opções">
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
                  <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                    {provider.banner ? (
                      <div className="mb-2 aspect-video w-full max-h-28 overflow-hidden rounded-lg border bg-muted/40 sm:max-h-none sm:aspect-[2/1]">
                        <img src={provider.banner} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : null}
                    {provider.description && (
                      <p className="text-sm text-muted-foreground mb-2 break-words line-clamp-3">{provider.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      Toque para filtrar itens · {provider.servicesCount || 0} item(ns)
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Services */}
      <Card className="min-w-0 overflow-hidden">
        <CardHeader className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
            <div className="min-w-0 space-y-2">
              <CardTitle className="text-lg sm:text-xl break-words">Catálogo de Itens</CardTitle>
              <CardDescription className="break-words">
                {filteredServices.length} item(ns), {filteredServices.filter((s) => s.active).length} ativo(s)
                {selectedProviderId ? ' · filtrado' : ''}
              </CardDescription>
              {selectedProviderId ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto touch-manipulation"
                  onClick={() => setSelectedProviderId(null)}
                >
                  Limpar filtro
                </Button>
              ) : null}
            </div>
            <Dialog open={isServiceDialogOpen} onOpenChange={(open) => {
              setIsServiceDialogOpen(open)
              if (!open) {
                setEditingService(null)
              }
            }}>
              <DialogTrigger asChild>
                <Button
                  className="w-full sm:w-auto"
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
                paymentFlowType={companyData?.paymentFlowType}
                onSave={handleSaveService}
                onClose={() => {
                  setEditingService(null)
                  setIsServiceDialogOpen(false)
                }}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 sm:px-6 sm:pb-6">
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
            <>
              <div className="catalog-items-mobile space-y-3">
                {filteredServices.map((service) => {
                  const provider = providers.find(p => p.id === service.providerId)
                  return (
                    <Card key={service.id} className="border border-border/70">
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-start gap-3">
                          {service.imageUrl ? (
                            <ImageWithFallback
                              src={service.imageUrl}
                              alt={service.title}
                              width={56}
                              height={56}
                              className="rounded-lg object-cover shrink-0"
                            />
                          ) : null}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium leading-tight">{service.title}</p>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {service.description || 'Sem descrição'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary" className="max-w-full truncate font-normal">
                            {provider?.name || 'N/A'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{formatCatalogPriceLabel(service.price)}</span>
                          <span className="text-sm text-muted-foreground">{service.duration} min</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={service.active}
                              onCheckedChange={() => toggleActive(service.id)}
                            />
                            <span className="text-sm">{service.active ? 'Ativo' : 'Inativo'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={() => {
                                setEditingService(service)
                                setIsServiceDialogOpen(true)
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-destructive"
                              onClick={() => handleDelete(service.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              <div className="catalog-items-desktop overflow-x-auto -mx-2 md:mx-0">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Serviço</TableHead>
                      <TableHead>{isNegotiatedCatalogFlow ? 'Preço a partir de (R$)' : 'Preço'}</TableHead>
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
                            {!(isNegotiatedCatalogFlow && (!service.price || service.price === 0)) ? (
                              <DollarSign className="w-3 h-3" />
                            ) : null}
                            {formatCatalogPriceLabel(service.price)}
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
              </div>
            </>
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
        banner: (provider as any)?.banner || '',
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
        banner: '',
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
  const [loadingCep, setLoadingCep] = useState(false)

  const handleProviderCepChange = async (cepDigits: string) => {
    const clean = cepDigits.replace(/\D/g, '')
    if (clean.length === 8) {
      setLoadingCep(true)
      try {
        const data = await lookupCep(clean)
        if (data) {
          setFormData((prev) => ({
            ...prev,
            zipCode: data.zipCode,
            address: data.address,
            city: data.city,
            state: data.state,
          }))
          toast.success('Endereço encontrado!')
        } else {
          toast.error('CEP não encontrado')
        }
      } finally {
        setLoadingCep(false)
      }
    } else {
      setFormData((prev) => ({ ...prev, zipCode: clean }))
    }
  }

  // Sincronizar formulário ao trocar entre edição e novo (evita manter dados do card anterior)
  useEffect(() => {
    if (provider) {
      setFormData({
        name: provider.name || '',
        category: provider.category || 'OTHER',
        description: provider.description || '',
        banner: (provider as any)?.banner || '',
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
      setUseCompanyAddress((provider as any)?.useCompanyAddress ?? true)
      setUseCompanyContact((provider as any)?.useCompanyContact ?? true)
    } else {
      setFormData({
        name: '',
        category: 'OTHER',
        description: '',
        banner: '',
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
      })
      setUseCompanyAddress(true)
      setUseCompanyContact(true)
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
    <DialogContent
      className="left-[50%] top-4 w-[95vw] max-w-[95vw] translate-x-[-50%] translate-y-0 overflow-y-auto overflow-x-hidden p-3 sm:top-[50%] sm:w-[min(100vw-0.75rem,72rem)] sm:max-w-4xl sm:translate-y-[-50%] sm:p-5 lg:max-w-5xl lg:p-6"
      style={{ maxHeight: '90vh', maxWidth: '600px', WebkitOverflowScrolling: 'touch' as any }}
      onPointerDownOutside={(e) => {
        const target = (e as any)?.target as HTMLElement | null
        if (target?.closest?.('.photo-crop-portal-overlay, .photo-crop-portal-card')) {
          e.preventDefault()
        }
      }}
      onInteractOutside={(e) => {
        const target = (e as any)?.target as HTMLElement | null
        if (target?.closest?.('.photo-crop-portal-overlay, .photo-crop-portal-card')) {
          e.preventDefault()
        }
      }}
      onFocusOutside={(e) => {
        const target = (e as any)?.target as HTMLElement | null
        if (target?.closest?.('.photo-crop-portal-overlay, .photo-crop-portal-card')) {
          e.preventDefault()
        }
      }}
    >
      <DialogHeader className="min-w-0 shrink-0 pr-8 text-left">
        <DialogTitle className="break-words">
          {provider ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <DialogDescription className="break-words">
          Crie um serviço para organizar seus itens por tipo
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pb-2">
        <div className="min-w-0">
          <Label htmlFor="provider-name">Nome do Serviço</Label>
          <Input
            id="provider-name"
            className="min-w-0"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Banho & Tosa, Farmácia, Passeios..."
            required
          />
        </div>

        <div className="min-w-0">
          <Label htmlFor="provider-category">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={6} className="max-h-[min(70vh,22rem)] w-[var(--radix-select-trigger-width)]">
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

        <ServiceBannerCropField
          value={(formData as any).banner}
          onChange={(url) => setFormData((prev) => ({ ...prev, banner: url }))}
          onRemove={() => setFormData((prev) => ({ ...prev, banner: '' }))}
          uploadType="SERVICE_IMAGE"
          uploadDescription="Banner do serviço"
          outputSize={{ width: 1280, height: 720 }}
          defaultFileName="provider-banner.jpg"
        />

        {/* Checkbox para usar endereço da empresa */}
        <div className="flex items-start gap-2 pb-2 border-b">
          <Switch
            id="use-company-address"
            className="mt-0.5 shrink-0"
            checked={useCompanyAddress}
            onCheckedChange={(checked) => {
              setUseCompanyAddress(checked)
            }}
          />
          <Label htmlFor="use-company-address" className="text-sm font-medium leading-snug">
            Usar endereço da empresa
          </Label>
        </div>

        {/* Campos de Localização - Mostrar apenas se NÃO usar dados da empresa */}
        {!useCompanyAddress && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="provider-zipCode">CEP</Label>
                <div className="relative">
                  <Input
                    id="provider-zipCode"
                    className="pl-9 pr-9"
                    value={formData.zipCode}
                    placeholder="00000-000"
                    maxLength={9}
                    inputMode="numeric"
                    autoComplete="postal-code"
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '')
                      void handleProviderCepChange(digits)
                    }}
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Digite o CEP para preencher rua, cidade e UF automaticamente
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div className="flex items-start gap-2 pb-2 border-b pt-4">
          <Switch
            id="use-company-contact"
            className="mt-0.5 shrink-0"
            checked={useCompanyContact}
            onCheckedChange={(checked) => {
              setUseCompanyContact(checked)
            }}
          />
          <Label htmlFor="use-company-contact" className="text-sm font-medium leading-snug">
            Usar contato da empresa
          </Label>
        </div>

        {/* Campos de Contato - Mostrar apenas se NÃO usar dados da empresa */}
        {!useCompanyContact && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
          <div className="flex items-start gap-2">
            <Switch
              id="provider-offersDelivery"
              className="mt-0.5 shrink-0"
              checked={formData.offersDelivery}
              onCheckedChange={(checked) => setFormData({ ...formData, offersDelivery: checked })}
            />
            <Label htmlFor="provider-offersDelivery" className="text-sm leading-snug">Oferece entrega</Label>
          </div>
          <div className="flex items-start gap-2">
            <Switch
              id="provider-offersHomeService"
              className="mt-0.5 shrink-0"
              checked={formData.offersHomeService}
              onCheckedChange={(checked) => setFormData({ ...formData, offersHomeService: checked })}
            />
            <Label htmlFor="provider-offersHomeService" className="text-sm leading-snug">Atendimento domiciliar</Label>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
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
  paymentFlowType?: Company['paymentFlowType']
  onSave: (service: Partial<Service> & { providerId: string }) => void
  onClose: () => void
}

function ServiceDialog({ service, providers, paymentFlowType, onSave, onClose }: ServiceDialogProps) {
  const isNegotiatedFlow = paymentFlowType === 'NEGOTIATED_VIA_CHAT'

  const [showOptionalPrice, setShowOptionalPrice] = useState(
    () => !!(service && isNegotiatedFlow && service.price > 0),
  )

  const [formData, setFormData] = useState({
    providerId: service?.providerId || '',
    title: service?.title || '',
    description: service?.description || '',
    price: service ? (service.price / 100).toString() : '',
    duration: service?.duration?.toString() || '',
    active: service?.active ?? true,
    imageUrl: service?.imageUrl || ''
  })

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
    } else {
      setFormData({
        providerId: providers.length > 0 ? providers[0].id : '',
        title: '',
        description: '',
        price: '',
        duration: '',
        active: true,
        imageUrl: ''
      })
    }
  }, [service, providers])

  useEffect(() => {
    if (!isNegotiatedFlow) {
      setShowOptionalPrice(true)
      return
    }
    if (service && service.price > 0) {
      setShowOptionalPrice(true)
    } else {
      setShowOptionalPrice(false)
    }
  }, [service, isNegotiatedFlow])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.providerId) {
      toast.error('Selecione um provider')
      return
    }

    let priceCents: number
    if (isNegotiatedFlow && !showOptionalPrice) {
      priceCents = 0
    } else {
      const raw = formData.price?.trim() ?? ''
      if (!raw) {
        toast.error(
          isNegotiatedFlow
            ? 'Informe o preço de referência ou desative a opção'
            : 'Informe o preço',
        )
        return
      }
      const parsed = parseFloat(raw.replace(',', '.'))
      if (Number.isNaN(parsed) || parsed < 0) {
        toast.error('Informe um preço válido')
        return
      }
      priceCents = Math.round(parsed * 100)
    }

    const durationNum = parseInt(formData.duration, 10)
    if (Number.isNaN(durationNum) || durationNum < 15) {
      toast.error('Informe a duração (mín. 15 minutos)')
      return
    }

    onSave({
      providerId: formData.providerId,
      title: formData.title,
      description: formData.description,
      price: priceCents,
      duration: durationNum,
      active: formData.active,
      imageUrl: formData.imageUrl || undefined
    })
  }

  return (
    <DialogContent
      className="left-[50%] top-4 flex w-[95vw] max-w-[95vw] translate-x-[-50%] translate-y-0 flex-col overflow-hidden p-3 sm:top-[50%] sm:w-[min(100vw-0.75rem,72rem)] sm:max-w-4xl sm:translate-y-[-50%] sm:p-5 lg:max-w-5xl lg:p-6"
      style={{ maxHeight: '90vh', maxWidth: '600px', WebkitOverflowScrolling: 'touch' as any }}
    >
      <DialogHeader className="min-w-0 shrink-0 pr-8 text-left">
        <DialogTitle className="break-words">{service ? 'Editar Item' : 'Novo Item'}</DialogTitle>
        <DialogDescription className="break-words">
          Preencha as informações do seu serviço
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 -mr-1">
          <div>
            <Label htmlFor="provider">
              Serviço <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.providerId}
              onValueChange={(value) => setFormData({ ...formData, providerId: value })}
              required
            >
              <SelectTrigger className="w-full min-w-0">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent position="popper" sideOffset={6} className="max-h-[min(70vh,22rem)] w-[var(--radix-select-trigger-width)]">
                {providers.map((provider) => (
                  <SelectItem key={provider.id} value={provider.id}>
                    <span className="line-clamp-2 break-words text-left">
                      {provider.name} ({serviceCategoryLabels[provider.category] || provider.category})
                    </span>
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

          {/* Foto do serviço — mesmo componente do app (PetForm) */}
          <PhotoCropUpload
            value={formData.imageUrl}
            onUploaded={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            onRemove={() => setFormData((prev) => ({ ...prev, imageUrl: '' }))}
            uploadType="SERVICE_IMAGE"
            uploadDescription="Foto do serviço"
            loadingMessage="Enviando foto do serviço..."
            successMessage="Foto do serviço adicionada!"
            modalTitle="Cortar foto do serviço"
            modalSubtitle="Ajuste a área de corte. A foto será quadrada. Arraste para mover e use o zoom."
            confirmButtonText="Cortar e usar"
            sectionTitle="Foto do serviço"
            sectionDescription="Imagem do produto/serviço. Máximo 5MB."
            fallbackLabel="?"
            variant="product"
            defaultFileName="service-photo.jpg"
          />

          {isNegotiatedFlow ? (
            <div className="flex items-start gap-2 rounded-lg border border-border/80 bg-muted/30 p-3">
              <Switch
                id="service-optional-price"
                className="mt-0.5 shrink-0"
                checked={showOptionalPrice}
                onCheckedChange={(checked) => {
                  setShowOptionalPrice(checked)
                  if (!checked) {
                    setFormData((prev) => ({ ...prev, price: '' }))
                  }
                }}
              />
              <div className="min-w-0 space-y-0.5">
                <Label htmlFor="service-optional-price" className="text-sm font-medium leading-snug">
                  Informar preço de referência (opcional)
                </Label>
                <p className="text-xs text-muted-foreground leading-snug">
                  No fluxo por consulta você não é obrigado a cadastrar valor. Se quiser, ative e informe um valor
                  &quot;a partir de&quot; para orientar o tutor.
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(!isNegotiatedFlow || showOptionalPrice) ? (
              <div>
                <Label htmlFor="price">
                  {isNegotiatedFlow ? 'Preço a partir de (R$)' : 'Preço (R$)'}
                </Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0,00"
                  required={!isNegotiatedFlow || showOptionalPrice}
                />
              </div>
            ) : null}

            <div className={isNegotiatedFlow && !showOptionalPrice ? 'sm:col-span-2' : undefined}>
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

          <div className="flex items-start gap-2">
            <Switch
              id="active"
              className="mt-0.5 shrink-0"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            />
            <Label htmlFor="active" className="text-sm leading-snug">Item ativo (visível para clientes)</Label>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 flex-shrink-0 pt-4 mt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button type="submit" className="w-full sm:w-auto">
            {service ? 'Atualizar' : 'Criar'} Item
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}