import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Textarea } from './ui/textarea'
import { Progress } from './ui/progress'
import {
  Star,
  MessageSquare,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Reply,
  Send,
  MoreVertical,
  Heart,
  AlertCircle,
  Loader2,
  Pin
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { reviewsService, type Review as BackendReview, type ReviewStatistics } from '../services'
import { toast } from 'sonner'
import { ReportModal } from './report-modal'

interface ReviewData {
  id: string | number
  client: {
    name: string
    avatar?: string
    pets: string[]
  }
  company: {
    id: string
    name: string
  }
  service: string
  rating: number
  date: Date
  comment?: string
  response?: {
    text: string
    date: Date
  } | null
  helpful: number
  helpfulByUser?: boolean
  reportReason?: string
  isImportant?: boolean
}

function convertBackendReview(backendReview: BackendReview): ReviewData {
  return {
    id: backendReview.id,
    client: {
      name: backendReview.author?.name || 'Cliente',
      avatar: backendReview.author?.profilePicture,
      pets: Array.isArray(backendReview.petNames) ? backendReview.petNames : []
    },
    company: {
      id: backendReview.company?.id || '',
      name: backendReview.company?.name || 'Empresa'
    },
    service: backendReview.provider?.name || backendReview.providerName || 'Serviço',
    rating: backendReview.rating,
    date: new Date(backendReview.createdAt),
    comment: backendReview.comment,
    response: backendReview.responseText && backendReview.responseDate ? {
      text: backendReview.responseText,
      date: new Date(backendReview.responseDate)
    } : null,
    helpful: backendReview.helpful || 0,
    helpfulByUser: backendReview.helpfulByUser ?? false,
    reportReason: backendReview.reportReason,
    isImportant: backendReview.isImportant ?? false
  }
}


function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "lg" ? "w-6 h-6" : size === "md" ? "w-5 h-5" : "w-4 h-4"

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${iconSize} ${star <= rating ? "text-yellow-500 fill-current" : "text-gray-300"
            }`}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review, onReply, onHelpful, onReport, onMarkImportant, helpfulLoading }: {
  review: ReviewData
  onReply: (id: string | number) => void
  onHelpful: (id: string | number) => void
  onReport: (review: ReviewData) => void
  onMarkImportant: (review: ReviewData) => void
  helpfulLoading?: boolean
}) {
  return (
    <Card className={`border border-gray-200 ${review.isImportant ? 'ring-1 ring-[#5EC4E7]/50' : ''}`}>
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
                {review.client.pets.length > 0 && (
                  <Badge variant="outline" className="text-xs text-[#6B7280]">
                    {review.client.pets.join(', ')}
                  </Badge>
                )}
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
            {review.isImportant && (
              <Badge variant="outline" className="border-[#5EC4E7] text-[#5EC4E7] gap-1">
                <Pin className="h-3 w-3" />
                Fixado
              </Badge>
            )}
            <Badge className="bg-[#5EC4E7] text-white">{review.service}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onMarkImportant(review)}>
                  {review.isImportant ? (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Remover destaque
                    </>
                  ) : (
                    <>
                      <Pin className="h-4 w-4 mr-2" />
                      Marcar como importante
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onReport(review)}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Reportar problema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {review.comment && (
          <p className="text-[#6B7280] mb-4 leading-relaxed">{review.comment}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              disabled={helpfulLoading}
              className={`${review.helpfulByUser ? 'text-red-500' : 'text-[#6B7280]'} hover:text-[#2E6F79]`}
              onClick={() => onHelpful(review.id)}
            >
              <Heart className={`h-4 w-4 mr-1 ${review.helpfulByUser ? 'fill-current' : ''}`} />
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
                  <AvatarFallback>P</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-[#2E6F79]">{review.company.name}</span>
                <Badge variant="secondary" className="text-xs bg-[#FF9B57] text-white">Empresa</Badge>
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
  const [replyingTo, setReplyingTo] = useState<string | number | null>(null)
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [sendingReply, setSendingReply] = useState(false)
  const [helpfulLoadingId, setHelpfulLoadingId] = useState<string | number | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportTargetId, setReportTargetId] = useState<string | number | null>(null)
  const [reportExistingReason, setReportExistingReason] = useState<string | null>(null)

  const [reviewsData, setReviewsData] = useState<ReviewData[]>([])
  const [statsData, setStatsData] = useState<ReviewStatistics>({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [
      { stars: 5, count: 0, percentage: 0 },
      { stars: 4, count: 0, percentage: 0 },
      { stars: 3, count: 0, percentage: 0 },
      { stars: 2, count: 0, percentage: 0 },
      { stars: 1, count: 0, percentage: 0 }
    ],
    monthlyGrowth: 0,
    responseRate: 0
  })

  const loadStatistics = async () => {
    setLoadingStats(true)
    try {
      const result = await reviewsService.obterEstatisticas()

      if (result.success && result.data) {
        setStatsData(result.data)
      } else {
        toast.error(result.error || 'Erro ao carregar estatísticas')
      }
    } catch (error: any) {
      toast.error('Erro ao conectar com o servidor')
    } finally {
      setLoadingStats(false)
    }
  }

  const loadReviews = async () => {
    setLoading(true)
    try {
      const filters: any = { limit: 100 }
      if (selectedRating !== "all") filters.rating = parseInt(selectedRating)
      if (selectedService !== "all") filters.providerId = selectedService

      const result = await reviewsService.getAll(filters)

      if (result.success && result.data) {
        const backendReviews = result.data.data || []
        const convertedReviews = backendReviews.map(convertBackendReview)
        setReviewsData(convertedReviews)
      } else {
        toast.error(result.error || 'Erro ao carregar avaliações')
        setReviewsData([])
      }
    } catch (error: any) {
      toast.error('Erro ao conectar com o servidor')
      setReviewsData([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStatistics()
    loadReviews()
  }, [])

  useEffect(() => {
    loadReviews()
  }, [selectedRating, selectedService, selectedPeriod])

  const handleReply = (reviewId: string | number) => {
    setReplyingTo(reviewId)
    setReplyText("")
  }

  const handleSendReply = async () => {
    if (!replyingTo || !replyText.trim()) return

    setSendingReply(true)
    try {
      const result = await reviewsService.responder(String(replyingTo), { responseText: replyText })
      if (result.success) {
        toast.success(result.message || 'Resposta enviada com sucesso')
        setReplyingTo(null)
        setReplyText("")
        await Promise.all([loadReviews(), loadStatistics()])
      } else {
        toast.error(result.error || 'Erro ao enviar resposta')
      }
    } catch (error: any) {
      toast.error('Erro ao enviar resposta')
    } finally {
      setSendingReply(false)
    }
  }

  const handleHelpful = async (reviewId: string | number) => {
    if (helpfulLoadingId) return
    setHelpfulLoadingId(reviewId)
    try {
      const result = await reviewsService.marcarComoUtil(String(reviewId))
      if (result.success && result.data) {
        const isNowMarked = result.helpfulByUser ?? result.data.helpfulByUser ?? false
        setReviewsData(prev => prev.map(r => {
          if (r.id !== reviewId) return r
          const count = typeof result.data?.helpful === 'number' ? result.data.helpful : (isNowMarked ? r.helpful + 1 : Math.max(0, r.helpful - 1))
          return {
            ...r,
            helpful: count,
            helpfulByUser: isNowMarked
          }
        }))
        toast.success(result.message || (isNowMarked ? 'Marcado como útil' : 'Removido dos úteis'))
      } else {
        toast.error(result.error || 'Erro ao marcar como útil')
      }
    } catch (error: any) {
      toast.error('Erro ao marcar como útil')
    } finally {
      setHelpfulLoadingId(null)
    }
  }

  const handleReport = (review: ReviewData) => {
    setReportTargetId(review.id)
    setReportExistingReason(review.reportReason ?? null)
    setReportModalOpen(true)
  }

  const handleMarkImportant = async (review: ReviewData) => {
    try {
      const result = await reviewsService.marcarComoImportante(String(review.id))
      if (result.success) {
        toast.success(result.message || (result.data?.isImportant ? 'Marcado como importante' : 'Destaque removido'))
        setReviewsData(prev => prev.map(r =>
          r.id === review.id ? { ...r, isImportant: result.data?.isImportant ?? !r.isImportant } : r
        ))
      } else {
        toast.error(result.error || 'Erro ao atualizar')
      }
    } catch (error: any) {
      toast.error('Erro ao marcar como importante')
    }
  }

  const handleReportSubmit = async (reasonReport: string) => {
    if (!reportTargetId) return
    const result = await reviewsService.reportarProblema(String(reportTargetId), reasonReport)
    if (result.success) {
      toast.success(result.data?.alreadyReported ? 'Reporte já registrado' : 'Problema reportado com sucesso')
      if (result.data?.reportReason) setReportExistingReason(result.data.reportReason)
      await loadReviews()
    } else {
      throw new Error(result.error)
    }
    setReportTargetId(null)
  }

  const filteredReviews = reviewsData
    .filter(review => {
      if (selectedRating !== "all" && review.rating !== parseInt(selectedRating)) return false
      if (selectedService !== "all" && review.service !== selectedService) return false
      if (selectedPeriod !== "all") {
        const now = new Date()
        const reviewDate = review.date instanceof Date ? review.date : new Date(review.date)
        const cutoff = new Date(now)
        if (selectedPeriod === "7d") cutoff.setDate(cutoff.getDate() - 7)
        else if (selectedPeriod === "30d") cutoff.setDate(cutoff.getDate() - 30)
        else if (selectedPeriod === "90d") cutoff.setDate(cutoff.getDate() - 90)
        if (reviewDate < cutoff) return false
      }
      return true
    })
    .sort((a, b) => {
      // Importantes primeiro; entre importantes, pela data (mais recente primeiro)
      if (a.isImportant && !b.isImportant) return -1
      if (!a.isImportant && b.isImportant) return 1
      if (a.isImportant && b.isImportant) {
        const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime()
        const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime()
        return dateB - dateA
      }
      const dateA = a.date instanceof Date ? a.date.getTime() : new Date(a.date).getTime()
      const dateB = b.date instanceof Date ? b.date.getTime() : new Date(b.date).getTime()
      return dateB - dateA
    })

  return (
    <div className="p-10 space-y-8">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#2E6F79] flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Resumo das Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingStats ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-[#5EC4E7] mx-auto animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#2E6F79] mb-2">
                    {statsData.averageRating > 0 ? statsData.averageRating.toFixed(1) : '0.0'}
                  </div>
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
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  statsData.monthlyGrowth < 0 ? 'bg-red-500/20' :
                  statsData.monthlyGrowth === 0 ? 'bg-gray-300/30' : 'bg-[#8DD9B6]/20'
                }`}>
                  {statsData.monthlyGrowth < 0 ? (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  ) : statsData.monthlyGrowth === 0 ? (
                    <Minus className="h-5 w-5 text-gray-500" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-[#8DD9B6]" />
                  )}
                </div>
                <div>
                  <div className={`font-semibold ${
                    statsData.monthlyGrowth < 0 ? 'text-red-500' :
                    statsData.monthlyGrowth === 0 ? 'text-gray-500' : 'text-[#2E6F79]'
                  }`}>
                    {statsData.monthlyGrowth > 0 ? '+' : ''}{statsData.monthlyGrowth}%
                  </div>
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
                <SelectItem value="Vacinação">Vacinação</SelectItem>
                <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                <SelectItem value="Consulta Veterinária">Consulta Veterinária</SelectItem>
                <SelectItem value="Adestramento">Adestramento</SelectItem>
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
                  disabled={!replyText.trim() || sendingReply}
                  className="bg-[#FF9B57] hover:bg-[#e8864a] text-white"
                >
                  {sendingReply ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Enviar Resposta
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setReplyingTo(null)}
                  disabled={sendingReply}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-[#5EC4E7] mx-auto mb-4 animate-spin" />
              <p className="text-[#6B7280]">Carregando avaliações...</p>
            </CardContent>
          </Card>
        ) : filteredReviews.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="font-medium text-[#2E6F79] mb-2">Nenhuma avaliação encontrada</h3>
              <p className="text-[#6B7280]">
                {reviewsData.length === 0 
                  ? 'Você ainda não recebeu avaliações' 
                  : 'Ajuste os filtros para ver mais avaliações'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              onReply={handleReply}
              onHelpful={handleHelpful}
              onReport={handleReport}
              onMarkImportant={handleMarkImportant}
              helpfulLoading={helpfulLoadingId === review.id}
            />
          ))
        )}
      </div>

      {filteredReviews.length > 0 && (
        <div className="flex justify-center pt-6">
          <Button variant="outline" className="border-[#FF9B57] text-[#FF9B57] hover:bg-[#FF9B57] hover:text-white">
            Ver mais avaliações
          </Button>
        </div>
      )}

      <ReportModal
        open={reportModalOpen}
        onOpenChange={(open) => {
          setReportModalOpen(open)
          if (!open) {
            setReportTargetId(null)
            setReportExistingReason(null)
          }
        }}
        onSubmit={handleReportSubmit}
        title="Reportar avaliação"
        description="Descreva o problema encontrado nesta avaliação. Sua contribuição nos ajuda a manter a qualidade."
        readonly={!!reportExistingReason}
        initialValue={reportExistingReason ?? undefined}
      />
    </div>
  )
}
