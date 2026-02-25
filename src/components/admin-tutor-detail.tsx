import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ArrowLeft, Mail, Phone, MapPin, PawPrint, Heart, Loader2, Calendar, Star, Bookmark } from 'lucide-react'
import { usersService, type UserDetailTutor } from '../services/users.service'

const SPECIES_LABEL: Record<string, string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
  BIRD: 'Pássaro',
  FISH: 'Peixe',
  RABBIT: 'Coelho',
  HAMSTER: 'Hamster',
  OTHER: 'Outro',
}

const GENDER_LABEL: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
  UNKNOWN: 'Não informado',
}

const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Concluído',
}

function formatDate(value: string | undefined): string {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return value
  }
}

interface AdminTutorDetailProps {
  tutorId: string
  onBack: () => void
}

export function AdminTutorDetail({ tutorId, onBack }: AdminTutorDetailProps) {
  const [tutor, setTutor] = useState<UserDetailTutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    usersService
      .getUserByIdForAdmin(tutorId)
      .then((res) => {
        if (cancelled) return
        setLoading(false)
        if (res.success && res.data) setTutor(res.data as UserDetailTutor)
        else setError(res.error || 'Erro ao carregar tutor')
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          setError('Erro ao carregar tutor')
        }
      })
    return () => { cancelled = true }
  }, [tutorId])

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-aumigo-teal mb-4" />
        <p className="text-aumigo-gray">Carregando dados do tutor...</p>
      </div>
    )
  }

  if (error || !tutor) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-aumigo-teal hover:bg-aumigo-teal/10 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para listagem
        </Button>
        <p className="text-red-600">{error || 'Tutor não encontrado'}</p>
      </div>
    )
  }

  const pets = tutor.pets ?? []
  const bookings = tutor.customerBookings ?? []
  const reviews = tutor.reviews ?? []
  const favorites = tutor.favorites ?? []

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-aumigo-teal hover:bg-aumigo-teal/10 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para listagem
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-aumigo-teal/20">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24 border-4 border-aumigo-teal/20">
                <AvatarImage src={tutor.profilePicture ?? undefined} />
                <AvatarFallback className="bg-aumigo-teal/10 text-aumigo-teal text-2xl">
                  {tutor.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-aumigo-teal text-xl mt-4">{tutor.name}</CardTitle>
            <CardDescription>Tutor · Dono de pets</CardDescription>
            <div className="pt-2">
              <Badge
                variant={tutor.status === 'ACTIVE' ? 'default' : 'secondary'}
                className={tutor.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : ''}
              >
                {tutor.status === 'ACTIVE' ? 'Ativo' : tutor.status === 'INACTIVE' ? 'Inativo' : 'Suspenso'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-aumigo-teal shrink-0" />
              <span className="text-aumigo-gray break-all">{tutor.email}</span>
            </div>
            {tutor.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-aumigo-teal shrink-0" />
                <span className="text-aumigo-gray">{tutor.phone}</span>
              </div>
            )}
            {(tutor.city || tutor.state) && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-aumigo-teal shrink-0 mt-0.5" />
                <span className="text-aumigo-gray">
                  {[tutor.city, tutor.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {(tutor.address || tutor.addressNumber) && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-aumigo-teal shrink-0 mt-0.5" />
                <span className="text-aumigo-gray">
                  {[tutor.address, tutor.addressNumber].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {tutor.zipCode && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-aumigo-teal shrink-0" />
                <span className="text-aumigo-gray">CEP {tutor.zipCode}</span>
              </div>
            )}
            {tutor.cpf && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-aumigo-gray font-medium min-w-[3rem]">CPF</span>
                <span className="text-aumigo-gray">{tutor.cpf}</span>
              </div>
            )}
            {tutor.birthDate && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-aumigo-gray font-medium min-w-[3rem]">Nasc.</span>
                <span className="text-aumigo-gray">{formatDate(tutor.birthDate)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-aumigo-teal/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-aumigo-teal/10">
                <PawPrint className="h-5 w-5 text-aumigo-teal" />
              </div>
              <div>
                <CardTitle className="text-aumigo-teal">Pets vinculados</CardTitle>
                <CardDescription>
                  {pets.length === 0
                    ? 'Nenhum pet cadastrado'
                    : `${pets.length} pet(s) relacionados a este tutor`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {pets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-aumigo-teal/20 bg-aumigo-teal/5">
                <Heart className="h-12 w-12 text-aumigo-teal/40 mb-3" />
                <p className="text-aumigo-gray">Este tutor ainda não possui pets cadastrados.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {pets.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center gap-4 p-4 rounded-xl border border-aumigo-teal/20 bg-aumigo-teal/5 hover:bg-aumigo-teal/10 transition-colors"
                  >
                    <Avatar className="h-14 w-14 rounded-full border-2 border-aumigo-teal/20 shrink-0">
                      <AvatarImage src={pet.avatar ?? undefined} alt={pet.name} />
                      <AvatarFallback className="rounded-full bg-aumigo-teal/20 text-aumigo-teal">
                        <PawPrint className="h-7 w-7" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-aumigo-teal">{pet.name}</p>
                      <p className="text-sm text-aumigo-gray">
                        {SPECIES_LABEL[pet.species] || pet.species}
                        {pet.breed ? ` · ${pet.breed}` : ''}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {GENDER_LABEL[pet.gender as string] || pet.gender || '—'}
                        </Badge>
                        {pet.weight != null && (
                          <Badge variant="outline" className="text-xs">
                            {pet.weight} kg
                          </Badge>
                        )}
                        {pet.color && (
                          <Badge variant="outline" className="text-xs">
                            {pet.color}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Agendamentos */}
      <Card className="border-aumigo-teal/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-aumigo-teal/10">
              <Calendar className="h-5 w-5 text-aumigo-teal" />
            </div>
            <div>
              <CardTitle className="text-aumigo-teal">Agendamentos</CardTitle>
              <CardDescription>
                {bookings.length === 0
                  ? 'Nenhum agendamento'
                  : `${bookings.length} agendamento(s) recente(s)`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="py-8 text-center text-aumigo-gray rounded-xl border-2 border-dashed border-aumigo-teal/20 bg-aumigo-teal/5">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-aumigo-teal/20 bg-aumigo-teal/5"
                >
                  <span className="font-medium text-aumigo-teal">{formatDate(b.date)}</span>
                  <span className="text-aumigo-gray">{b.time}</span>
                  <Badge variant="outline" className="text-xs">
                    {BOOKING_STATUS_LABEL[b.status] ?? b.status}
                  </Badge>
                  {b.service?.name && <span className="text-sm text-aumigo-gray">{b.service.name}</span>}
                  {b.provider?.name && <span className="text-sm text-aumigo-gray">· {b.provider.name}</span>}
                  {b.pet?.name && <span className="text-sm text-aumigo-gray">· Pet: {b.pet.name}</span>}
                  {b.price != null && <span className="text-sm text-aumigo-gray ml-auto">R$ {(b.price / 100).toFixed(2)}</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Avaliações */}
        <Card className="border-aumigo-teal/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-aumigo-teal/10">
                <Star className="h-5 w-5 text-aumigo-teal" />
              </div>
              <div>
                <CardTitle className="text-aumigo-teal">Avaliações</CardTitle>
                <CardDescription>
                  {reviews.length === 0 ? 'Nenhuma avaliação' : `${reviews.length} avaliação(ões) feita(s)`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-aumigo-gray rounded-xl border-2 border-dashed border-aumigo-teal/20 bg-aumigo-teal/5">
                Nenhuma avaliação encontrada.
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border border-aumigo-teal/20 bg-aumigo-teal/5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-aumigo-teal">{r.rating} ★</span>
                      {r.provider?.name && <span className="text-sm text-aumigo-gray">{r.provider.name}</span>}
                      {r.company?.name && <span className="text-xs text-aumigo-gray">({r.company.name})</span>}
                    </div>
                    {r.comment && <p className="text-sm text-aumigo-gray mt-1 line-clamp-2">{r.comment}</p>}
                    <p className="text-xs text-aumigo-gray mt-1">{formatDate(r.createdAt)}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favoritos */}
        <Card className="border-aumigo-teal/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-aumigo-teal/10">
                <Bookmark className="h-5 w-5 text-aumigo-teal" />
              </div>
              <div>
                <CardTitle className="text-aumigo-teal">Favoritos</CardTitle>
                <CardDescription>
                  {favorites.length === 0 ? 'Nenhum favorito' : `${favorites.length} profissional(is) favoritado(s)`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {favorites.length === 0 ? (
              <div className="py-8 text-center text-aumigo-gray rounded-xl border-2 border-dashed border-aumigo-teal/20 bg-aumigo-teal/5">
                Nenhum favorito encontrado.
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {favorites.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 p-3 rounded-lg border border-aumigo-teal/20 bg-aumigo-teal/5">
                    {f.provider?.name && <span className="font-medium text-aumigo-teal">{f.provider.name}</span>}
                    {f.company?.name && <span className="text-sm text-aumigo-gray">· {f.company.name}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
