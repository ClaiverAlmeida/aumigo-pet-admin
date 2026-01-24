import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  User, 
  Bell, 
  Calendar, 
  CreditCard, 
  Shield, 
  Settings,
  Camera,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  DollarSign,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Save,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { usersService } from '../services/users.service'

interface ProfileData {
  name: string
  email: string
  phone?: string
  cpf?: string
  birthDate?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  profilePicture?: string
}

interface NotificationSettings {
  newBookings: boolean
  bookingReminders: boolean
  clientMessages: boolean
  paymentUpdates: boolean
  reviewNotifications: boolean
  marketingEmails: boolean
  smsNotifications: boolean
  pushNotifications: boolean
}

interface AvailabilitySettings {
  autoAcceptBookings: boolean
  bufferTime: number
  maxDailyBookings: number
  advanceBookingDays: number
  cancellationPolicy: string
  workingHours: {
    start: string
    end: string
  }
}

interface PaymentSettings {
  bankAccount: string
  pixKey: string
  commission: number
  autoWithdraw: boolean
  withdrawDay: number
}

interface PrivacySettings {
  profileVisibility: 'public' | 'clients-only' | 'private'
  showPhoneNumber: boolean
  showEmail: boolean
  allowReviews: boolean
  dataSharing: boolean
}

