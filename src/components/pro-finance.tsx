import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Progress } from './ui/progress'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  CreditCard,
  Banknote,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface Payout {
  id: string
  amount: number
  fee: number
  netAmount: number
  status: 'scheduled' | 'processing' | 'paid' | 'failed'
  scheduledFor: string
  paidAt?: string
  reference: string
}

interface Transaction {
  id: string
  bookingId: string
  customerName: string
  service: string
  amount: number
  fee: number
  netAmount: number
  date: string
  status: 'paid' | 'refunded' | 'failed'
}


interface FinancialSummary {
  currentBalance: number
  pendingAmount: number
  monthEarnings: number
  monthFees: number
  monthNet: number
  averageTicket: number
  transactionCount: number
}

export function ProFinance() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    currentBalance: 0,
    pendingAmount: 0,
    monthEarnings: 0,
    monthFees: 0,
    monthNet: 0,
    averageTicket: 0,
    transactionCount: 0
  })
  const [selectedPeriod, setSelectedPeriod] = useState('current-month')

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  const getPayoutStatusBadge = (status: Payout['status']) => {
    const configs = {
      scheduled: { label: 'Agendado', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-700' },
      processing: { label: 'Processando', variant: 'secondary' as const, className: 'bg-yellow-100 text-yellow-700' },
      paid: { label: 'Pago', variant: 'default' as const, className: 'bg-green-100 text-green-700' },
      failed: { label: 'Falhou', variant: 'destructive' as const, className: '' }
    }

    const config = configs[status]
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const getPayoutStatusIcon = (status: Payout['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'processing':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Calendar className="w-4 h-4 text-blue-600" />
    }
  }

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>Financeiro</h2>
          <p className="text-muted-foreground">Acompanhe seus ganhos e repasses</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current-month">Mês Atual</SelectItem>
              <SelectItem value="last-month">Mês Anterior</SelectItem>
              <SelectItem value="last-3-months">Últimos 3 Meses</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Financeiros */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Disponível</CardTitle>
            <Banknote className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.currentBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Disponível para saque
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.monthEarnings)}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              <span className="text-green-600">+12%</span>
              <span className="ml-1">vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Líquido</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.monthNet)}</div>
            <p className="text-xs text-muted-foreground">
              Após taxas ({formatCurrency(financialSummary.monthFees)})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(financialSummary.averageTicket)}</div>
            <p className="text-xs text-muted-foreground">
              {financialSummary.transactionCount} transações
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payouts">Repasses</TabsTrigger>
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="analytics">Análise</TabsTrigger>
        </TabsList>

        <TabsContent value="payouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cronograma de Repasses</CardTitle>
              <CardDescription>
                Acompanhe quando seus valores serão depositados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referência</TableHead>
                    <TableHead>Valor Bruto</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Valor Líquido</TableHead>
                    <TableHead>Data Programada</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Nenhum repasse encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPayoutStatusIcon(payout.status)}
                          <span className="font-mono text-sm">{payout.reference}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(payout.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        -{formatCurrency(payout.fee)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payout.netAmount)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{formatDate(payout.scheduledFor)}</p>
                          {payout.paidAt && (
                            <p className="text-xs text-muted-foreground">
                              Pago em {formatDate(payout.paidAt)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPayoutStatusBadge(payout.status)}
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Todas as transações dos seus agendamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Valor Bruto</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>Valor Líquido</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        Nenhuma transação encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{transaction.customerName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {transaction.bookingId}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{transaction.service}</TableCell>
                      <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        -{formatCurrency(transaction.fee)} (10%)
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(transaction.netAmount)}
                      </TableCell>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={transaction.status === 'paid' ? 'default' : 'destructive'}
                          className={transaction.status === 'paid' ? 'bg-green-100 text-green-700' : ''}
                        >
                          {transaction.status === 'paid' ? 'Pago' : 
                           transaction.status === 'refunded' ? 'Reembolsado' : 'Falhou'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Mensal</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {financialSummary.monthEarnings > 0 ? (
                  <>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Meta de Receita</span>
                        <span>R$ 10.000</span>
                      </div>
                      <Progress 
                        value={Math.min((financialSummary.monthEarnings / 100000) * 100, 100)} 
                        className="h-2" 
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(financialSummary.monthEarnings)} de R$ 10.000
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Eficiência (Taxa vs Meta)</span>
                        <span>10%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                      <p className="text-xs text-green-600 mt-1">Taxa dentro do esperado</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{financialSummary.transactionCount}</p>
                        <p className="text-xs text-muted-foreground">Transações</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold">98%</p>
                        <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nenhum dado disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Breakdown de Receita</CardTitle>
                <CardDescription>Por tipo de serviço</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {financialSummary.monthEarnings > 0 ? (
                  <>
                    <div className="pt-4 space-y-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span>Receita Total</span>
                        <span className="font-medium">{formatCurrency(financialSummary.monthEarnings)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Taxa Plataforma (10%)</span>
                        <span>-{formatCurrency(financialSummary.monthFees)}</span>
                      </div>
                      <div className="flex justify-between font-medium border-t pt-2">
                        <span>Valor Líquido</span>
                        <span>{formatCurrency(financialSummary.monthNet)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Nenhum dado disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}