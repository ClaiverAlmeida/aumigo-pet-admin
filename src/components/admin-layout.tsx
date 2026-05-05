import React, { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { ImageWithFallback } from './figma/ImageWithFallback'
import exampleImage from '../assets/8dfcc005426cdf14f94213dc79b85192818ffd4b.png'
import {
  Search,
  Command,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  Menu,
  X,
  FileCheck,
  Calendar,
  AlertCircle,
  Users,
  UserCog,
  Package,
  CreditCard,
  DollarSign,
  Receipt,
  Star,
  MessageSquare,
  BarChart3,
  Activity,
  Webhook,
  Building2,
  Store,
  ListOrdered,
} from 'lucide-react'
import { NotificationBell } from './notification-bell'
// import { GuideAssistantWidget } from './guide-assistant-widget'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'operations' | 'support' | 'finance'
  permissions: string[]
  lastLogin?: string
  profilePicture?: string | null
}

interface AdminLayoutProps {
  currentPage: string
  onNavigate: (page: string) => void
  user: AdminUser
  onLogout: () => void
  children: React.ReactNode
}

interface NavSection {
  title: string
  items: {
    id: string
    label: string
    icon: any
    badge?: string
    badgeVariant?: 'default' | 'destructive' | 'outline' | 'secondary'
  }[]
}

// Menu alinhado ao schema Prisma: entidades e fluxos que existem no sistema
const navigationSections: NavSection[] = [
  {
    title: 'Operações',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'kyc', label: 'KYC / Triagem', icon: FileCheck },
      // { id: 'bookings', label: 'Agendamentos', icon: Calendar },
      { id: 'incidents', label: 'Incidentes', icon: AlertCircle },
    ]
  },
  {
    title: 'Usuários',
    items: [
      { id: 'users', label: 'Tutores & Profissionais', icon: Users },
      // { id: 'rbac', label: 'Papéis & Permissões', icon: UserCog },
    ]
  },
  {
    title: 'Empresas e catálogo',
    items: [
      { id: 'companies', label: 'Empresas', icon: Building2 },
      // { id: 'service-providers', label: 'Serviços', icon: Store },
      // { id: 'catalog', label: 'Itens no catálogo', icon: Package },
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { id: 'payments', label: 'Pagamentos', icon: CreditCard },
      { id: 'transactions', label: 'Transações', icon: DollarSign },
      { id: 'payouts', label: 'Repasses', icon: ListOrdered },
    ]
  },
  // {
  //   title: 'Qualidade',
  //   items: [
  //     { id: 'reviews', label: 'Avaliações', icon: Star },
  //     { id: 'support', label: 'Suporte', icon: MessageSquare },
  //   ]
  // },
  // {
  //   title: 'Sistema',
  //   items: [
  //     { id: 'webhooks', label: 'Integrações', icon: Webhook },
  //     { id: 'logs', label: 'Logs & Auditoria', icon: Activity },
  //   ]
  // }
]

export function AdminLayout({ currentPage, onNavigate, user, onLogout, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  // const [assistantOpen, setAssistantOpen] = useState(false)

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'operations':
        return 'bg-blue-100 text-blue-800'
      case 'support':
        return 'bg-green-100 text-green-800'
      case 'finance':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Super Admin'
      case 'operations':
        return 'Operações'
      case 'support':
        return 'Suporte'
      case 'finance':
        return 'Financeiro'
      default:
        return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform lg:translate-x-0 lg:relative lg:flex lg:flex-col`}>
        {/* Header da Sidebar */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <img 
              src={exampleImage} 
              alt="AuMigoPet" 
              className="h-6 w-auto"
            />
            <div className="flex items-center space-x-2">
              <span className="text-red-800 text-lg">Admin</span>
              <Shield className="h-4 w-4 text-red-600" />
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navegação */}
        <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <h3 className="px-2 text-xs text-gray-500 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentPage === item.id
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge 
                        variant={item.badgeVariant || 'secondary'} 
                        className="h-5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer da Sidebar */}
        <div className="p-4 border-t border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div className="text-xs text-gray-500">
              Sistema operacional
            </div>
          </div>
        </div>
      </div>

      {/* Overlay para mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            {/* Lado esquerdo */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {/* Busca Global */}
              {/* <div className="relative w-96 hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar usuários, pedidos, transações... (⌘K)"
                  className="pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Badge variant="outline" className="text-xs h-5">
                    ⌘K
                  </Badge>
                </div>
              </div> */}
            </div>

            {/* Lado direito */}
            <div className="flex items-center space-x-4">
              {/* IA AuMigoPet temporariamente desabilitada */}
              {/*
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex"
                onClick={() => setAssistantOpen(true)}
              >
                Assistente IA
              </Button>
              */}

              <Separator orientation="vertical" className="h-6 hidden md:block" />

              {/* Notificações */}
              <NotificationBell showFullCenter={false} maxPreview={10} />

              {/* Perfil do Admin */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profilePicture ?? undefined} alt={user.name} />
                      <AvatarFallback className="bg-red-100 text-red-700">
                        {user.name?.charAt(0) ?? 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <div className="text-sm">{user.name}</div>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </div>
                    </div>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <div className="text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  {/* 
                  <DropdownMenuItem>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Logs da Sessão</span>
                  </DropdownMenuItem> */}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
        {/* <GuideAssistantWidget open={assistantOpen} onOpenChange={setAssistantOpen} /> */}
      </div>

    </div>
  )
}