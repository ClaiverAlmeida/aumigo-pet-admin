import { api } from './api.service';

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
}

export class UsersService {
  /**
   * Busca o perfil do usuário logado
   */
  async getMyProfile(): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      const result = await api.get<{ data: User }>('/users/me', {
        useCache: true,
        cacheTtl: 2 * 60 * 1000, // 2 minutos
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
  async updateMyProfile(data: UpdateUserData): Promise<{ success: boolean; data?: User; error?: string }> {
    try {
      // Remove campos vazios (converte para undefined)
      const cleanData: any = {};
      Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          cleanData[key] = value;
        }
      });

      const result = await api.patch<{ data: User }>('/users/me', cleanData);

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
}

export const usersService = new UsersService();
