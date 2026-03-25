import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { AlertTriangle, Search, Loader2, Trash2, ShieldCheck, Pin, PinOff } from 'lucide-react'
import { reviewsService, type Review } from '../services/reviews.service'
import { toast } from 'sonner'

const PAGE_SIZE = 20

type PendingAction =
  | { type: 'delete'; review: Review }
  | { type: 'cancel-report'; review: Review }
  | null

const formatDateTime = (value?: string) => {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

export function AdminIncidents() {
  const [search, setSearch] = useState('')
  const [incidents, setIncidents] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  })
  const [pendingAction, setPendingAction] = useState<PendingAction>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadIncidents = useCallback(async (pageNum: number) => {
    setLoading(true)
    try {
      const res = await reviewsService.getReported({ page: pageNum, limit: PAGE_SIZE })
      if (res.success && res.data) {
        setIncidents(res.data.data || [])
        const pg = res.data.pagination
        if (pg) {
          setPagination({
            page: pg.page ?? pageNum,
            limit: pg.limit ?? PAGE_SIZE,
            total: pg.total ?? (res.data.data?.length || 0),
            totalPages: pg.totalPages ?? 1,
            hasNextPage: !!pg.hasNextPage,
            hasPreviousPage: !!pg.hasPreviousPage,
          })
        } else {
          setPagination({
            page: pageNum,
            limit: PAGE_SIZE,
            total: res.data.data?.length || 0,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          })
        }
      } else {
        setIncidents([])
        toast.error(res.error || 'Erro ao carregar incidentes')
      }
    } catch (error: any) {
      setIncidents([])
      toast.error(error?.message || 'Erro ao carregar incidentes')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadIncidents(page)
  }, [page, loadIncidents])

  const filteredIncidents = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return incidents
    return incidents.filter((review) => {
      const author = review.author?.name || review.authorName || ''
      const provider = review.provider?.name || review.providerName || ''
      const comment = review.comment || ''
      const reason = review.reportReason || ''
      return `${author} ${provider} ${comment} ${reason}`.toLowerCase().includes(term)
    })
  }, [incidents, search])

  const handleToggleImportant = async (review: Review) => {
    const result = await reviewsService.marcarComoImportante(review.id)
    if (!result.success) {
      toast.error(result.error || 'Erro ao atualizar destaque')
      return
    }
    const nextValue = !!result.data?.isImportant
    setIncidents((prev) => prev.map((r) => (r.id === review.id ? { ...r, isImportant: nextValue } : r)))
    toast.success(nextValue ? 'Avaliação marcada como destaque' : 'Destaque removido')
  }

  const handleConfirmAction = async () => {
    if (!pendingAction) return
    setActionLoading(true)
    try {
      if (pendingAction.type === 'delete') {
        const res = await reviewsService.deleteReview(pendingAction.review.id)
        if (!res.success) {
          toast.error(res.error || 'Erro ao excluir avaliação')
          return
        }
        toast.success('Avaliação excluída com sucesso')
        void loadIncidents(page)
      } else {
        const res = await reviewsService.cancelarReporte(pendingAction.review.id)
        if (!res.success) {
          toast.error(res.error || 'Erro ao cancelar reporte')
          return
        }
        toast.success(res.message || 'Reporte cancelado')
        void loadIncidents(page)
      }
      setPendingAction(null)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-aumigo-teal text-2xl sm:text-3xl font-semibold mb-1 sm:mb-2">Incidentes</h1>
        <p className="text-aumigo-gray text-sm sm:text-base">
          Moderação de avaliações reportadas por tutores.
        </p>
      </div>

      <Card className="border-aumigo-teal/20 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <CardTitle className="text-aumigo-teal">Incidentes de avaliações</CardTitle>
                <CardDescription>
                  Total reportado: {pagination.total}
                </CardDescription>
              </div>
            </div>
          </div>
          <div className="mt-3 flex h-9 items-center gap-2 rounded-md border border-aumigo-teal/20 bg-background px-3 focus-within:border-aumigo-teal focus-within:ring-2 focus-within:ring-aumigo-teal/20">
            <Search className="h-4 w-4 shrink-0 text-aumigo-gray" aria-hidden />
            <Input
              placeholder="Buscar por autor, profissional, comentário ou motivo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-auto min-h-0 flex-1 border-0 bg-transparent p-0 pl-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-10 text-center">
              <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-gray-700 font-medium">Nenhum incidente encontrado</p>
              <p className="text-sm text-gray-500 mt-1">Quando houver reportes de avaliações, eles aparecerão aqui.</p>
            </div>
          ) : (
            filteredIncidents.map((review) => (
              <div key={review.id} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-gray-500">Avaliado em {formatDateTime(review.createdAt)}</p>
                    <p className="text-sm font-medium text-gray-900">
                      {review.author?.name || review.authorName || 'Tutor'} {' • '} {review.provider?.name || review.providerName || 'Profissional'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Empresa: <span className="font-medium text-gray-700">{review.company?.name || 'Não informada'}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Reportada</Badge>
                    {review.isImportant ? <Badge className="bg-aumigo-teal text-white">Destaque</Badge> : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Motivo do reporte</p>
                  <p className="text-sm text-gray-800">{review.reportReason || '-'}</p>
                </div>

                {review.comment ? (
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Comentário do tutor</p>
                    <p className="text-sm text-gray-700 bg-gray-50 border border-gray-100 rounded-lg p-3">{review.comment}</p>
                  </div>
                ) : null}

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleToggleImportant(review)}
                    className="gap-1"
                  >
                    {review.isImportant ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    {review.isImportant ? 'Remover destaque' : 'Marcar destaque'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPendingAction({ type: 'cancel-report', review })}
                    className="gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Cancelar reporte
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setPendingAction({ type: 'delete', review })}
                    className="gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir avaliação
                  </Button>
                </div>
              </div>
            ))
          )}

          <div className="pt-2 flex items-center justify-between gap-2">
            <p className="text-xs text-gray-500">
              Página {pagination.page} de {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingAction} onOpenChange={(open) => !open && setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction?.type === 'delete' ? 'Excluir avaliação?' : 'Cancelar reporte?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.type === 'delete'
                ? 'Essa ação remove a avaliação e não poderá ser desfeita.'
                : 'Essa ação remove o motivo de reporte e tira a avaliação da fila de incidentes.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleConfirmAction()
              }}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

