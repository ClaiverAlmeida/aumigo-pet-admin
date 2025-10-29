import { ReactNode } from 'react'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from './ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { Header } from './header'
import { Footer } from './footer'
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar,
  MessageSquare,
  DollarSign,
  Star,
  Settings,
  FileText,
  Megaphone,
  Bell
} from 'lucide-react'
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

interface ProLayoutProps {
  children: ReactNode
  currentPage: string
  onNavigate: (page: string) => void
  user?: User
  onLogout?: () => void
}

const navigationItems = [
  { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
  { id: 'kyc', label: 'KYC & Perfil', icon: FileText },
  { id: 'services', label: 'Serviços', icon: Briefcase },
  { id: 'availability', label: 'Agenda', icon: Calendar },
  { id: 'bookings', label: 'Agendamentos', icon: Calendar },
  { id: 'ads', label: 'ADS (Impulsionar)', icon: Megaphone },
  { id: 'finance', label: 'Financeiro', icon: DollarSign },
  { id: 'reviews', label: 'Avaliações', icon: Star },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'notifications', label: 'Notificações', icon: Bell },
  { id: 'settings', label: 'Configurações', icon: Settings },
]

export function ProLayout({ children, currentPage, onNavigate, user, onLogout }: ProLayoutProps) {
  const currentPageTitle = navigationItems.find(item => item.id === currentPage)?.label || 'Painel Profissional'
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border p-4 bg-background">
            <div className="flex items-center gap-3">
              <img 
                src={exampleImage} 
                alt="AuMigoPet" 
                className="h-8 w-auto"
              />
              <div className="flex flex-col">
                <span className="text-aumigo-teal font-semibold text-sm">Painel PRO</span>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 p-3 bg-muted rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} />
                <AvatarFallback>{user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs text-aumigo-teal truncate">{user?.name || 'Usuário'}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Badge className="text-xs bg-aumigo-orange text-white border-0 h-4">PRO</Badge>
                  {user?.kycStatus === 'APPROVED' && (
                    <Badge className="text-xs bg-status-success text-white border-0 h-4">Ativo</Badge>
                  )}
                  {user?.kycStatus === 'PENDING' && (
                    <Badge className="text-xs bg-status-warning text-white border-0 h-4">Pendente</Badge>
                  )}
                  {user?.kycStatus === 'REJECTED' && (
                    <Badge className="text-xs bg-status-error text-white border-0 h-4">Rejeitado</Badge>
                  )}
                </div>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => onNavigate(item.id)}
                          isActive={currentPage === item.id}
                          className="w-full justify-start text-muted-foreground hover:text-aumigo-teal hover:bg-muted data-[active=true]:bg-aumigo-orange data-[active=true]:text-white"
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <Header currentPageTitle={currentPageTitle} user={user} onLogout={onLogout} />
          
          <main className="flex-1">
            {children}
          </main>
          
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  )
}