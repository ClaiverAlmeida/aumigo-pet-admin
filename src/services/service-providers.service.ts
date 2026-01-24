import { api } from "./api.service";

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  description?: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  status: string;
  companyId: string;
  ownerId: string;
  servicesCount?: number;
  averageRating?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceProviderData {
  name: string;
  category: string;
  description?: string;
  logo?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // companyId será adicionado automaticamente pelo backend
  // ownerId será adicionado automaticamente pelo backend
}

export interface UpdateServiceProviderData extends Partial<CreateServiceProviderData> {}

export class ServiceProvidersService {
  /**
   * Listar todos os providers da empresa do usuário logado
   * O backend filtra automaticamente pela companyId do usuário
   */
  async list(): Promise<{ success: boolean; data?: ServiceProvider[] | { data: ServiceProvider[]; pagination: any }; error?: string }> {
    return api.get<ServiceProvider[] | { data: ServiceProvider[]; pagination: any }>("/service-providers");
  }

  /**
   * Buscar um provider por ID
   */
  async getById(id: string): Promise<{ success: boolean; data?: ServiceProvider; error?: string }> {
    return api.get<ServiceProvider>(`/service-providers/${id}`);
  }

  /**
   * Criar novo provider
   */
  async create(data: CreateServiceProviderData): Promise<{ success: boolean; data?: ServiceProvider; error?: string }> {
    return api.post<ServiceProvider>("/service-providers", data);
  }

  /**
   * Atualizar provider
   */
  async update(id: string, data: UpdateServiceProviderData): Promise<{ success: boolean; data?: ServiceProvider; error?: string }> {
    return api.patch<ServiceProvider>(`/service-providers/${id}`, data);
  }

  /**
   * Deletar provider
   */
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    return api.delete(`/service-providers/${id}`);
  }
}

export const serviceProvidersService = new ServiceProvidersService();
