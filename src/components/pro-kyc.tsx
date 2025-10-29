import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Progress } from './ui/progress'
import { Alert, AlertDescription } from './ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { ImageWithFallback } from './figma/ImageWithFallback'
import { 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Camera,
  Home,
  User,
  Building,
  AlertTriangle,
  Eye,
  Trash2
} from 'lucide-react'

type KycStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

interface KycDocument {
  id: string
  kind: string
  fileName: string
  fileUrl: string
  status: KycStatus
  feedback?: string
  uploadedAt: string
}

interface ProfessionalProfile {
  name: string
  email: string
  phone: string
  bio: string
  cnpj: string
  avatarUrl: string
  address: {
    street: string
    city: string
    state: string
    zip: string
  }
  kycStatus: KycStatus
}

const mockProfile: ProfessionalProfile = {
  name: 'Maria Souza',
  email: 'maria@email.com', 
  phone: '(11) 99999-9999',
  bio: 'Profissional especializada em banho e tosa com 5 anos de experiência. Trabalho com muito carinho e dedicação para o bem-estar dos pets.',
  cnpj: '12.345.678/0001-90',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  address: {
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zip: '01234-567'
  },
  kycStatus: 'PENDING'
}

const mockDocuments: KycDocument[] = [
  {
    id: '1',
    kind: 'rg',
    fileName: 'RG_frente.jpg',
    fileUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=150&fit=crop',
    status: 'APPROVED',
    uploadedAt: '2025-09-01'
  },
  {
    id: '2', 
    kind: 'selfie',
    fileName: 'Selfie_documento.jpg',
    fileUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=150&fit=crop&crop=face',
    status: 'PENDING',
    uploadedAt: '2025-09-02'
  },
  {
    id: '3',
    kind: 'comprovante',
    fileName: 'Comprovante_residencia.pdf',
    fileUrl: '/placeholder-document.png',
    status: 'REJECTED',
    feedback: 'Documento ilegível. Favor enviar uma versão com melhor qualidade.',
    uploadedAt: '2025-09-03'
  }
]

const documentTypes = [
  { key: 'rg', label: 'RG ou CNH', icon: User, description: 'Documento de identidade com foto' },
  { key: 'selfie', label: 'Selfie com Documento', icon: Camera, description: 'Foto sua segurando o documento' },
  { key: 'comprovante', label: 'Comprovante de Residência', icon: Home, description: 'Conta de luz, água ou telefone (últimos 3 meses)' },
  { key: 'cnpj', label: 'Comprovante de CNPJ', icon: Building, description: 'Cartão CNPJ ou contrato social (opcional)' }
]

