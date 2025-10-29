import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Eye,
  Users,
  Gavel,
  Heart
} from 'lucide-react'

const policyCategories = [
  {
    id: 'content',
    title: 'Conteúdo Permitido',
    icon: CheckCircle,
    color: 'text-aumigo-mint',
    rules: [
      'Fotos reais dos seus serviços e instalações',
      'Preços claros e atualizados',
      'Descrições honestas e precisas',
      'Certificações e credenciais válidas',
      'Depoimentos reais de clientes',
      'Promoções com condições claras'
    ]
  },
  {
    id: 'prohibited',
    title: 'Conteúdo Proibido',
    icon: XCircle,
    color: 'text-red-500',
    rules: [
      'Fotos de animais feridos ou em situações perigosas',
      'Claims médicos não comprovados (ex: "cura 100% das doenças")',
      'Preços falsos ou promoções enganosas',
      'Uso de imagens de terceiros sem autorização',
      'Conteúdo discriminatório ou ofensivo',
      'Informações de contato de outros profissionais',
      'Medicamentos controlados ou procedimentos ilegais'
    ]
  },
  {
    id: 'guidelines',
    title: 'Diretrizes de Qualidade',
    icon: Eye,
    color: 'text-aumigo-blue',
    rules: [
      'Use imagens com boa resolução (mínimo 800x600)',
      'Evite textos longos na imagem',
      'Mensagens claras e objetivas',
      'Respeite direitos autorais',
      'Mantenha consistência com sua marca',
      'Atualize informações regularmente'
    ]
  }
]

const moderationProcess = [
  {
    step: 1,
    title: 'Análise Automática',
    description: 'Sistema verifica automaticamente texto e imagens',
    duration: 'Instantâneo',
    icon: Shield
  },
  {
    step: 2,
    title: 'Revisão Manual',
    description: 'Equipe especializada analisa anúncios com alertas',
    duration: 'Até 2 horas úteis',
    icon: Users
  },
  {
    step: 3,
    title: 'Aprovação/Reprovação',
    description: 'Decisão final com feedback detalhado',
    duration: 'Até 4 horas úteis',
    icon: Gavel
  }
]

const reportReasons = [
  'Preço incorreto ou enganoso',
  'Serviço não corresponde ao anunciado',
  'Imagem inadequada ou ofensiva',
  'Informações falsas sobre qualificações',
  'Spam ou conteúdo repetitivo',
  'Violação de direitos autorais'
]

