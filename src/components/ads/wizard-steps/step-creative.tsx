import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Alert, AlertDescription } from '../../ui/alert'
import { ImageWithFallback } from '../../figma/ImageWithFallback'
import { 
  Image as ImageIcon,
  Upload,
  Eye,
  Smartphone,
  Monitor,
  AlertCircle,
  Camera,
  X,
  Star,
  MapPin,
  Clock
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

interface StepCreativeProps {
  data: CampaignData
  onUpdate: (updates: Partial<CampaignData>) => void
}

// Mock data para preview
const mockServiceData = {
  name: 'Banho & Tosa Completo',
  price: 'R$ 80,00',
  rating: 4.8,
  reviewCount: 127,
  distance: '2.3 km',
  duration: '2h',
  image: 'https://images.unsplash.com/photo-1581888227599-779811939961?w=300&h=200&fit=crop'
}

export function StepCreative({ data, onUpdate }: StepCreativeProps) {
  const [imageError, setImageError] = useState('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [previewMode, setPreviewMode] = useState<'home' | 'search'>('home')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMessageChange = (message: string) => {
    onUpdate({
      creative: {
        ...data.creative,
        message
      }
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
      // Converter para base64 para preview
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        onUpdate({
          creative: {
            ...data.creative,
            imageUrl: result
          }
        })
        setIsUploadingImage(false)
      }
      reader.onerror = () => {
        setImageError('Erro ao processar a imagem.')
        setIsUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setImageError('Erro ao fazer upload da imagem.')
      setIsUploadingImage(false)
    }
  }

  const removeImage = () => {
    onUpdate({
      creative: {
        ...data.creative,
        imageUrl: ''
      }
    })
    setImageError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const PreviewCard = ({ isMobile = false }) => {
    const serviceData = {
      ...mockServiceData,
      name: data.serviceName || mockServiceData.name,
      image: data.creative.imageUrl || mockServiceData.image
    }

    return (
      <div className={`
        bg-white border rounded-lg shadow-sm overflow-hidden
        ${isMobile ? 'w-full max-w-xs' : 'w-full max-w-sm'}
      `}>
        {/* Badge Patrocinado */}
        <div className="relative">
          <ImageWithFallback
            src={serviceData.image}
            alt={serviceData.name}
            width={isMobile ? 300 : 400}
            height={isMobile ? 160 : 200}
            className="w-full object-cover"
          />
          <Badge className="absolute top-2 left-2 bg-aumigo-orange text-white text-xs">
            Patrocinado
          </Badge>
        </div>

        <div className="p-3 space-y-2">
          <div>
            <h4 className="font-medium text-sm line-clamp-1">{serviceData.name}</h4>
            {data.creative.message && (
              <p className="text-xs text-aumigo-orange font-medium mt-1">
                {data.creative.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>{serviceData.rating}</span>
              <span>({serviceData.reviewCount})</span>
            </div>
            <span className="font-medium text-foreground">{serviceData.price}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{serviceData.distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{serviceData.duration}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <ImageIcon className="w-12 h-12 text-aumigo-orange mx-auto" />
        <h4>Configure a aparência do seu anúncio</h4>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Personalize a mensagem e imagem que aparecerão no seu anúncio promocional.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuração de Criativos */}
        <div className="space-y-6">
          {/* Imagem */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Camera className="w-5 h-5" />
                Imagem do Anúncio
              </CardTitle>
              <CardDescription>
                Use uma imagem atrativa do seu serviço (recomendado: 400x300px)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.creative.imageUrl ? (
                <div className="relative">
                  <div className="w-full h-48 rounded-lg overflow-hidden border">
                    <img 
                      src={data.creative.imageUrl} 
                      alt="Preview do anúncio" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Imagem padrão do serviço será usada
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploadingImage ? 'Carregando...' : data.creative.imageUrl ? 'Alterar Imagem' : 'Fazer Upload'}
                </Button>
              </div>

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
            </CardContent>
          </Card>

          {/* Mensagem */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensagem Promocional</CardTitle>
              <CardDescription>
                Adicione uma mensagem curta e chamativa (máximo 60 caracteres)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Textarea
                  placeholder="Ex: Banho & tosa com desconto hoje!"
                  value={data.creative.message}
                  onChange={(e) => handleMessageChange(e.target.value)}
                  maxLength={60}
                  rows={2}
                />
                <div className="flex justify-between text-xs">
                  <span className={data.creative.message.length > 60 ? 'text-destructive' : 'text-muted-foreground'}>
                    {data.creative.message.length}/60 caracteres
                  </span>
                  {data.creative.message.length > 60 && (
                    <span className="text-destructive">Muito longa</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Sugestões:</Label>
                <div className="grid gap-1">
                  {[
                    'Promoção especial hoje!',
                    'Agende já com desconto!',
                    'Cuidado premium para seu pet',
                    'Novo cliente? Ganhe 10% off!'
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="justify-start text-xs h-7"
                      onClick={() => handleMessageChange(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Eye className="w-5 h-5" />
                Preview do Anúncio
              </CardTitle>
              <CardDescription>
                Veja como seu anúncio aparecerá no aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Toggle Preview Mode */}
              <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
                <Button
                  type="button"
                  variant={previewMode === 'home' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('home')}
                  className="flex-1"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button
                  type="button"
                  variant={previewMode === 'search' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setPreviewMode('search')}
                  className="flex-1"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  Busca
                </Button>
              </div>

              {/* Preview */}
              <div className="flex justify-center">
                {previewMode === 'home' ? (
                  <div className="space-y-2">
                    <p className="text-xs text-center text-muted-foreground">
                      Carrossel "Destaques perto de você"
                    </p>
                    <PreviewCard />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-center text-muted-foreground">
                      Resultado de busca patrocinado
                    </p>
                    <PreviewCard isMobile />
                  </div>
                )}
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Este é um preview aproximado. A aparência final pode variar dependendo 
                  da versão do app e configurações do usuário.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}