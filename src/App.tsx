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
import exampleImage from 'figma:asset/8dfcc005426cdf14f94213dc79b85192818ffd4b.png'

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
  const [currentPage, setCurrentPage] = useState('overview')
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentMode, setCurrentMode] = useState<'pro' | 'admin' | 'select'>('select')

  // Verificar se há um usuário logado no localStorage
  useEffect(() => {
    const checkAuthState = () => {
      try {
        // Verificar se estamos na rota admin
        const path = window.location.pathname
        if (path.includes('/admin')) {
          setCurrentMode('admin')
          const savedAdminUser = localStorage.getItem('aumigopet_admin')
          if (savedAdminUser) {
            const adminData = JSON.parse(savedAdminUser)
            setAdminUser(adminData)
            setCurrentPage('dashboard')
          }
        } else if (path === '/' || path === '/pro') {
          setCurrentMode('pro')
          const savedUser = localStorage.getItem('aumigopet_user')
          if (savedUser) {
            const userData = JSON.parse(savedUser)
            setUser(userData)
            
            // Se é o primeiro login e o KYC está pendente, redirecionar para KYC
            if (userData.isFirstLogin && userData.kycStatus === 'PENDING') {
              setCurrentPage('kyc')
            }
          }
        } else {
          // Se a URL não especifica o modo, mostrar seletor
          setCurrentMode('select')
        }
      } catch (error) {
        console.error('Erro ao verificar estado de autenticação:', error)
        // Limpar dados corrompidos
        localStorage.removeItem('aumigopet_user')
        localStorage.removeItem('aumigopet_admin')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthState()
  }, [])

  const handleLogin = (userData: User) => {
    setUser(userData)
    localStorage.setItem('aumigopet_user', JSON.stringify(userData))
    
    // Se é o primeiro login e o KYC está pendente, redirecionar para KYC
    if (userData.isFirstLogin && userData.kycStatus === 'PENDING') {
      setCurrentPage('kyc')
    } else {
      setCurrentPage('overview')
    }
  }

  const handleAdminLogin = (adminData: AdminUser) => {
    setAdminUser(adminData)
    localStorage.setItem('aumigopet_admin', JSON.stringify(adminData))
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    if (currentMode === 'admin') {
      setAdminUser(null)
      localStorage.removeItem('aumigopet_admin')
      setCurrentPage('dashboard')
    } else {
      setUser(null)
      localStorage.removeItem('aumigopet_user')
      setCurrentPage('overview')
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
      setCurrentPage('dashboard')
    } else {
      setCurrentPage('overview')
    }
  }

  // Tela de loading
  if (isLoading) {
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
          onNavigate={setCurrentPage}
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
          onNavigate={setCurrentPage}
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