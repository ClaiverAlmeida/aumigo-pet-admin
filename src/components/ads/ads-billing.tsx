import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Alert, AlertDescription } from '../ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { 
  CreditCard,
  Plus,
  Download,
  AlertCircle,
  Check,
  Calendar,
  DollarSign,
  FileText,
  Trash2,
  Edit
} from 'lucide-react'

// Mock data para métodos de pagamento
const mockPaymentMethods = [
  {
    id: '1',
    type: 'credit_card',
    last4: '4532',
    brand: 'Visa',
    expiryMonth: 12,
    expiryYear: 2027,
    isDefault: true
  },
  {
    id: '2',
    type: 'pix',
    email: 'profissional@aumigopet.com',
    isDefault: false
  }
]

// Mock data para faturas
const mockInvoices = [
  {
    id: 'INV-2024-001',
    periodStart: '2024-12-01',
    periodEnd: '2024-12-07',
    amountCents: 17250,
    status: 'paid',
    paidAt: '2024-12-08',
    campaigns: [
      { name: 'Banho & Tosa - Dezembro', spend: 125.50 },
      { name: 'Adestramento - Promoção', spend: 47.00 }
    ]
  },
  {
    id: 'INV-2024-002',
    periodStart: '2024-11-24',
    periodEnd: '2024-11-30',
    amountCents: 23180,
    status: 'paid',
    paidAt: '2024-12-01',
    campaigns: [
      { name: 'Hospedagem - Black Friday', spend: 231.80 }
    ]
  },
  {
    id: 'INV-2024-003',
    periodStart: '2024-11-17',
    periodEnd: '2024-11-23',
    amountCents: 15690,
    status: 'pending',
    paidAt: null,
    campaigns: [
      { name: 'Consulta Veterinária', spend: 98.40 },
      { name: 'Banho & Tosa - Novembro', spend: 58.50 }
    ]
  }
]

const billingModes = {
  post_paid: {
    title: 'Pós-pago (Atual)',
    description: 'Cobrança semanal do valor consumido',
    benefits: [
      'Pague apenas pelo que usar',
      'Sem necessidade de recarga',
      'Cobrança automática semanal'
    ]
  },
  pre_paid: {
    title: 'Pré-pago',
    description: 'Carregue créditos antecipadamente',
    benefits: [
      'Controle total do orçamento',
      'Sem surpresas na cobrança',
      'Pausar quando saldo acabar'
    ]
  }
}

const statusLabels = {
  paid: { label: 'Paga', color: 'bg-aumigo-mint' },
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  overdue: { label: 'Vencida', color: 'bg-red-500' }
}

