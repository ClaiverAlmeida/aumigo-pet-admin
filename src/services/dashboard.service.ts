import { api } from './api.service';

/** Métricas de usuários (extensível: ex. por cidade/estado no futuro) */
export interface UsuariosMetricas {
  tutores: number;
  profissionais: number;
}

/** Agendamentos por status */
export interface AgendamentosPorStatus {
  PENDING: number;
  CONFIRMED: number;
  DONE: number;
  CANCELLED: number;
}

/** Payload completo do dashboard – GET /dashboard/stats */
export interface DashboardStats {
  usuarios: UsuariosMetricas;
  empresas: number;
  pets: number;
  pontosAtendimento: number;
  servicosCatalogo: number;
  agendamentos: number;
  agendamentosPorStatus: AgendamentosPorStatus;
  avaliacoes: number;
  favoritos: number;
  pagamentos: number;
  tickets: number;
  notificacoes: number;
}

export class DashboardService {
  async getStats(): Promise<{
    success: boolean;
    data?: DashboardStats;
    error?: string;
  }> {
    try {
      const result = await api.get<{ data: DashboardStats }>('/dashboard/stats', {
        useCache: false,
      });
      if (result.success && result.data) {
        const payload = (result.data as any).data ?? result.data;
        return { success: true, data: payload as DashboardStats };
      }
      return { success: false, error: 'Erro ao carregar métricas' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Erro ao carregar métricas' };
    }
  }
}

export const dashboardService = new DashboardService();
