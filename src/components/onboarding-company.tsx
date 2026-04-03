import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import {
  Building,
  FileText,
  Globe,
  MapPin,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api.service'
import { getUserFromToken } from '../services/jwt'
import exampleImage from '../assets/8dfcc005426cdf14f94213dc79b85192818ffd4b.png'
import { lookupCep } from '../utils/viacep'

interface OnboardingCompanyProps {
  onComplete: () => void
  user: {
    id: string
    name: string
    email: string
  }
}

export function OnboardingCompany({ onComplete, user }: OnboardingCompanyProps) {
  const { signIn, signOut } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingCep, setLoadingCep] = useState(false)

  const [companyData, setCompanyData] = useState({
    businessType: 'empresa' as 'empresa' | 'autonomo',
    business: '',
    cnpj: '',
    website: '',
    zipCode: '',
    address: '',
    addressNumber: '',
    city: '',
    state: '',
  })

  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const data = await lookupCep(cleanCep)
        if (data) {
          setCompanyData((prev) => ({
            ...prev,
            zipCode: data.zipCode,
            address: data.address,
            city: data.city,
            state: data.state,
          }))
          toast.success('Endereço encontrado!')
        } else {
          toast.error('CEP não encontrado')
        }
      } finally {
        setLoadingCep(false)
      }
    } else {
      setCompanyData((prev) => ({ ...prev, zipCode: cleanCep }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (step === 1) {
      // Validação da etapa 1
      if (!companyData.business) {
        setError('Preencha todos os campos obrigatórios')
        toast.error('Preencha todos os campos obrigatórios')
        return
      }
      
      // Validação de documento (CNPJ ou CPF)
      if (!companyData.cnpj) {
        const errorMsg = companyData.businessType === 'empresa' ? 'CNPJ é obrigatório' : 'CPF é obrigatório'
        setError(errorMsg)
        toast.error(errorMsg)
        return
      }

      // Validação para empresa: tudo obrigatório (exceto site)
      if (companyData.businessType === 'empresa') {
        if (!companyData.zipCode) {
          setError('CEP é obrigatório para empresas')
          toast.error('CEP é obrigatório para empresas')
          return
        }
        if (!companyData.address) {
          setError('Endereço é obrigatório para empresas')
          toast.error('Endereço é obrigatório para empresas')
          return
        }
        if (!companyData.addressNumber) {
          setError('Número do endereço é obrigatório para empresas')
          toast.error('Número do endereço é obrigatório para empresas')
          return
        }
        if (!companyData.city) {
          setError('Cidade é obrigatória para empresas')
          toast.error('Cidade é obrigatória para empresas')
          return
        }
        if (!companyData.state) {
          setError('Estado é obrigatório para empresas')
          toast.error('Estado é obrigatório para empresas')
          return
        }
      }

      // Validação para autônomo: cidade e UF obrigatórios
      if (companyData.businessType === 'autonomo') {
        if (!companyData.city) {
          setError('Cidade é obrigatória')
          toast.error('Cidade é obrigatória')
          return
        }
        if (!companyData.state) {
          setError('Estado é obrigatório')
          toast.error('Estado é obrigatório')
          return
        }
      }
      
      setError('')
      setStep(2)
      return
    }
    
    if (step === 2) {
      setIsLoading(true)
      setError('')
      toast.loading('Criando sua empresa...', { id: 'upgrade-loading' })

      try {
        const result = await api.post('/auth/upgrade-to-service-provider', {
          businessName: companyData.business,
          cnpj: companyData.cnpj || undefined,
          website: companyData.businessType === 'empresa' ? companyData.website : undefined,
          zipCode: companyData.zipCode || undefined,
          address: companyData.address || undefined,
          addressNumber: companyData.addressNumber || undefined,
          city: companyData.city || undefined,
          state: companyData.state || undefined,
        })

        toast.dismiss('upgrade-loading')

        if (result.success && result.data?.access_token) {
          // Atualizar token
          localStorage.setItem('auth_token', result.data.access_token)
          if (result.data.refresh_token) {
            localStorage.setItem('refresh_token', result.data.refresh_token)
          }

          // Decodificar token para pegar dados atualizados do usuário
          const tokenUser = getUserFromToken(result.data.access_token)
          
          // Atualizar dados do usuário no localStorage
          const storedUser = localStorage.getItem('aumigopet_user')
          if (storedUser) {
            const userData = JSON.parse(storedUser)
            const updatedUser = {
              ...userData,
              role: tokenUser?.role || 'SERVICE_PROVIDER',
              companyId: tokenUser?.companyId || null,
            }
            localStorage.setItem('aumigopet_user', JSON.stringify(updatedUser))
          }

          setIsLoading(false)
          toast.success('Empresa criada com sucesso! 🎉')
          onComplete()
        } else {
          setIsLoading(false)
          const errorMsg = result.error || 'Erro ao criar empresa'
          setError(errorMsg)
          toast.error(errorMsg)
        }
      } catch (error: any) {
        toast.dismiss('upgrade-loading')
        setIsLoading(false)
        const errorMsg = error?.message || 'Erro ao criar empresa'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    }
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aumigo-blue/10 via-white to-aumigo-orange/10 flex items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
          <CardHeader className="text-center pb-6 px-8 pt-8 relative">
            {/* Botão de logout no canto superior direito */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="absolute top-4 right-4 text-aumigo-gray hover:text-aumigo-orange"
              disabled={isLoading}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
            
            <div className="flex items-center justify-center mb-6">
              <img 
                src={exampleImage} 
                alt="AuMigoPet" 
                className="h-10 w-auto mr-3"
              />
              <span style={{ color: 'rgb(46, 111, 121)', fontSize: '1.25rem' }}>AuMigoPet PRO</span>
            </div>
            <CardTitle style={{ color: 'rgb(46, 111, 121)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' }}>
              Complete seu cadastro profissional
            </CardTitle>
            <CardDescription style={{ color: 'rgb(107, 114, 128)', fontSize: '1rem', lineHeight: '1.75' }}>
              Para acessar o painel profissional, você precisa criar uma empresa ou se cadastrar como prestador autônomo
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mensagem de erro animada */}
              {error && (
                <motion.div 
                  className="px-4 py-3 rounded-xl mb-4"
                  style={{
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c'
                  }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-sm flex items-center gap-2" style={{ color: '#b91c1c' }}>
                    <AlertCircle className="h-4 w-4" style={{ color: '#dc2626' }} />
                    {error}
                  </p>
                </motion.div>
              )}

              {step === 1 && (
                <>
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center space-x-2" style={{ color: 'rgb(107, 114, 128)', fontSize: '0.875rem' }}>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(255, 155, 87)' }}></div>
                        <span className="ml-1">Dados da empresa</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(107, 114, 128, 0.3)' }}></div>
                        <span className="ml-1">Finalizar</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="business-name">Nome do negócio</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                      <Input
                        id="business-name"
                        type="text"
                        placeholder="Ex: Clínica Pet, João Veterinário, Pet Shop Central..."
                        className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                        value={companyData.business}
                        onChange={(e) => {
                          setCompanyData({ ...companyData, business: e.target.value })
                          setError('')
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo de negócio</Label>
                    <RadioGroup
                      value={companyData.businessType}
                      onValueChange={(value) => setCompanyData({ ...companyData, businessType: value as 'empresa' | 'autonomo', cnpj: '', website: '' })}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="empresa" id="empresa" />
                        <Label htmlFor="empresa" className="font-normal cursor-pointer">
                          Empresa (com CNPJ)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="autonomo" id="autonomo" />
                        <Label htmlFor="autonomo" className="font-normal cursor-pointer">
                          Prestador autônomo
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnpj">
                      {companyData.businessType === 'empresa' ? 'CNPJ' : 'CPF'} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                      <Input
                        id="cnpj"
                        type="text"
                        placeholder={companyData.businessType === 'empresa' ? '00.000.000/0000-00' : '000.000.000-00'}
                        maxLength={companyData.businessType === 'empresa' ? 18 : 14}
                        className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                        value={companyData.cnpj}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          let formatted = ''
                          if (companyData.businessType === 'empresa') {
                            formatted = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                          } else {
                            formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                          }
                          setCompanyData({ ...companyData, cnpj: formatted })
                          setError('')
                        }}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Site (opcional)</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                      <Input
                        id="website"
                        type="url"
                        placeholder="https://www.exemplo.com.br"
                        className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                        value={companyData.website}
                        onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zipCode">
                      CEP {companyData.businessType === 'empresa' && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="00000-000"
                        maxLength={9}
                        className="pl-10 pr-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                        value={companyData.zipCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2')
                          handleCepChange(value)
                        }}
                        required={companyData.businessType === 'empresa'}
                      />
                      {loadingCep && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-aumigo-gray">
                      Digite o CEP para preencher automaticamente o endereço
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Endereço (rua, bairro) {companyData.businessType === 'empresa' && <span className="text-red-500">*</span>}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                      <Input
                        id="address"
                        type="text"
                        placeholder="Rua, bairro"
                        className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                        value={companyData.address}
                        onChange={(e) => {
                          setCompanyData({ ...companyData, address: e.target.value })
                          setError('')
                        }}
                        required={companyData.businessType === 'empresa'}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressNumber">
                      Número {companyData.businessType === 'empresa' && <span className="text-red-500">*</span>}
                    </Label>
                    <Input
                      id="addressNumber"
                      type="text"
                      placeholder="123"
                      className="border-aumigo-gray/30 focus:border-aumigo-orange"
                      value={companyData.addressNumber}
                      onChange={(e) => {
                        setCompanyData({ ...companyData, addressNumber: e.target.value })
                        setError('')
                      }}
                      required={companyData.businessType === 'empresa'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">
                        Cidade <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Cidade"
                        className="border-aumigo-gray/30 focus:border-aumigo-orange"
                        value={companyData.city}
                        onChange={(e) => {
                          setCompanyData({ ...companyData, city: e.target.value })
                          setError('')
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">
                        Estado <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="UF"
                        maxLength={2}
                        className="border-aumigo-gray/30 focus:border-aumigo-orange"
                        value={companyData.state}
                        onChange={(e) => {
                          setCompanyData({ ...companyData, state: e.target.value.toUpperCase() })
                          setError('')
                        }}
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="text-center mb-4">
                    <div className="flex items-center justify-center space-x-2" style={{ color: 'rgb(107, 114, 128)', fontSize: '0.875rem' }}>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(141, 217, 182)' }}></div>
                        <span className="ml-1">Dados da empresa</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(255, 155, 87)' }}></div>
                        <span className="ml-1">Finalizar</span>
                      </div>
                    </div>
                  </div>

                  <Alert className="border-aumigo-blue/30 bg-aumigo-blue/10">
                    <CheckCircle className="h-4 w-4 text-aumigo-blue" />
                    <AlertDescription className="text-aumigo-teal">
                      Confirme os dados da sua empresa para finalizar o cadastro profissional.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Nome do negócio:</span>
                      <p className="text-sm text-gray-900">{companyData.business}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        {companyData.businessType === 'empresa' ? 'CNPJ' : 'CPF'}:
                      </span>
                      <p className="text-sm text-gray-900">{companyData.cnpj}</p>
                    </div>
                    {companyData.address && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Endereço:</span>
                        <p className="text-sm text-gray-900">
                          {companyData.address}
                          {companyData.addressNumber && `, ${companyData.addressNumber}`}
                          {companyData.city && ` - ${companyData.city}`}
                          {companyData.state && `/${companyData.state}`}
                          {companyData.zipCode && ` - ${companyData.zipCode}`}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="flex gap-2">
                {step > 1 && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setError('')
                      setStep(step - 1)
                    }}
                    className="flex-1 border-aumigo-gray/30"
                    disabled={isLoading}
                  >
                    Voltar
                  </Button>
                )}
                <Button 
                  type="submit" 
                  className={`${step === 1 ? 'w-full' : 'flex-1'} bg-aumigo-orange hover:bg-aumigo-orange/90`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Criando empresa...' : 
                   step === 2 ? 'Finalizar cadastro' : 'Continuar'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
