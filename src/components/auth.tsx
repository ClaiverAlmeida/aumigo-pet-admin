import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Alert, AlertDescription } from './ui/alert'
import { Checkbox } from './ui/checkbox'
import { ImageWithFallback } from './figma/ImageWithFallback'
import exampleImage from 'figma:asset/8dfcc005426cdf14f94213dc79b85192818ffd4b.png'
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
  Scissors
} from 'lucide-react'
import { toast } from 'sonner'

interface AuthProps {
  onLogin: (userData: any) => void
}

export function Auth({ onLogin }: AuthProps) {
  const [currentTab, setCurrentTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // Para cadastro em etapas

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
    business: '',
    specialty: '',
    experience: '',
    location: '',
    // Etapa 3 - Termos
    acceptTerms: false,
    acceptMarketing: false
  })

  // Estado do formulário de recuperação de senha
  const [forgotData, setForgotData] = useState({
    email: ''
  })

  const specialties = [
    { value: 'veterinario', label: 'Veterinário(a)', icon: Heart },
    { value: 'banho_tosa', label: 'Banho e Tosa', icon: Scissors },
    { value: 'adestramento', label: 'Adestramento', icon: Star },
    { value: 'hospedagem', label: 'Hospedagem', icon: PawPrint },
    { value: 'outros', label: 'Outros Serviços', icon: Building }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginData.email || !loginData.password) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    toast.loading('Fazendo login...', { id: 'auth-loading' })

    // Simular API call
    setTimeout(() => {
      toast.dismiss('auth-loading')
      
      // Mock de dados do usuário
      const userData = {
        id: '1',
        name: 'Claiver Almeida',
        email: loginData.email,
        phone: '(11) 99999-9999',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        specialty: 'banho_tosa',
        kycStatus: 'APPROVED',
        isFirstLogin: false
      }
      
      setIsLoading(false)
      toast.success('Login realizado com sucesso! 🎉')
      onLogin(userData)
    }, 2000)
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
      if (!signupData.business || !signupData.specialty || !signupData.location) {
        toast.error('Preencha todos os campos obrigatórios')
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
      
      // Simular API call
      setTimeout(() => {
        toast.dismiss('signup-loading')
        
        const userData = {
          id: '1',
          name: signupData.name,
          email: signupData.email,
          phone: signupData.phone,
          avatar: '',
          specialty: signupData.specialty,
          kycStatus: 'PENDING',
          isFirstLogin: true
        }
        
        setIsLoading(false)
        toast.success('Conta criada com sucesso! Complete seu perfil para começar. 🎉')
        onLogin(userData)
      }, 2500)
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

  const resetSignupStep = () => {
    setStep(1)
    setSignupData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      business: '',
      specialty: '',
      experience: '',
      location: '',
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
                className="h-20 w-auto mx-auto brightness-0 invert"
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
              <div className="flex items-center gap-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: 'rgb(141, 217, 182)' }} />
                <span style={{ fontSize: '1.125rem' }}>Chat em tempo real com clientes</span>
              </div>
              <div className="flex items-center gap-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                <CheckCircle className="h-6 w-6 flex-shrink-0" style={{ color: 'rgb(141, 217, 182)' }} />
                <span style={{ fontSize: '1.125rem' }}>Avaliações e feedback dos tutores</span>
              </div>
            </div>

            <div 
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
            </div>
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
                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
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
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
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
                                placeholder="Nome da sua empresa/clínica"
                                className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                                value={signupData.business}
                                onChange={(e) => setSignupData({ ...signupData, business: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Especialidade principal</Label>
                            <div className="grid grid-cols-1 gap-2">
                              {specialties.map((specialty) => {
                                const Icon = specialty.icon
                                return (
                                  <button
                                    key={specialty.value}
                                    type="button"
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                                      signupData.specialty === specialty.value
                                        ? 'border-aumigo-orange bg-aumigo-orange/10 text-aumigo-orange'
                                        : 'border-aumigo-gray/30 hover:border-aumigo-orange/50'
                                    }`}
                                    onClick={() => setSignupData({ ...signupData, specialty: specialty.value })}
                                  >
                                    <Icon className="h-5 w-5" />
                                    <span>{specialty.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="location">Localização</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
                              <Input
                                id="location"
                                type="text"
                                placeholder="Cidade, Estado"
                                className="pl-10 border-aumigo-gray/30 focus:border-aumigo-orange"
                                value={signupData.location}
                                onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                                required
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="experience">Experiência (anos)</Label>
                            <Input
                              id="experience"
                              type="number"
                              placeholder="Ex: 5"
                              className="border-aumigo-gray/30 focus:border-aumigo-orange"
                              value={signupData.experience}
                              onChange={(e) => setSignupData({ ...signupData, experience: e.target.value })}
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
                                <button type="button" className="text-aumigo-orange hover:underline">
                                  Termos de Serviço
                                </button>{' '}
                                e a{' '}
                                <button type="button" className="text-aumigo-orange hover:underline">
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