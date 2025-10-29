import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Alert, AlertDescription } from './ui/alert'
import { Checkbox } from './ui/checkbox'
import { ImageWithFallback } from './figma/ImageWithFallback'
import exampleImage from 'figma:asset/8dfcc005426cdf14f94213dc79b85192818ffd4b.png'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  AlertTriangle,
  ArrowRight,
  Server,
  Users,
  BarChart3
} from 'lucide-react'
import { toast } from 'sonner'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'operations' | 'support' | 'finance'
  permissions: string[]
  lastLogin: string
}

interface AdminAuthProps {
  onLogin: (userData: AdminUser) => void
}

export function AdminAuth({ onLogin }: AdminAuthProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [forgotData, setForgotData] = useState({
    email: ''
  })

  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!loginData.email || !loginData.password) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsLoading(true)
    toast.loading('Validando credenciais...', { id: 'admin-auth-loading' })

    // Simular API call com validação mais rigorosa para admin
    setTimeout(() => {
      toast.dismiss('admin-auth-loading')
      
      // Mock de dados do admin
      const adminData: AdminUser = {
        id: 'admin_1',
        name: 'Admin AuMigoPet',
        email: loginData.email,
        role: 'super_admin',
        permissions: ['kyc_manage', 'users_manage', 'finance_manage', 'system_manage'],
        lastLogin: new Date().toISOString()
      }

      setIsLoading(false)
      toast.success('Login realizado com sucesso')
      onLogin(adminData)
    }, 2000)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!forgotData.email) {
      toast.error('Digite seu e-mail')
      return
    }

    setIsLoading(true)
    toast.loading('Enviando instruções...', { id: 'admin-forgot-loading' })

    // Simular API call
    setTimeout(() => {
      toast.dismiss('admin-forgot-loading')
      setIsLoading(false)
      toast.success('Instruções enviadas para seu e-mail')
      setShowForgotPassword(false)
      setForgotData({ email: '' })
    }, 1500)
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
            <CardHeader className="text-center pb-6 px-8 pt-8">
              <div className="flex items-center justify-center mb-6">
                <div className="p-3 bg-red-100 rounded-full">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-red-800 text-2xl mb-3">
                Recuperação de Senha
              </CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Digite seu e-mail administrativo para receber as instruções de recuperação
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 px-8 pb-8">
              <form onSubmit={handleForgotPassword} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="forgot-email">E-mail Administrativo</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="admin@aumigopet.com"
                      className="pl-10 border-gray-300 focus:border-red-500 h-12"
                      value={forgotData.email}
                      onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Enviando...' : 'Enviar Instruções'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-800"
                    onClick={() => setShowForgotPassword(false)}
                  >
                    Voltar ao Login
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Lado esquerdo - Admin Branding */}
          <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-8 bg-gradient-to-br from-red-800 to-red-900 rounded-3xl p-16 text-white min-h-[700px]">
            <div className="space-y-6">
              <div className="flex items-center justify-center space-x-3">
                <img 
                  src={exampleImage} 
                  alt="AuMigoPet" 
                  className="h-12 w-auto brightness-0 invert"
                />
                <Shield className="h-8 w-8 text-red-300" />
              </div>
              <h1 className="text-white mb-4 text-3xl">Admin AuMigoPet</h1>
              <div className="bg-red-700/50 rounded-xl p-4 border border-red-600/50">
                <p className="text-red-200 text-lg flex items-center justify-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Área Restrita
                </p>
              </div>
              <p className="text-red-100 text-lg max-w-sm mx-auto leading-relaxed">
                Painel administrativo para operações, triagem e gestão da plataforma
              </p>
            </div>
            
            <div className="space-y-6 w-full max-w-sm mx-auto">
              <div className="flex items-center gap-4 text-red-100">
                <Server className="h-6 w-6 text-red-300 flex-shrink-0" />
                <span className="text-lg">Gestão de operações</span>
              </div>
              <div className="flex items-center gap-4 text-red-100">
                <Users className="h-6 w-6 text-red-300 flex-shrink-0" />
                <span className="text-lg">Controle de usuários</span>
              </div>
              <div className="flex items-center gap-4 text-red-100">
                <BarChart3 className="h-6 w-6 text-red-300 flex-shrink-0" />
                <span className="text-lg">Análises e relatórios</span>
              </div>
              <div className="flex items-center gap-4 text-red-100">
                <Shield className="h-6 w-6 text-red-300 flex-shrink-0" />
                <span className="text-lg">Auditoria e segurança</span>
              </div>
            </div>

            <div className="mt-10 p-6 bg-red-700/30 rounded-2xl backdrop-blur-sm border border-red-600/30">
              <p className="text-base text-red-100 leading-relaxed">
                Acesso restrito à equipe <strong className="text-red-300">AuMigoPet</strong> autorizada
              </p>
            </div>
          </div>

          {/* Lado direito - Formulário de Login Admin */}
          <div className="w-full max-w-lg mx-auto lg:max-w-none">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-3xl">
              <CardHeader className="text-center pb-6 px-8 pt-8">
                <div className="flex items-center justify-center mb-6 lg:hidden">
                  <img 
                    src={exampleImage} 
                    alt="AuMigoPet" 
                    className="h-10 w-auto mr-3"
                  />
                  <Shield className="h-6 w-6 text-red-600 mr-2" />
                  <span className="text-red-800 text-xl">Admin</span>
                </div>
                
                <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center justify-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="text-sm">Área Administrativa Restrita</span>
                  </div>
                </div>

                <CardTitle className="text-red-800 text-2xl mb-3">
                  Acesso Administrativo
                </CardTitle>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  Entre com suas credenciais de administrador para acessar o painel de controle
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6 px-8 pb-8">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="admin-email">E-mail Administrativo</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@aumigopet.com"
                        className="pl-10 border-gray-300 focus:border-red-500 h-12"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="admin-password">Senha Administrativa</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="admin-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Digite sua senha administrativa"
                        className="pl-10 pr-10 border-gray-300 focus:border-red-500 h-12"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="admin-remember"
                        checked={loginData.rememberMe}
                        onCheckedChange={(checked) => setLoginData({ ...loginData, rememberMe: checked as boolean })}
                      />
                      <Label htmlFor="admin-remember" className="text-sm text-gray-600">
                        Manter sessão ativa
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-sm text-red-600 hover:text-red-700 p-0 h-auto"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Esqueceu a senha?
                    </Button>
                  </div>

                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700 text-sm">
                      Este acesso é monitorado e registrado para fins de auditoria e segurança.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-600 hover:bg-red-700 h-12 text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Validando...' : 'Acessar Painel Admin'}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}