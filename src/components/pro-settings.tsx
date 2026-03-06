import React, { useState, useEffect, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Slider } from './ui/slider'
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
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { usersService } from '../services/users.service'
import { filesService } from '../services/files.service'
import { authService } from '../services/auth.service'
import { companiesService } from '../services/companies.service'

const OUTPUT_SIZE = 512

async function createCroppedImage(
  imageSrc: string,
  cropPercent: Area,
  outputSize = OUTPUT_SIZE
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.src = imageSrc
    image.crossOrigin = 'anonymous'
    image.onload = () => {
      const nw = image.naturalWidth
      const nh = image.naturalHeight
      const x = (cropPercent.x / 100) * nw
      const y = (cropPercent.y / 100) * nh
      const w = (cropPercent.width / 100) * nw
      const h = (cropPercent.height / 100) * nh
      const canvas = document.createElement('canvas')
      canvas.width = outputSize
      canvas.height = outputSize
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas não disponível'))
        return
      }
      ctx.drawImage(image, x, y, w, h, 0, 0, outputSize, outputSize)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Falha ao gerar imagem'))
        },
        'image/jpeg',
        0.9
      )
    }
    image.onerror = () => reject(new Error('Falha ao carregar imagem'))
  })
}

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

/** Dados da empresa para recebimento de repasses (PIX ou conta bancária) */
interface PayoutSettings {
  usePix: boolean
  payoutPixKey: string
  payoutPixKeyType: string
  payoutBankCode: string
  payoutBankAgency: string
  payoutBankAccount: string
  payoutBankAccountDigit: string
  payoutBankOwnerName: string
  payoutBankCpfCnpj: string
  payoutBankAccountType: string
}