export function AdsPolicies() {
  return (
    <div className="space-y-6">
      <div>
        <h3>Políticas e Diretrizes</h3>
        <p className="text-sm text-muted-foreground">
          Conheça as regras e boas práticas para criar anúncios eficazes e em conformidade
        </p>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList>
          <TabsTrigger value="policies">Políticas</TabsTrigger>
          <TabsTrigger value="moderation">Moderação</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          <TabsTrigger value="help">Ajuda</TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          {/* Overview */}
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Importante:</strong> Todos os anúncios passam por análise antes de serem publicados. 
              Anúncios que violem nossas políticas serão rejeitados e você receberá feedback para correção.
            </AlertDescription>
          </Alert>

          {/* Categorias de Políticas */}
          <div className="grid gap-6">
            {policyCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 ${category.color}`}>
                      <Icon className="w-5 h-5" />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 md:grid-cols-2">
                      {category.rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-current rounded-full mt-2 flex-shrink-0" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* LGPD e Transparência */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-aumigo-orange" />
                Proteção de Dados e Transparência
              </CardTitle>
              <CardDescription>
                Nosso compromisso com a privacidade e transparência
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h5 className="font-medium mb-2">LGPD - Lei Geral de Proteção de Dados</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Segmentação apenas por localização e categoria de serviço</li>
                    <li>• Não coletamos dados sensíveis dos usuários</li>
                    <li>• Dados anonimizados para métricas</li>
                    <li>• Direito de exclusão de dados a qualquer momento</li>
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium mb-2">Transparência nos Anúncios</h5>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Todos os anúncios têm selo "Patrocinado"</li>
                    <li>• Não misturamos anúncios com conteúdo orgânico</li>
                    <li>• Máximo de 2-3 anúncios por tela</li>
                    <li>• Priorização baseada em relevância e qualidade</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="moderation" className="space-y-6">
          <div>
            <h4>Como Funciona a Moderação</h4>
            <p className="text-sm text-muted-foreground">
              Entenda o processo de análise e aprovação dos seus anúncios
            </p>
          </div>

          {/* Processo de Moderação */}
          <div className="grid gap-4">
            {moderationProcess.map((process) => {
              const Icon = process.icon
              return (
                <Card key={process.step}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-aumigo-orange/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-aumigo-orange" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">Etapa {process.step}: {process.title}</h5>
                          <Badge variant="outline" className="text-xs">
                            {process.duration}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{process.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Status de Aprovação */}
          <Card>
            <CardHeader>
              <CardTitle>Status de Aprovação</CardTitle>
              <CardDescription>
                Possíveis status dos seus anúncios durante a moderação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  {
                    status: 'Em análise',
                    description: 'Anúncio enviado para revisão',
                    color: 'bg-yellow-500',
                    action: 'Aguarde a análise'
                  },
                  {
                    status: 'Aprovado',
                    description: 'Anúncio aprovado e publicado',
                    color: 'bg-aumigo-mint',
                    action: 'Campanha ativa'
                  },
                  {
                    status: 'Rejeitado',
                    description: 'Anúncio violou políticas',
                    color: 'bg-red-500',
                    action: 'Corrigir e reenviar'
                  },
                  {
                    status: 'Revisão manual',
                    description: 'Precisa de análise humana',
                    color: 'bg-aumigo-blue',
                    action: 'Análise em andamento'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-3 h-3 ${item.color} rounded-full`} />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.status}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                      <p className="text-xs font-medium mt-1">{item.action}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div>
            <h4>Conformidade e Boas Práticas</h4>
            <p className="text-sm text-muted-foreground">
              Dicas para manter seus anúncios sempre em conformidade
            </p>
          </div>

          {/* Checklist de Conformidade */}
          <Card>
            <CardHeader>
              <CardTitle>Checklist Antes de Publicar</CardTitle>
              <CardDescription>
                Verifique estes pontos para evitar rejeições
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  'Preços estão atualizados e corretos',
                  'Imagens são próprias ou licenciadas',
                  'Descrição é honesta e precisa',
                  'Não há claims médicos exagerados',
                  'Promoções têm condições claras',
                  'Certificações são válidas',
                  'Horários de funcionamento corretos',
                  'Endereço e contato atualizados'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Relatórios de Usuários */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Sistema de Denúncias
              </CardTitle>
              <CardDescription>
                Como usuários podem reportar anúncios inadequados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h5 className="font-medium mb-2">Motivos de Denúncia Mais Comuns:</h5>
                <div className="grid gap-2 md:grid-cols-2">
                  {reportReasons.map((reason, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      {reason}
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Denúncias são investigadas em até 24 horas. 
                  Anúncios com múltiplas denúncias procedentes podem resultar em suspensão da conta.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="help" className="space-y-6">
          <div>
            <h4>Central de Ajuda</h4>
            <p className="text-sm text-muted-foreground">
              Recursos e contatos para esclarecer dúvidas sobre políticas
            </p>
          </div>

          {/* FAQ Rápido */}
          <Card>
            <CardHeader>
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  question: 'Quanto tempo leva para aprovar um anúncio?',
                  answer: 'A maioria dos anúncios é aprovada automaticamente em segundos. Casos que precisam de revisão manual levam até 4 horas úteis.'
                },
                {
                  question: 'Posso usar fotos do Google em meus anúncios?',
                  answer: 'Não. Use apenas fotos próprias ou com licença comprovada. Violações de direitos autorais resultam em rejeição automática.'
                },
                {
                  question: 'O que fazer se meu anúncio foi rejeitado?',
                  answer: 'Verifique o motivo no painel, corrija os problemas apontados e reenvie. Nossa equipe oferece sugestões específicas.'
                },
                {
                  question: 'Posso anunciar medicamentos para pets?',
                  answer: 'Apenas veterinários registrados podem anunciar consultas. Medicamentos controlados são proibidos para todos.'
                }
              ].map((faq, index) => (
                <div key={index} className="border-b pb-3">
                  <h5 className="font-medium mb-1">{faq.question}</h5>
                  <p className="text-sm text-muted-foreground">{faq.answer}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Contatos de Suporte */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Suporte Técnico</CardTitle>
                <CardDescription>
                  Problemas com campanhas ou sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>📧 ads-suporte@aumigopet.com</p>
                  <p>💬 Chat no app (segunda a sexta, 8h-18h)</p>
                  <p>📱 WhatsApp: (11) 99999-8888</p>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  Abrir Ticket de Suporte
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revisão de Políticas</CardTitle>
                <CardDescription>
                  Conteste rejeições ou denúncias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p>📧 revisao@aumigopet.com</p>
                  <p>📋 Formulário de contestação</p>
                  <p>⏱️ Resposta em até 48h úteis</p>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  Solicitar Revisão
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Recursos Educativos */}
          <Card>
            <CardHeader>
              <CardTitle>Recursos Educativos</CardTitle>
              <CardDescription>
                Aprenda a criar anúncios mais eficazes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  { title: 'Guia de Boas Práticas', type: 'PDF', size: '2.1 MB' },
                  { title: 'Vídeo: Como Criar Anúncios Eficazes', type: 'Vídeo', size: '8 min' },
                  { title: 'Templates de Mensagens', type: 'Download', size: '450 KB' },
                  { title: 'Webinar: Políticas de Anúncios', type: 'Gravação', size: '45 min' }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">{resource.type} • {resource.size}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}