export function ProSettings() {
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePicture: ''
  })
  const [originalData, setOriginalData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    birthDate: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePicture: ''
  })

  const [notifications, setNotifications] = useState<NotificationSettings>({
    newBookings: true,
    bookingReminders: true,
    clientMessages: true,
    paymentUpdates: true,
    reviewNotifications: true,
    marketingEmails: false,
    smsNotifications: true,
    pushNotifications: true
  })

  const [availability, setAvailability] = useState<AvailabilitySettings>({
    autoAcceptBookings: false,
    bufferTime: 30,
    maxDailyBookings: 8,
    advanceBookingDays: 30,
    cancellationPolicy: 'flexible',
    workingHours: {
      start: '08:00',
      end: '18:00'
    }
  })

  const [payment, setPayment] = useState<PaymentSettings>({
    bankAccount: '**** **** **** 1234',
    pixKey: 'maria.souza@email.com',
    commission: 15,
    autoWithdraw: true,
    withdrawDay: 1
  })

  const [privacy, setPrivacy] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showPhoneNumber: true,
    showEmail: false,
    allowReviews: true,
    dataSharing: false
  })

  // Carregar dados do usuário ao montar o componente
  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true)
      try {
        const result = await usersService.getMyProfile()
        if (result.success && result.data) {
          const user = result.data
          
          // Formatar birthDate se vier como ISO string do backend
          let formattedBirthDate = ''
          if (user.birthDate) {
            try {
              // Se vier como ISO string, converter para formato YYYY-MM-DD
              const date = new Date(user.birthDate)
              if (!isNaN(date.getTime())) {
                formattedBirthDate = date.toISOString().split('T')[0]
              } else {
                formattedBirthDate = user.birthDate
              }
            } catch {
              formattedBirthDate = user.birthDate
            }
          }

          const loadedData: ProfileData = {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            cpf: user.cpf || '',
            birthDate: formattedBirthDate,
            address: user.address || '',
            city: user.city || '',
            state: user.state || '',
            zipCode: user.zipCode || '',
            profilePicture: user.profilePicture || ''
          }
          setProfileData(loadedData)
          setOriginalData(loadedData) // Armazenar dados originais para comparação
        } else {
          toast.error(result.error || 'Erro ao carregar dados do usuário')
        }
      } catch (error: any) {
        toast.error('Erro ao carregar dados do usuário')
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleSaveProfile = async () => {
    // Validação
    if (!profileData.name.trim()) {
      toast.error('Nome é obrigatório!')
      return
    }
    if (!profileData.email.trim()) {
      toast.error('Email é obrigatório!')
      return
    }
    // Phone, CPF e outros campos são opcionais, não validar

    setIsSaving(true)
    const loadingToast = toast.loading('Salvando informações do perfil...')
    
    try {
      // Comparar dados atuais com originais e enviar apenas o que mudou
      const updateData: any = {}

      // Verificar se name mudou
      if (profileData.name.trim() !== originalData.name.trim()) {
        updateData.name = profileData.name.trim()
      }

      // Verificar se email mudou
      if (profileData.email.trim() !== originalData.email.trim()) {
        updateData.email = profileData.email.trim()
      }

      // Verificar se phone mudou
      if ((profileData.phone || '') !== (originalData.phone || '')) {
        updateData.phone = profileData.phone?.trim() || undefined
      }

      // Verificar se cpf mudou
      if ((profileData.cpf || '') !== (originalData.cpf || '')) {
        updateData.cpf = profileData.cpf?.trim() || undefined
      }

      // Verificar se birthDate mudou
      if ((profileData.birthDate || '') !== (originalData.birthDate || '')) {
        updateData.birthDate = profileData.birthDate?.trim() || undefined
      }

      // Verificar se address mudou
      if ((profileData.address || '') !== (originalData.address || '')) {
        updateData.address = profileData.address?.trim() || undefined
      }

      // Verificar se city mudou
      if ((profileData.city || '') !== (originalData.city || '')) {
        updateData.city = profileData.city?.trim() || undefined
      }

      // Verificar se state mudou
      if ((profileData.state || '') !== (originalData.state || '')) {
        updateData.state = profileData.state?.trim() || undefined
      }

      // Verificar se zipCode mudou
      if ((profileData.zipCode || '') !== (originalData.zipCode || '')) {
        updateData.zipCode = profileData.zipCode?.trim() || undefined
      }

      // Se não houver mudanças, não fazer update
      if (Object.keys(updateData).length === 0) {
        toast.dismiss(loadingToast)
        toast.info('Nenhuma alteração detectada')
        setIsSaving(false)
        return
      }

      const result = await usersService.updateMyProfile(updateData)
      
      toast.dismiss(loadingToast)

      if (result.success && result.data) {
        toast.success('✅ Perfil atualizado com sucesso!', {
          description: 'Suas informações pessoais foram salvas e já estão visíveis no seu perfil.'
        })
        
        // Atualizar o estado local com os dados retornados
        const user = result.data
        // Formatar birthDate se vier como ISO string do backend
        let formattedBirthDate = ''
        if (user.birthDate) {
          try {
            const date = new Date(user.birthDate)
            if (!isNaN(date.getTime())) {
              formattedBirthDate = date.toISOString().split('T')[0]
            } else {
              formattedBirthDate = user.birthDate
            }
          } catch {
            formattedBirthDate = user.birthDate
          }
        }

        const updatedData: ProfileData = {
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          cpf: user.cpf || '',
          birthDate: formattedBirthDate,
          address: user.address || '',
          city: user.city || '',
          state: user.state || '',
          zipCode: user.zipCode || '',
          profilePicture: user.profilePicture || ''
        }
        setProfileData(updatedData)
        setOriginalData(updatedData) // Atualizar dados originais após sucesso
      } else {
        toast.error(result.error || 'Erro ao atualizar perfil')
      }
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error('Erro ao atualizar perfil')
      console.error('Erro ao atualizar perfil:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveNotifications = () => {
    toast.loading('Salvando preferências de notificação...')
    
    setTimeout(() => {
      toast.dismiss()
      const enabledCount = Object.values(notifications).filter(Boolean).length
      toast.success('🔔 Preferências de notificação atualizadas!', {
        description: `${enabledCount} tipos de notificação ativados.`
      })
    }, 1000)
  }

  const handleSaveAvailability = () => {
    toast.loading('Atualizando configurações de agenda...')
    
    setTimeout(() => {
      toast.dismiss()
      toast.success('📅 Configurações de agenda salvas!', {
        description: `Horário: ${availability.workingHours.start} às ${availability.workingHours.end} • Máx: ${availability.maxDailyBookings} agendamentos/dia`
      })
    }, 1200)
  }

  const handleSavePayment = () => {
    // Simulação de validação
    if (!payment.bankAccount || payment.bankAccount.includes('****')) {
      toast.error('Dados bancários incompletos!')
      return
    }
    if (!payment.pixKey.trim()) {
      toast.error('Chave PIX é obrigatória!')
      return
    }

    toast.loading('Verificando e salvando dados de pagamento...')
    
    setTimeout(() => {
      toast.dismiss()
      toast.success('💳 Configurações de pagamento atualizadas!', {
        description: `Taxa: ${payment.commission}% • Saque automático: ${payment.autoWithdraw ? 'Ativado' : 'Desativado'}`
      })
    }, 2000)
  }

  const handleSavePrivacy = () => {
    toast.loading('Aplicando configurações de privacidade...')
    
    setTimeout(() => {
      toast.dismiss()
      toast.success('🔒 Configurações de privacidade salvas!', {
        description: `Perfil: ${privacy.profileVisibility === 'public' ? 'Público' : privacy.profileVisibility === 'clients-only' ? 'Clientes apenas' : 'Privado'}`
      })
    }, 1000)
  }

  const handleDeleteAccount = () => {
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      toast.loading('Processando exclusão de conta...')
      setTimeout(() => {
        toast.dismiss()
        toast.error('⚠️ Exclusão cancelada', {
          description: 'A funcionalidade de exclusão está em desenvolvimento por questões de segurança.'
        })
      }, 1000)
    } else {
      toast.info('Exclusão cancelada pelo usuário')
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-card flex-shrink-0">
        <div>
          <h1 className="text-foreground mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-aumigo-mint text-white">
            Perfil Aprovado
          </Badge>
          {/* <Button 
            variant="outline" 
            className="border-aumigo-blue text-aumigo-blue hover:bg-aumigo-blue hover:text-white"
            onClick={() => {
              toast.loading('Iniciando backup completo...')
              setTimeout(() => {
                toast.dismiss()
                toast.success('✅ Backup concluído!', {
                  description: 'Todos os seus dados foram salvos com segurança.'
                })
              }, 2500)
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup de Dados
          </Button> */}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            {/* <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger> */}
            {/* <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Agenda
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacidade
            </TabsTrigger> */}
            {/* <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Geral
            </TabsTrigger> */}
          </TabsList>

          <div className="flex-1 overflow-auto">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-aumigo-orange" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações básicas e foto de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">Carregando dados do usuário...</p>
                    </div>
                  ) : (
                    <>
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.profilePicture} alt={profileData.name} />
                        <AvatarFallback className="text-xl bg-aumigo-blue/20 text-aumigo-teal">
                          {profileData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full bg-aumigo-orange hover:bg-aumigo-orange/90"
                        onClick={() => toast.info('Upload de foto em desenvolvimento')}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Foto do Perfil</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        Recomendamos uma foto clara e profissional
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            toast.loading('Fazendo upload da foto...')
                            setTimeout(() => {
                              toast.dismiss()
                              toast.success('📸 Foto do perfil atualizada!', {
                                description: 'Sua nova foto está sendo processada e aparecerá em breve.'
                              })
                            }, 1500)
                          }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Alterar foto
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive"
                          onClick={() => {
                            toast.loading('Removendo foto...')
                            setTimeout(() => {
                              toast.dismiss()
                              toast.success('Foto removida com sucesso!')
                            }, 800)
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                        placeholder="Seu nome completo"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profileData.phone || ''}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={profileData.cpf || ''}
                        onChange={(e) => setProfileData({...profileData, cpf: e.target.value})}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={profileData.birthDate || ''}
                        onChange={(e) => setProfileData({...profileData, birthDate: e.target.value})}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Address Info */}
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={profileData.address || ''}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      placeholder="Rua, número, complemento"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          className="pl-10"
                          value={profileData.city || ''}
                          onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                          placeholder="Cidade"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={profileData.state || ''}
                        onChange={(e) => setProfileData({...profileData, state: e.target.value})}
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={profileData.zipCode || ''}
                        onChange={(e) => setProfileData({...profileData, zipCode: e.target.value})}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Restaurar dados originais
                        setProfileData(originalData)
                        toast.info('🔄 Alterações desfeitas')
                      }}
                      disabled={isLoading || isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSaveProfile} 
                      className="bg-aumigo-orange hover:bg-aumigo-orange/90"
                      disabled={isLoading || isSaving}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-aumigo-orange" />
                    Preferências de Notificação
                  </CardTitle>
                  <CardDescription>
                    Configure como e quando deseja receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* App Notifications */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Notificações do App</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'newBookings', label: 'Novos agendamentos', description: 'Receba quando um cliente solicitar um serviço' },
                        { key: 'bookingReminders', label: 'Lembretes de agendamento', description: 'Lembrete 30 min antes do serviço começar' },
                        { key: 'clientMessages', label: 'Mensagens de clientes', description: 'Notificação quando receber mensagens no chat' },
                        { key: 'paymentUpdates', label: 'Atualizações de pagamento', description: 'Confirmações e comprovantes de pagamento' },
                        { key: 'reviewNotifications', label: 'Novas avaliações', description: 'Quando um cliente avaliar seu serviço' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <Switch
                            checked={notifications[item.key as keyof NotificationSettings] as boolean}
                            onCheckedChange={(checked) => 
                              setNotifications({...notifications, [item.key]: checked})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Communication Preferences */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Canais de Comunicação</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'pushNotifications', label: 'Notificações Push', description: 'Receber notificações no dispositivo' },
                        { key: 'smsNotifications', label: 'SMS', description: 'Receber SMS para agendamentos importantes' },
                        { key: 'marketingEmails', label: 'Emails promocionais', description: 'Dicas, novidades e promoções da plataforma' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <Switch
                            checked={notifications[item.key as keyof NotificationSettings] as boolean}
                            onCheckedChange={(checked) => 
                              setNotifications({...notifications, [item.key]: checked})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        // Reset para valores padrão
                        setNotifications({
                          newBookings: true,
                          bookingReminders: true,
                          clientMessages: true,
                          paymentUpdates: true,
                          reviewNotifications: true,
                          marketingEmails: false,
                          smsNotifications: true,
                          pushNotifications: true
                        })
                        toast.info('🔄 Preferências restauradas para padrão')
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Restaurar Padrão
                    </Button>
                    <Button onClick={handleSaveNotifications} className="bg-aumigo-orange hover:bg-aumigo-orange/90">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Preferências
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-aumigo-orange" />
                    Configurações de Agenda
                  </CardTitle>
                  <CardDescription>
                    Configure suas preferências de agendamento e disponibilidade
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Working Hours */}
                    <div className="space-y-4">
                      <h4 className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Horário de Trabalho
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Horário de Início</Label>
                          <Input
                            type="time"
                            value={availability.workingHours.start}
                            onChange={(e) => setAvailability({
                              ...availability,
                              workingHours: {...availability.workingHours, start: e.target.value}
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Horário de Término</Label>
                          <Input
                            type="time"
                            value={availability.workingHours.end}
                            onChange={(e) => setAvailability({
                              ...availability,
                              workingHours: {...availability.workingHours, end: e.target.value}
                            })}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Booking Settings */}
                    <div className="space-y-4">
                      <h4 className="font-medium">Configurações de Agendamento</h4>
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label>Tempo de Intervalo (minutos)</Label>
                          <Select value={availability.bufferTime.toString()} onValueChange={(value) => 
                            setAvailability({...availability, bufferTime: parseInt(value)})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="15">15 minutos</SelectItem>
                              <SelectItem value="30">30 minutos</SelectItem>
                              <SelectItem value="45">45 minutos</SelectItem>
                              <SelectItem value="60">1 hora</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Máximo de agendamentos por dia</Label>
                          <Select value={availability.maxDailyBookings.toString()} onValueChange={(value) => 
                            setAvailability({...availability, maxDailyBookings: parseInt(value)})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="5">5 agendamentos</SelectItem>
                              <SelectItem value="8">8 agendamentos</SelectItem>
                              <SelectItem value="10">10 agendamentos</SelectItem>
                              <SelectItem value="15">15 agendamentos</SelectItem>
                              <SelectItem value="20">20 agendamentos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Booking Policies */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Políticas de Agendamento</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Agendamento com Antecedência</Label>
                        <Select value={availability.advanceBookingDays.toString()} onValueChange={(value) => 
                          setAvailability({...availability, advanceBookingDays: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">1 semana</SelectItem>
                            <SelectItem value="14">2 semanas</SelectItem>
                            <SelectItem value="30">1 mês</SelectItem>
                            <SelectItem value="60">2 meses</SelectItem>
                            <SelectItem value="90">3 meses</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Política de Cancelamento</Label>
                        <Select value={availability.cancellationPolicy} onValueChange={(value) => 
                          setAvailability({...availability, cancellationPolicy: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flexible">Flexível (até 2h antes)</SelectItem>
                            <SelectItem value="moderate">Moderada (até 12h antes)</SelectItem>
                            <SelectItem value="strict">Rigorosa (até 24h antes)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div>
                      <div className="font-medium">Aceitar agendamentos automaticamente</div>
                      <div className="text-sm text-muted-foreground">
                        Novos agendamentos serão confirmados automaticamente
                      </div>
                    </div>
                    <Switch
                      checked={availability.autoAcceptBookings}
                      onCheckedChange={(checked) => 
                        setAvailability({...availability, autoAcceptBookings: checked})}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setAvailability({
                          autoAcceptBookings: false,
                          bufferTime: 30,
                          maxDailyBookings: 8,
                          advanceBookingDays: 30,
                          cancellationPolicy: 'flexible',
                          workingHours: {
                            start: '08:00',
                            end: '18:00'
                          }
                        })
                        toast.info('🔄 Configurações restauradas')
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Restaurar Padrão
                    </Button>
                    <Button onClick={handleSaveAvailability} className="bg-aumigo-orange hover:bg-aumigo-orange/90">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payment Tab */}
            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-aumigo-orange" />
                    Configurações de Pagamento
                  </CardTitle>
                  <CardDescription>
                    Gerencie suas informações bancárias e preferências de recebimento
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Bank Account */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Dados Bancários
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Conta Bancária</Label>
                        <Input
                          value={payment.bankAccount}
                          onChange={(e) => setPayment({...payment, bankAccount: e.target.value})}
                          placeholder="Banco - Agência - Conta"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Chave PIX</Label>
                        <Input
                          value={payment.pixKey}
                          onChange={(e) => setPayment({...payment, pixKey: e.target.value})}
                          placeholder="CPF, email ou chave aleatória"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Commission & Withdrawal */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Comissão e Saques</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border border-border/50 rounded-lg bg-muted/30">
                        <div className="text-sm text-muted-foreground mb-1">Taxa da plataforma</div>
                        <div className="text-2xl font-bold text-aumigo-orange">{payment.commission}%</div>
                        <div className="text-xs text-muted-foreground">Por transação</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Dia do saque automático</Label>
                        <Select value={payment.withdrawDay.toString()} onValueChange={(value) => 
                          setPayment({...payment, withdrawDay: parseInt(value)})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Todo dia 1</SelectItem>
                            <SelectItem value="5">Todo dia 5</SelectItem>
                            <SelectItem value="10">Todo dia 10</SelectItem>
                            <SelectItem value="15">Todo dia 15</SelectItem>
                            <SelectItem value="30">Todo dia 30</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                    <div>
                      <div className="font-medium">Saque automático</div>
                      <div className="text-sm text-muted-foreground">
                        Transferir automaticamente os valores recebidos
                      </div>
                    </div>
                    <Switch
                      checked={payment.autoWithdraw}
                      onCheckedChange={(checked) => 
                        setPayment({...payment, autoWithdraw: checked})}
                    />
                  </div>

                  <div className="bg-aumigo-blue/10 border border-aumigo-blue/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-aumigo-blue flex-shrink-0 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-aumigo-blue mb-1">Conta Verificada</h5>
                        <p className="text-sm text-aumigo-blue/80">
                          Sua conta bancária foi verificada com sucesso. Você pode receber pagamentos normalmente.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        toast.info('🔄 Dados bancários mantidos por segurança')
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSavePayment} className="bg-aumigo-orange hover:bg-aumigo-orange/90">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-aumigo-orange" />
                    Privacidade e Segurança
                  </CardTitle>
                  <CardDescription>
                    Controle quem pode ver suas informações e como seus dados são usados
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Visibility */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Visibilidade do Perfil</h4>
                    <div className="space-y-2">
                      <Label>Quem pode ver seu perfil</Label>
                      <Select value={privacy.profileVisibility} onValueChange={(value: any) => 
                        setPrivacy({...privacy, profileVisibility: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Público - Qualquer pessoa</SelectItem>
                          <SelectItem value="clients-only">Apenas clientes cadastrados</SelectItem>
                          <SelectItem value="private">Privado - Apenas você</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Informações de Contato</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'showPhoneNumber', label: 'Mostrar número de telefone', description: 'Clientes poderão ver seu telefone no perfil' },
                        { key: 'showEmail', label: 'Mostrar email', description: 'Clientes poderão ver seu email no perfil' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <Switch
                            checked={privacy[item.key as keyof PrivacySettings] as boolean}
                            onCheckedChange={(checked) => 
                              setPrivacy({...privacy, [item.key]: checked})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Reviews & Data */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Avaliações e Dados</h4>
                    <div className="space-y-4">
                      {[
                        { key: 'allowReviews', label: 'Permitir avaliações', description: 'Clientes podem avaliar e comentar seus serviços' },
                        { key: 'dataSharing', label: 'Compartilhamento de dados', description: 'Permitir uso de dados para melhorias na plataforma' }
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-muted-foreground">{item.description}</div>
                          </div>
                          <Switch
                            checked={privacy[item.key as keyof PrivacySettings] as boolean}
                            onCheckedChange={(checked) => 
                              setPrivacy({...privacy, [item.key]: checked})}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Password Change */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Alterar Senha
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Senha Atual</Label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite a senha atual"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nova Senha</Label>
                        <Input
                          type="password"
                          placeholder="Digite a nova senha"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirmar Nova Senha</Label>
                        <Input
                          type="password"
                          placeholder="Confirme a nova senha"
                        />
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        toast.loading('Alterando senha...')
                        setTimeout(() => {
                          toast.dismiss()
                          toast.success('🔐 Senha alterada com sucesso!', {
                            description: 'Sua nova senha já está ativa. Use-a no próximo login.'
                          })
                        }, 1500)
                      }}
                    >
                      Alterar Senha
                    </Button>
                  </div>

                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setPrivacy({
                          profileVisibility: 'public',
                          showPhoneNumber: true,
                          showEmail: false,
                          allowReviews: true,
                          dataSharing: false
                        })
                        toast.info('🔄 Configurações de privacidade restauradas')
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Restaurar Padrão
                    </Button>
                    <Button onClick={handleSavePrivacy} className="bg-aumigo-orange hover:bg-aumigo-orange/90">
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Configurações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-aumigo-orange" />
                    Configurações Gerais
                  </CardTitle>
                  <CardDescription>
                    Configurações da conta e opções avançadas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Language & Region */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Idioma e Região
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Idioma da Interface</Label>
                        <Select defaultValue="pt-BR">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="es-ES">Español</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Fuso Horário</Label>
                        <Select defaultValue="America/Sao_Paulo">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="America/Sao_Paulo">Brasília (GMT-3)</SelectItem>
                            <SelectItem value="America/Manaus">Manaus (GMT-4)</SelectItem>
                            <SelectItem value="America/Rio_Branco">Rio Branco (GMT-5)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* App Preferences */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Preferências do App</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                        <div>
                          <div className="font-medium">Modo escuro</div>
                          <div className="text-sm text-muted-foreground">
                            Usar tema escuro na interface
                          </div>
                        </div>
                        <Switch defaultChecked={false} />
                      </div>
                      <div className="flex items-center justify-between p-3 border border-border/50 rounded-lg">
                        <div>
                          <div className="font-medium">Confirmações automáticas</div>
                          <div className="text-sm text-muted-foreground">
                            Pular diálogos de confirmação para ações simples
                          </div>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Data Management */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Gerenciamento de Dados</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-start text-left"
                        onClick={() => {
                          toast.loading('Preparando exportação de dados...')
                          setTimeout(() => {
                            toast.dismiss()
                            toast.success('📥 Exportação concluída!', {
                              description: 'Seus dados foram compactados e o download iniciará em breve.'
                            })
                          }, 2000)
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Download className="h-4 w-4" />
                          <span className="font-medium">Exportar Dados</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Baixe uma cópia de todos os seus dados
                        </span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-start text-left"
                        onClick={() => {
                          toast.loading('Configurando backup automático...')
                          setTimeout(() => {
                            toast.dismiss()
                            toast.success('☁️ Backup automático ativado!', {
                              description: 'Seus dados serão salvos automaticamente a cada 24 horas.'
                            })
                          }, 1500)
                        }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Upload className="h-4 w-4" />
                          <span className="font-medium">Backup Automático</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Configurar backup automático dos dados
                        </span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Account Actions */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Zona de Perigo
                    </h4>
                    <div className="space-y-3">
                      <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="font-medium text-destructive mb-1">Excluir Conta</h5>
                            <p className="text-sm text-muted-foreground">
                              Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
                            </p>
                          </div>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleDeleteAccount}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir Conta
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}