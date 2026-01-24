import { api } from "./api.service";

export interface Service {
  id: string;
  name: string;
  category?: string;
  description?: string;
  price?: number;
  duration?: number;
  isActive: boolean;
  imageUrl?: string;
  providerId: string;
  companyId?: string;
  provider?: {
    id: string;
    name: string;
    category: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServiceData {
  name: string;
  category?: string;
  description?: string;
  price?: number;
  duration?: number;
  isActive?: boolean;
  imageUrl?: string;
  // companyId será adicionado automaticamente pelo backend
}

export interface UpdateServiceData extends Partial<CreateServiceData> {}

export class ServicesService {
  /**
   * Listar todos os serviços da empresa do usuário logado
   * O backend filtra automaticamente pela companyId do usuário
   * Retorna { data: Service[], pagination: {...} } ou Service[] direto
   */
  async list(): Promise<{ success: boolean; data?: Service[] | { data: Service[]; pagination: any }; error?: string }> {
    return api.get<Service[] | { data: Service[]; pagination: any }>("/services");
  }

  /**
   * Buscar um serviço por ID
   */
  async getById(id: string): Promise<{ success: boolean; data?: Service; error?: string }> {
    return api.get<Service>(`/services/${id}`);
  }

  /**
   * Criar novo serviço
   */
  async create(data: CreateServiceData): Promise<{ success: boolean; data?: Service; error?: string }> {
    return api.post<Service>("/services", data);
  }

  /**
   * Atualizar serviço
   */
  async update(id: string, data: UpdateServiceData): Promise<{ success: boolean; data?: Service; error?: string }> {
    return api.patch<Service>(`/services/${id}`, data);
  }

  /**
   * Deletar serviço
   */
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    return api.delete(`/services/${id}`);
  }

  /**
   * Toggle status ativo/inativo
   */
  async toggleActive(id: string, isActive: boolean): Promise<{ success: boolean; data?: Service; error?: string }> {
    return api.patch<Service>(`/services/${id}`, { isActive });
  }
}

export const servicesService = new ServicesService();