export function ProKYC() {
  const [profile, setProfile] = useState<ProfessionalProfile>(mockProfile)
  const [documents, setDocuments] = useState<KycDocument[]>(mockDocuments)
  const [isEditing, setIsEditing] = useState(false)

  const handleProfileChange = (field: string, value: string) => {
    setProfile(prev => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.')
        return {
          ...prev,
          [parent]: {
            ...prev[parent as keyof typeof prev],
            [child]: value
          }
        }
      }
      return { ...prev, [field]: value }
    })
  }

  const completionPercentage = () => {
    const requiredDocs = ['rg', 'selfie', 'comprovante']
    const approvedDocs = documents.filter(doc => 
      requiredDocs.includes(doc.kind) && doc.status === 'APPROVED'
    )
    return Math.round((approvedDocs.length / requiredDocs.length) * 100)
  }

  const getStatusIcon = (status: KycStatus) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: KycStatus) => {
    const variants = {
      APPROVED: 'default',
      REJECTED: 'destructive', 
      PENDING: 'secondary'
    } as const

    const labels = {
      APPROVED: 'Aprovado',
      REJECTED: 'Rejeitado',
      PENDING: 'Pendente'
    }

    return (
      <Badge 
        variant={variants[status]}
        className={
          status === 'APPROVED' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
          status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''
        }
      >
        {labels[status]}
      </Badge>
    )
  }

  const handleFileUpload = (docType: string) => {
    // Simular upload de arquivo
    const newDoc: KycDocument = {
      id: Date.now().toString(),
      kind: docType,
      fileName: `${docType}_${Date.now()}.jpg`,
      fileUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=200&h=150&fit=crop',
      status: 'PENDING',
      uploadedAt: new Date().toISOString().split('T')[0]
    }

    setDocuments([...documents.filter(d => d.kind !== docType), newDoc])
  }

  const handleDeleteDocument = (docId: string) => {
    setDocuments(documents.filter(d => d.id !== docId))
  }

  return (
    <div className="p-10 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2>KYC & Perfil Profissional</h2>
          <p className="text-muted-foreground">Complete sua verificação para começar a receber clientes</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Progress value={completionPercentage()} className="w-32" />
          <span className="text-sm font-medium">{completionPercentage()}%</span>
        </div>
      </div>

      {/* Status Geral */}
      <Alert className={profile.kycStatus === 'REJECTED' ? 'border-red-200' : ''}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <strong>Status da Verificação:</strong> {getStatusBadge(profile.kycStatus)}
              {profile.kycStatus === 'PENDING' && (
                <span className="ml-2">Seus documentos estão sendo analisados. Isso pode levar até 48 horas.</span>
              )}
              {profile.kycStatus === 'REJECTED' && (
                <span className="ml-2 text-red-600">Alguns documentos foram rejeitados. Verifique abaixo e reenvie.</span>
              )}
            </div>
            {profile.kycStatus === 'APPROVED' && (
              <Badge variant="default" className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Perfil Profissional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Dados Profissionais
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            </CardTitle>
            <CardDescription>Informações básicas do seu perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile.avatarUrl} />
                <AvatarFallback>{profile.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <Input 
                      value={profile.name} 
                      placeholder="Nome completo"
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                    />
                    <Input 
                      value={profile.phone} 
                      placeholder="Telefone"
                      onChange={(e) => handleProfileChange('phone', e.target.value)}
                    />
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.phone}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label>Bio Profissional</Label>
              {isEditing ? (
                <Textarea 
                  value={profile.bio}
                  placeholder="Conte sobre sua experiência..."
                  rows={4}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                />
              ) : (
                <p className="text-sm bg-muted p-3 rounded-md mt-1">{profile.bio}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>CNPJ (opcional)</Label>
                {isEditing ? (
                  <Input 
                    value={profile.cnpj} 
                    placeholder="00.000.000/0001-00"
                    onChange={(e) => handleProfileChange('cnpj', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-mono">{profile.cnpj || 'Não informado'}</p>
                )}
              </div>
              <div>
                <Label>CEP</Label>
                {isEditing ? (
                  <Input 
                    value={profile.address.zip} 
                    placeholder="00000-000"
                    onChange={(e) => handleProfileChange('address.zip', e.target.value)}
                  />
                ) : (
                  <p className="text-sm font-mono">{profile.address.zip}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Endereço Completo</Label>
              {isEditing ? (
                <div className="space-y-2">
                  <Input 
                    value={profile.address.street} 
                    placeholder="Rua, número"
                    onChange={(e) => handleProfileChange('address.street', e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input 
                      value={profile.address.city} 
                      placeholder="Cidade"
                      onChange={(e) => handleProfileChange('address.city', e.target.value)}
                    />
                    <Input 
                      value={profile.address.state} 
                      placeholder="UF"
                      onChange={(e) => handleProfileChange('address.state', e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  <p>{profile.address.street}</p>
                  <p>{profile.address.city} - {profile.address.state}</p>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  Salvar Alterações
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documentos KYC */}
        <Card>
          <CardHeader>
            <CardTitle>Documentos de Verificação</CardTitle>
            <CardDescription>
              Envie os documentos necessários para verificar sua identidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {documentTypes.map((docType) => {
              const Icon = docType.icon
              const existingDoc = documents.find(d => d.kind === docType.key)
              
              return (
                <div key={docType.key} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{docType.label}</p>
                        <p className="text-xs text-muted-foreground">{docType.description}</p>
                      </div>
                    </div>
                    
                    {existingDoc && (
                      <div className="flex items-center gap-2">
                        {getStatusIcon(existingDoc.status)}
                        {getStatusBadge(existingDoc.status)}
                      </div>
                    )}
                  </div>

                  {existingDoc ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                        {existingDoc.kind !== 'cnpj' && (
                          <ImageWithFallback
                            src={existingDoc.fileUrl}
                            alt={existingDoc.fileName}
                            width={48}
                            height={36}
                            className="rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{existingDoc.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            Enviado em {new Date(existingDoc.uploadedAt).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDeleteDocument(existingDoc.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {existingDoc.feedback && (
                        <Alert variant="destructive">
                          <AlertDescription className="text-sm">
                            <strong>Feedback:</strong> {existingDoc.feedback}
                          </AlertDescription>
                        </Alert>
                      )}

                      {existingDoc.status === 'REJECTED' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleFileUpload(docType.key)}
                          className="w-full"
                        >
                          <Upload className="w-3 h-3 mr-2" />
                          Reenviar Documento
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => handleFileUpload(docType.key)}
                      className="w-full"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Enviar {docType.label}
                    </Button>
                  )}
                </div>
              )
            })}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900">Dicas importantes:</p>
                  <ul className="text-blue-700 mt-1 space-y-1">
                    <li>• Fotos devem estar nítidas e bem iluminadas</li>
                    <li>• Documentos não devem estar vencidos</li>
                    <li>• A selfie deve mostrar claramente seu rosto e o documento</li>
                    <li>• Arquivos em JPG, PNG ou PDF até 5MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}