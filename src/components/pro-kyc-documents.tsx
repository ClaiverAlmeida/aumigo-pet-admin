import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Badge } from './ui/badge'
import { Progress } from './ui/progress'
import { Switch } from './ui/switch'
import {
  Banknote,
  FileText,
  Home,
  IdCard,
  ShieldCheck,
  Clock,
  XCircle,
  UploadCloud,
  Stethoscope,
  FileImage,
  FileSpreadsheet,
  File as FileGeneric,
  Download,
} from 'lucide-react'
import {
  BankAccountFields,
  PixFields,
  type BankAccountSettings,
  type PixSettings,
} from './pro-bank-account-fields'
import { Separator } from './ui/separator'
import { filesService, kycDocumentsService, companiesService } from '../services'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog'

type KycStatus = 'pendente' | 'em-analise' | 'aprovado' | 'reprovado'

interface SelectedFile {
  id: string
  label: string
  file?: File
  existingId?: string
  existingFileName?: string
  existingFileUrl?: string
  existingStatus?: 'PENDING' | 'APPROVED' | 'REJECTED'
  existingUploadedAt?: string
  existingMimeType?: string
  existingFeedback?: string
}

interface ExistingKycDocument {
  id: string
  type: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  feedback?: string
  file?: {
    id: string
    fileName: string
    url: string
    mimeType?: string
  }
  createdAt: string
}

