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
  Bell,
  Settings,
  LogOut,
  Shield,
  ChevronDown,
  Menu,
  X,
  // Operações
  FileCheck,
  UserCheck,
  Calendar,
  AlertCircle,
  // Usuários
  Users,
  UserCog,
  // Catálogo
  Package,
  Tags,
  // Financeiro
  CreditCard,
  DollarSign,
  Receipt,
  TrendingUp,
  // Qualidade
  Star,
  MessageSquare,
  BarChart3,
  // Conteúdo
  FileText,
  Image,
  Megaphone,
  // Sistema
  Flag,
  Activity,
  Database,
  Webhook
} from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'super_admin' | 'operations' | 'support' | 'finance'
  permissions: string[]
  lastLogin: string
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

const navigationSections: NavSection[] = [
  {
    title: 'Operações',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
      { id: 'kyc', label: 'KYC / Triagem', icon: FileCheck, badge: '12', badgeVariant: 'destructive' },
      { id: 'approvals', label: 'Aprovações', icon: UserCheck, badge: '5', badgeVariant: 'secondary' },
      { id: 'bookings', label: 'Agendamentos', icon: Calendar },
      { id: 'incidents', label: 'Incidentes', icon: AlertCircle, badge: '2', badgeVariant: 'destructive' },
    ]
  },
  {
    title: 'Usuários',
    items: [
      { id: 'users', label: 'Tutores & Profissionais', icon: Users },
      { id: 'rbac', label: 'Papéis & Permissões', icon: UserCog },
    ]
  },
  {
    title: 'Catálogo',
    items: [
      { id: 'services', label: 'Serviços', icon: Package },
      { id: 'categories', label: 'Categorias', icon: Tags },
    ]
  },
  {
    title: 'Financeiro',
    items: [
      { id: 'payments', label: 'Pagamentos', icon: CreditCard },
      { id: 'payouts', label: 'Repasses', icon: DollarSign },
      { id: 'transactions', label: 'Transações', icon: Receipt },
      { id: 'campaigns', label: 'Cupons & Campanhas', icon: TrendingUp },
    ]
  },
  {
    title: 'Qualidade',
    items: [
      { id: 'reviews', label: 'Avaliações', icon: Star },
      { id: 'support', label: 'Suporte', icon: MessageSquare, badge: '8', badgeVariant: 'secondary' },
      { id: 'analytics', label: 'SLA & NPS', icon: BarChart3 },
    ]
  },
  {
    title: 'Conteúdo',
    items: [
      { id: 'cms', label: 'Páginas', icon: FileText },
      { id: 'media', label: 'Mídia', icon: Image },
      { id: 'marketing', label: 'Campanhas', icon: Megaphone },
    ]
  },
  {
    title: 'Sistema',
    items: [
      { id: 'features', label: 'Feature Flags', icon: Flag },
      { id: 'logs', label: 'Logs & Auditoria', icon: Activity },
      { id: 'database', label: 'Banco de Dados', icon: Database },
      { id: 'webhooks', label: 'Integrações', icon: Webhook },
    ]
  }
]

export function AdminLayout({ currentPage, onNavigate, user, onLogout, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
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
      case 'super_admin':
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
              <div className="relative w-96 hidden md:block">
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
              </div>
            </div>

            {/* Lado direito */}
            <div className="flex items-center space-x-4">
              {/* Ambiente */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Produção</span>
              </div>

              <Separator orientation="vertical" className="h-6 hidden md:block" />

              {/* Notificações */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white">3</span>
                </div>
              </Button>

              {/* Perfil do Admin */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 px-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-red-100 text-red-700">
                        {user.name.charAt(0)}
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
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="mr-2 h-4 w-4" />
                    <span>Logs da Sessão</span>
                  </DropdownMenuItem>
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
      </div>
    </div>
  )
}