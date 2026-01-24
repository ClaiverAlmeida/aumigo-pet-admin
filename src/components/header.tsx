import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Badge } from './ui/badge'
import { SidebarTrigger } from './ui/sidebar'
import { Bell, LogOut, User, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { NotificationBell } from './notification-bell'
import { useRouter } from '../hooks/useRouter'

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

interface HeaderProps {
  currentPageTitle: string
  user?: User
  onLogout?: () => void
}

export function Header({ currentPageTitle, user, onLogout }: HeaderProps) {
  const { navigate } = useRouter()

  return (
    <header className="border-b bg-background supports-[backdrop-filter]:bg-background/95 backdrop-blur sticky top-0 z-40 shadow-sm">
      <div className="flex h-16 items-center px-6">
        {/* Trigger da sidebar e título */}
        <div className="flex items-center gap-4 flex-1">
          <SidebarTrigger />
          
          {/* Título da página - oculto para Chat */}
          {currentPageTitle !== 'Chat' && (
            <h1 className="text-aumigo-teal font-semibold text-lg">
              {currentPageTitle}
            </h1>
          )}
        </div>

        {/* Ações do usuário */}
        <div className="flex items-center gap-3">
          {/* Notificações */}
          <NotificationBell showFullCenter={false} maxPreview={4} />

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} />
                  <AvatarFallback>{user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none text-aumigo-teal">{user?.name || 'Usuário'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email || 'usuario@email.com'}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="text-xs bg-aumigo-orange text-white border-0">PRO</Badge>
                  {user?.kycStatus === 'APPROVED' && (
                    <Badge className="text-xs bg-status-success text-white border-0">Aprovado</Badge>
                  )}
                  {user?.kycStatus === 'PENDING' && (
                    <Badge className="text-xs bg-status-warning text-white border-0">Pendente</Badge>
                  )}
                  {user?.kycStatus === 'REJECTED' && (
                    <Badge className="text-xs bg-status-error text-white border-0">Rejeitado</Badge>
                  )}
                </div>
              </div>
              <DropdownMenuSeparator />
         
              <DropdownMenuItem onClick={() => navigate('/pro/kyc')}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={onLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}