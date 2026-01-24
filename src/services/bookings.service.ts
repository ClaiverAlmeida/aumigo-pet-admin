import { api } from './api.service';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';

export interface Booking {
  id: string;
  date: string; // ISO string
  time: string; // HH:MM
  status: BookingStatus;
  notes?: string;
  price: number; // em centavos
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // Relacionamentos (já transformados pelo backend)
  serviceName?: string;
  providerName?: string;
  customerName?: string;
  petName?: string;
  // Dados completos dos relacionamentos (se necessário)
  service?: { id: string; name: string; price: number };
  customer?: { id: string; name: string; email: string; phone?: string };
  pet?: { 
    id: string; 
    name: string; 
    species?: string; 
    breed?: string; 
    gender?: string; 
    weight?: number; 
    birthDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBookingData {
  status?: BookingStatus;
  notes?: string;
  date?: string; // ISO string
  time?: string; // HH:MM
}

export class BookingsService {
  /**
   * Busca todos os agendamentos do service provider logado
   */
  async getAll(filters?: {
    status?: BookingStatus;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data?: { data: Booking[]; pagination?: any }; error?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.search) params.append('q', filters.search);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const url = `/bookings${queryString ? `?${queryString}` : ''}`;

      const result = await api.get<{ data: Booking[]; pagination?: any }>(url);

      if (result.success && result.data) {
        // O backend retorna { data: Booking[], pagination: {...} }
        const response = result.data as any
        return { success: true, data: response };
      }

      return { success: false, error: 'Erro ao buscar agendamentos' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar agendamentos' };
    }
  }

  /**
   * Busca um agendamento por ID
   */
  async getById(id: string): Promise<{ success: boolean; data?: Booking; error?: string }> {
    try {
      const result = await api.get<{ data: Booking }>(`/bookings/${id}`);

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const bookingData: any = backendResponse.data || backendResponse;

        if (bookingData && bookingData.id) {
          return { success: true, data: bookingData };
        }
      }

      return { success: false, error: 'Agendamento não encontrado' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar agendamento' };
    }
  }

  /**
   * Atualiza um agendamento
   */
  async update(id: string, data: UpdateBookingData): Promise<{ success: boolean; data?: Booking; error?: string }> {
    try {
      const result = await api.patch<{ data: Booking }>(`/bookings/${id}`, data);

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const bookingData: any = backendResponse.data || backendResponse;

        if (bookingData && bookingData.id) {
          return { success: true, data: bookingData };
        }
      }

      return { success: false, error: 'Erro ao atualizar agendamento' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao atualizar agendamento' };
    }
  }
}

export const bookingsService = new BookingsService();
