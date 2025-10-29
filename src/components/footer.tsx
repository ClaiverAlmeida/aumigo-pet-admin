import { Button } from './ui/button'
import { 
  Heart, 
  Mail, 
  Phone, 
  MapPin, 
  Instagram, 
  Facebook, 
  Twitter,
  HelpCircle
} from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-background border-t border-border mt-auto">
      <div className="px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Informações da empresa */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-aumigo-teal font-semibold mb-4">AuMigoPet PRO</h3>
            <p className="text-muted-foreground text-sm mb-4 max-w-md">
              Conectando profissionais do cuidado animal com tutores que amam seus pets. 
              Uma plataforma segura e confiável para serviços veterinários, banho e tosa, 
              adestramento e muito mais.
            </p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-aumigo-blue hover:text-aumigo-teal">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-aumigo-blue hover:text-aumigo-teal">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-aumigo-blue hover:text-aumigo-teal">
                <Twitter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links úteis */}
          <div>
            <h3 className="text-aumigo-teal font-semibold mb-3">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-aumigo-teal justify-start">
                  Central de Ajuda
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-aumigo-teal justify-start">
                  Termos de Serviço
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-aumigo-teal justify-start">
                  Política de Privacidade
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-muted-foreground hover:text-aumigo-teal justify-start">
                  Como Funciona
                </Button>
              </li>
            </ul>
          </div>

          {/* Contato e suporte */}
          <div>
            <h3 className="text-aumigo-teal font-semibold mb-3">Suporte</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="h-4 w-4 text-aumigo-blue" />
                suporte@aumigopet.com
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="h-4 w-4 text-aumigo-blue" />
                (11) 4002-8922
              </li>
              <li className="flex items-center gap-2 text-muted-foreground text-sm">
                <MapPin className="h-4 w-4 text-aumigo-blue" />
                São Paulo, SP
              </li>
              <li className="mt-3">
                <Button 
                  size="sm" 
                  className="bg-aumigo-orange hover:bg-aumigo-orange/90 text-white border-0"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Fale Conosco
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha inferior */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 mt-6 border-t border-border">
          <p className="text-muted-foreground text-sm">
            © 2025 AuMigoPet. Todos os direitos reservados.
          </p>
          <p className="text-muted-foreground text-sm flex items-center gap-1 mt-2 md:mt-0">
            Feito com <Heart className="h-3 w-3 text-aumigo-orange fill-current" /> para pets e seus tutores
          </p>
        </div>
      </div>
    </footer>
  )
}