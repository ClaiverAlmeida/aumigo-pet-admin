import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Checkbox } from './ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { RadioGroup, RadioGroupItem } from './ui/radio-group'
import { ImageWithFallback } from './figma/ImageWithFallback'
import exampleImage from '../assets/8dfcc005426cdf14f94213dc79b85192818ffd4b.png'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Building,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  PawPrint,
  Star,
  Heart,
  Scissors,
  Globe,
  FileText,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../contexts/AuthContext'

interface AuthProps {
  onLogin: (userData: any) => void
}

export function Auth({ onLogin }: AuthProps) {
  const { signIn, signUpPro } = useAuth()
  const [currentTab, setCurrentTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // Para cadastro em etapas
  const [error, setError] = useState('') // Estado para mensagem de erro
  const [loadingCep, setLoadingCep] = useState(false)

  // Estados do formulário de login
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  // Estados do formulário de cadastro
  const [signupData, setSignupData] = useState({
    // Etapa 1 - Dados básicos
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Etapa 2 - Informações profissionais
    businessType: 'empresa' as 'empresa' | 'autonomo',
    business: '',
    cnpj: '',
    website: '',
    zipCode: '',
    address: '',
    addressNumber: '',
    city: '',
    state: '',
    specialty: '',
    experience: '',
    // Etapa 3 - Termos
    acceptTerms: false,
    acceptMarketing: false
  })

  // Estado do formulário de recuperação de senha
  const [forgotData, setForgotData] = useState({
    email: ''
  })

  const specialties = [
    // Alinhado com enum ServiceCategory (prisma/schema.prisma)
    { value: 'VETERINARY', label: 'Veterinário', icon: Heart },
    { value: 'HOSPITAL', label: 'Emergência', icon: Heart },
    { value: 'GROOMING', label: 'Banho e Tosa', icon: Scissors },
    { value: 'TRAINING', label: 'Adestramento', icon: Star },
    { value: 'WALKER', label: 'Passeador', icon: PawPrint },
    { value: 'HOTEL', label: 'Hotel para Pets', icon: PawPrint },
    { value: 'PET_SHOP', label: 'Pet Shop', icon: Building },
    { value: 'FARMACY', label: 'Farmácia', icon: Building },
    { value: 'OTHER', label: 'Outro', icon: Building },
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('') // Limpar erro anterior
    
    if (!loginData.email || !loginData.password) {
      setError('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    toast.loading('Fazendo login...', { id: 'auth-loading' })

    try {
      // Usar contexto de autenticação - Seguindo padrão do app
      const result = await signIn(loginData.email, loginData.password)

      toast.dismiss('auth-loading')

      if (result.success) {
        setIsLoading(false)
        setError('') // Limpar erro em caso de sucesso
        toast.success('Login realizado com sucesso! 🎉')
        
        // Mapear dados para o formato esperado pelo onLogin
        const storedUser = localStorage.getItem('aumigopet_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          onLogin({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            avatar: userData.avatar || '',
            specialty: userData.specialty || 'OTHER',
            kycStatus: userData.kycStatus || 'PENDING',
            isFirstLogin: userData.isFirstLogin || false
          })
        }
      } else {
        setIsLoading(false)
        const errorMsg = result.error || 'Erro ao fazer login'
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } catch (error: any) {
      toast.dismiss('auth-loading')
      setIsLoading(false)
      const errorMsg = error.message || 'Erro ao fazer login'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (step === 1) {
      // Validação da etapa 1
      if (!signupData.name || !signupData.email || !signupData.phone || 
          !signupData.password || !signupData.confirmPassword) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }
      
      if (signupData.password !== signupData.confirmPassword) {
        toast.error('As senhas não coincidem')
        return
      }
      
      if (signupData.password.length < 8) {
        toast.error('A senha deve ter pelo menos 8 caracteres')
        return
      }
      
      setStep(2)
      return
    }
    
    if (step === 2) {
      // Validação da etapa 2
      if (!signupData.business) {
        toast.error('Preencha todos os campos obrigatórios')
        return
      }
      
      // Validação de documento (CNPJ ou CPF)
      if (!signupData.cnpj) {
        toast.error(signupData.businessType === 'empresa' ? 'CNPJ é obrigatório' : 'CPF é obrigatório')
        return
      }

      // Validação para empresa: tudo obrigatório (exceto site)
      if (signupData.businessType === 'empresa') {
        if (!signupData.zipCode) {
          toast.error('CEP é obrigatório para empresas')
          return
        }
        if (!signupData.address) {
          toast.error('Endereço é obrigatório para empresas')
          return
        }
        if (!signupData.addressNumber) {
          toast.error('Número do endereço é obrigatório para empresas')
          return
        }
        if (!signupData.city) {
          toast.error('Cidade é obrigatória para empresas')
          return
        }
        if (!signupData.state) {
          toast.error('Estado é obrigatório para empresas')
          return
        }
      }

      // Validação para autônomo: cidade e UF obrigatórios
      if (signupData.businessType === 'autonomo') {
        if (!signupData.city) {
          toast.error('Cidade é obrigatória')
          return
        }
        if (!signupData.state) {
          toast.error('Estado é obrigatório')
          return
        }
      }

      // Validação de especialidade e experiência (obrigatórios para todos)
      if (!signupData.specialty) {
        toast.error('Especialidade é obrigatória')
        return
      }
      if (!signupData.experience) {
        toast.error('Experiência é obrigatória')
        return
      }
      
      setStep(3)
      return
    }
    
    if (step === 3) {
      // Validação da etapa 3
      if (!signupData.acceptTerms) {
        toast.error('Você deve aceitar os termos de serviço')
        return
      }
      
      setIsLoading(true)
      toast.loading('Criando sua conta...', { id: 'signup-loading' })

      try {
        const result = await signUpPro({
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
          businessName: signupData.business,
          cnpj: signupData.cnpj || undefined,
          website: signupData.businessType === 'empresa' ? signupData.website : undefined,
          zipCode: signupData.zipCode || undefined,
          address: signupData.address || undefined,
          addressNumber: signupData.addressNumber || undefined,
          city: signupData.city || undefined,
          state: signupData.state || undefined,
        })

        toast.dismiss('signup-loading')

        if (!result.success) {
          setIsLoading(false)
          toast.error(result.error || 'Erro ao criar conta')
          return
        }

        // Mapear dados para o formato esperado pelo onLogin
        const storedUser = localStorage.getItem('aumigopet_user')
        if (storedUser) {
          const userData = JSON.parse(storedUser)
          onLogin({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            avatar: userData.avatar || '',
            specialty: userData.specialty || 'OTHER',
            kycStatus: userData.kycStatus || 'PENDING',
            isFirstLogin: userData.isFirstLogin || true,
          })
        }

        setIsLoading(false)
        toast.success('Conta criada com sucesso! Complete seu perfil para começar. 🎉')
      } catch (error: any) {
        toast.dismiss('signup-loading')
        setIsLoading(false)
        toast.error(error?.message || 'Erro ao criar conta')
      }
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!forgotData.email) {
      toast.error('Digite seu e-mail')
      return
    }
    
    setIsLoading(true)
    toast.loading('Enviando link de recuperação...', { id: 'forgot-loading' })
    
    setTimeout(() => {
      toast.dismiss('forgot-loading')
      setIsLoading(false)
      toast.success('Link de recuperação enviado! Verifique seu e-mail. 📧')
      setCurrentTab('login')
    }, 2000)
  }

  // Função para buscar endereço pelo CEP (ViaCEP)
  const handleCepChange = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '')
    
    if (cleanCep.length === 8) {
      setLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
        const data = await response.json()
        
        if (!data.erro) {
          setSignupData(prev => ({
            ...prev,
            zipCode: cleanCep.replace(/(\d{5})(\d{3})/, '$1-$2'),
            address: data.logradouro || '',
            city: data.localidade || '',
            state: data.uf || '',
            // Não preenchemos addressNumber automaticamente, usuário deve informar
          }))
          toast.success('Endereço encontrado!')
        } else {
          toast.error('CEP não encontrado')
        }
      } catch (error) {
        toast.error('Erro ao buscar CEP')
      } finally {
        setLoadingCep(false)
      }
    } else {
      setSignupData(prev => ({ ...prev, zipCode: cep }))
    }
  }

  const resetSignupStep = () => {
    setStep(1)
    setSignupData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      businessType: 'empresa',
      business: '',
      cnpj: '',
      website: '',
      zipCode: '',
      address: '',
      addressNumber: '',
      city: '',
      state: '',
      specialty: '',
      experience: '',
      acceptTerms: false,
      acceptMarketing: false
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aumigo-blue/10 via-white to-aumigo-orange/10 flex items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Lado esquerdo - Branding */}
          <div 
            className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 rounded-3xl p-16 min-h-[700px]" 
            style={{ 
              background: 'linear-gradient(135deg, rgb(46, 111, 121) 0%, rgb(94, 196, 231) 100%)',
              color: 'white'
            }}
          >
            <div className="space-y-6">
              <img 
                src={exampleImage} 
                alt="AuMigoPet" 
                className="h-20 w-auto mx-auto "
              />
              <h1 style={{ color: 'white', fontSize: '1.875rem', fontWeight: '600', marginBottom: '1rem' }}>
                AuMigoPet PRO
              </h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.25rem', maxWidth: '24rem', margin: '0 auto', lineHeight: '1.75' }}>
                A plataforma que conecta profissionais do cuidado animal com tutores que amam seus pets
              </p>
            </div>
            
            <div className="space-y-6 w-full max-w-sm mx-auto">
              <div className="flex items-center gap-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: 'rgb(141, 217, 182)' }} />
                <span style={{ fontSize: '1.125rem' }}>Gestão completa de agendamentos</span>
              </div>
              <div className="flex items-center gap-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: 'rgb(141, 217, 182)' }} />
                <span style={{ fontSize: '1.125rem' }}>Sistema de pagamentos integrado</span>
              </div>
              {/* <div className="flex items-center gap-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: 'rgb(141, 217, 182)' }} />
                <span style={{ fontSize: '1.125rem' }}>Chat em tempo real com clientes</span>
              </div> */}
              <div className="flex items-center gap-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: 'rgb(141, 217, 182)' }} />
                <span style={{ fontSize: '1.125rem' }}>Avaliações e feedback dos tutores</span>
              </div>
            </div>

            {/* <div 
              className="mt-10 p-6 rounded-2xl backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1rem', marginBottom: '1rem', lineHeight: '1.75' }}>
                Junte-se a mais de <strong style={{ color: 'rgb(141, 217, 182)' }}>2.500+ profissionais</strong> que já confiam na AuMigoPet
              </p>
              <div className="flex -space-x-2 justify-center">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'white' }}
                  />
                ))}
                <div 
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm"
                  style={{ backgroundColor: 'rgb(141, 217, 182)', borderColor: 'white', color: 'white' }}
                >
                  +
                </div>
              </div>
            </div> */}
          </div>

          {/* Lado direito - Formulários */}
          <div className="w-full max-w-lg mx-auto lg:max-w-none">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
              <CardHeader className="text-center pb-6 px-8 pt-8">
                <div className="flex items-center justify-center mb-6 lg:hidden">
                  <img 
                    src={exampleImage} 
                    alt="AuMigoPet" 
                    className="h-10 w-auto mr-3"
                  />
                  <span style={{ color: 'rgb(46, 111, 121)', fontSize: '1.25rem' }}>AuMigoPet PRO</span>
                </div>
                <CardTitle style={{ color: 'rgb(46, 111, 121)', fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.75rem' }}>
                  {currentTab === 'login' ? 'Faça seu login' : 
                   currentTab === 'signup' ? 'Crie sua conta' : 
                   'Recuperar senha'}
                </CardTitle>
                <CardDescription style={{ color: 'rgb(107, 114, 128)', fontSize: '1rem', lineHeight: '1.75' }}>
                  {currentTab === 'login' ? 'Acesse sua conta profissional' :
                   currentTab === 'signup' ? 'Comece sua jornada como profissional' :
                   'Receba um link para redefinir sua senha'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 px-8 pb-8">
                <Tabs value={currentTab} onValueChange={(value) => {
                  setCurrentTab(value)
                  setError('') // Limpar erro ao trocar de aba
                  if (value === 'signup') resetSignupStep()
                }}>
                  <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                    <TabsTrigger 
                      value="login"
                      className="data-[state=active]:bg-aumigo-orange data-[state=active]:text-white"
                    >
                      Entrar
                    </TabsTrigger>
                    <TabsTrigger 
                      value="signup"
                      className="data-[state=active]:bg-aumigo-orange data-[state=active]:text-white"
                    >
                      Cadastrar
                    </TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login" className="space-y-6">
                    <form onSubmit={handleLogin} className="space-y-6">
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
                      
                      <div className="space-y-3">
                        <label htmlFor="login-email" style={{ color: 'rgb(46, 111, 121)', fontSize: '0.875rem', fontWeight: '500' }}>
                          E-mail
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(107, 114, 128)' }} />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10"
                            style={{ 
                              color: 'rgb(46, 111, 121)', 
                              borderColor: 'rgba(107, 114, 128, 0.3)',
                              backgroundColor: 'white'
                            }}
                            value={loginData.email}
                            onChange={(e) => {
                              setLoginData({ ...loginData, email: e.target.value })
                              setError('') // Limpar erro ao começar a digitar
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label htmlFor="login-password" style={{ color: 'rgb(46, 111, 121)', fontSize: '0.875rem', fontWeight: '500' }}>
                          Senha
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(107, 114, 128)' }} />
                          <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Digite sua senha"
                            className="pl-10 pr-10"
                            style={{ 
                              color: 'rgb(46, 111, 121)', 
                              borderColor: 'rgba(107, 114, 128, 0.3)',
                              backgroundColor: 'white'
                            }}
                            value={loginData.password}
                            onChange={(e) => {
                              setLoginData({ ...loginData, password: e.target.value })
                              setError('') // Limpar erro ao começar a digitar
                            }}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            style={{ color: 'rgb(107, 114, 128)' }}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="remember"
                            checked={loginData.rememberMe}
                            onCheckedChange={(checked) => setLoginData({ ...loginData, rememberMe: checked as boolean })}
                          />
                          <label htmlFor="remember" style={{ color: 'rgb(107, 114, 128)', fontSize: '0.875rem' }}>
                            Lembrar de mim
                          </label>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="p-0 h-auto"
                          style={{ color: 'rgb(255, 155, 87)', fontSize: '0.875rem' }}
                          onClick={() => setCurrentTab('forgot')}
                        >
                          Esqueceu a senha?
                        </Button>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full bg-aumigo-orange hover:bg-aumigo-orange/90 h-12 text-base"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Entrando...' : 'Entrar'}
                        {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Signup Tab */}
                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                      {step === 1 && (
                        <>
                          <div className="text-center mb-4">
                            <div className="flex items-center justify-center space-x-2" style={{ color: 'rgb(107, 114, 128)', fontSize: '0.875rem' }}>
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(255, 155, 87)' }}></div>
                                <span className="ml-1">Dados pessoais</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(107, 114, 128, 0.3)' }}></div>
                                <span className="ml-1">Profissional</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(107, 114, 128, 0.3)' }}></div>
                                <span className="ml-1">Finalizar</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="signup-name" style={{ color: 'rgb(46, 111, 121)', fontSize: '0.875rem', fontWeight: '500' }}>
                              Nome completo
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(107, 114, 128)' }} />
                              <Input
                                id="signup-name"
                                type="text"
                                placeholder="Seu nome completo"
                                className="pl-10"
                                style={{ 
                                  color: 'rgb(46, 111, 121)', 
                                  borderColor: 'rgba(107, 114, 128, 0.3)',
                                  backgroundColor: 'white'
                                }}
                                value={signupData.name}
                                onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="signup-email" style={{ color: 'rgb(46, 111, 121)', fontSize: '0.875rem', fontWeight: '500' }}>
                              E-mail
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(107, 114, 128)' }} />
                              <Input
                                id="signup-email"
                                type="email"
                                placeholder="seu@email.com"
                                className="pl-10"
                                style={{ 
                                  color: 'rgb(46, 111, 121)', 
                                  borderColor: 'rgba(107, 114, 128, 0.3)',
                                  backgroundColor: 'white'
                                }}
                                value={signupData.email}
                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="signup-phone" style={{ color: 'rgb(46, 111, 121)', fontSize: '0.875rem', fontWeight: '500' }}>
                              Telefone
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(107, 114, 128)' }} />
                              <Input
                                id="signup-phone"
                                type="tel"
                                placeholder="(11) 99999-9999"
                                className="pl-10"
                                style={{ 
                                  color: 'rgb(46, 111, 121)', 
                                  borderColor: 'rgba(107, 114, 128, 0.3)',
                                  backgroundColor: 'white'
                                }}
                                value={signupData.phone}
                                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="signup-password" style={{ color: 'rgb(46, 111, 121)', fontSize: '0.875rem', fontWeight: '500' }}>
                              Senha
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(107, 114, 128)' }} />
                              <Input
                                id="signup-password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Mínimo 8 caracteres"
                                className="pl-10 pr-10"
                                style={{ 
                                  color: 'rgb(46, 111, 121)', 
                                  borderColor: 'rgba(107, 114, 128, 0.3)',
                                  backgroundColor: 'white'
                                }}
                                value={signupData.password}
                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'rgb(107, 114, 128)' }}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label htmlFor="signup-confirm-password" style={{ color: 'rgb(46, 111, 121)', fontSize: '0.875rem', fontWeight: '500' }}>
                              Confirmar senha
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgb(107, 114, 128)' }} />
                              <Input
                                id="signup-confirm-password"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Digite a senha novamente"
                                className="pl-10 pr-10"
                                style={{ 
                                  color: 'rgb(46, 111, 121)', 
                                  borderColor: 'rgba(107, 114, 128, 0.3)',
                                  backgroundColor: 'white'
                                }}
                                value={signupData.confirmPassword}
                                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2"
                                style={{ color: 'rgb(107, 114, 128)' }}
                              >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>
                        </>
                      )}

                      {step === 2 && (
                        <>
                          <div className="text-center mb-4">
                            <div className="flex items-center justify-center space-x-2 text-sm text-aumigo-gray">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-aumigo-mint rounded-full"></div>
                                <span className="ml-1">Dados pessoais</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-aumigo-orange rounded-full"></div>
                                <span className="ml-1">Profissional</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-aumigo-gray/30 rounded-full"></div>
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
                                value={signupData.business}
                                onChange={(e) => setSignupData({ ...signupData, business: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label>Tipo de negócio</Label>
                            <RadioGroup
                              value={signupData.businessType}
                              onValueChange={(value) => setSignupData({ ...signupData, businessType: value as 'empresa' | 'autonomo', cnpj: '', website: '' })}
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
                              {signupData.businessType === 'empresa' ? 'CNPJ' : 'CPF'} <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                              <Input
                                id="cnpj"
                                type="text"
                                placeholder={signupData.businessType === 'empresa' ? '00.000.000/0000-00' : '000.000.000-00'}
                                maxLength={signupData.businessType === 'empresa' ? 18 : 14}
                                className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                                value={signupData.cnpj}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '')
                                  let formatted = ''
                                  if (signupData.businessType === 'empresa') {
                                    // Máscara CNPJ: 00.000.000/0000-00
                                    formatted = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
                                  } else {
                                    // Máscara CPF: 000.000.000-00
                                    formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                                  }
                                  setSignupData({ ...signupData, cnpj: formatted })
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
                                value={signupData.website}
                                onChange={(e) => setSignupData({ ...signupData, website: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="zipCode">
                              CEP {signupData.businessType === 'empresa' && <span className="text-red-500">*</span>}
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                              <Input
                                id="zipCode"
                                type="text"
                                placeholder="00000-000"
                                maxLength={9}
                                className="pl-10 pr-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                                value={signupData.zipCode}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '')
                                  const formatted = value.replace(/(\d{5})(\d{3})/, '$1-$2')
                                  handleCepChange(value)
                                }}
                                required={signupData.businessType === 'empresa'}
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
                              Endereço (rua, bairro) {signupData.businessType === 'empresa' && <span className="text-red-500">*</span>}
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                              <Input
                                id="address"
                                type="text"
                                placeholder="Rua, bairro"
                                className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                                value={signupData.address}
                                onChange={(e) => setSignupData({ ...signupData, address: e.target.value })}
                                required={signupData.businessType === 'empresa'}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="addressNumber">
                              Número {signupData.businessType === 'empresa' && <span className="text-red-500">*</span>}
                            </Label>
                            <Input
                              id="addressNumber"
                              type="text"
                              placeholder="123"
                              className="border-aumigo-gray/30 focus:border-aumigo-orange"
                              value={signupData.addressNumber}
                              onChange={(e) => setSignupData({ ...signupData, addressNumber: e.target.value })}
                              required={signupData.businessType === 'empresa'}
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
                                value={signupData.city}
                                onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
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
                                value={signupData.state}
                                onChange={(e) => setSignupData({ ...signupData, state: e.target.value.toUpperCase() })}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="specialty">
                              Especialidade principal <span className="text-red-500">*</span>
                            </Label>
                            <Select
                              value={signupData.specialty || ''}
                              onValueChange={(value) => setSignupData({ ...signupData, specialty: value })}
                              required
                            >
                              <SelectTrigger 
                                id="specialty"
                                className="border-aumigo-gray/30 focus:border-aumigo-orange"
                              >
                                <SelectValue placeholder="Selecione uma especialidade" />
                              </SelectTrigger>
                              <SelectContent>
                                {specialties.map((specialty) => {
                                  const Icon = specialty.icon
                                  return (
                                    <SelectItem key={specialty.value} value={specialty.value}>
                                      <div className="flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        <span>{specialty.label}</span>
                                      </div>
                                    </SelectItem>
                                  )
                                })}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-aumigo-gray">
                              Você poderá adicionar mais serviços depois no catálogo
                            </p>
                          </div>


                          <div className="space-y-2">
                            <Label htmlFor="experience">
                              Experiência (anos) <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="experience"
                              type="number"
                              placeholder="Ex: 5"
                              className="border-aumigo-gray/30 focus:border-aumigo-orange"
                              value={signupData.experience}
                              onChange={(e) => setSignupData({ ...signupData, experience: e.target.value })}
                              required
                              min="0"
                            />
                          </div>
                        </>
                      )}

                      {step === 3 && (
                        <>
                          <div className="text-center mb-4">
                            <div className="flex items-center justify-center space-x-2 text-sm text-aumigo-gray">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-aumigo-mint rounded-full"></div>
                                <span className="ml-1">Dados pessoais</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-aumigo-mint rounded-full"></div>
                                <span className="ml-1">Profissional</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-aumigo-orange rounded-full"></div>
                                <span className="ml-1">Finalizar</span>
                              </div>
                            </div>
                          </div>

                          <Alert className="border-aumigo-blue/30 bg-aumigo-blue/10">
                            <CheckCircle className="h-4 w-4 text-aumigo-blue" />
                            <AlertDescription className="text-aumigo-teal">
                              Quase pronto! Só falta aceitar os termos para finalizar seu cadastro.
                            </AlertDescription>
                          </Alert>

                          <div className="space-y-4">
                            <div className="flex items-start space-x-2">
                              <Checkbox 
                                id="terms"
                                checked={signupData.acceptTerms}
                                onCheckedChange={(checked) => setSignupData({ ...signupData, acceptTerms: checked as boolean })}
                                required
                              />
                              <Label htmlFor="terms" className="text-sm text-aumigo-gray leading-5">
                                Eu li e aceito os{' '}
                                <button 
                                  type="button" 
                                  className="text-aumigo-orange hover:underline cursor-pointer" 
                                  onClick={() => window.open('https://aumigopet.com.br/termos-de-uso/', '_blank', 'noopener,noreferrer')}
                                >
                                  Termos de Serviço
                                </button>{' '}
                                e a{' '}
                                <button 
                                  type="button" 
                                  className="text-aumigo-orange hover:underline cursor-pointer"
                                  onClick={() => window.open('https://aumigopet.com.br/politica-de-privacidade/', '_blank', 'noopener,noreferrer')}
                                >
                                  Política de Privacidade
                                </button>
                              </Label>
                            </div>

                            <div className="flex items-start space-x-2">
                              <Checkbox 
                                id="marketing"
                                checked={signupData.acceptMarketing}
                                onCheckedChange={(checked) => setSignupData({ ...signupData, acceptMarketing: checked as boolean })}
                              />
                              <Label htmlFor="marketing" className="text-sm text-aumigo-gray leading-5">
                                Quero receber novidades, dicas e ofertas exclusivas por e-mail
                              </Label>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex gap-2">
                        {step > 1 && (
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setStep(step - 1)}
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
                          {isLoading ? 'Criando conta...' : 
                           step === 3 ? 'Criar conta' : 'Continuar'}
                          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                      </div>
                    </form>
                  </TabsContent>
                </Tabs>

                {/* Forgot Password Modal (usando currentTab = 'forgot') */}
                {currentTab === 'forgot' && (
                  <div className="space-y-4">
                    <Alert className="border-aumigo-blue/30 bg-aumigo-blue/10">
                      <AlertCircle className="h-4 w-4 text-aumigo-blue" />
                      <AlertDescription className="text-aumigo-teal">
                        Digite seu e-mail e enviaremos um link para redefinir sua senha.
                      </AlertDescription>
                    </Alert>

                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="forgot-email">E-mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                          <Input
                            id="forgot-email"
                            type="email"
                            placeholder="seu@email.com"
                            className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                            value={forgotData.email}
                            onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline"
                          onClick={() => setCurrentTab('login')}
                          className="flex-1 border-aumigo-gray/30"
                          disabled={isLoading}
                        >
                          Voltar ao login
                        </Button>
                        <Button 
                          type="submit" 
                          className="flex-1 bg-aumigo-orange hover:bg-aumigo-orange/90"
                          disabled={isLoading}
                        >
                          {isLoading ? 'Enviando...' : 'Enviar link'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Divider and alternatives */}
                {(currentTab === 'login' || currentTab === 'signup') && (
                  <>
                    <Separator className="my-6" />
                    
                    <div className="text-center space-y-4">
                      <p style={{ color: 'rgb(107, 114, 128)', fontSize: '0.875rem' }}>
                        {currentTab === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        style={{ 
                          borderColor: 'rgba(107, 114, 128, 0.3)',
                          color: 'rgb(46, 111, 121)'
                        }}
                        onClick={() => {
                          setCurrentTab(currentTab === 'login' ? 'signup' : 'login')
                          if (currentTab === 'login') resetSignupStep()
                        }}
                      >
                        {currentTab === 'login' ? 'Criar conta gratuita' : 'Fazer login'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}