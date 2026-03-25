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
  helpfulByUser?: boolean;
  reportReason?: string;
  isImportant?: boolean;
  petNames?: string[];
  createdAt: string;
  updatedAt: string;
  authorName?: string;
  providerName?: string;
  author?: {
    id: string;
    name: string;
    profilePicture?: string;
    pets?: Array<{
      id: string;
      name: string;
      species?: string;
      breed?: string;
      avatar?: string;
      isActive?: boolean;
    }>;
  };
  provider?: {
    id: string; 
    name: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
  totalHelpful?: number;
  helpfulPorProvider?: Array<{
    providerId: string;
    providerName: string;
    totalHelpful: number;
  }>;
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
  async getAllByCompany(filters?: {
    rating?: number;
    providerId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data?: { data: Review[]; pagination?: any }; error?: string }> {
    try {
      const params: any = {};
      if (filters?.rating) params.rating = filters.rating;
      if (filters?.providerId) params.providerId = filters.providerId;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;
      const result = await api.get<{ data: Review[]; pagination?: any }>(
        '/reviews/scope/company',
        { params, useCache: false },
      );
      if (result.success && result.data) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error || 'Erro ao buscar avaliações' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar avaliações' };
    }
  }

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

      const result = await api.get<{ data: Review[]; pagination?: any }>(
        '/reviews',
        { params },
      );

      if (result.success && result.data) {
        return { success: true, data: result.data };
      }

      return { success: false, error: result.error || 'Erro ao buscar avaliações' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar avaliações' };
    }
  }

  async getReported(filters?: {
    page?: number;
    limit?: number;
    providerId?: string;
  }): Promise<{ success: boolean; data?: { data: Review[]; pagination?: any }; error?: string }> {
    const page = Math.max(1, Number(filters?.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters?.limit) || 20));
    const providerId = filters?.providerId;
    const fetchLimit = Math.max(limit * 5, 100);

    try {
      const result = await this.getAll({
        page: 1,
        limit: fetchLimit,
        providerId,
      });

      if (!result.success || !result.data) {
        return { success: false, error: result.error || 'Erro ao buscar incidentes' };
      }

      const fullList = Array.isArray(result.data.data) ? result.data.data : [];
      const reportedOnly = fullList.filter(
        (review) => typeof review.reportReason === 'string' && review.reportReason.trim().length > 0,
      );

      const start = (page - 1) * limit;
      const data = reportedOnly.slice(start, start + limit);
      const total = reportedOnly.length;
      const totalPages = Math.ceil(total / limit) || 1;

      return {
        success: true,
        data: {
          data,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
          },
        },
      };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar incidentes' };
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
      const result = await api.patch<{ data: Review; message?: string }>(`/reviews/${id}/response`, data);

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
      
      const result = await api.get<any>('/reviews/statistics', {
        params,
        useCache: false,
      });

      if (result.success && result.data) {
        return { success: true, data: result.data as ReviewStatistics };
      }

      return { success: false, error: result.error || 'Erro ao buscar estatísticas' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao buscar estatísticas' };
    }
  }

  async marcarComoUtil(id: string): Promise<{ success: boolean; data?: Review; helpfulByUser?: boolean; error?: string; message?: string }> {
    try {
      const result = await api.patch<{ data: Review; helpfulByUser?: boolean; message?: string }>(`/reviews/${id}/helpful`, {});

      if (result.success && result.data) {
        const backendResponse = result.data as any;
        const reviewData: any = backendResponse.data || backendResponse;
        const message = backendResponse.message || 'Marcado como útil';
        const helpfulByUser = backendResponse.helpfulByUser ?? reviewData?.helpfulByUser ?? false;

        if (reviewData && reviewData.id) {
          return { success: true, data: { ...reviewData, helpfulByUser }, helpfulByUser, message };
        }
      }

      return { success: false, error: 'Erro ao marcar como útil' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao marcar como útil' };
    }
  }

  async reportarProblema(
    id: string,
    reportReason: string
  ): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    data?: { reportReason?: string; alreadyReported?: boolean };
  }> {
    try {
      const result = await api.patch<{
        message?: string;
        reportReason?: string;
        alreadyReported?: boolean;
      }>(`/reviews/${id}/report`, { reportReason });

      if (result.success) {
        const backendResponse = result.data as any;
        return {
          success: true,
          message: backendResponse?.message || 'Problema reportado com sucesso',
          data: {
            reportReason: backendResponse?.reportReason,
            alreadyReported: backendResponse?.alreadyReported,
          },
        };
      }

      return { success: false, error: result.error || 'Erro ao reportar problema' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao reportar problema' };
    }
  }

  async marcarComoImportante(
    id: string
  ): Promise<{
    success: boolean;
    data?: { isImportant?: boolean };
    error?: string;
    message?: string;
  }> {
    try {
      const result = await api.patch<{
        isImportant?: boolean;
        message?: string;
      }>(`/reviews/${id}/important`, {});

      if (result.success) {
        const backendResponse = result.data as any;
        return {
          success: true,
          data: { isImportant: backendResponse?.isImportant },
          message: backendResponse?.message,
        };
      }

      return { success: false, error: result.error || 'Erro ao marcar como importante' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao marcar como importante' };
    }
  }

  async cancelarReporte(
    id: string
  ): Promise<{
    success: boolean;
    error?: string;
    message?: string;
    data?: { reportReason?: string | null; alreadyCleared?: boolean };
  }> {
    try {
      const result = await api.patch<{
        message?: string;
        reportReason?: string | null;
        alreadyCleared?: boolean;
      }>(`/reviews/${id}/report/cancel`, {});

      if (result.success) {
        const backendResponse = result.data as any;
        return {
          success: true,
          message: backendResponse?.message,
          data: {
            reportReason: backendResponse?.reportReason ?? null,
            alreadyCleared: backendResponse?.alreadyCleared,
          },
        };
      }

      return { success: false, error: result.error || 'Erro ao cancelar reporte' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao cancelar reporte' };
    }
  }

  async deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete(`/reviews/${id}`);
      if (result.success) return { success: true };
      return { success: false, error: result.error || 'Erro ao excluir avaliação' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao excluir avaliação' };
    }
  }
}

export const reviewsService = new ReviewsService();
