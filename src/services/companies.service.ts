import { api } from './api.service';

export interface Company {
  id: string;
  name: string;
  logo?: string;
  address?: string;
  addressNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  cnpj?: string;
  deletedAt?: string | null;
  /** Especialidade principal (ServiceCategory) */
  primaryCategory?: string;
  /** Dados para repasse (recebimento de saques) */
  payoutPixKey?: string;
  payoutPixKeyType?: string;
  payoutBankCode?: string;
  payoutBankAgency?: string;
  payoutBankAccount?: string;
  payoutBankAccountDigit?: string;
  payoutBankOwnerName?: string;
  payoutBankCpfCnpj?: string;
  payoutBankAccountType?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Horário de funcionamento (JSON). */
  openingHours?: unknown;
  paymentFlowType?: 'INSTANT_BOOKING' | 'AFTER_PROVIDER_CONFIRMATION' | 'NEGOTIATED_VIA_CHAT';
}

/** Item da lista de empresas no admin (com contagens) */
export interface CompanyListItem extends Company {
  usersCount: number;
  serviceProvidersCount: number;
}

export interface UpdateCompanyData {
  name?: string;
  logo?: string;
  address?: string;
  addressNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  cnpj?: string;
  primaryCategory?: string;
  payoutPixKey?: string;
  payoutPixKeyType?: string;
  payoutBankCode?: string;
  payoutBankAgency?: string;
  payoutBankAccount?: string;
  payoutBankAccountDigit?: string;
  payoutBankOwnerName?: string;
  payoutBankCpfCnpj?: string;
  payoutBankAccountType?: string;
  paymentFlowType?: 'INSTANT_BOOKING' | 'AFTER_PROVIDER_CONFIRMATION' | 'NEGOTIATED_VIA_CHAT';
}

/** Dados de repasse da empresa (somente para admin visualizar). GET /companies/:id/payout-details */
export interface CompanyPayoutDetails {
  payoutPixKey?: string | null;
  payoutPixKeyType?: string | null;
  payoutBankCode?: string | null;
  payoutBankAgency?: string | null;
  payoutBankAccount?: string | null;
  payoutBankAccountDigit?: string | null;
  payoutBankOwnerName?: string | null;
  payoutBankCpfCnpj?: string | null;
  payoutBankAccountType?: string | null;
}

/** Resposta do endpoint GET /companies/me/balance ou GET /companies/:id/balance */
export interface CompanyBalance {
  saldoBruto: number;
  taxas: number;
  taxaGateway?: number;
  taxaPlataforma?: number;
  saldoLiquido: number;
  totalRepassado: number;
  saldoDisponivel: number;
  totalPagamentos: number;
  totalRepasses: number;
  /** True se existe repasse em PENDING_APPROVAL, SCHEDULED ou PROCESSING (bloqueia nova solicitação). */
  hasPendingPayout?: boolean;
}

