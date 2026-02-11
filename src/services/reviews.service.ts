import { api } from './api.service';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  providerId: string;
  authorId: string;
  responseText?: string;
  responseDate?: string;
  helpful?: number;
  photos?: number;
  petNames?: string[];
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  providerName?: string;
  author?: {
    id: string;
    name: string;
    profilePicture?: string;
  };
  provider?: {
    id: string;
    name: string;
  };
}

export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Array<{
    stars: number;
    count: number;
    percentage: number;
  }>;
  monthlyGrowth: number;
  responseRate: number;
}

export interface ResponseReviewData {
  responseText: string;
}

export class ReviewsService {
  async getAll(filters?: {
    rating?: number;
    providerId?: string;
    period?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data?: { data: Review[]; pagination?: any }; error?: string }> {
    try {
      const params: any = {};
      if (filters?.rating) params.rating = filters.rating;
      if (filters?.providerId) params.providerId = filters.providerId;
      if (filters?.period) params.period = filters.period;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;

      const result = await api.get<{ data: Review[]; pagination?: any }>('/reviews', params);

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: result.error || 'Erro ao buscar avaliações' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar avaliações' };
    }
  }

  async getById(id: string): Promise<{ success: boolean; data?: Review; error?: string }> {
    try {
      const result = await api.get<{ data: Review }>(`/reviews/${id}`);

      if (result.success && result.data) {
        const reviewData = (result.data as any).data || result.data;
        return { success: true, data: reviewData };
      }

      return { success: false, error: result.error || 'Erro ao buscar avaliação' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar avaliação' };
    }
  }

  async responder(id: string, data: ResponseReviewData): Promise<{ success: boolean; data?: Review; error?: string; message?: string }> {
    try {
      const result = await api.post<{ data: Review; message?: string }>(`/reviews/${id}/response`, data);

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const reviewData: any = backendResponse.data || backendResponse;
        const message = backendResponse.message || 'Resposta enviada com sucesso';

        if (reviewData && reviewData.id) {
          return { success: true, data: reviewData, message };
        }
      }

      return { success: false, error: 'Erro ao enviar resposta' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao enviar resposta' };
    }
  }

  async obterEstatisticas(month?: number, year?: number): Promise<{ success: boolean; data?: ReviewStatistics; error?: string }> {
    try {
      const params: any = {};
      if (month !== undefined) params.month = month;
      if (year !== undefined) params.year = year;
      
      const result = await api.get<any>('/reviews/statistics', params);

      if (result.success && result.data) {
        return { success: true, data: result.data as ReviewStatistics };
      }

      return { success: false, error: result.error || 'Erro ao buscar estatísticas' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar estatísticas' };
    }
  }

  async marcarComoUtil(id: string): Promise<{ success: boolean; data?: Review; error?: string; message?: string }> {
    try {
      const result = await api.post<{ data: Review; message?: string }>(`/reviews/${id}/helpful`, {});

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const reviewData: any = backendResponse.data || backendResponse;
        const message = backendResponse.message || 'Marcado como útil';

        if (reviewData && reviewData.id) {
          return { success: true, data: reviewData, message };
        }
      }

      return { success: false, error: 'Erro ao marcar como útil' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao marcar como útil' };
    }
  }

  async reportarProblema(id: string, motivo: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const result = await api.post<{ message?: string }>(`/reviews/${id}/report`, { motivo });

      if (result.success) {
        const backendResponse = result.data as any;
        const message = backendResponse?.message || 'Problema reportado com sucesso';
        return { success: true, message };
      }

      return { success: false, error: result.error || 'Erro ao reportar problema' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao reportar problema' };
    }
  }
}

export const reviewsService = new ReviewsService();