export function AdsBilling() {
  const [currentMode, setCurrentMode] = useState<'post_paid' | 'pre_paid'>('post_paid')
  const [creditBalance, setCreditBalance] = useState(0)
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false)

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const totalSpentThisWeek = 17250 // R$ 172,50

  return (
    <div className="space-y-6">
      <div>
        <h3>Pagamentos e Faturamento</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie seus métodos de pagamento e acompanhe suas faturas
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="methods">Métodos de Pagamento</TabsTrigger>
          <TabsTrigger value="invoices">Faturas</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Status Atual */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Gasto desta semana</p>
                    <p className="text-lg font-medium">{formatPrice(totalSpentThisWeek)}</p>
                  </div>
                  <DollarSign className="w-5 h-5 text-aumigo-orange" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Período: 01/12 - 07/12
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Próxima cobrança</p>
                    <p className="text-lg font-medium">15/12/2024</p>
                  </div>
                  <Calendar className="w-5 h-5 text-aumigo-blue" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Estimativa: R$ 145,00
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Modo de cobrança</p>
                    <p className="text-lg font-medium">Pós-pago</p>
                  </div>
                  <CreditCard className="w-5 h-5 text-aumigo-teal" />
                </div>
                <Badge variant="outline" className="mt-1 text-xs">
                  •••• 4532
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          <div className="space-y-3">
            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                Sua cobrança está em dia. Próxima cobrança em 8 dias.
              </AlertDescription>
            </Alert>

            {currentMode === 'pre_paid' && creditBalance < 50 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Saldo baixo! Você tem {formatPrice(creditBalance * 100)} em créditos. 
                  Recarregue para não interromper suas campanhas.
                  <Button variant="link" className="p-0 ml-2 h-auto">
                    Recarregar agora
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Últimas Faturas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Últimas Faturas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockInvoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{invoice.id}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatPrice(invoice.amountCents)}</p>
                        <Badge className={`${statusLabels[invoice.status as keyof typeof statusLabels].color} text-white text-xs`}>
                          {statusLabels[invoice.status as keyof typeof statusLabels].label}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4>Métodos de Pagamento</h4>
              <p className="text-sm text-muted-foreground">
                Adicione e gerencie seus métodos de pagamento
              </p>
            </div>
            <Button onClick={() => setShowAddPaymentMethod(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Método
            </Button>
          </div>

          <div className="grid gap-4">
            {mockPaymentMethods.map((method) => (
              <Card key={method.id} className={method.isDefault ? 'ring-2 ring-aumigo-orange' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                        <CreditCard className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        {method.type === 'credit_card' ? (
                          <>
                            <p className="font-medium">
                              {method.brand} •••• {method.last4}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Vence em {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">PIX</p>
                            <p className="text-sm text-muted-foreground">{method.email}</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <Badge className="bg-aumigo-orange text-white">Padrão</Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      {!method.isDefault && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Formulário para Adicionar Método */}
          {showAddPaymentMethod && (
            <Card>
              <CardHeader>
                <CardTitle>Adicionar Método de Pagamento</CardTitle>
                <CardDescription>
                  Escolha como deseja pagar pelos seus anúncios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs defaultValue="credit_card">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="credit_card">Cartão de Crédito</TabsTrigger>
                    <TabsTrigger value="pix">PIX</TabsTrigger>
                  </TabsList>

                  <TabsContent value="credit_card" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardNumber">Número do cartão</Label>
                        <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Nome no cartão</Label>
                        <Input id="cardName" placeholder="Nome como no cartão" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Validade</Label>
                        <Input id="expiry" placeholder="MM/AA" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="pix" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="pixEmail">Email para PIX</Label>
                      <Input id="pixEmail" type="email" placeholder="seu@email.com" />
                    </div>
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        O PIX será usado para reembolsos. Para cobranças, um boleto será enviado por email.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2">
                  <Button className="flex-1 bg-aumigo-orange hover:bg-aumigo-orange/90">
                    Adicionar Método
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddPaymentMethod(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Faturas</CardTitle>
              <CardDescription>
                Todas as suas faturas e comprovantes de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fatura</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">
                            {invoice.campaigns.length} campanha(s)
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{formatDate(invoice.periodStart)}</p>
                          <p className="text-muted-foreground">
                            até {formatDate(invoice.periodEnd)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{formatPrice(invoice.amountCents)}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${statusLabels[invoice.status as keyof typeof statusLabels].color} text-white`}>
                          {statusLabels[invoice.status as keyof typeof statusLabels].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modo de Cobrança</CardTitle>
              <CardDescription>
                Escolha como prefere ser cobrado pelos anúncios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(billingModes).map(([mode, config]) => (
                <div
                  key={mode}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    currentMode === mode ? 'border-aumigo-orange bg-aumigo-orange/5' : 'hover:border-aumigo-orange/50'
                  }`}
                  onClick={() => setCurrentMode(mode as 'post_paid' | 'pre_paid')}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{config.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                      <ul className="mt-2 space-y-1">
                        {config.benefits.map((benefit, index) => (
                          <li key={index} className="text-xs text-muted-foreground flex items-center gap-1">
                            <div className="w-1 h-1 bg-aumigo-orange rounded-full" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className={`w-4 h-4 border-2 rounded-full ${
                      currentMode === mode ? 'border-aumigo-orange bg-aumigo-orange' : 'border-muted-foreground'
                    }`}>
                      {currentMode === mode && (
                        <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {currentMode === 'pre_paid' && (
                <div className="p-4 bg-muted rounded-lg">
                  <h5 className="font-medium mb-2">Recarregar Créditos</h5>
                  <div className="flex gap-2">
                    <Input placeholder="R$ 0,00" className="flex-1" />
                    <Button className="bg-aumigo-orange hover:bg-aumigo-orange/90">
                      Recarregar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Saldo atual: {formatPrice(creditBalance * 100)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificações de Cobrança</CardTitle>
              <CardDescription>
                Configure quando e como ser notificado sobre cobranças
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  { id: 'email_invoice', label: 'Receber fatura por email', checked: true },
                  { id: 'sms_payment', label: 'SMS quando pagamento for processado', checked: false },
                  { id: 'low_balance', label: 'Alertar quando saldo estiver baixo (pré-pago)', checked: true },
                  { id: 'weekly_summary', label: 'Resumo semanal de gastos', checked: true }
                ].map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <input type="checkbox" id={option.id} defaultChecked={option.checked} />
                    <Label htmlFor={option.id} className="text-sm">{option.label}</Label>
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