export class CompaniesService {
  /**
   * Busca os dados da empresa do usuário logado
   * O backend filtra automaticamente pela companyId do usuário
   */
  async getMyCompany(): Promise<{ success: boolean; data?: Company; error?: string }> {
    try {
      // Backend retorna { data: { ... } }
      const result = await api.get<{ data: Company }>('/companies/me', {
        useCache: true,
        cacheTtl: 5 * 60 * 1000, // 5 minutos
      });

      if (result.success && result.data) {
        // O api.get retorna { success: true, data: response.data }
        // O backend retorna { data: { id, name, ... } }
        // Então result.data = { data: { id, name, ... } }
        const backendResponse = result.data as any;
        const companyData: any = backendResponse.data || backendResponse;
        
        if (companyData && companyData.id) {
          return { 
            success: true, 
            data: {
              id: companyData.id,
              name: companyData.name || '',
              logo: companyData.logo || '',
              address: companyData.address || '',
              addressNumber: companyData.addressNumber || '',
              city: companyData.city || '',
              state: companyData.state || '',
              zipCode: companyData.zipCode || '',
              contactPhone: companyData.contactPhone || '',
              contactEmail: companyData.contactEmail || '',
              website: companyData.website || '',
              cnpj: companyData.cnpj || '',
              primaryCategory: companyData.primaryCategory || '',
              payoutPixKey: companyData.payoutPixKey ?? '',
              payoutPixKeyType: companyData.payoutPixKeyType ?? '',
              payoutBankCode: companyData.payoutBankCode ?? '',
              payoutBankAgency: companyData.payoutBankAgency ?? '',
              payoutBankAccount: companyData.payoutBankAccount ?? '',
              payoutBankAccountDigit: companyData.payoutBankAccountDigit ?? '',
              payoutBankOwnerName: companyData.payoutBankOwnerName ?? '',
              payoutBankCpfCnpj: companyData.payoutBankCpfCnpj ?? '',
              payoutBankAccountType: companyData.payoutBankAccountType ?? '',
              paymentFlowType: companyData.paymentFlowType ?? 'INSTANT_BOOKING',
            }
          };
        }
      }

      return { success: false, error: 'Empresa não encontrada' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar empresa' };
    }
  }

  /**
   * Atualiza os dados da empresa do usuário logado
   */
  async updateMyCompany(data: UpdateCompanyData): Promise<{ success: boolean; data?: Company; error?: string }> {
    try {
      const result = await api.put<{ data: Company }>('/companies/me', data);

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const companyData: any = backendResponse.data || backendResponse;
        
        if (companyData && companyData.id) {
          return { 
            success: true, 
            data: {
              id: companyData.id,
              name: companyData.name,
              logo: companyData.logo,
              address: companyData.address,
              addressNumber: companyData.addressNumber,
              city: companyData.city,
              state: companyData.state,
              zipCode: companyData.zipCode,
              contactPhone: companyData.contactPhone,
              contactEmail: companyData.contactEmail,
              website: companyData.website,
              cnpj: companyData.cnpj,
              primaryCategory: companyData.primaryCategory,
              payoutPixKey: companyData.payoutPixKey,
              payoutPixKeyType: companyData.payoutPixKeyType,
              payoutBankCode: companyData.payoutBankCode,
              payoutBankAgency: companyData.payoutBankAgency,
              payoutBankAccount: companyData.payoutBankAccount,
              payoutBankAccountDigit: companyData.payoutBankAccountDigit,
              payoutBankOwnerName: companyData.payoutBankOwnerName,
              payoutBankCpfCnpj: companyData.payoutBankCpfCnpj,
              payoutBankAccountType: companyData.payoutBankAccountType,
              paymentFlowType: companyData.paymentFlowType,
            }
          };
        }
      }

      return { success: false, error: result.error || 'Erro ao atualizar empresa' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao atualizar empresa' };
    }
  }

  /**
   * Saldo da empresa. Sem companyId: GET /companies/me/balance; com id: GET /companies/:id/balance.
   * startDate/endDate (YYYY-MM-DD) opcionais para filtro mensal.
   */
  async getCompanyBalance(
    companyId?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<{ success: boolean; data?: CompanyBalance; error?: string }> {
    try {
      const path = companyId ? `/companies/${companyId}/balance` : '/companies/me/balance';
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const query = params.toString();
      const url = query ? `${path}?${query}` : path;
      const result = await api.get<CompanyBalance>(url);
      if (result.success && result.data) {
        return { success: true, data: result.data };
      }
      return { success: false, error: (result as any).error || 'Saldo não encontrado' };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message || 'Erro ao buscar saldo',
      };
    }
  }

  /**
   * Saldo global do sistema (todas as empresas). Apenas admin. GET /payments/balance/overview
   * startDate/endDate (YYYY-MM-DD) opcionais para filtro mensal.
   */
  async getGlobalBalance(
    startDate?: string,
    endDate?: string,
  ): Promise<{ success: boolean; data?: CompanyBalance; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const query = params.toString();
      const url = query ? `/payments/balance/overview?${query}` : '/payments/balance/overview';
      const result = await api.get<CompanyBalance>(url);
      if (result.success && result.data) {
        return { success: true, data: result.data };
      }
      return { success: false, error: (result as any).error || 'Saldo global não encontrado' };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message || 'Erro ao buscar saldo global',
      };
    }
  }

  /**
   * Dados de repasse da empresa (PIX ou conta). Apenas admin. GET /companies/:id/payout-details
   */
  async getCompanyPayoutDetails(
    companyId: string,
  ): Promise<{ success: boolean; data?: CompanyPayoutDetails | null; error?: string }> {
    try {
      const result = await api.get<{ data: CompanyPayoutDetails | null }>(
        `/companies/${companyId}/payout-details`,
      );
      if (result.success) {
        const raw = result.data as any;
        const data = raw?.data ?? raw ?? null;
        return { success: true, data: data ?? null };
      }
      return { success: false, error: (result as any).error || 'Dados não encontrados' };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message || 'Erro ao buscar dados de pagamento',
      };
    }
  }

  /**
   * Lista empresas (admin). GET /companies com paginação.
   */
  async listCompanies(
    page = 1,
    limit = 100,
  ): Promise<{ success: boolean; data?: { data: Company[]; total?: number }; error?: string }> {
    try {
      const result = await api.get<{ data: Company[]; total?: number }>(
        `/companies?page=${page}&limit=${limit}`,
      );
      if (result.success && result.data) {
        const raw = result.data as any;
        const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
        const total = raw?.pagination?.total ?? raw?.total ?? list.length;
        return { success: true, data: { data: list, total } };
      }
      return { success: false, error: 'Erro ao listar empresas' };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message || 'Erro ao listar empresas',
      };
    }
  }

  /**
   * Lista empresas para admin: ativas (activeOnly=true) ou inativas (activeOnly=false).
   * GET /companies/admin/list?activeOnly=&page=&limit=
   */
  async listCompaniesForAdmin(
    activeOnly: boolean,
    page = 1,
    limit = 50,
  ): Promise<{
    success: boolean;
    data?: { data: CompanyListItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      params.set('activeOnly', String(activeOnly));
      params.set('page', String(page));
      params.set('limit', String(limit));
      const result = await api.get<{ data: CompanyListItem[]; pagination: any }>(
        `/companies/admin/list?${params.toString()}`,
      );
      if (result.success && result.data) {
        const raw = result.data as any;
        const list = Array.isArray(raw?.data) ? raw.data : [];
        const pagination = raw?.pagination ?? { page: 1, limit: 50, total: list.length, totalPages: 1 };
        return { success: true, data: { data: list, pagination } };
      }
      return { success: false, error: 'Erro ao listar empresas' };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message || 'Erro ao listar empresas',
      };
    }
  }

  /**
   * Detalhe da empresa para admin (dados + usersCount, serviceProvidersCount).
   * GET /companies/admin/detail/:id
   */
  async getCompanyDetailForAdmin(
    companyId: string,
  ): Promise<{ success: boolean; data?: CompanyListItem; error?: string }> {
    try {
      const result = await api.get<{ data: CompanyListItem }>(
        `/companies/admin/detail/${companyId}`,
      );
      if (result.success && result.data) {
        const raw = result.data as any;
        const data = raw?.data ?? raw;
        return { success: true, data };
      }
      return { success: false, error: 'Empresa não encontrada' };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.message || error.message || 'Erro ao carregar empresa',
      };
    }
  }
}

export const companiesService = new CompaniesService();