export function ProKycDocumentsSection() {
  const [status, setStatus] = useState<KycStatus>('pendente')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditingDocuments, setIsEditingDocuments] = useState(true)
  const [isVeterinarian, setIsVeterinarian] = useState(false)
  const [pixSettings, setPixSettings] = useState<PixSettings>({
    payoutPixKey: '',
    payoutPixKeyType: 'CPF',
  })
  const [bankAccount, setBankAccount] = useState<BankAccountSettings>({
    payoutBankCode: '',
    payoutBankAgency: '',
    payoutBankAccount: '',
    payoutBankAccountDigit: '',
    payoutBankOwnerName: '',
    payoutBankCpfCnpj: '',
    payoutBankAccountType: 'CONTA_CORRENTE',
  })

  const [documents, setDocuments] = useState<SelectedFile[]>([
    { id: 'cnpj-cpf', label: 'CNPJ / CPF do profissional' },
    { id: 'bank-account', label: 'Dados da conta bancária para saque' },
    { id: 'identity', label: 'Documento oficial com foto (RG ou CNH)' },
    { id: 'crmv', label: 'CRMV (somente veterinários)' },
    { id: 'address-proof', label: 'Comprovante de residência' },
  ])

  const mapBackendStatusToUi = (backend: 'PENDING' | 'APPROVED' | 'REJECTED'): KycStatus => {
    if (backend === 'APPROVED') return 'aprovado'
    if (backend === 'REJECTED') return 'reprovado'
    return 'pendente'
  }

  const mapFieldIdToKycType = (id: string): string | null => {
    if (id === 'cnpj-cpf') return 'CNPJ'
    if (id === 'bank-account') return 'BANK_PROOF'
    if (id === 'identity') return 'RG'
    if (id === 'address-proof') return 'PROOF_OF_ADDRESS'
    if (id === 'crmv') return 'CRMV'
    return null
  }

  useEffect(() => {
    const carregarKyc = async () => {
      try {
        const response = await kycDocumentsService.buscarMeusDocumentos()
        if (!response.success || !response.data) return

        const { status: backendStatus, documents: backendDocuments } = response.data
        setStatus(mapBackendStatusToUi(backendStatus))
        setIsEditingDocuments(backendStatus !== 'APPROVED')

        const existingByType: Record<string, ExistingKycDocument> = {}
        backendDocuments.forEach((doc: ExistingKycDocument) => {
          existingByType[doc.type] = doc
        })

        // Se já tiver documento de CRMV, liga automaticamente o toggle
        if (existingByType.CRMV) {
          setIsVeterinarian(true)
        }

        setDocuments(prev =>
          prev.map(item => {
            const mappedType = mapFieldIdToKycType(item.id)
            const existing = mappedType ? existingByType[mappedType] : undefined
            if (!existing) return item
            return {
              ...item,
              existingId: existing.id,
              existingFileName: existing.file?.fileName,
              existingFileUrl: existing.file?.url,
              existingStatus: existing.status,
              existingMimeType: existing.file?.mimeType,
              existingUploadedAt: existing.createdAt,
              existingFeedback: existing.feedback,
            }
          }),
        )
      } catch {
        // Silenciar erro inicial, a tela continua funcionando em modo "draft"
      }
    }

    const carregarDadosBancarios = async () => {
      try {
        const result = await companiesService.getMyCompany()
        if (!result.success || !result.data) return

        const company = result.data

        if (company.primaryCategory === 'VETERINARY') {
          setIsVeterinarian(true)
        }

        setPixSettings({
          payoutPixKey: company.payoutPixKey ?? '',
          payoutPixKeyType: company.payoutPixKeyType || 'CPF',
        })

        setBankAccount({
          payoutBankCode: company.payoutBankCode ?? '',
          payoutBankAgency: company.payoutBankAgency ?? '',
          payoutBankAccount: company.payoutBankAccount ?? '',
          payoutBankAccountDigit: company.payoutBankAccountDigit ?? '',
          payoutBankOwnerName: company.payoutBankOwnerName ?? '',
          payoutBankCpfCnpj: company.payoutBankCpfCnpj ?? '',
          payoutBankAccountType: company.payoutBankAccountType || 'CONTA_CORRENTE',
        })
      } catch {
        // silencioso – não quebra a tela se der erro aqui
      }
    }

    carregarKyc()
    carregarDadosBancarios()
  }, [])

  const handleFileChange = (id: string, file?: File) => {
    setDocuments(prev =>
      prev.map(doc => (doc.id === id ? { ...doc, file } : doc)),
    )
  }

  const handleRemoveExistingDocument = async (id: string) => {
    try {
      const mappedType = mapFieldIdToKycType(id)
      if (!mappedType) {
        toast.error('Tipo de documento inválido para remoção.')
        return
      }

      const result = await kycDocumentsService.deleteMyDocument(mappedType)
      if (!result.success || !result.data) {
        toast.error((result as any).error || 'Erro ao remover documento.')
        return
      }

      const { status: backendStatus, documents: backendDocuments } = result.data
      setStatus(mapBackendStatusToUi(backendStatus))
      setIsEditingDocuments(backendStatus !== 'APPROVED')

      const existingByType: Record<string, ExistingKycDocument> = {}
      backendDocuments.forEach((doc: ExistingKycDocument) => {
        existingByType[doc.type] = doc
      })

      setDocuments(prev =>
        prev.map(item => {
          const mapped = mapFieldIdToKycType(item.id)
          const existing = mapped ? existingByType[mapped] : undefined
          if (!existing) {
            return {
              ...item,
              file: undefined,
              existingId: undefined,
              existingFileName: undefined,
              existingFileUrl: undefined,
              existingStatus: undefined,
              existingMimeType: undefined,
              existingUploadedAt: undefined,
              existingFeedback: undefined,
            }
          }
          return {
            ...item,
            file: undefined,
            existingId: existing.id,
            existingFileName: existing.file?.fileName,
            existingFileUrl: existing.file?.url,
            existingStatus: existing.status,
            existingMimeType: existing.file?.mimeType,
            existingUploadedAt: existing.createdAt,
            existingFeedback: existing.feedback,
          }
        }),
      )

      toast.success('Documento removido com sucesso.')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao remover documento.')
    }
  }

  const handleSubmitDocuments = async () => {
    try {
      setIsSubmitting(true)

      // 1) Preparar payload de dados bancários / PIX da empresa
      const payoutPayload: any = {
        payoutPixKey: pixSettings.payoutPixKey || undefined,
        payoutPixKeyType: pixSettings.payoutPixKey ? pixSettings.payoutPixKeyType : undefined,
        payoutBankCode: bankAccount.payoutBankCode || undefined,
        payoutBankAgency: bankAccount.payoutBankAgency || undefined,
        payoutBankAccount: bankAccount.payoutBankAccount || undefined,
        payoutBankAccountDigit: bankAccount.payoutBankAccountDigit || undefined,
        payoutBankOwnerName: bankAccount.payoutBankOwnerName || undefined,
        payoutBankCpfCnpj: bankAccount.payoutBankCpfCnpj || undefined,
        payoutBankAccountType: bankAccount.payoutBankAccountType || undefined,
      }

      const hasPayoutData = Object.values(payoutPayload).some(value => !!value)
      const hasExistingDocs = documents.some(doc => !!doc.existingFileName)

      // 2) Validações específicas de documentos antes do envio
      const requiredBaseIds = ['cnpj-cpf', 'bank-account', 'identity', 'address-proof']
      const requiredIds = isVeterinarian ? [...requiredBaseIds, 'crmv'] : requiredBaseIds

      if (!hasExistingDocs) {
        // Primeiro envio: todos os documentos obrigatórios devem ser enviados
        const missingRequired = requiredIds.filter(id => {
          const doc = documents.find(d => d.id === id)
          return !doc?.file
        })
        if (missingRequired.length > 0) {
          toast.error('Para o primeiro envio, é obrigatório enviar todos os documentos solicitados.')
          return
        }
      }

      if (isVeterinarian) {
        const crmvDoc = documents.find(doc => doc.id === 'crmv')
        const hasValidCrmvExisting =
          crmvDoc?.existingStatus === 'APPROVED' || crmvDoc?.existingStatus === 'PENDING'
        const hasNewCrmv = !!crmvDoc?.file
        if (!hasValidCrmvExisting && !hasNewCrmv) {
          toast.error('Para profissionais veterinários, o envio do CRMV é obrigatório.')
          return
        }
      }

      // 3) Enviar documentos de KYC (quando aplicável)
      const hasAnyFile = documents.some(doc => doc.file)
      if (hasExistingDocs) {
        // Reenvio: precisa ter ao menos um documento novo OU alteração de dados bancários
        if (!hasAnyFile && !hasPayoutData) {
          toast.error('Envie pelo menos um documento atualizado ou altere seus dados bancários para continuar.')
          return
        }
      } else {
        // Primeiro envio: docs já foram validados acima, aqui só garantimos consistência
        if (!hasAnyFile) {
          toast.error('Envie pelo menos um documento para continuar.')
          return
        }
      }

      // 4) Atualizar dados bancários / PIX da empresa (somente se houve preenchimento)
      if (hasPayoutData) {
        const payoutResult = await companiesService.updateMyCompany(payoutPayload)
        if (!payoutResult.success) {
          toast.error(payoutResult.error || 'Erro ao salvar dados bancários para saque.')
          return
        }
      }

      // Se não há nenhum arquivo novo e só houve alteração bancária, encerramos aqui
      if (!hasAnyFile && hasPayoutData) {
        toast.success('Dados bancários atualizados com sucesso.')
        return
      }

      const uploadResults: { type: string; fileId: string }[] = []

      for (const doc of documents) {
        if (!doc.file) continue

        const mappedType = mapFieldIdToKycType(doc.id)
        if (!mappedType) continue

        const upload = await filesService.upload(doc.file as any, 'DOCUMENT', doc.label)
        if (!upload.success || !upload.data) {
          toast.error(`Erro ao enviar arquivo de ${doc.label}.`)
          return
        }

        uploadResults.push({
          type: mappedType,
          fileId: upload.data.id,
        })
      }

      if (!uploadResults.length) {
        toast.error('Envie pelo menos um documento válido para continuar.')
        return
      }

      const response = await kycDocumentsService.salvarMeusDocumentos({
        documents: uploadResults,
      })

      if (!response.success || !response.data) {
        toast.error(response.error || 'Erro ao salvar documentos para análise.')
        return
      }

      const { status: backendStatus, documents: backendDocuments } = response.data
      setStatus(mapBackendStatusToUi(backendStatus))
      setIsEditingDocuments(backendStatus !== 'APPROVED')

      const existingByType: Record<string, ExistingKycDocument> = {}
      backendDocuments.forEach((doc: ExistingKycDocument) => {
        existingByType[doc.type] = doc
      })

      setDocuments(prev =>
        prev.map(item => {
          const mappedType = mapFieldIdToKycType(item.id)
          const existing = mappedType ? existingByType[mappedType] : undefined
          if (!existing) {
            return { ...item, file: undefined }
          }
          return {
            ...item,
            file: undefined,
            existingId: existing.id,
            existingFileName: existing.file?.fileName,
            existingFileUrl: existing.file?.url,
            existingStatus: existing.status,
            existingMimeType: existing.file?.mimeType,
            existingUploadedAt: existing.createdAt,
            existingFeedback: existing.feedback,
          }
        }),
      )

      toast.success('Documentos enviados para análise com sucesso.')
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao enviar documentos para análise.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const completedSteps = (() => {
    switch (status) {
      case 'pendente':
        return 1
      case 'em-analise':
        return 2
      case 'aprovado':
        return 3
      case 'reprovado':
        return 3
      default:
        return 1
    }
  })()

  const progressValue = (completedSteps / 3) * 100

  const renderStatusBadge = () => {
    if (status === 'pendente') {
      return <Badge variant="outline">Envio pendente</Badge>
    }
    if (status === 'em-analise') {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          Em análise
        </Badge>
      )
    }
    if (status === 'aprovado') {
      return (
        <Badge className="gap-1">
          <ShieldCheck className="h-3 w-3" />
          Aprovado
        </Badge>
      )
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Reprovado
      </Badge>
    )
  }

  const renderStatusBanner = () => {
    if (status === 'pendente') {
      return (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs sm:text-sm text-amber-900">
          Estamos aguardando o envio dos seus documentos. Quanto antes você enviar, mais rápido conseguimos liberar seus saques e agendamentos.
        </div>
      )
    }
    if (status === 'em-analise') {
      return (
        <div className="rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs sm:text-sm text-sky-900">
          Seus documentos foram recebidos e estão em análise pelo time AuMigoPet. Você será notificado assim que houver uma decisão.
        </div>
      )
    }
    if (status === 'aprovado') {
      return (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs sm:text-sm text-emerald-900">
          Seu KYC foi aprovado. Você pode utilizar normalmente a plataforma.
        </div>
      )
    }
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs sm:text-sm text-red-900">
        Um ou mais documentos foram reprovados. Revise os arquivos indicados abaixo, confira o motivo da reprovação e envie novamente para uma nova análise.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 space-y-0">
          <CardTitle className="text-base sm:text-lg">
            Envio de documentos para KYC
          </CardTitle>
          <CardDescription>
            Envie os documentos necessários para validação do seu cadastro
            profissional.
          </CardDescription>
          <div className="mt-3 flex items-center justify-start">
            {renderStatusBadge()}
          </div>
          <div className="mt-2">
            {renderStatusBanner()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEditingDocuments && status === 'aprovado' ? (
            <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Documentos aprovados
                </p>
                <p className="text-xs text-muted-foreground">
                  Seus documentos de verificação foram aprovados. Caso precise atualizar alguma informação,
                  você pode enviar novamente os documentos para uma nova análise.
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center">
                <Badge className="gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  KYC aprovado
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={() => setIsEditingDocuments(true)}
                >
                  <UploadCloud className="h-4 w-4" />
                  Enviar novamente
                </Button>
              </div>
            </div>
          ) : (
            <>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-muted-foreground">
                Jornada de verificação
              </span>
              <span className="text-xs text-muted-foreground">
                {Math.round(progressValue)}% concluído
              </span>
            </div>
            <Progress value={progressValue} />
            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full border flex items-center justify-center bg-background">
                  <FileText className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Preenchimento</p>
                  <p>Dados pessoais e da empresa</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full border flex items-center justify-center bg-background">
                  <UploadCloud className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Envio</p>
                  <p>Documentos para validação</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full border flex items-center justify-center bg-background">
                  <ShieldCheck className="h-3 w-3" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Análise</p>
                  <p>Aprovação do time AuMigoPet</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-lg border bg-muted/40 p-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Stethoscope className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-foreground">Profissional é veterinário?</p>
                <p className="text-xs text-muted-foreground sm:text-xs">
                  Ative se o profissional atuar como médico(a) veterinário(a) e precisar enviar o CRMV.
                </p>
              </div>
            </div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Sou veterinário</span>
              <Switch checked={isVeterinarian} onCheckedChange={setIsVeterinarian} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <KycUploadField
              icon={FileText}
              title="CNPJ / CPF"
              description="Documento oficial que comprove o CNPJ (para clínicas/empresas) ou CPF (para profissionais autônomos)."
              hint="Formatos aceitos: PDF, JPG ou PNG. Tamanho máximo 10 MB."
              selected={documents.find(d => d.id === 'cnpj-cpf')}
              onFileChange={file => handleFileChange('cnpj-cpf', file)}
              onRemoveExisting={
                documents.find(d => d.id === 'cnpj-cpf')?.existingStatus !== 'APPROVED'
                  ? () => handleRemoveExistingDocument('cnpj-cpf')
                  : undefined
              }
            />

            <KycUploadField
              icon={Banknote}
              title="Conta bancária para saque"
              description="Comprovante ou extrato contendo banco, agência, conta e CPF/CNPJ do titular."
              hint="Use um PDF ou imagem legível do comprovante."
              selected={documents.find(d => d.id === 'bank-account')}
              onFileChange={file => handleFileChange('bank-account', file)}
              onRemoveExisting={
                documents.find(d => d.id === 'bank-account')?.existingStatus !== 'APPROVED'
                  ? () => handleRemoveExistingDocument('bank-account')
                  : undefined
              }
            />

            <KycUploadField
              icon={IdCard}
              title="Documento oficial com foto"
              description="RG ou CNH em bom estado e dentro da validade. Para veterinários, será necessário enviar também o CRMV."
              hint="Envie frente e verso se aplicável, no mesmo arquivo ou em até dois arquivos."
              selected={documents.find(d => d.id === 'identity')}
              onFileChange={file => handleFileChange('identity', file)}
              onRemoveExisting={
                documents.find(d => d.id === 'identity')?.existingStatus !== 'APPROVED'
                  ? () => handleRemoveExistingDocument('identity')
                  : undefined
              }
            />

            {isVeterinarian && (
              <KycUploadField
                icon={Stethoscope}
                title="CRMV (somente veterinários)"
                description="Envie o documento que comprove seu registro ativo no CRMV do seu estado."
                hint="Envie um PDF ou imagem legível do CRMV, com número e UF visíveis."
                selected={documents.find(d => d.id === 'crmv')}
                onFileChange={file => handleFileChange('crmv', file)}
                onRemoveExisting={
                  documents.find(d => d.id === 'crmv')?.existingStatus !== 'APPROVED'
                    ? () => handleRemoveExistingDocument('crmv')
                    : undefined
                }
              />
            )}

            <KycUploadField
              icon={Home}
              title="Comprovante de residência"
              description="Conta de consumo (água, luz, internet) emitida há no máximo 90 dias."
              hint="Certifique-se de que o endereço esteja legível e atualizado."
              selected={documents.find(d => d.id === 'address-proof')}
              onFileChange={file => handleFileChange('address-proof', file)}
              onRemoveExisting={
                documents.find(d => d.id === 'address-proof')?.existingStatus !== 'APPROVED'
                  ? () => handleRemoveExistingDocument('address-proof')
                  : undefined
              }
            />
          </div>

          <div className="space-y-4 rounded-lg border bg-muted/40 p-3 sm:p-4">
            <div>
              <p className="text-sm font-medium text-foreground">
                Dados bancários para saque
              </p>
              <p className="text-xs text-muted-foreground">
                Informe as opções de recebimento que você usará para saques (PIX e/ou TED). Esses dados podem ser ajustados também em Configurações &gt; Pagamento.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Chave PIX (opcional)
                </p>
                <PixFields value={pixSettings} onChange={setPixSettings} />
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">
                  Conta bancária para TED (opcional)
                </p>
                <BankAccountFields value={bankAccount} onChange={setBankAccount} />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
            <p className="text-muted-foreground">
              Após o envio, nossa equipe revisará seus documentos em até{' '}
              <span className="font-medium text-foreground">
                2 dias úteis
              </span>
              . Você será notificado em caso de aprovação ou necessidade de
              ajustes.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Dica: mantenha seus dados sempre atualizados para evitar
              bloqueios em saques e agendamentos.
            </p>
            <Button
              className="w-full sm:w-auto"
              onClick={handleSubmitDocuments}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enviando documentos...' : 'Enviar documentos para análise'}
            </Button>
          </div>
          </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface KycUploadFieldProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  hint: string
  selected?: SelectedFile
  onFileChange: (file?: File) => void
  onRemoveExisting?: () => void
}

function KycUploadField({
  icon: Icon,
  title,
  description,
  hint,
  selected,
  onFileChange,
  onRemoveExisting,
}: KycUploadFieldProps) {
  const handleChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0]
    onFileChange(file)
  }

  const resolveFileIcon = (mimeType?: string, fileName?: string) => {
    const lower = (mimeType || fileName || '').toLowerCase()
    if (lower.includes('image') || lower.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
      return FileImage
    }
    if (
      lower.includes('sheet') ||
      lower.includes('excel') ||
      lower.match(/\.(xls|xlsx|csv)$/)
    ) {
      return FileSpreadsheet
    }
    if (lower.includes('pdf') || lower.endsWith('.pdf')) {
      return FileText
    }
    return FileGeneric
  }

  const formatDateTime = (iso?: string) => {
    if (!iso) return ''
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isApproved = selected?.existingStatus === 'APPROVED'
  const isRejected = selected?.existingStatus === 'REJECTED'

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-card/40 p-3 sm:p-4">
      {/* Cabeçalho: ícone + título + descrição (descrição limitada a 2 linhas) */}
      <div className="flex gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 space-y-0.5">
          <p className="text-sm font-medium leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      <div className="space-y-2 min-w-0">
        {selected?.existingStatus !== 'APPROVED' && (
          <>
            <Label className="text-xs">Arquivo</Label>
            <div className="min-w-0">
              <Input
                type="file"
                accept=".pdf,image/*"
                className="text-xs file:text-xs max-w-full"
                onChange={handleChange}
              />
            </div>
          </>
        )}
        {selected?.file ? (
          <p className="truncate text-xs text-foreground">
            Selecionado: <span className="font-medium">{selected.file.name}</span>
          </p>
        ) : selected?.existingFileName ? (
          <div className="space-y-2 min-w-0">
            {/* Linha 1: ícone do arquivo + data + badge (aprovado) */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {(() => {
                const IconFile = resolveFileIcon(
                  selected.existingMimeType,
                  selected.existingFileName,
                )
                return (
                  <span className="flex items-center gap-1.5 text-xs text-foreground">
                    <IconFile className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="whitespace-nowrap">
                      Enviado em {formatDateTime(selected.existingUploadedAt) || '—'}
                    </span>
                  </span>
                )
              })()}
              {isApproved && (
                <Badge className="shrink-0 bg-green-600 text-xs text-white hover:bg-green-700">
                  Aprovado
                </Badge>
              )}
            </div>
            {/* Linha 2: hint em uma linha */}
            <p className="text-xs text-muted-foreground">
              {isApproved
                ? 'Apenas download disponível.'
                : 'Você pode enviar um novo arquivo para atualizar.'}
            </p>
            {/* Linha 3: ações (Download + Remover) sempre em linha */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {selected.existingFileUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 px-2.5 text-xs"
                  onClick={() => {
                    window.open(selected.existingFileUrl, '_blank', 'noopener,noreferrer')
                  }}
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              )}
              {onRemoveExisting && !isApproved && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="shrink-0 text-xs text-red-600 hover:underline"
                    >
                      Remover documento
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover documento</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação irá remover o documento atual deste tipo. Você poderá enviar
                        outro arquivo em seguida, mas essa remoção não poderá ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={onRemoveExisting}
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            {isRejected && selected.existingFeedback && (
              <div
                className="rounded border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-900 line-clamp-2"
                title={selected.existingFeedback}
              >
                <span className="font-semibold">Motivo:</span> {selected.existingFeedback}
              </div>
            )}
          </div>
        ) : (
          selected?.existingStatus !== 'APPROVED' && (
            <p className="text-xs text-muted-foreground line-clamp-2">{hint}</p>
          )
        )}
      </div>
    </div>
  )
}