import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ArrowLeft, Mail, Phone, Building2, MapPin, Globe, FileText, Loader2, PawPrint, Heart, Calendar, Star, Bookmark, Store, ListChecks } from 'lucide-react'
import { usersService, type UserDetailProfessional } from '../services/users.service'

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

const SERVICE_CATEGORY_LABEL: Record<string, string> = {
  VETERINARY: 'Veterinária',
  PET_SHOP: 'Pet shop',
  FARMACY: 'Farmácia',
  HOTEL: 'Hotel para pets',
  GROOMING: 'Banho e tosa',
  WALKER: 'Passeador',
  TRAINING: 'Adestramento',
  HOSPITAL: 'Hospital veterinário',
  TRANSPORT: 'Transporte pet',
  PET_SITTER: 'Pet sitter',
  OTHER: 'Outro',
}

const PROVIDER_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  SUSPENDED: 'Suspenso',
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

interface AdminProfessionalDetailProps {
  professionalId: string
  onBack: () => void
}

export function AdminProfessionalDetail({ professionalId, onBack }: AdminProfessionalDetailProps) {
  const [professional, setProfessional] = useState<UserDetailProfessional | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    usersService
      .getUserByIdForAdmin(professionalId)
      .then((res) => {
        if (cancelled) return
        setLoading(false)
        if (res.success && res.data) setProfessional(res.data as UserDetailProfessional)
        else setError(res.error || 'Erro ao carregar profissional')
      })
      .catch(() => {
        if (!cancelled) {
          setLoading(false)
          setError('Erro ao carregar profissional')
        }
      })
    return () => { cancelled = true }
  }, [professionalId])

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-aumigo-orange mb-4" />
        <p className="text-aumigo-gray">Carregando dados do profissional...</p>
      </div>
    )
  }

  if (error || !professional) {
    return (
      <div className="p-6 space-y-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-aumigo-teal hover:bg-aumigo-teal/10 -ml-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para listagem
        </Button>
        <p className="text-red-600">{error || 'Profissional não encontrado'}</p>
      </div>
    )
  }

  const company = professional.company ?? {
    name: '—',
    id: '',
    cnpj: null,
    website: null,
    contactEmail: professional.email,
    contactPhone: professional.phone ?? null,
    address: null,
    addressNumber: null,
    city: null,
    state: null,
    zipCode: null,
  }

  const fullAddress = [company.address, company.addressNumber, company.city, company.state].filter(Boolean).join(', ')
  const serviceProvidersList = professional.serviceProviders ?? []
  const pets = professional.pets ?? []
  const bookings = professional.customerBookings ?? []
  const reviews = professional.reviews ?? []
  const favorites = professional.favorites ?? []

  return (
    <div className="p-6 space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="text-aumigo-teal hover:bg-aumigo-teal/10 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Voltar para listagem
      </Button>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 border-aumigo-orange/20">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center">
              <Avatar className="h-24 w-24 border-4 border-aumigo-orange/20">
                <AvatarImage src={professional.profilePicture ?? undefined} />
                <AvatarFallback className="bg-aumigo-orange/10 text-aumigo-orange text-2xl">
                  {professional.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-aumigo-teal text-xl mt-4">{professional.name}</CardTitle>
            <CardDescription>Profissional</CardDescription>
            <div className="pt-2 flex flex-wrap justify-center gap-1">
              <Badge
                variant={professional.status === 'ACTIVE' ? 'default' : 'secondary'}
                className={professional.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : professional.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : ''}
              >
                {professional.status === 'ACTIVE' ? 'Ativo' : professional.status === 'INACTIVE' ? 'Inativo' : 'Suspenso'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-aumigo-orange shrink-0" />
              <span className="text-aumigo-gray break-all">{professional.email}</span>
            </div>
            {professional.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-aumigo-orange shrink-0" />
                <span className="text-aumigo-gray">{professional.phone}</span>
              </div>
            )}
            {(professional.city || professional.state) && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-aumigo-orange shrink-0 mt-0.5" />
                <span className="text-aumigo-gray">
                  {[professional.city, professional.state].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {(professional.address || professional.addressNumber) && (
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="h-4 w-4 text-aumigo-orange shrink-0 mt-0.5" />
                <span className="text-aumigo-gray">
                  {[professional.address, professional.addressNumber].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {professional.zipCode && (
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-aumigo-orange shrink-0" />
                <span className="text-aumigo-gray">CEP {professional.zipCode}</span>
              </div>
            )}
            {professional.cpf && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-aumigo-gray font-medium min-w-[3rem]">CPF</span>
                <span className="text-aumigo-gray">{professional.cpf}</span>
              </div>
            )}
            {professional.birthDate && (
              <div className="flex items-center gap-3 text-sm">
                <span className="text-aumigo-gray font-medium min-w-[3rem]">Nasc.</span>
                <span className="text-aumigo-gray">{formatDate(professional.birthDate)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-aumigo-orange/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-aumigo-orange/10">
                <Building2 className="h-5 w-5 text-aumigo-orange" />
              </div>
              <div>
                <CardTitle className="text-aumigo-teal">Empresa vinculada</CardTitle>
                <CardDescription>Dados da empresa à qual o profissional está atribuído</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-aumigo-teal text-lg mb-3">{company.name}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {company.cnpj && (
                  <div className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-aumigo-orange shrink-0" />
                    <span className="text-aumigo-gray">CNPJ: {company.cnpj}</span>
                  </div>
                )}
                {company.website && (
                  <div className="flex items-center gap-3 text-sm">
                    <Globe className="h-4 w-4 text-aumigo-orange shrink-0" />
                    <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-aumigo-teal hover:underline truncate block">
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {company.contactEmail && (
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-aumigo-orange shrink-0" />
                    <span className="text-aumigo-gray break-all">{company.contactEmail}</span>
                  </div>
                )}
                {company.contactPhone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-aumigo-orange shrink-0" />
                    <span className="text-aumigo-gray">{company.contactPhone}</span>
                  </div>
                )}
              </div>
            </div>

            {fullAddress && (
              <div className="pt-4 border-t border-aumigo-teal/10">
                <p className="text-sm font-medium text-aumigo-teal mb-2">Endereço</p>
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-aumigo-orange shrink-0 mt-0.5" />
                  <span className="text-aumigo-gray">{fullAddress}</span>
                </div>
                {company.zipCode && (
                  <p className="text-sm text-aumigo-gray mt-1 ml-7">CEP: {company.zipCode}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Serviços e itens (itens) */}
      <Card className="border-aumigo-orange/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-aumigo-orange/10">
              <Store className="h-5 w-5 text-aumigo-orange" />
            </div>
            <div>
              <CardTitle className="text-aumigo-teal">Serviços e itens</CardTitle>
              <CardDescription>
                {serviceProvidersList.length === 0
                  ? 'Nenhum serviço cadastrado'
                  : `${serviceProvidersList.length} serviço(s) com seus itens`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {serviceProvidersList.length === 0 ? (
            <div className="py-8 text-center text-aumigo-gray rounded-xl border-2 border-dashed border-aumigo-orange/20 bg-aumigo-orange/5">
              Nenhum serviço encontrado.
            </div>
          ) : (
            <div className="space-y-6">
              {serviceProvidersList.map((provider) => (
                <div
                  key={provider.id}
                  className="rounded-xl border border-aumigo-orange/20 bg-aumigo-orange/5 overflow-hidden"
                >
                  <div className="p-4 border-b border-aumigo-orange/20 bg-aumigo-orange/10">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-aumigo-teal">{provider.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {SERVICE_CATEGORY_LABEL[provider.category] || provider.category}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${provider.status === 'ACTIVE' ? 'border-green-500 text-green-700' : provider.status === 'PENDING' ? 'border-amber-500 text-amber-700' : ''}`}
                      >
                        {PROVIDER_STATUS_LABEL[provider.status] || provider.status}
              
                      </Badge>
                    </div>
                    {(provider.address || provider.city) && (
                      <p className="text-sm text-aumigo-gray mt-1 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {[provider.address, provider.addressNumber, provider.city, provider.state].filter(Boolean).join(', ')}
                      </p>
                    )}
                    {provider.description && (
                      <p className="text-sm text-aumigo-gray mt-1 line-clamp-2">{provider.description}</p>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-medium text-aumigo-teal mb-2 flex items-center gap-1">
                      <ListChecks className="h-4 w-4" />
                      Serviços / itens oferecidos
                    </p>
                    {!provider.services || provider.services.length === 0 ? (
                      <p className="text-sm text-aumigo-gray italic">Nenhum item cadastrado neste serviço.</p>
                    ) : (
                      <ul className="space-y-2">
                        {provider.services.map((svc) => (
                          <li
                            key={svc.id}
                            className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-aumigo-teal/10 bg-white dark:bg-aumigo-teal/5"
                          >
                            <span className="font-medium text-aumigo-teal">{svc.name}</span>
                            {svc.price != null && (
                              <Badge variant="secondary" className="text-xs">
                                R$ {Number(svc.price).toFixed(2)}
                              </Badge>
                            )}
                            {svc.duration != null && (
                              <span className="text-xs text-aumigo-gray">{svc.duration} min</span>
                            )}
                            {!svc.isActive && (
                              <Badge variant="outline" className="text-xs text-amber-700">Inativo</Badge>
                            )}
                            {svc.description && (
                              <p className="w-full text-xs text-aumigo-gray mt-1 line-clamp-1">{svc.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pets (como tutor) */}
      <Card className="border-aumigo-orange/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-aumigo-orange/10">
              <PawPrint className="h-5 w-5 text-aumigo-orange" />
            </div>
            <div>
              <CardTitle className="text-aumigo-teal">Pets vinculados</CardTitle>
              <CardDescription>
                {pets.length === 0
                  ? 'Nenhum pet cadastrado'
                  : `${pets.length} pet(s) relacionados (uso como tutor)`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border-2 border-dashed border-aumigo-orange/20 bg-aumigo-orange/5">
              <Heart className="h-12 w-12 text-aumigo-orange/40 mb-3" />
              <p className="text-aumigo-gray">Nenhum pet cadastrado como tutor.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="flex items-center gap-4 p-4 rounded-xl border border-aumigo-orange/20 bg-aumigo-orange/5 hover:bg-aumigo-orange/10 transition-colors"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-aumigo-orange/20">
                    <PawPrint className="h-7 w-7 text-aumigo-orange" />
                  </div>
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

      {/* Agendamentos (como tutor) */}
      <Card className="border-aumigo-orange/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-aumigo-orange/10">
              <Calendar className="h-5 w-5 text-aumigo-orange" />
            </div>
            <div>
              <CardTitle className="text-aumigo-teal">Agendamentos</CardTitle>
              <CardDescription>
                {bookings.length === 0
                  ? 'Nenhum agendamento como cliente'
                  : `${bookings.length} agendamento(s) recente(s) como tutor`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {bookings.length === 0 ? (
            <div className="py-8 text-center text-aumigo-gray rounded-xl border-2 border-dashed border-aumigo-orange/20 bg-aumigo-orange/5">
              Nenhum agendamento encontrado.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-aumigo-orange/20 bg-aumigo-orange/5"
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
        {/* Avaliações (como tutor) */}
        <Card className="border-aumigo-orange/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-aumigo-orange/10">
                <Star className="h-5 w-5 text-aumigo-orange" />
              </div>
              <div>
                <CardTitle className="text-aumigo-teal">Avaliações</CardTitle>
                <CardDescription>
                  {reviews.length === 0 ? 'Nenhuma avaliação' : `${reviews.length} avaliação(ões) feita(s) como cliente`}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {reviews.length === 0 ? (
              <div className="py-8 text-center text-aumigo-gray rounded-xl border-2 border-dashed border-aumigo-orange/20 bg-aumigo-orange/5">
                Nenhuma avaliação encontrada.
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3 rounded-lg border border-aumigo-orange/20 bg-aumigo-orange/5">
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

        {/* Favoritos (como tutor) */}
        <Card className="border-aumigo-orange/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-aumigo-orange/10">
                <Bookmark className="h-5 w-5 text-aumigo-orange" />
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
              <div className="py-8 text-center text-aumigo-gray rounded-xl border-2 border-dashed border-aumigo-orange/20 bg-aumigo-orange/5">
                Nenhum favorito encontrado.
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {favorites.map((f) => (
                  <div key={f.id} className="flex items-center gap-2 p-3 rounded-lg border border-aumigo-orange/20 bg-aumigo-orange/5">
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
