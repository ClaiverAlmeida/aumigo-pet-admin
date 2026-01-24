import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { 
  Loader2,
  User,
  Building
} from 'lucide-react'
import { companiesService, usersService } from '../services'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

interface UserData {
  id: string
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  profilePicture?: string
}

interface CompanyData {
  id: string
  name: string
  cnpj?: string
  address?: string
  addressNumber?: string
  city?: string
  state?: string
  zipCode?: string
  contactPhone?: string
  contactEmail?: string
  website?: string
}

export function ProKYC() {
  const { user } = useAuth()
  const [userData, setUserData] = useState<UserData>({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    profilePicture: '',
  })
  const [company, setCompany] = useState<CompanyData>({
    id: '',
    name: '',
    cnpj: '',
    address: '',
    addressNumber: '',
    city: '',
    state: '',
    zipCode: '',
    contactPhone: '',
    contactEmail: '',
    website: '',
  })
  const [isEditingCompany, setIsEditingCompany] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Carregar dados iniciais
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Buscar dados do usuário via API
      const userResult = await usersService.getMyProfile()
      if (userResult.success && userResult.data) {
        const userDataFromApi = userResult.data
        setUserData({
          id: userDataFromApi.id || '',
          name: userDataFromApi.name || '',
          email: userDataFromApi.email || '',
          phone: userDataFromApi.phone || '',
          address: userDataFromApi.address || '',
          city: userDataFromApi.city || '',
          state: userDataFromApi.state || '',
          zipCode: userDataFromApi.zipCode || '',
          profilePicture: userDataFromApi.profilePicture || '',
        })
      } else if (user) {
        // Fallback para AuthContext se API falhar
        setUserData({
          id: user.id || '',
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          address: '',
          city: '',
          state: '',
          zipCode: '',
          profilePicture: user.avatar || '',
        })
      }

      // Buscar dados da empresa
      const companyResult = await companiesService.getMyCompany()
      if (companyResult.success && companyResult.data) {
        const companyData = companyResult.data
        setCompany({
          id: companyData.id || '',
          name: companyData.name || '',
          cnpj: companyData.cnpj || '',
          address: companyData.address || '',
          addressNumber: companyData.addressNumber || '',
          city: companyData.city || '',
          state: companyData.state || '',
          zipCode: companyData.zipCode || '',
          contactPhone: companyData.contactPhone || '',
          contactEmail: companyData.contactEmail || '',
          website: companyData.website || '',
        })
      }
    } catch (error: any) {
      toast.error('Erro ao carregar dados: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const handleCompanyChange = (field: keyof CompanyData, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveCompany = async () => {
    setSaving(true)
    try {
      // Preparar dados: remover strings vazias e converter para undefined
      const prepareValue = (value: string | undefined): string | undefined => {
        return value && value.trim() !== '' ? value.trim() : undefined;
      };

      const companyResult = await companiesService.updateMyCompany({
        name: company.name || undefined,
        cnpj: prepareValue(company.cnpj),
        address: prepareValue(company.address),
        addressNumber: prepareValue(company.addressNumber),
        city: prepareValue(company.city),
        state: prepareValue(company.state),
        zipCode: prepareValue(company.zipCode),
        contactPhone: prepareValue(company.contactPhone),
        contactEmail: prepareValue(company.contactEmail),
        website: prepareValue(company.website),
      })

      if (companyResult.success) {
        toast.success('Dados da empresa atualizados com sucesso!')
        setIsEditingCompany(false)
        await loadData() // Recarregar dados
      } else {
        toast.error(companyResult.error || 'Erro ao salvar dados da empresa')
      }
    } catch (error: any) {
      toast.error('Erro ao salvar dados da empresa: ' + (error.message || 'Erro desconhecido'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-aumigo-orange" />
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>KYC & Perfil Profissional</h2>
          <p className="text-muted-foreground">Gerencie seus dados pessoais e da empresa</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Card: Dados do Usuário (Somente Leitura) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados do Usuário
            </CardTitle>
            <CardDescription>Informações pessoais do seu perfil (somente leitura)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userData.profilePicture} />
                <AvatarFallback>{userData.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div>
                  <h3 className="font-medium">{userData.name || 'Não informado'}</h3>
                  <p className="text-sm text-muted-foreground">{userData.email || 'Não informado'}</p>
                  <p className="text-sm text-muted-foreground">{userData.phone || 'Não informado'}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>CEP</Label>
                <p className="text-sm font-mono mt-1">{userData.zipCode || '-'}</p>
              </div>
            </div>

            <div>
              <Label>Endereço</Label>
              <div className="text-sm mt-1">
                {userData.address ? (
                  <>
                    <p>{userData.address}</p>
                    <p>{userData.city} - {userData.state}</p>
                  </>
                ) : (
                  <p className="text-muted-foreground">-</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card: Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Dados da Empresa
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (isEditingCompany) {
                    setIsEditingCompany(false)
                    loadData() // Recarregar dados originais
                  } else {
                    setIsEditingCompany(true)
                  }
                }}
              >
                {isEditingCompany ? 'Cancelar' : 'Editar'}
              </Button>
            </CardTitle>
            <CardDescription>Informações da sua empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nome da Empresa</Label>
              {isEditingCompany ? (
                <Input 
                  value={company.name} 
                  placeholder="Nome da empresa"
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                />
              ) : (
                <p className="text-sm font-medium mt-1">{company.name || '-'}</p>
              )}
            </div>

            <div>
              <Label>CNPJ</Label>
              {isEditingCompany ? (
                <Input 
                  value={company.cnpj || ''} 
                  placeholder="00.000.000/0000-00"
                  onChange={(e) => handleCompanyChange('cnpj', e.target.value)}
                />
              ) : (
                <p className="text-sm font-mono mt-1">{company.cnpj || '-'}</p>
              )}
            </div>

            <div>
              <Label>Endereço</Label>
              {isEditingCompany ? (
                <div className="space-y-2">
                  <Input 
                    value={company.address || ''} 
                    placeholder="Rua"
                    onChange={(e) => handleCompanyChange('address', e.target.value)}
                  />
                  <Input 
                    value={company.addressNumber || ''} 
                    placeholder="Número"
                    onChange={(e) => handleCompanyChange('addressNumber', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      value={company.city || ''} 
                      placeholder="Cidade"
                      onChange={(e) => handleCompanyChange('city', e.target.value)}
                    />
                    <Input 
                      value={company.state || ''} 
                      placeholder="UF"
                      onChange={(e) => handleCompanyChange('state', e.target.value)}
                    />
                  </div>
                  <Input 
                    value={company.zipCode || ''} 
                    placeholder="CEP"
                    onChange={(e) => handleCompanyChange('zipCode', e.target.value)}
                  />
                </div>
              ) : (
                <div className="text-sm mt-1">
                  {company.address ? (
                    <>
                      <p>{company.address}, {company.addressNumber}</p>
                      <p>{company.city} - {company.state}</p>
                      <p>{company.zipCode}</p>
                    </>
                  ) : (
                    <p className="text-muted-foreground">-</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Telefone de Contato</Label>
                {isEditingCompany ? (
                  <Input 
                    value={company.contactPhone || ''} 
                    placeholder="(00) 00000-0000"
                    onChange={(e) => handleCompanyChange('contactPhone', e.target.value)}
                  />
                ) : (
                  <p className="text-sm mt-1">{company.contactPhone || '-'}</p>
                )}
              </div>
              <div>
                <Label>Email de Contato</Label>
                {isEditingCompany ? (
                  <Input 
                    value={company.contactEmail || ''} 
                    placeholder="contato@empresa.com"
                    onChange={(e) => handleCompanyChange('contactEmail', e.target.value)}
                  />
                ) : (
                  <p className="text-sm mt-1">{company.contactEmail || '-'}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Website</Label>
              {isEditingCompany ? (
                <Input 
                  value={company.website || ''} 
                  placeholder="https://www.empresa.com"
                  onChange={(e) => handleCompanyChange('website', e.target.value)}
                />
              ) : (
                <p className="text-sm mt-1">{company.website || '-'}</p>
              )}
            </div>

            {isEditingCompany && (
              <div className="flex justify-end gap-2 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditingCompany(false)
                    loadData()
                  }}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSaveCompany}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar Alterações'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
