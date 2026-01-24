import { useState, useEffect } from 'react'
import { ProLayout } from './components/pro-layout'
import { ProOverview } from './components/pro-overview'
import { ProServices } from './components/pro-services'
import { ProAvailability } from './components/pro-availability'
import { ProBookings } from './components/pro-bookings'
import { ProKYC } from './components/pro-kyc'
import { ProFinance } from './components/pro-finance'
import { ProReviews } from './components/pro-reviews'
import { ProChat } from './components/pro-chat'
import { ProSettings } from './components/pro-settings'
import { ProNotifications } from './components/pro-notifications'
import { ProAds } from './components/pro-ads'
import { Auth } from './components/auth'
import { AdminAuth } from './components/admin-auth'
import { AdminLayout } from './components/admin-layout'
import { AdminDashboard } from './components/admin-dashboard'
import { RouteSwitcher } from './components/route-switcher'
import { Toaster } from './components/ui/sonner'
import { useAuth } from './contexts/AuthContext'
import { useRouter } from './hooks/useRouter'
import exampleImage from './assets/8dfcc005426cdf14f94213dc79b85192818ffd4b.png'

interface User {
  id: string
  name: string
  email: string
  phone: string
  avatar: string
  specialty: string
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
  isFirstLogin: boolean
}

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'operations' | 'support' | 'finance'
  permissions: string[]
  lastLogin: string
}

export default function App() {
  const { user, adminUser, loading, signOut, signOutAdmin } = useAuth()
  const { currentPath, navigate } = useRouter()
  const [currentPage, setCurrentPage] = useState('overview')
  const [currentMode, setCurrentMode] = useState<'pro' | 'admin' | 'select'>('select')

  // Verificar modo e página baseado na URL
  useEffect(() => {
    const path = currentPath
    
    // Modo Admin
    if (path.startsWith('/admin')) {
      setCurrentMode('admin')
      // Extrair página da rota /admin/:page
      const pageMatch = path.match(/^\/admin\/(.+)$/)
      if (pageMatch) {
        setCurrentPage(pageMatch[1])
      } else if (path === '/admin') {
        setCurrentPage('dashboard')
        navigate('/admin/dashboard')
      }
    } 
    // Modo Pro
    else if (path.startsWith('/pro') || path === '/' || path === '') {
      setCurrentMode('pro')
      // Extrair página da rota /pro/:page
      const pageMatch = path.match(/^\/(?:pro\/)?(.+)$/)
      if (pageMatch && pageMatch[1] !== 'pro') {
        setCurrentPage(pageMatch[1])
      } else {
        // Se é o primeiro login e o KYC está pendente, redirecionar para KYC
        if (user?.isFirstLogin && user?.kycStatus === 'PENDING') {
          setCurrentPage('kyc')
          navigate('/pro/kyc')
        } else {
          setCurrentPage('overview')
          if (path === '/' || path === '') {
            navigate('/pro/overview')
          }
        }
      }
    } 
    // Seletor de modo
    else {
      setCurrentMode('select')
    }
  }, [currentPath, user, adminUser, navigate])

  // Handlers de login - redirecionar usando rotas
  const handleLogin = (userData: User) => {
    // O contexto já gerencia o estado, apenas redirecionar
    if (userData.isFirstLogin && userData.kycStatus === 'PENDING') {
      navigate('/pro/kyc')
    } else {
      navigate('/pro/overview')
    }
  }

  const handleAdminLogin = (adminData: AdminUser) => {
    // O contexto já gerencia o estado, apenas redirecionar
    navigate('/admin/dashboard')
  }

  // Logout - Seguindo EXATAMENTE o padrão do app
  const handleLogout = async () => {
    if (currentMode === 'admin') {
      await signOutAdmin()
      navigate('/admin/dashboard')
    } else {
      await signOut()
      navigate('/pro/overview')
    }
  }

  // Handler de navegação que atualiza a URL
  const handleNavigate = (page: string) => {
    setCurrentPage(page)
    if (currentMode === 'admin') {
      navigate(`/admin/${page}`)
    } else {
      navigate(`/pro/${page}`)
    }
  }

  const renderCurrentPage = () => {
    if (currentMode === 'admin') {
      switch (currentPage) {
        case 'dashboard':
          return <AdminDashboard onNavigate={setCurrentPage} />
        default:
          return <AdminDashboard onNavigate={setCurrentPage} />
      }
    } else {
      switch (currentPage) {
        case 'overview':
          return <ProOverview />
        case 'services':
          return <ProServices />
        case 'availability':
          return <ProAvailability />
        case 'bookings':
          return <ProBookings />
        case 'ads':
          return <ProAds />
        case 'kyc':
          return <ProKYC />
        case 'finance':
          return <ProFinance />
        case 'reviews':
          return <ProReviews />
        case 'chat':
          return <ProChat />
        case 'settings':
          return <ProSettings />
        case 'notifications':
          return <ProNotifications />
        default:
          return <ProOverview />
      }
    }
  }

  const handleModeSelect = (mode: 'pro' | 'admin') => {
    setCurrentMode(mode)
    if (mode === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/pro/overview')
    }
  }

  // Tela de loading - Seguindo padrão do app
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <img 
              src={exampleImage} 
              alt="AuMigoPet" 
              className="h-16 w-auto mx-auto animate-pulse"
            />
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-aumigo-orange rounded-full animate-pulse"></div>
          </div>
          <p className="text-aumigo-gray text-sm">
            {currentMode === 'admin' ? 'Carregando AuMigoPet Admin...' : 
             currentMode === 'pro' ? 'Carregando AuMigoPet PRO...' : 
             'Carregando AuMigoPet...'}
          </p>
        </div>
      </div>
    )
  }

  // Mostrar seletor de modo se necessário
  if (currentMode === 'select') {
    return (
      <>
        <RouteSwitcher onSelectMode={handleModeSelect} />
        <Toaster />
      </>
    )
  }

  // Renderizar interface baseada no modo atual
  if (currentMode === 'admin') {
    // Se não há admin logado, mostrar tela de autenticação admin
    if (!adminUser) {
      return (
        <>
          <AdminAuth onLogin={handleAdminLogin} />
          <Toaster />
        </>
      )
    }

    // Admin logado - mostrar painel administrativo
    return (
      <div className="min-h-screen bg-background">
        <AdminLayout 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          user={adminUser}
          onLogout={handleLogout}
        >
          {renderCurrentPage()}
        </AdminLayout>
        <Toaster />
      </div>
    )
  } else {
    // Se não há usuário logado, mostrar tela de autenticação profissional
    if (!user) {
      return (
        <>
          <Auth onLogin={handleLogin} />
          <Toaster />
        </>
      )
    }

    // Usuário logado - mostrar painel profissional
    return (
      <div className="min-h-screen bg-background">
        <ProLayout 
          currentPage={currentPage} 
          onNavigate={handleNavigate}
          user={user}
          onLogout={handleLogout}
        >
          {renderCurrentPage()}
        </ProLayout>
        <Toaster />
      </div>
    )
  }
}