import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { 
  Star, 
  MessageSquare, 
  Filter, 
  TrendingUp, 
  Calendar,
  ChevronDown,
  Reply,
  Send,
  MoreVertical,
  Heart,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'


// Mock data para avaliações
const reviewsData = [
  {
    id: 1,
    client: {
      name: "Ana Clara Silva",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      pets: ["Luna", "Bella"]
    },
    service: "Banho e Tosa",
    rating: 5,
    date: new Date(2025, 0, 15),
    comment: "Excelente profissional! Minha Luna ficou linda e cheirosa. O cuidado e carinho com os animais é notável. Super recomendo!",
    response: null,
    helpful: 12,
    photos: 2
  },
  {
    id: 2,
    client: {
      name: "Carlos Eduardo",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      pets: ["Rex"]
    },
    service: "Consulta Veterinária",
    rating: 5,
    date: new Date(2025, 0, 12),
    comment: "Atendimento impecável! Dr. Maria foi muito atenciosa e explicou tudo detalhadamente sobre a saúde do Rex. Consultório bem equipado.",
    response: {
      text: "Muito obrigada pelo feedback, Carlos! Fico feliz em saber que o Rex está bem. Qualquer dúvida, estarei à disposição!",
      date: new Date(2025, 0, 13)
    },
    helpful: 8,
    photos: 0
  },
  {
    id: 3,
    client: {
      name: "Mariana Santos",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      pets: ["Mimi", "Totó"]
    },
    service: "Adestramento",
    rating: 4,
    date: new Date(2025, 0, 10),
    comment: "Ótimo trabalho! O Totó melhorou muito o comportamento. Gostaria de mais sessões práticas, mas no geral estou satisfeita.",
    response: null,
    helpful: 5,
    photos: 1
  },
  {
    id: 4,
    client: {
      name: "Pedro Lima",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      pets: ["Buddy"]
    },
    service: "Vacinação",
    rating: 5,
    date: new Date(2025, 0, 8),
    comment: "Processo muito tranquilo. Buddy nem sentiu a aplicação. Profissional muito experiente e cuidadosa. Voltarei em breve!",
    response: {
      text: "Obrigada, Pedro! O Buddy é um amor. Aguardo vocês para a próxima dose!",
      date: new Date(2025, 0, 8)
    },
    helpful: 15,
    photos: 0
  },
  {
    id: 5,
    client: {
      name: "Juliana Costa",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
      pets: ["Princesa"]
    },
    service: "Banho e Tosa",
    rating: 3,
    date: new Date(2025, 0, 5),
    comment: "O serviço foi ok, mas demorou mais que o esperado. A Princesa ficou bem, mas esperava um resultado melhor no corte.",
    response: null,
    helpful: 2,
    photos: 0
  }
]

const statsData = {
  averageRating: 4.6,
  totalReviews: 127,
  ratingDistribution: [
    { stars: 5, count: 89, percentage: 70 },
    { stars: 4, count: 25, percentage: 20 },
    { stars: 3, count: 8, percentage: 6 },
    { stars: 2, count: 3, percentage: 2 },
    { stars: 1, count: 2, percentage: 2 }
  ],
  monthlyGrowth: 12,
  responseRate: 85
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4"
  
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconSize} ${
            star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review, onReply }: { review: any; onReply: (id: number) => void }) {
  return (
    <Card className="border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.client.avatar} />
              <AvatarFallback>{review.client.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-[#2E6F79]">{review.client.name}</h4>
                <Badge variant="outline" className="text-xs text-[#6B7280]">
                  {review.client.pets.join(', ')}
                </Badge>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <StarRating rating={review.rating} />
                <span className="text-sm text-[#6B7280]">
                  {review.date.toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-[#5EC4E7] text-white">{review.service}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Marcar como importante
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reportar problema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <p className="text-[#6B7280] mb-4 leading-relaxed">{review.comment}</p>
        
        {review.photos > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <div className="flex -space-x-2">
              {[...Array(review.photos)].map((_, i) => (
                <div key={i} className="w-8 h-8 bg-gray-200 rounded border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-500">📷</span>
                </div>
              ))}
            </div>
            <span className="text-sm text-[#6B7280]">{review.photos} foto{review.photos > 1 ? 's' : ''}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="text-[#6B7280] hover:text-[#2E6F79]">
              <Heart className="h-4 w-4 mr-1" />
              {review.helpful} úteis
            </Button>
          </div>
          
          {!review.response && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onReply(review.id)}
              className="border-[#FF9B57] text-[#FF9B57] hover:bg-[#FF9B57] hover:text-white"
            >
              <Reply className="h-4 w-4 mr-1" />
              Responder
            </Button>
          )}
        </div>
        
        {review.response && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="bg-[#f8f9fa] p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[#2E6F79]">Maria Souza</span>
                <Badge variant="secondary" className="text-xs bg-[#FF9B57] text-white">Profissional</Badge>
                <span className="text-xs text-[#6B7280] ml-auto">
                  {review.response.date.toLocaleDateString('pt-BR')}
                </span>
              </div>
              <p className="text-[#6B7280] text-sm">{review.response.text}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ProReviews() {
  const [selectedRating, setSelectedRating] = useState<string>("all")
  const [selectedService, setSelectedService] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyText, setReplyText] = useState("")

  const handleReply = (reviewId: number) => {
    setReplyingTo(reviewId)
    setReplyText("")
  }

  const handleSendReply = () => {
    // Aqui enviaria a resposta para a API
    console.log(`Resposta para avaliação ${replyingTo}: ${replyText}`)
    setReplyingTo(null)
    setReplyText("")
  }

  const filteredReviews = reviewsData.filter(review => {
    if (selectedRating !== "all" && review.rating !== parseInt(selectedRating)) return false
    if (selectedService !== "all" && review.service !== selectedService) return false
    // Adicionar filtro de período se necessário
    return true
  })

  return (
    <div className="p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[#2E6F79] mb-2">Avaliações dos Clientes</h1>
          <p className="text-[#6B7280]">Gerencie e responda às avaliações dos seus serviços</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-[#5EC4E7] text-[#5EC4E7] hover:bg-[#5EC4E7] hover:text-white">
            <TrendingUp className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#2E6F79] flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Resumo das Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#2E6F79] mb-2">{statsData.averageRating}</div>
                <StarRating rating={Math.round(statsData.averageRating)} size="md" />
                <p className="text-[#6B7280] mt-1">{statsData.totalReviews} avaliações</p>
              </div>
              
              <div className="space-y-2">
                {statsData.ratingDistribution.map((item) => (
                  <div key={item.stars} className="flex items-center gap-2">
                    <span className="text-sm w-6">{item.stars}★</span>
                    <Progress value={item.percentage} className="flex-1" />
                    <span className="text-sm text-[#6B7280] w-12">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#8DD9B6] bg-opacity-20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-[#8DD9B6]" />
                </div>
                <div>
                  <div className="font-semibold text-[#2E6F79]">+{statsData.monthlyGrowth}%</div>
                  <p className="text-sm text-[#6B7280]">Este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#FF9B57] bg-opacity-20 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-[#FF9B57]" />
                </div>
                <div>
                  <div className="font-semibold text-[#2E6F79]">{statsData.responseRate}%</div>
                  <p className="text-sm text-[#6B7280]">Taxa de resposta</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#6B7280]" />
              <span className="text-sm font-medium text-[#2E6F79]">Filtrar por:</span>
            </div>
            
            <Select value={selectedRating} onValueChange={setSelectedRating}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as estrelas</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3">3 estrelas</SelectItem>
                <SelectItem value="2">2 estrelas</SelectItem>
                <SelectItem value="1">1 estrela</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os serviços</SelectItem>
                <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                <SelectItem value="Consulta Veterinária">Consulta Veterinária</SelectItem>
                <SelectItem value="Adestramento">Adestramento</SelectItem>
                <SelectItem value="Vacinação">Vacinação</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo período</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-[#6B7280]">{filteredReviews.length} avaliações encontradas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de resposta */}
      {replyingTo && (
        <Card className="border-[#FF9B57]">
          <CardHeader>
            <CardTitle className="text-[#FF9B57] flex items-center gap-2">
              <Reply className="h-5 w-5" />
              Responder Avaliação
            </CardTitle>
            <CardDescription>
              Responda de forma profissional e cordial à avaliação do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-20"
              />
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="bg-[#FF9B57] hover:bg-[#e8864a] text-white"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Resposta
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setReplyingTo(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de avaliações */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-[#2E6F79] mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-[#6B7280]">Ajuste os filtros para ver mais avaliações</p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onReply={handleReply}
            />
          ))
        )}
      </div>

      {/* Pagination placeholder */}
      {filteredReviews.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" className="border-[#FF9B57] text-[#FF9B57] hover:bg-[#FF9B57] hover:text-white">
            Ver mais avaliações
          </Button>
        </div>
      )}
    </div>
  )
}