const PIX_KEY_TYPES = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave aleatória' },
]

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
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPct, setCroppedAreaPct] = useState<Area | null>(null)
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

  const [payoutSettings, setPayoutSettings] = useState<PayoutSettings>({
    usePix: true,
    payoutPixKey: '',
    payoutPixKeyType: 'CPF',
    payoutBankCode: '',
    payoutBankAgency: '',
    payoutBankAccount: '',
    payoutBankAccountDigit: '',
    payoutBankOwnerName: '',
    payoutBankCpfCnpj: '',
    payoutBankAccountType: 'CONTA_CORRENTE',
  })
  const [payoutSettingsLoading, setPayoutSettingsLoading] = useState(false)
  const [payoutSettingsSaving, setPayoutSettingsSaving] = useState(false)
  const [hasCompany, setHasCompany] = useState<boolean | null>(null)

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

  const onCropAreaChange = useCallback((croppedArea: Area) => {
    setCroppedAreaPct(croppedArea)
  }, [])

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida')
      return
    }
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('A imagem deve ter no máximo 5MB')
      return
    }
    setImageToCrop(URL.createObjectURL(file))
    setSelectedFileName(file.name)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedAreaPct(null)
    setShowCropModal(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleCropCancel = useCallback(() => {
    if (imageToCrop) URL.revokeObjectURL(imageToCrop)
    setShowCropModal(false)
    setImageToCrop(null)
    setSelectedFileName('')
    setCroppedAreaPct(null)
  }, [imageToCrop])

  const uploadCroppedImage = async (blob: Blob, fileName: string) => {
    setIsUploadingImage(true)
    const loadingToast = toast.loading('Fazendo upload da foto...')

    try {
      const file = new File([blob], fileName.replace(/\.[^.]+$/, '.jpg') || 'foto.jpg', { type: 'image/jpeg' })
      const uploadResult = await filesService.upload(
        file as any,
        'PROFILE_IMAGE',
        'Foto de perfil do usuário'
      )

      if (!uploadResult.success || !uploadResult.data) {
        throw new Error(uploadResult.error || 'Erro ao fazer upload da imagem')
      }

      // Atualizar perfil com a URL da imagem
      const updateResult = await usersService.updateMyProfile({
        profilePicture: uploadResult.data.url
      })

      toast.dismiss(loadingToast)

      if (updateResult.success && updateResult.data) {
        // Atualizar estado local
        setProfileData(prev => ({
          ...prev,
          profilePicture: uploadResult.data!.url
        }))
        setOriginalData(prev => ({
          ...prev,
          profilePicture: uploadResult.data!.url
        }))

        toast.success('📸 Foto do perfil atualizada!', {
          description: 'Sua nova foto está sendo processada e aparecerá em breve.'
        })
      } else {
        throw new Error(updateResult.error || 'Erro ao atualizar perfil')
      }
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Erro ao fazer upload da foto')
      console.error('Erro ao fazer upload:', error)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPct) {
      toast.error('Ajuste a área de corte antes de continuar')
      return
    }
    const fileName = selectedFileName
    try {
      const blob = await createCroppedImage(imageToCrop, croppedAreaPct)
      handleCropCancel()
      await uploadCroppedImage(blob, fileName)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao processar imagem')
    }
  }

  const handleRemoveImage = async () => {
    if (!profileData.profilePicture) return

    setIsUploadingImage(true)
    const loadingToast = toast.loading('Removendo foto...')

    try {
      // Atualizar perfil removendo a URL da imagem
      const updateResult = await usersService.updateMyProfile({
        profilePicture: null
      })

      toast.dismiss(loadingToast)

      if (updateResult.success && updateResult.data) {
        // Atualizar estado local
        setProfileData(prev => ({
          ...prev,
          profilePicture: ''
        }))
        setOriginalData(prev => ({
          ...prev,
          profilePicture: ''
        }))

        toast.success('Foto removida com sucesso!')
      } else {
        throw new Error(updateResult.error || 'Erro ao remover foto')
      }
    } catch (error: any) {
      toast.dismiss(loadingToast)
      toast.error(error.message || 'Erro ao remover foto')
      console.error('Erro ao remover foto:', error)
    } finally {
      setIsUploadingImage(false)
    }
  }

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

  // Carregar dados da empresa (repasse) quando abrir a aba Pagamento
  useEffect(() => {
    if (activeTab !== 'payment') return
    let cancelled = false
    setPayoutSettingsLoading(true)
    companiesService.getMyCompany().then((res) => {
      if (cancelled) return
      setPayoutSettingsLoading(false)
      if (res.success && res.data) {
        const c = res.data
        setHasCompany(true)
        const hasPix = Boolean(c.payoutPixKey?.trim() && c.payoutPixKeyType)
        setPayoutSettings({
          usePix: hasPix || !(c.payoutBankCode && c.payoutBankAccount),
          payoutPixKey: c.payoutPixKey ?? '',
          payoutPixKeyType: c.payoutPixKeyType ?? 'CPF',
          payoutBankCode: c.payoutBankCode ?? '',
          payoutBankAgency: c.payoutBankAgency ?? '',
          payoutBankAccount: c.payoutBankAccount ?? '',
          payoutBankAccountDigit: c.payoutBankAccountDigit ?? '',
          payoutBankOwnerName: c.payoutBankOwnerName ?? '',
          payoutBankCpfCnpj: c.payoutBankCpfCnpj ?? '',
          payoutBankAccountType: c.payoutBankAccountType ?? 'CONTA_CORRENTE',
        })
      } else {
        setHasCompany(false)
      }
    })
    return () => { cancelled = true }
  }, [activeTab])

  const handleSavePayoutSettings = async () => {
    if (payoutSettings.usePix) {
      if (!payoutSettings.payoutPixKey.trim()) {
        toast.error('Informe a chave PIX.')
        return
      }
      if (!payoutSettings.payoutPixKeyType) {
        toast.error('Selecione o tipo da chave PIX.')
        return
      }
    } else {
      if (!payoutSettings.payoutBankCode?.trim() || !payoutSettings.payoutBankAgency?.trim() ||
          !payoutSettings.payoutBankAccount?.trim() || !payoutSettings.payoutBankOwnerName?.trim() ||
          !payoutSettings.payoutBankCpfCnpj?.trim()) {
        toast.error('Preencha todos os dados da conta bancária.')
        return
      }
    }
    setPayoutSettingsSaving(true)
    const payload: Record<string, string> = payoutSettings.usePix
      ? {
          payoutPixKey: payoutSettings.payoutPixKey.trim(),
          payoutPixKeyType: payoutSettings.payoutPixKeyType,
          payoutBankCode: '',
          payoutBankAgency: '',
          payoutBankAccount: '',
          payoutBankAccountDigit: '',
          payoutBankOwnerName: '',
          payoutBankCpfCnpj: '',
          payoutBankAccountType: '',
        }
      : {
          payoutPixKey: '',
          payoutPixKeyType: '',
          payoutBankCode: payoutSettings.payoutBankCode.trim(),
          payoutBankAgency: payoutSettings.payoutBankAgency.trim(),
          payoutBankAccount: payoutSettings.payoutBankAccount.trim(),
          payoutBankAccountDigit: payoutSettings.payoutBankAccountDigit.trim(),
          payoutBankOwnerName: payoutSettings.payoutBankOwnerName.trim(),
          payoutBankCpfCnpj: payoutSettings.payoutBankCpfCnpj.replace(/\D/g, ''),
          payoutBankAccountType: payoutSettings.payoutBankAccountType,
        }
    const res = await companiesService.updateMyCompany(payload)
    setPayoutSettingsSaving(false)
    if (res.success) {
      toast.success('Dados para repasse salvos!', {
        description: 'Quando você solicitar saque, a administração poderá realizar o pagamento via PIX ou TED usando estes dados.',
      })
    } else {
      toast.error(res.error ?? 'Erro ao salvar. Tente novamente.')
    }
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

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast.error('Preencha todos os campos de senha')
      return
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast.error('Nova senha e confirmação não conferem')
      return
    }
    if (passwordForm.new.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres')
      return
    }
    const result = await authService.changePassword(
      passwordForm.current,
      passwordForm.new
    )
    if (result.success) {
      toast.success('Senha alterada com sucesso', {
        description: 'Sua nova senha já está ativa. Use-a no próximo login.'
      })
      setPasswordForm({ current: '', new: '', confirm: '' })
    } else {
      toast.error(result.error ?? 'Erro ao alterar senha')
    }
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
      {/* Modal de corte da imagem */}
      <Dialog open={showCropModal} onOpenChange={(open) => !open && handleCropCancel()}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Cortar foto</DialogTitle>
            <DialogDescription>
              Ajuste a área de corte. A foto de perfil será quadrada. Arraste para mover e use o zoom se precisar.
            </DialogDescription>
          </DialogHeader>
          {imageToCrop && (
            <div className="relative h-[400px] w-full bg-black">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="rect"
                showGrid
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropAreaChange={onCropAreaChange}
                onCropComplete={onCropAreaChange}
              />
            </div>
          )}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Zoom</Label>
              <Slider
                min={1}
                max={3}
                step={0.1}
                value={[zoom]}
                onValueChange={([v]) => setZoom(v ?? 1)}
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCropCancel}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleCropConfirm} disabled={!croppedAreaPct}>
                Cortar e salvar
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 border-b bg-card flex-shrink-0 gap-4">
        <div className="min-w-0">
          <h1 className="text-foreground mb-2 text-lg sm:text-xl">Configurações</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
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
      <div className="flex-1 p-4 sm:p-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-4 sm:mb-6 h-auto p-1 gap-0">
            <TabsTrigger value="profile" className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-muted data-[state=inactive]:bg-transparent">
              <User className="h-4 w-4 shrink-0" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-muted data-[state=inactive]:bg-transparent">
              <Lock className="h-4 w-4 shrink-0" />
              Segurança
            </TabsTrigger>
            {/* <TabsTrigger value="notifications" ... /> <TabsTrigger value="availability" ... /> */}
            <TabsTrigger value="payment" className="flex items-center justify-center gap-2 py-2.5 data-[state=active]:bg-muted data-[state=inactive]:bg-transparent">
              <CreditCard className="h-4 w-4 shrink-0" />
              Pagamento
            </TabsTrigger>
            {/* <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Privacidade
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Geral
            </TabsTrigger> */}
          </TabsList>

          <div className="flex-1 overflow-auto">
            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-aumigo-orange" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Atualize suas informações básicas e foto de perfil
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-4 sm:p-6">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <p className="text-muted-foreground">Carregando dados do usuário...</p>
                    </div>
                  ) : (
                    <>
                  {/* Avatar Section */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileData.profilePicture} alt={profileData.name} />
                        <AvatarFallback className="text-xl bg-aumigo-blue/20 text-aumigo-teal">
                          {profileData.name?.[0]?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full bg-aumigo-orange hover:bg-aumigo-orange/90"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Foto do Perfil</h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        Recomendamos uma foto clara e profissional
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploadingImage ? 'Enviando...' : 'Alterar foto'}
                        </Button>
                        {profileData.profilePicture && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive"
                            onClick={handleRemoveImage}
                            disabled={isUploadingImage}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
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

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
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

            {/* Payment Tab — Dados para recebimento de repasses (PIX ou TED) */}
            <TabsContent value="payment" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-aumigo-orange" />
                    Dados para recebimento de repasses
                  </CardTitle>
                  <CardDescription>
                    Informe PIX ou conta bancária para receber os valores quando a administração realizar o pagamento do seu saque. Esses dados são usados apenas para repasses da plataforma AumigoPet.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {payoutSettingsLoading ? (
                    <div className="flex items-center justify-center py-12 text-aumigo-teal">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : hasCompany === false ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                      Você não possui empresa vinculada. Entre em contato com o suporte para configurar.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant={payoutSettings.usePix ? 'default' : 'outline'}
                          size="sm"
                          className={payoutSettings.usePix ? 'bg-aumigo-teal hover:bg-aumigo-teal/90' : ''}
                          onClick={() => setPayoutSettings((p) => ({ ...p, usePix: true }))}
                        >
                          Receber via PIX
                        </Button>
                        <Button
                          type="button"
                          variant={!payoutSettings.usePix ? 'default' : 'outline'}
                          size="sm"
                          className={!payoutSettings.usePix ? 'bg-aumigo-teal hover:bg-aumigo-teal/90' : ''}
                          onClick={() => setPayoutSettings((p) => ({ ...p, usePix: false }))}
                        >
                          Receber via TED (conta bancária)
                        </Button>
                      </div>

                      {payoutSettings.usePix ? (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Tipo da chave PIX</Label>
                            <Select
                              value={payoutSettings.payoutPixKeyType}
                              onValueChange={(v) => setPayoutSettings((p) => ({ ...p, payoutPixKeyType: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {PIX_KEY_TYPES.map((opt) => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Chave PIX</Label>
                            <Input
                              value={payoutSettings.payoutPixKey}
                              onChange={(e) => setPayoutSettings((p) => ({ ...p, payoutPixKey: e.target.value }))}
                              placeholder={
                                payoutSettings.payoutPixKeyType === 'CPF' || payoutSettings.payoutPixKeyType === 'CNPJ'
                                  ? 'Apenas números'
                                  : payoutSettings.payoutPixKeyType === 'PHONE'
                                    ? '11 dígitos com DDD'
                                    : 'Sua chave PIX'
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Código do banco</Label>
                            <Input
                              value={payoutSettings.payoutBankCode}
                              onChange={(e) => setPayoutSettings((p) => ({ ...p, payoutBankCode: e.target.value }))}
                              placeholder="Ex: 237"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Agência</Label>
                            <Input
                              value={payoutSettings.payoutBankAgency}
                              onChange={(e) => setPayoutSettings((p) => ({ ...p, payoutBankAgency: e.target.value }))}
                              placeholder="Número da agência"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Conta</Label>
                            <Input
                              value={payoutSettings.payoutBankAccount}
                              onChange={(e) => setPayoutSettings((p) => ({ ...p, payoutBankAccount: e.target.value }))}
                              placeholder="Número da conta"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Dígito</Label>
                            <Input
                              value={payoutSettings.payoutBankAccountDigit}
                              onChange={(e) => setPayoutSettings((p) => ({ ...p, payoutBankAccountDigit: e.target.value }))}
                              placeholder="Dígito"
                            />
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>Titular da conta</Label>
                            <Input
                              value={payoutSettings.payoutBankOwnerName}
                              onChange={(e) => setPayoutSettings((p) => ({ ...p, payoutBankOwnerName: e.target.value }))}
                              placeholder="Nome completo do titular"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>CPF ou CNPJ do titular</Label>
                            <Input
                              value={payoutSettings.payoutBankCpfCnpj}
                              onChange={(e) => setPayoutSettings((p) => ({ ...p, payoutBankCpfCnpj: e.target.value }))}
                              placeholder="Apenas números"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de conta</Label>
                            <Select
                              value={payoutSettings.payoutBankAccountType}
                              onValueChange={(v) => setPayoutSettings((p) => ({ ...p, payoutBankAccountType: v }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="CONTA_CORRENTE">Conta corrente</SelectItem>
                                <SelectItem value="CONTA_POUPANCA">Conta poupança</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="bg-aumigo-blue/10 border border-aumigo-blue/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-aumigo-blue flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-aumigo-blue/90">
                            Após solicitar saque na aba Financeiro, a administração poderá realizar o pagamento usando estes dados (PIX ou TED via plataforma).
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleSavePayoutSettings}
                          disabled={payoutSettingsSaving}
                          className="bg-aumigo-teal hover:bg-aumigo-teal/90"
                        >
                          {payoutSettingsSaving ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Salvar
                        </Button>
                      </div>
                    </>
                  )}
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

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
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

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-aumigo-orange" />
                    Alterar senha
                  </CardTitle>
                  <CardDescription>
                    Use uma senha forte e altere periodicamente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Senha atual</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite a senha atual"
                        value={passwordForm.current}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, current: e.target.value })
                        }
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
                    <Label>Nova senha</Label>
                    <Input
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      value={passwordForm.new}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, new: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar nova senha</Label>
                    <Input
                      type="password"
                      placeholder="Repita a nova senha"
                      value={passwordForm.confirm}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirm: e.target.value })
                      }
                    />
                  </div>
                  <Button variant="outline" onClick={handleChangePassword}>
                    <Lock className="h-4 w-4 mr-2" />
                    Alterar senha
                  </Button>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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