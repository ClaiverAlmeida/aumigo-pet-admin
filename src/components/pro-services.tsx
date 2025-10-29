import { useState, useRef } from 'react'
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
  AlertCircle
} from 'lucide-react'

interface Service {
  id: string
  title: string
  category: 'banho_tosa' | 'adestramento' | 'veterinario' | 'hospedagem'
  description: string
  priceCents: number
  durationMin: number
  active: boolean
  imageUrl?: string
}

const mockServices: Service[] = [
  {
    id: '1',
    title: 'Banho & Tosa Completo',
    category: 'banho_tosa',
    description: 'Banho com produtos premium, tosa higiênica, corte de unhas e limpeza de ouvido',
    priceCents: 8000,
    durationMin: 120,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=300&h=200&fit=crop'
  },
  {
    id: '2', 
    title: 'Adestramento Básico',
    category: 'adestramento',
    description: 'Comandos básicos: sentar, ficar, vir, deitar. Socialização e correção de comportamentos',
    priceCents: 15000,
    durationMin: 60,
    active: true,
    imageUrl: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop'
  },
  {
    id: '3',
    title: 'Consulta Veterinária',
    category: 'veterinario', 
    description: 'Consulta geral, exame clínico completo e orientações de saúde',
    priceCents: 12000,
    durationMin: 45,
    active: false,
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=200&fit=crop'
  }
]

const categories = {
  banho_tosa: 'Banho & Tosa',
  adestramento: 'Adestramento', 
  veterinario: 'Veterinário',
  hospedagem: 'Hospedagem'
}

export function ProServices() {
  const [services, setServices] = useState<Service[]>(mockServices)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const handleSave = (serviceData: Partial<Service>) => {
    if (editingService) {
      // Atualizar serviço existente
      setServices(services.map(s => 
        s.id === editingService.id ? { ...s, ...serviceData } : s
      ))
    } else {
      // Criar novo serviço
      const newService: Service = {
        id: Date.now().toString(),
        title: serviceData.title || '',
        category: serviceData.category || 'banho_tosa',
        description: serviceData.description || '',
        priceCents: serviceData.priceCents || 0,
        durationMin: serviceData.durationMin || 60,
        active: serviceData.active ?? true,
        imageUrl: serviceData.imageUrl
      }
      setServices([...services, newService])
    }
    
    setEditingService(null)
    setIsDialogOpen(false)
  }

  const handleDelete = (serviceId: string) => {
    setServices(services.filter(s => s.id !== serviceId))
  }

  const toggleActive = (serviceId: string) => {
    setServices(services.map(s => 
      s.id === serviceId ? { ...s, active: !s.active } : s
    ))
  }

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Meus Serviços</h2>
          <p className="text-muted-foreground">Gerencie seu catálogo de serviços</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingService(null)}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Button>
          </DialogTrigger>
          
          <ServiceDialog 
            service={editingService}
            onSave={handleSave}
            onClose={() => setIsDialogOpen(false)}
          />
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Serviços</CardTitle>
          <CardDescription>
            {services.length} serviço(s) cadastrado(s), {services.filter(s => s.active).length} ativo(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serviço</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
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
                          {service.description}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {categories[service.category]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatPrice(service.priceCents)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {service.durationMin}min
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
                        <DropdownMenuItem onClick={() => {
                          setEditingService(service)
                          setIsDialogOpen(true)
                        }}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(service.id)}
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
        </CardContent>
      </Card>
    </div>
  )
}

interface ServiceDialogProps {
  service: Service | null
  onSave: (service: Partial<Service>) => void
  onClose: () => void
}

function ServiceDialog({ service, onSave, onClose }: ServiceDialogProps) {
  const [formData, setFormData] = useState({
    title: service?.title || '',
    category: service?.category || 'banho_tosa' as const,
    description: service?.description || '',
    price: service ? (service.priceCents / 100).toString() : '',
    duration: service?.durationMin?.toString() || '',
    active: service?.active ?? true,
    imageUrl: service?.imageUrl || ''
  })
  
  const [imagePreview, setImagePreview] = useState<string>(service?.imageUrl || '')
  const [imageError, setImageError] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    
    onSave({
      title: formData.title,
      category: formData.category,
      description: formData.description,
      priceCents: Math.round(parseFloat(formData.price) * 100),
      durationMin: parseInt(formData.duration),
      active: formData.active,
      imageUrl: formData.imageUrl || undefined
    })
  }

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {service ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <DialogDescription>
          Preencha as informações do seu serviço
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="title">Título do Serviço</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Banho & Tosa Completo"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categories).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descreva detalhadamente seu serviço..."
            rows={3}
          />
        </div>

        {/* Upload de Imagem */}
        <div className="space-y-4">
          <Label>Imagem do Serviço</Label>
          <p className="text-sm text-muted-foreground">
            Adicione uma imagem representativa do seu serviço (800x800 pixels, máximo 5MB)
          </p>
          
          {imagePreview ? (
            <div className="relative">
              <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-dashed border-border">
                <img 
                  src={imagePreview} 
                  alt="Preview do serviço" 
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
          <Label htmlFor="active">Serviço ativo (visível para clientes)</Label>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit">
            {service ? 'Atualizar' : 'Criar'} Serviço
          </Button>
        </div>
      </form>
    </DialogContent>
  )
}