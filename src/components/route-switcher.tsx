import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ImageWithFallback } from './figma/ImageWithFallback'
import exampleImage from 'figma:asset/8dfcc005426cdf14f94213dc79b85192818ffd4b.png'
import {
  Shield,
  Users,
  ArrowRight,
  PawPrint,
  Settings,
  BarChart3
} from 'lucide-react'

interface RouteSwitcherProps {
  onSelectMode: (mode: 'pro' | 'admin') => void
}

export function RouteSwitcher({ onSelectMode }: RouteSwitcherProps) {
  const updateURL = (mode: 'pro' | 'admin') => {
    const newPath = mode === 'admin' ? '/admin/login' : '/'
    window.history.pushState({}, '', newPath)
  }

  const handleModeSelect = (mode: 'pro' | 'admin') => {
    updateURL(mode)
    onSelectMode(mode)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-aumigo-blue/10 via-white to-aumigo-orange/10 flex items-center justify-center p-6 lg:p-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <img 
              src={exampleImage} 
              alt="AuMigoPet" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-aumigo-teal text-3xl mb-4">AuMigoPet Platform</h1>
          <p className="text-aumigo-gray text-lg">
            Escolha a interface que deseja acessar
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Painel Profissional */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-aumigo-orange/50"
            onClick={() => handleModeSelect('pro')}
          >
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-4 bg-aumigo-orange/10 rounded-full">
                <PawPrint className="h-8 w-8 text-aumigo-orange" />
              </div>
              <CardTitle className="text-aumigo-teal text-xl mb-2">
                Painel Profissional
              </CardTitle>
              <CardDescription className="text-base">
                Interface para profissionais de cuidado animal
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-aumigo-gray">
                  <div className="w-2 h-2 bg-aumigo-mint rounded-full"></div>
                  <span>Gestão de serviços e agendamentos</span>
                </div>
                <div className="flex items-center gap-3 text-aumigo-gray">
                  <div className="w-2 h-2 bg-aumigo-mint rounded-full"></div>
                  <span>Chat com clientes</span>
                </div>
                <div className="flex items-center gap-3 text-aumigo-gray">
                  <div className="w-2 h-2 bg-aumigo-mint rounded-full"></div>
                  <span>Controle financeiro</span>
                </div>
                <div className="flex items-center gap-3 text-aumigo-gray">
                  <div className="w-2 h-2 bg-aumigo-mint rounded-full"></div>
                  <span>Avaliações e feedback</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="w-full bg-aumigo-orange hover:bg-aumigo-orange/90">
                  Acessar Painel PRO
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Painel Administrativo */}
          <Card 
            className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 hover:border-red-500/50"
            onClick={() => handleModeSelect('admin')}
          >
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CardTitle className="text-red-800 text-xl">
                  Painel Administrativo
                </CardTitle>
                <Badge variant="destructive" className="text-xs">
                  Restrito
                </Badge>
              </div>
              <CardDescription className="text-base">
                Interface para operações e gestão da plataforma
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Triagem KYC e aprovações</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Gestão de usuários</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Controle financeiro avançado</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <span>Análises e relatórios</span>
                </div>
              </div>
              
              <div className="pt-4">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Acessar Admin
                  <Shield className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rodapé informativo */}
        <div className="text-center mt-12 space-y-4">
          <div className="flex items-center justify-center gap-6 text-sm text-aumigo-gray">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>2.500+ profissionais ativos</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Sistema monitorado 24/7</span>
            </div>
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Suporte especializado</span>
            </div>
          </div>
          <p className="text-xs text-aumigo-gray">
            © 2024 AuMigoPet. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}