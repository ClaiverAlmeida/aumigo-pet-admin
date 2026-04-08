import { api } from './api.service';

/** Paginação no formato do backend (universal / users) */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/** Tutor na listagem (GET /users/tutores) */
export interface TutorListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  status: string;
  city: string | null;
  state: string | null;
  petsCount: number;
}

/** Profissional na listagem (GET /users/profissionais) */
export interface ProfessionalListItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  status: string;
  category: string;
  companyName: string;
  companyId: string;
}

/** Agendamento do tutor (resumo para admin) */
export interface TutorBookingItem {
  id: string;
  date: string;
  time: string;
  status: string;
  price?: number;
  service?: { id: string; name: string };
  provider?: { id: string; name: string };
  pet?: { id: string; name: string } | null;
}

/** Avaliação feita pelo tutor (resumo para admin) */
export interface TutorReviewItem {
  id: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  provider?: { id: string; name: string };
  company?: { id: string; name: string };
}

/** Favorito do tutor (resumo para admin) */
export interface TutorFavoriteItem {
  id: string;
  provider?: { id: string; name: string };
  company?: { id: string; name: string };
}

/** Detalhe por ID (GET /users/:id) – tutor com pets, agendamentos, avaliações, favoritos e perfil completo */
export interface UserDetailTutor {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profilePicture?: string | null;
  status: string;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  zipCode?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  pets?: Array<{
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    gender?: string;
    weight?: number | null;
    color?: string | null;
    avatar?: string | null;
  }>;
  customerBookings?: TutorBookingItem[];
  reviews?: TutorReviewItem[];
  favorites?: TutorFavoriteItem[];
}

/** Serviço (item) oferecido por um ponto de atendimento */
export interface ProviderServiceItem {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  duration?: number | null;
  isActive: boolean;
}

/** Ponto de atendimento do profissional (ex.: Banho & Tosa, Clínica) */
export interface ProviderServicePoint {
  id: string;
  name: string;
  category: string;
  status: string;
  description?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  services?: ProviderServiceItem[];
}

/** Detalhe profissional: empresa + serviços/serviços (itens) + dados como tutor */
export interface UserDetailProfessional {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  profilePicture?: string | null;
  status: string;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  addressNumber?: string | null;
  zipCode?: string | null;
  cpf?: string | null;
  birthDate?: string | null;
  companyId?: string | null;
  company?: {
    id: string;
    name: string;
    cnpj?: string | null;
    website?: string | null;
    contactEmail?: string | null;
    contactPhone?: string | null;
    address?: string | null;
    addressNumber?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    openingHours?: unknown;
  } | null;
  serviceProviders?: ProviderServicePoint[];
  pets?: Array<{
    id: string;
    name: string;
    species: string;
    breed?: string | null;
    gender?: string;
    weight?: number | null;
    color?: string | null;
    avatar?: string | null;
  }>;
  customerBookings?: TutorBookingItem[];
  reviews?: TutorReviewItem[];
  favorites?: TutorFavoriteItem[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profilePicture?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  birthDate?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  profilePicture?: string | null;
}

export class UsersService {
  /**
   * Busca o perfil do usuário logado
   */
  async getMyProfile(bearerToken?: string): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      // Sem cache: a chave global não distinguia Bearer; com Pro+Admin na mesma SPA, /me podia devolver perfil errado.
      const result = await api.get<{ data: User }>('/users/me', {
        useCache: false,
        ...(bearerToken
          ? { headers: { Authorization: `Bearer ${bearerToken}` } }
          : {}),
      });

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const userData: any = backendResponse.data || backendResponse;
        
        if (userData && userData.id) {
          return { 
            success: true, 
            data: {
              id: userData.id,
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              cpf: userData.cpf || '',
              birthDate: userData.birthDate || '',
              address: userData.address || '',
              city: userData.city || '',
              state: userData.state || '',
              zipCode: userData.zipCode || '',
              profilePicture: userData.profilePicture || '',
            }
          };
        }
      }

      return { success: false, error: 'Usuário não encontrado' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar usuário' };
    }
  }

  /**
   * Atualiza o perfil do usuário logado
   */
  async updateMyProfile(
    data: UpdateUserData,
    bearerToken?: string,
  ): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      // Inclui no payload apenas campos presentes; null é enviado para limpar (ex.: profilePicture)
      const cleanData: any = {};
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined) {
          cleanData[key] = value;
        }
      });

      const result = await api.patch<{ data: User }>('/users/me', cleanData, {
        ...(bearerToken
          ? { headers: { Authorization: `Bearer ${bearerToken}` } }
          : {}),
      });

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const userData: any = backendResponse.data || backendResponse;

        if (userData && userData.id) {
          return {
            success: true,
            data: {
              id: userData.id,
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              cpf: userData.cpf || '',
              birthDate: userData.birthDate || '',
              address: userData.address || '',
              city: userData.city || '',
              state: userData.state || '',
              zipCode: userData.zipCode || '',
              profilePicture: userData.profilePicture || '',
            }
          };
        }
      }

      return { success: false, error: 'Erro ao atualizar usuário' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao atualizar usuário' };
    }
  }

  /**
   * Lista tutores (painel admin) – GET /users/tutores
   */
  async getTutores(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{ success: boolean; data?: PaginatedResponse<TutorListItem>; error?: string }> {
    try {
      const result = await api.get<PaginatedResponse<TutorListItem>>('/users/tutores', {
        params: { page, limit, search: search || undefined },
        useCache: false,
      });
      if (result.success && result.data) {
        return { success: true, data: result.data as PaginatedResponse<TutorListItem> };
      }
      return { success: false, error: 'Erro ao buscar tutores' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar tutores' };
    }
  }

  /**
   * Lista profissionais (painel admin) – GET /users/profissionais
   */
  async getProfissionais(
    page = 1,
    limit = 20,
    search?: string,
  ): Promise<{ success: boolean; data?: PaginatedResponse<ProfessionalListItem>; error?: string }> {
    try {
      const result = await api.get<PaginatedResponse<ProfessionalListItem>>('/users/profissionais', {
        params: { page, limit, search: search || undefined },
        useCache: false,
      });
      if (result.success && result.data) {
        return { success: true, data: result.data as PaginatedResponse<ProfessionalListItem> };
      }
      return { success: false, error: 'Erro ao buscar profissionais' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar profissionais' };
    }
  }

  /**
   * Busca usuário por ID para painel admin (tutor + pets ou profissional + company) – GET /users/:id
   */
  async getUserByIdForAdmin(
    id: string,
  ): Promise<{
    success: boolean;
    data?: UserDetailTutor | UserDetailProfessional;
    error?: string;
  }> {
    try {
      const result = await api.get<UserDetailTutor | UserDetailProfessional>(`/users/${id}`, {
        useCache: false,
      });
      if (result.success && result.data) {
        const userData = (result.data as any).data ?? result.data;
        return { success: true, data: userData };
      }
      return { success: false, error: 'Usuário não encontrado' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar usuário' };
    }
  }
}

export const usersService = new UsersService();
