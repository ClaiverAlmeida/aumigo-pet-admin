import React, { useState, useEffect, useRef, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Separator } from './ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
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
  Shield,
  Lock,
  Eye,
  EyeOff,
  Save,
  X,
  Settings,
  Camera,
  MapPin,
  Upload,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { usersService } from '../services/users.service'
import { filesService } from '../services/files.service'
import { authService } from '../services/auth.service'
import { useAuth } from '../contexts/AuthContext'

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

const ROLE_LABEL: Record<string, string> = {
  super_admin: 'Super Admin',
  operations: 'Operações',
  support: 'Suporte',
  finance: 'Financeiro',
}

interface AdminSettingsProps {
  adminUser?: { name: string; email: string; role: string }
}

export function AdminSettings({ adminUser }: AdminSettingsProps) {
  const { refreshAdminUser } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    profilePicture: '',
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
    profilePicture: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true)
      try {
        const result = await usersService.getMyProfile()
        if (result.success && result.data) {
          const u = result.data
          let formattedBirthDate = ''
          if (u.birthDate) {
            try {
              const date = new Date(u.birthDate)
              formattedBirthDate = !isNaN(date.getTime())
                ? date.toISOString().split('T')[0]
                : (u.birthDate as string)
            } catch {
              formattedBirthDate = u.birthDate as string
            }
          }
          const data: ProfileData = {
            name: u.name ?? '',
            email: u.email ?? '',
            phone: u.phone ?? '',
            cpf: u.cpf ?? '',
            birthDate: formattedBirthDate,
            address: u.address ?? '',
            city: u.city ?? '',
            state: u.state ?? '',
            zipCode: u.zipCode ?? '',
            profilePicture: u.profilePicture ?? '',
          }
          setProfileData(data)
          setOriginalData(data)
        } else if (adminUser) {
          const fallback: ProfileData = {
            name: adminUser.name,
            email: adminUser.email,
          }
          setProfileData(fallback)
          setOriginalData(fallback)
        }
      } catch {
        if (adminUser) {
          const fallback: ProfileData = {
            name: adminUser.name,
            email: adminUser.email,
          }
          setProfileData(fallback)
          setOriginalData(fallback)
        }
      } finally {
        setIsLoading(false)
      }
    }
    loadProfile()
  }, [adminUser?.name, adminUser?.email])

  const handleSaveProfile = async () => {
    if (!profileData.name.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    if (!profileData.email.trim()) {
      toast.error('E-mail é obrigatório')
      return
    }
    // Monta payload apenas com campos alterados em relação ao original
    const updateData: any = {}
    const trim = (v?: string) => (v ?? '').trim()

    if (trim(profileData.name) !== trim(originalData.name)) {
      updateData.name = trim(profileData.name)
    }
    if (trim(profileData.email) !== trim(originalData.email)) {
      updateData.email = trim(profileData.email)
    }
    if (trim(profileData.phone) !== trim(originalData.phone)) {
      updateData.phone = trim(profileData.phone) || undefined
    }
    if (trim(profileData.cpf) !== trim(originalData.cpf)) {
      updateData.cpf = trim(profileData.cpf) || undefined
    }
    if (trim(profileData.birthDate) !== trim(originalData.birthDate)) {
      updateData.birthDate = trim(profileData.birthDate) || undefined
    }
    if (trim(profileData.address) !== trim(originalData.address)) {
      updateData.address = trim(profileData.address) || undefined
    }
    if (trim(profileData.city) !== trim(originalData.city)) {
      updateData.city = trim(profileData.city) || undefined
    }
    if (trim(profileData.state) !== trim(originalData.state)) {
      updateData.state = trim(profileData.state) || undefined
    }
    if (trim(profileData.zipCode) !== trim(originalData.zipCode)) {
      updateData.zipCode = trim(profileData.zipCode) || undefined
    }

    if (Object.keys(updateData).length === 0) {
      toast.info('Nenhuma alteração para salvar')
      return
    }

    setIsSaving(true)
    const loadingToast = toast.loading('Salvando perfil...')
    try {
      const result = await usersService.updateMyProfile(updateData)
      toast.dismiss(loadingToast)
      if (result.success && result.data) {
        setOriginalData(profileData)
        await refreshAdminUser()
        toast.success('Perfil atualizado com sucesso')
      } else {
        toast.error(result.error ?? 'Erro ao salvar perfil')
      }
    } catch (e: any) {
      toast.dismiss(loadingToast)
      toast.error(e.message ?? 'Erro ao salvar perfil')
    } finally {
      setIsSaving(false)
    }
  }

  const onCropAreaChange = useCallback((croppedArea: Area) => {
    setCroppedAreaPct(croppedArea)
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
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
    const loadingToast = toast.loading('Enviando foto...')
    try {
      const file = new File([blob], fileName.replace(/\.[^.]+$/, '.jpg') || 'foto.jpg', {
        type: 'image/jpeg',
      })
      const uploadResult = await filesService.upload(
        file as any,
        'PROFILE_IMAGE',
        'Foto de perfil do administrador'
      )
      if (!uploadResult.success || !uploadResult.data?.url) {
        throw new Error(uploadResult.error ?? 'Erro no upload')
      }
      const updateResult = await usersService.updateMyProfile({
        profilePicture: uploadResult.data.url,
      })
      toast.dismiss(loadingToast)
      if (updateResult.success && updateResult.data) {
        setProfileData((prev) => ({ ...prev, profilePicture: uploadResult.data!.url }))
        setOriginalData((prev) => ({ ...prev, profilePicture: uploadResult.data!.url }))
        await refreshAdminUser()
        toast.success('Foto do perfil atualizada')
      } else {
        throw new Error(updateResult.error ?? 'Erro ao atualizar perfil')
      }
    } catch (err: any) {
      toast.dismiss(loadingToast)
      toast.error(err.message ?? 'Erro ao enviar foto')
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
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao processar imagem')
    }
  }

  const handleRemoveImage = async () => {
    if (!profileData.profilePicture) return
    setIsUploadingImage(true)
    const loadingToast = toast.loading('Removendo foto...')
    try {
      const result = await usersService.updateMyProfile({ profilePicture: null })
      toast.dismiss(loadingToast)
      if (result.success) {
        setProfileData((prev) => ({ ...prev, profilePicture: '' }))
        setOriginalData((prev) => ({ ...prev, profilePicture: '' }))
        await refreshAdminUser()
        toast.success('Foto removida')
      } else {
        throw new Error(result.error)
      }
    } catch (err: any) {
      toast.dismiss(loadingToast)
      toast.error(err.message ?? 'Erro ao remover foto')
    } finally {
      setIsUploadingImage(false)
    }
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
      toast.success('Senha alterada com sucesso')
      setPasswordForm({ current: '', new: '', confirm: '' })
    } else {
      toast.error(result.error ?? 'Erro ao alterar senha')
    }
  }

  const roleLabel = adminUser?.role ? ROLE_LABEL[adminUser.role] ?? adminUser.role : null

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
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

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-aumigo-teal flex items-center gap-2">
          <Settings className="h-7 w-7" />
          Configurações
        </h1>
        <p className="text-aumigo-gray text-sm mt-1">
          Gerencie seu perfil e segurança do painel administrativo
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-sm">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Segurança
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card className="border-aumigo-teal/20">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-aumigo-teal">
                <User className="h-5 w-5" />
                Informações pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações básicas e foto de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-4 sm:p-6">
              {isLoading ? (
                <p className="text-muted-foreground text-sm py-4">Carregando...</p>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative">
                      <Avatar className="h-24 w-24 border-2 border-aumigo-teal/20">
                        <AvatarImage src={profileData.profilePicture} alt={profileData.name} />
                        <AvatarFallback className="text-xl bg-aumigo-teal/10 text-aumigo-teal">
                          {profileData.name?.[0]?.toUpperCase() ?? 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 h-8 w-8 p-0 rounded-full bg-aumigo-teal hover:bg-aumigo-teal/90"
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
                      <h3 className="font-medium mb-1">Foto do perfil</h3>
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
                      {roleLabel && (
                        <p className="text-sm text-aumigo-gray mt-2">
                          Função: <span className="font-medium text-aumigo-teal">{roleLabel}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-name">Nome completo *</Label>
                      <Input
                        id="admin-name"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-phone">Telefone</Label>
                      <Input
                        id="admin-phone"
                        value={profileData.phone ?? ''}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-email">E-mail *</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-cpf">CPF</Label>
                      <Input
                        id="admin-cpf"
                        value={profileData.cpf ?? ''}
                        onChange={(e) => setProfileData({ ...profileData, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-birthDate">Data de nascimento</Label>
                      <Input
                        id="admin-birthDate"
                        type="date"
                        value={profileData.birthDate ?? ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, birthDate: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="admin-address">Endereço</Label>
                    <Input
                      id="admin-address"
                      value={profileData.address ?? ''}
                      onChange={(e) =>
                        setProfileData({ ...profileData, address: e.target.value })
                      }
                      placeholder="Rua, número, complemento"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin-city">Cidade</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="admin-city"
                          className="pl-10"
                          value={profileData.city ?? ''}
                          onChange={(e) =>
                            setProfileData({ ...profileData, city: e.target.value })
                          }
                          placeholder="Cidade"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-state">Estado</Label>
                      <Input
                        id="admin-state"
                        value={profileData.state ?? ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, state: e.target.value })
                        }
                        placeholder="UF"
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin-zipCode">CEP</Label>
                      <Input
                        id="admin-zipCode"
                        value={profileData.zipCode ?? ''}
                        onChange={(e) =>
                          setProfileData({ ...profileData, zipCode: e.target.value })
                        }
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setProfileData(originalData)
                        toast.info('Alterações desfeitas')
                      }}
                      disabled={isLoading || isSaving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading || isSaving}
                      className="bg-aumigo-teal hover:bg-aumigo-teal/90"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-aumigo-teal/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-aumigo-teal">
                <Lock className="h-5 w-5" />
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
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Nova senha</Label>
                <Input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
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
      </Tabs>
    </div>
  )
}
