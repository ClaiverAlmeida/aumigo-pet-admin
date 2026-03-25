import { Label } from './ui/label'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export interface BankAccountSettings {
  payoutBankCode: string
  payoutBankAgency: string
  payoutBankAccount: string
  payoutBankAccountDigit: string
  payoutBankOwnerName: string
  payoutBankCpfCnpj: string
  payoutBankAccountType: string
}

export interface PixSettings {
  payoutPixKey: string
  payoutPixKeyType: string
}

export const PIX_KEY_TYPES = [
  { value: 'CPF', label: 'CPF' },
  { value: 'CNPJ', label: 'CNPJ' },
  { value: 'EMAIL', label: 'E-mail' },
  { value: 'PHONE', label: 'Telefone' },
  { value: 'RANDOM', label: 'Chave aleatória' },
]

interface BankAccountFieldsProps<T extends BankAccountSettings> {
  value: T
  onChange: (next: T) => void
}

export function BankAccountFields<T extends BankAccountSettings>({
  value,
  onChange,
}: BankAccountFieldsProps<T>) {
  const handleFieldChange = (field: keyof BankAccountSettings, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    })
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label>Código do banco</Label>
        <Input
          value={value.payoutBankCode}
          onChange={e => handleFieldChange('payoutBankCode', e.target.value)}
          placeholder="Ex: 237"
        />
      </div>
      <div className="space-y-2">
        <Label>Agência</Label>
        <Input
          value={value.payoutBankAgency}
          onChange={e => handleFieldChange('payoutBankAgency', e.target.value)}
          placeholder="Número da agência"
        />
      </div>
      <div className="space-y-2">
        <Label>Conta</Label>
        <Input
          value={value.payoutBankAccount}
          onChange={e => handleFieldChange('payoutBankAccount', e.target.value)}
          placeholder="Número da conta"
        />
      </div>
      <div className="space-y-2">
        <Label>Dígito</Label>
        <Input
          value={value.payoutBankAccountDigit}
          onChange={e => handleFieldChange('payoutBankAccountDigit', e.target.value)}
          placeholder="Dígito"
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>Titular da conta</Label>
        <Input
          value={value.payoutBankOwnerName}
          onChange={e => handleFieldChange('payoutBankOwnerName', e.target.value)}
          placeholder="Nome completo do titular"
        />
      </div>
      <div className="space-y-2">
        <Label>CPF ou CNPJ do titular</Label>
        <Input
          value={value.payoutBankCpfCnpj}
          onChange={e => handleFieldChange('payoutBankCpfCnpj', e.target.value)}
          placeholder="Apenas números"
        />
      </div>
      <div className="space-y-2">
        <Label>Tipo de conta</Label>
        <Select
          value={value.payoutBankAccountType}
          onValueChange={v =>
            handleFieldChange('payoutBankAccountType', v)
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CONTA_CORRENTE">Conta corrente</SelectItem>
            <SelectItem value="CONTA_POUPANCA">Conta poupança</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

interface PixFieldsProps<T extends PixSettings> {
  value: T
  onChange: (next: T) => void
}

export function PixFields<T extends PixSettings>({
  value,
  onChange,
}: PixFieldsProps<T>) {
  const handleFieldChange = (field: keyof PixSettings, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo da chave PIX</Label>
        <Select
          value={value.payoutPixKeyType}
          onValueChange={v => handleFieldChange('payoutPixKeyType', v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PIX_KEY_TYPES.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Chave PIX</Label>
        <Input
          value={value.payoutPixKey}
          onChange={event =>
            handleFieldChange('payoutPixKey', event.target.value)
          }
          placeholder={
            value.payoutPixKeyType === 'CPF' || value.payoutPixKeyType === 'CNPJ'
              ? 'Apenas números'
              : value.payoutPixKeyType === 'PHONE'
                ? '11 dígitos com DDD'
                : 'Sua chave PIX'
          }
        />
      </div>
    </div>
  )
}


