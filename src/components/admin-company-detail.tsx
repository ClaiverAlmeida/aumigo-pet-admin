import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Briefcase,
  DollarSign,
  Loader2,
  CreditCard,
  Landmark,
  Clock,
  Wallet,
} from 'lucide-react'
import type { CompanyListItem, CompanyBalance } from '../services/companies.service'
import { companiesService } from '../services/companies.service'

function formatDate(value: string | undefined): string {
  if (!value) return '—'
  try {
    const d = new Date(value)
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return value
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const PIX_KEY_TYPE_LABEL: Record<string, string> = {
  CPF: 'CPF',
  CNPJ: 'CNPJ',
  EMAIL: 'E-mail',
  PHONE: 'Telefone',
  RANDOM: 'Chave aleatória',
}

const BANK_ACCOUNT_TYPE_LABEL: Record<string, string> = {
  CONTA_CORRENTE: 'Conta corrente',
  CONTA_POUPANCA: 'Conta poupança',
}

// 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
const DAY_LABEL: Record<string, string> = {
  '0': 'Domingo',
  '1': 'Segunda',
  '2': 'Terça',
  '3': 'Quarta',
  '4': 'Quinta',
  '5': 'Sexta',
  '6': 'Sábado',
}

interface DaySchedule {
  slots?: Array<{ start?: string; end?: string }>
  active?: boolean
}

function formatOpeningHours(oh: unknown): string {
  if (!oh || typeof oh !== 'object') return '—'
  const raw = oh as Record<string, DaySchedule>
  const lines: string[] = []
  for (let d = 0; d <= 6; d++) {
    const key = String(d)
    const label = DAY_LABEL[key] ?? key
    const dayData = raw[key]
    if (!dayData || !dayData.slots?.length) {
      lines.push(`${label}: —`)
      continue
    }
    const ranges = dayData.slots
      .map((s) => `${s.start ?? '?'} – ${s.end ?? '?'}`)
      .join(', ')
    lines.push(`${label}: ${ranges}`)
  }
  return lines.length ? lines.join('\n') : 'Não configurado'
}

interface AdminCompanyDetailProps {
  company: CompanyListItem
  onBack: () => void
  onNavigateToTransactions: (companyId: string) => void
}

export function AdminCompanyDetail({ company, onBack, onNavigateToTransactions }: AdminCompanyDetailProps) {
  const [balance, setBalance] = useState<CompanyBalance | null>(null)
  const [loadingBalance, setLoadingBalance] = useState(true)

  const addressParts = [company.address, company.addressNumber].filter(Boolean)
  const addressLine1 = addressParts.length > 0 ? addressParts.join(', ') : null
  const cityStateZip = [company.city, company.state, company.zipCode].filter(Boolean).join(' · ')
  const hasPix = company.payoutPixKey && String(company.payoutPixKey).trim() && company.payoutPixKeyType
  const hasBank =
    company.payoutBankCode &&
    company.payoutBankAgency &&
    company.payoutBankAccount &&
    company.payoutBankAccountDigit &&
    company.payoutBankOwnerName &&
    company.payoutBankCpfCnpj &&
    company.payoutBankAccountType

  useEffect(() => {
    let cancelled = false
    setLoadingBalance(true)
    companiesService
      .getCompanyBalance(company.id)
      .then((res) => {
        if (!cancelled && res.success && res.data) setBalance(res.data)
      })
      .finally(() => {
        if (!cancelled) setLoadingBalance(false)
      })
    return () => { cancelled = true }
  }, [company.id])

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="w-fit text-aumigo-teal">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar às empresas
        </Button>
      </div>

      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-aumigo-teal flex items-center gap-2">
          <Building2 className="h-6 w-6 shrink-0" />
          {company.name}
        </h1>
        <p className="text-sm text-aumigo-gray mt-1">Dados cadastrais, repasse e financeiro</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Dados da empresa */}
        <Card className="border-aumigo-teal/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Dados da empresa
            </CardTitle>
            <CardDescription>Informações cadastradas na tabela da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.cnpj && (
              <div>
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">CNPJ</p>
                <p className="text-sm mt-0.5">{company.cnpj}</p>
              </div>
            )}
            {company.contactEmail && (
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-aumigo-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">E-mail</p>
                  <p className="text-sm mt-0.5">{company.contactEmail}</p>
                </div>
              </div>
            )}
            {company.contactPhone && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-aumigo-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Telefone</p>
                  <p className="text-sm mt-0.5">{company.contactPhone}</p>
                </div>
              </div>
            )}
            {(addressLine1 || cityStateZip) && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-aumigo-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Endereço</p>
                  {addressLine1 && <p className="text-sm mt-0.5">{addressLine1}</p>}
                  {cityStateZip && <p className="text-sm text-aumigo-gray">{cityStateZip}</p>}
                </div>
              </div>
            )}
            {company.website && (
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-aumigo-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Site</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-aumigo-teal hover:underline mt-0.5 block break-all">
                    {company.website}
                  </a>
                </div>
              </div>
            )}
            {company.openingHours != null && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-aumigo-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Horário de funcionamento</p>
                  <pre className="text-xs mt-0.5 whitespace-pre-wrap font-sans text-aumigo-gray">{formatOpeningHours(company.openingHours)}</pre>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-aumigo-teal/10">
              <div>
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Cadastrado em</p>
                <p className="text-sm mt-0.5">{formatDate(company.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Atualizado em</p>
                <p className="text-sm mt-0.5">{formatDate(company.updatedAt)}</p>
              </div>
            </div>
            {company.deletedAt && (
              <div>
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">Inativado em</p>
                <p className="text-sm mt-0.5 text-amber-700">{formatDate(company.deletedAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usuários e funcionários */}
        <Card className="border-aumigo-teal/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuários e funcionários
            </CardTitle>
            <CardDescription>Quantidade de vínculos à empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Users className="h-8 w-8 text-aumigo-teal shrink-0" />
              <div>
                <p className="text-2xl font-semibold text-aumigo-teal">{company.usersCount ?? 0}</p>
                <p className="text-xs text-aumigo-gray">Usuários vinculados</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Briefcase className="h-8 w-8 text-aumigo-teal shrink-0" />
              <div>
                <p className="text-2xl font-semibold text-aumigo-teal">{company.serviceProvidersCount ?? 0}</p>
                <p className="text-xs text-aumigo-gray">Serviços / itens de catálogo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo financeiro */}
      <Card className="border-aumigo-teal/10">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            Resumo financeiro
          </CardTitle>
          <CardDescription>Saldo e totais da empresa (mês atual)</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingBalance ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-aumigo-teal" />
            </div>
          ) : balance ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Saldo bruto</p>
                <p className="text-lg font-semibold text-aumigo-teal mt-0.5">{formatCurrency(balance.saldoBruto)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Taxas</p>
                <p className="text-lg font-semibold text-aumigo-teal mt-0.5">{formatCurrency(balance.taxas)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Saldo líquido</p>
                <p className="text-lg font-semibold text-aumigo-teal mt-0.5">{formatCurrency(balance.saldoLiquido)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Saldo disponível</p>
                <p className="text-lg font-semibold text-aumigo-teal mt-0.5">{formatCurrency(balance.saldoDisponivel)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Total repassado</p>
                <p className="text-lg font-semibold text-aumigo-teal mt-0.5">{formatCurrency(balance.totalRepassado)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Pagamentos / Repasses</p>
                <p className="text-sm font-medium text-aumigo-teal mt-0.5">{balance.totalPagamentos} pag. · {balance.totalRepasses} rep.</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-aumigo-gray py-4">Não foi possível carregar o resumo financeiro.</p>
          )}
          <Button
            className="w-full mt-4 sm:w-auto border-aumigo-teal/20 text-aumigo-teal hover:bg-aumigo-teal/10"
            variant="outline"
            onClick={() => onNavigateToTransactions(company.id)}
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Ver transações da empresa
          </Button>
        </CardContent>
      </Card>

      {/* Dados para repasse: PIX e Conta bancária */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="border-aumigo-teal/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              PIX (repasse)
            </CardTitle>
            <CardDescription>Chave PIX cadastrada para recebimento de repasses</CardDescription>
          </CardHeader>
          <CardContent>
            {hasPix ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Tipo</p>
                  <p className="text-sm mt-0.5">{PIX_KEY_TYPE_LABEL[company.payoutPixKeyType!] ?? company.payoutPixKeyType}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Chave</p>
                  <p className="text-sm mt-0.5 break-all font-mono">{company.payoutPixKey}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-aumigo-gray">Nenhuma chave PIX cadastrada.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-aumigo-teal/10">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Conta bancária / TED (repasse)
            </CardTitle>
            <CardDescription>Dados da conta para recebimento de repasses via TED</CardDescription>
          </CardHeader>
          <CardContent>
            {hasBank ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Banco</p>
                  <p className="text-sm mt-0.5">{company.payoutBankCode}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Agência</p>
                    <p className="text-sm mt-0.5">{company.payoutBankAgency}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Conta</p>
                    <p className="text-sm mt-0.5">{company.payoutBankAccount}-{company.payoutBankAccountDigit}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Titular</p>
                  <p className="text-sm mt-0.5">{company.payoutBankOwnerName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">CPF/CNPJ</p>
                  <p className="text-sm mt-0.5 font-mono">{company.payoutBankCpfCnpj}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-aumigo-gray uppercase tracking-wide">Tipo da conta</p>
                  <p className="text-sm mt-0.5">{BANK_ACCOUNT_TYPE_LABEL[company.payoutBankAccountType!] ?? company.payoutBankAccountType}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-aumigo-gray">Nenhuma conta bancária cadastrada.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
