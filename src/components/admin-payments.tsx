import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { CreditCard, DollarSign, ArrowRight } from 'lucide-react'

interface AdminPaymentsProps {
  onNavigate: (page: string) => void
}

/**
 * Página de Pagamentos (admin): pagamentos do profissional/empresa para o AumigoPet
 * (assinaturas, planos etc.). Placeholder até a estrutura de cobrança existir.
 */
export function AdminPayments({ onNavigate }: AdminPaymentsProps) {
  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-aumigo-teal flex items-center gap-2">
          <CreditCard className="h-6 w-6 sm:h-7 sm:w-7 shrink-0" />
          Pagamentos
        </h1>
        <p className="text-sm text-aumigo-gray mt-1">
          Pagamentos do profissional/empresa para o AumigoPet (assinaturas, planos e afins).
        </p>
      </div>

      <Card className="border-aumigo-teal/10">
        <CardHeader>
          <CardTitle className="text-base">Em breve</CardTitle>
          <CardDescription>
            Esta tela será usada para gerenciar os pagamentos que profissionais e empresas fazem ao sistema AumigoPet,
            como assinaturas de plano e cobranças recorrentes. A estrutura ainda não está disponível.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:gap-2">
          <Button
            variant="outline"
            className="border-aumigo-teal/20 text-aumigo-teal min-h-[44px] touch-manipulation"
            onClick={() => onNavigate('transactions')}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Transações (clientes)
          </Button>
          <Button
            variant="outline"
            className="border-aumigo-teal/20 text-aumigo-teal min-h-[44px] touch-manipulation"
            onClick={() => onNavigate('payouts')}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Repasses
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
