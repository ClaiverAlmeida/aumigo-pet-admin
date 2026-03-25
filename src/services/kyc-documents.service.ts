import { api } from './api.service';

export interface KycDocument {
  id: string;
  type: string; // RG, SELFIE, PROOF_OF_ADDRESS, CNPJ, OTHER
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback?: string;
  fileId: string;
  providerId: string;
  companyId?: string;
  reviewedById?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  // Relacionamentos
  file?: {
    id: string;
    fileName: string;
    url: string;
  };
  provider?: {
    id: string;
    name: string;
  };
  companyName?: string;
  companyCity?: string | null;
  companyState?: string | null;
  companyCnpj?: string | null;
  reviewedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ProfessionalProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  bio: string;
  cnpj?: string;
  avatarUrl?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface CreateKycDocumentDto {
  type: string;
  providerId: string;
  fileId: string;
  status?: string;
  feedback?: string;
}

export interface UpdateKycDocumentDto {
  status?: string;
  feedback?: string;
  reviewedById?: string;
}

export interface MyKycDocumentsResponse {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  documents: KycDocument[];
}

export interface CreateMyKycDocumentsDto {
  documents: {
    type: string;
    fileId: string;
  }[];
  notes?: string;
}

/**
 * 🆔 SERVIÇO DE KYC DOCUMENTS
 * Gerencia documentos KYC dos profissionais
 */
export class KycDocumentsService {
  /**
   * Listar documentos KYC
   */
  async list(filters?: {
    providerId?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    return api.get<KycDocument[]>('/kyc-documents', {
      params: { page: 1, limit: 50, ...filters },
      useCache: true,
      cacheTtl: 60000, // 1 minuto
    });
  }

  /**
   * Buscar documento por ID
   */
  async getById(id: string) {
    return api.get<KycDocument>(`/kyc-documents/${id}`);
  }

  /**
   * Buscar documentos por provider
   */
  async getByProviderId(providerId: string) {
    return api.get<KycDocument[]>('/kyc-documents', {
      params: { providerId },
      useCache: true,
      cacheTtl: 60000,
    });
  }

  /**
   * Criar novo documento KYC
   */
  async create(data: CreateKycDocumentDto) {
    return api.post<KycDocument>('/kyc-documents', data);
  }

  /**
   * Atualizar documento KYC
   */
  async update(id: string, data: UpdateKycDocumentDto) {
    return api.patch<KycDocument>(`/kyc-documents/${id}`, data);
  }

  /**
   * Aprovar documento
   */
  async approve(id: string, reviewedById?: string) {
    return api.patch<KycDocument>(`/kyc-documents/${id}`, {
      status: 'APPROVED',
      reviewedById,
    });
  }

  /**
   * Rejeitar documento
   */
  async reject(id: string, feedback: string, reviewedById?: string) {
    return api.patch<KycDocument>(`/kyc-documents/${id}`, {
      status: 'REJECTED',
      feedback,
      reviewedById,
    });
  }

  /**
   * Deletar documento
   */
  async delete(id: string) {
    return api.delete(`/kyc-documents/${id}`);
  }

  /**
   * Deletar documento do profissional logado por tipo (fluxo "meu KYC")
   */
  async deleteMyDocument(type: string) {
    const response = await api.delete<{ data: MyKycDocumentsResponse }>(
      `/kyc-documents/me/${type}`,
    );

    if (!response.success || !response.data) {
      return response as any;
    }

    return {
      ...response,
      data: (response.data as any).data ?? (response.data as any),
    } as { success: boolean; data?: MyKycDocumentsResponse; error?: string };
  }

  /**
   * Salvar documentos de KYC do profissional logado (fluxo "meu KYC")
   */
  async salvarMeusDocumentos(data: CreateMyKycDocumentsDto) {
    const response = await api.post<{ data: MyKycDocumentsResponse }>(
      '/kyc-documents/me',
      data,
    );

    if (!response.success || !response.data) {
      return response as any;
    }

    return {
      ...response,
      data: response.data.data,
    };
  }

  /**
   * Buscar documentos de KYC do profissional logado + status agregado
   */
  async buscarMeusDocumentos() {
    const response = await api.get<{ data: MyKycDocumentsResponse }>(
      '/kyc-documents/me',
      {
        useCache: false,
      },
    );

    if (!response.success || !response.data) {
      return response as any;
    }

    return {
      ...response,
      data: response.data.data,
    };
  }
}

export const kycDocumentsService = new KycDocumentsService();
