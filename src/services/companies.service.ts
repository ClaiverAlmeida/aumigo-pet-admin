import { api } from './api.service';

export interface Company {
  id: string;
  name: string;
  address?: string;
  addressNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  cnpj?: string;
}

export interface UpdateCompanyData {
  name?: string;
  address?: string;
  addressNumber?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  cnpj?: string;
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
              address: companyData.address || '',
              addressNumber: companyData.addressNumber || '',
              city: companyData.city || '',
              state: companyData.state || '',
              zipCode: companyData.zipCode || '',
              contactPhone: companyData.contactPhone || '',
              contactEmail: companyData.contactEmail || '',
              website: companyData.website || '',
              cnpj: companyData.cnpj || '',
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
              address: companyData.address,
              addressNumber: companyData.addressNumber,
              city: companyData.city,
              state: companyData.state,
              zipCode: companyData.zipCode,
              contactPhone: companyData.contactPhone,
              contactEmail: companyData.contactEmail,
              website: companyData.website,
              cnpj: companyData.cnpj,
            }
          };
        }
      }

      return { success: false, error: result.error || 'Erro ao atualizar empresa' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao atualizar empresa' };
    }
  }
}

export const companiesService = new CompaniesService();
