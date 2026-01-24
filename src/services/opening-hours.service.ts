import { api } from './api.service';

export interface TimeSlot {
  start: string; // HH:MM formato "08:00"
  end: string; // HH:MM formato "18:00"
}

export interface DayAvailability {
  active: boolean;
  slots: TimeSlot[];
}

export interface WeeklyAvailability {
  [key: string]: DayAvailability; // "0" | "1" | "2" | "3" | "4" | "5" | "6"
}

export interface OpeningHoursResponse {
  data: {
    availability: WeeklyAvailability;
  };
}

export interface UpdateOpeningHoursDto {
  availability: WeeklyAvailability;
}

export class OpeningHoursService {
  /**
   * Busca os horários de funcionamento da empresa do usuário logado
   */
  async getOpeningHours(): Promise<{ success: boolean; data?: WeeklyAvailability; error?: string }> {
    try {
      const result = await api.get<OpeningHoursResponse>('/opening-hours', {
        useCache: true,
        cacheTtl: 5 * 60 * 1000, // 5 minutos
      });

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const availability = backendResponse.data?.availability || backendResponse.availability;
        
        if (availability) {
          return { success: true, data: availability };
        }
      }

      return { success: false, error: 'Horários não encontrados' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar horários' };
    }
  }

  /**
   * Atualiza os horários de funcionamento da empresa do usuário logado
   */
  async updateOpeningHours(availability: WeeklyAvailability): Promise<{ success: boolean; data?: WeeklyAvailability; error?: string }> {
    try {
      const result = await api.put<OpeningHoursResponse>('/opening-hours', {
        availability,
      });

      if (result.success && result.data) {
        // Backend retorna: { data: { availability: {...} } }
        // api.put retorna: { success: true, data: { data: { availability: {...} } } }
        const backendResponse = result.data as any;
        const updatedAvailability = backendResponse?.data?.availability || backendResponse?.availability;
        
        if (updatedAvailability) {
          return { success: true, data: updatedAvailability };
        }
      }

      return { success: false, error: 'Erro ao atualizar horários' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao atualizar horários' };
    }
  }
}

export const openingHoursService = new OpeningHoursService();
