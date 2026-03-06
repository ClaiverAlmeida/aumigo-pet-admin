import { api } from './api.service';

export interface PaymentItem {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  amountReais?: number;
  feeReais?: number;
  netAmountReais?: number;
  gatewayFeeReais?: number;
  platformFeeReais?: number;
  status: string;
  method: string;
  transactionId?: string | null;
  createdAt: string;
  paidAt?: string | null;
  customer?: { id: string; name: string; email: string };
  provider?: { id: string; name: string };
  booking?: { id: string; date: string; time: string };
  payout?: { id: string; reference: string; status: string } | null;
}

export interface PayoutItem {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  amountReais?: number;
  feeReais?: number;
  netAmountReais?: number;
  status: string;
  reference: string;
  scheduledFor: string;
  paidAt?: string | null;
  createdAt: string;
  provider?: { id: string; name: string };
  company?: { id: string; name: string; hasPayoutData?: boolean };
  payments?: { id: string; amount: number; status: string }[];
  /** URL do comprovante (Asaas), quando repasse pago via plataforma */
  receiptUrl?: string | null;
  /** ID da transferência no Asaas (para buscar comprovante depois) */
  asaasTransferId?: string | null;
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  PAID: 'Pago',
  FAILED: 'Falhou',
  REFUNDED: 'Reembolsado',
};

const PAYOUT_STATUS_LABEL: Record<string, string> = {
  PENDING_APPROVAL: 'Aguardando liberação',
  SCHEDULED: 'Agendado',
  PROCESSING: 'Processando',
  PAID: 'Pago',
  FAILED: 'Falhou',
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  PIX: 'PIX',
  CREDIT_CARD: 'Cartão de crédito',
  DEBIT_CARD: 'Cartão de débito',
  BANK_SLIP: 'Boleto',
};

export function getPaymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABEL[status] ?? status;
}

export function getPayoutStatusLabel(status: string): string {
  return PAYOUT_STATUS_LABEL[status] ?? status;
}

export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABEL[method] ?? method;
}

export class FinanceService {
  async getPaymentsByCompany(
    companyId: string,
    page = 1,
    limit = 15,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    success: boolean;
    data?: { data: PaymentItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    error?: string;
  }> {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const res = await api.get<{ data: PaymentItem[]; pagination: any }>(
        `/payments/by-company/${companyId}?${params.toString()}`,
        { useCache: false },
      );
      if (res.success && res.data) {
        return { success: true, data: res.data as any };
      }
      return { success: false, error: 'Erro ao carregar transações' };
    } catch (e: any) {
      return { success: false, error: e?.response?.data?.message || e?.message || 'Erro ao carregar transações' };
    }
  }

  async getPayoutsByCompany(
    companyId: string,
    page = 1,
    limit = 15,
    startDate?: string,
    endDate?: string,
  ): Promise<{
    success: boolean;
    data?: { data: PayoutItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    error?: string;
  }> {
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const res = await api.get<{ data: PayoutItem[]; pagination: any }>(
        `/payouts/by-company/${companyId}?${params.toString()}`,
        { useCache: false },
      );
      if (res.success && res.data) {
        return { success: true, data: res.data as any };
      }
      return { success: false, error: 'Erro ao carregar repasses' };
    } catch (e: any) {
      return { success: false, error: e?.response?.data?.message || e?.message || 'Erro ao carregar repasses' };
    }
  }

  /**
   * Admin: lista todos os repasses com filtros. GET /payouts?status=&companyId=&page=&limit=
   */
  async listPayoutsForAdmin(filters: {
    status?: string;
    companyId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data?: { data: PayoutItem[]; pagination: { page: number; limit: number; total: number; totalPages: number } };
    error?: string;
  }> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.companyId) params.set('companyId', filters.companyId);
      if (filters.page != null) params.set('page', String(filters.page));
      if (filters.limit != null) params.set('limit', String(filters.limit));
      const res = await api.get<{ data: PayoutItem[]; pagination: any }>(
        `/payouts?${params.toString()}`,
        { useCache: false },
      );
      if (res.success && res.data) {
        return { success: true, data: res.data as any };
      }
      return { success: false, error: 'Erro ao carregar repasses' };
    } catch (e: any) {
      return { success: false, error: e?.response?.data?.message || e?.message || 'Erro ao carregar repasses' };
    }
  }

  /**
   * Profissional: solicita saque. POST /payouts/request. amountInReais opcional (usa saldo disponível se não informado).
   */
  async requestPayout(amountInReais?: number): Promise<{
    success: boolean;
    data?: { id: string; reference: string; amountReais: number; status: string };
    error?: string;
  }> {
    try {
      const res = await api.post<{ id: string; reference: string; amountReais: number; status: string }>(
        '/payouts/request',
        amountInReais != null ? { amountInReais } : {},
      );
      if (res.success && res.data) {
        return { success: true, data: res.data };
      }
      return { success: false, error: 'Erro ao solicitar saque' };
    } catch (e: any) {
      return { success: false, error: e?.response?.data?.message || e?.message || 'Erro ao solicitar saque' };
    }
  }

  /**
   * Admin: libera (aprova) repasse solicitado. PATCH /payouts/:id/approve
   */
  async approvePayout(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.patch<{ id: string; status: string }>(`/payouts/${id}/approve`, {});
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.response?.data?.message || e?.message || 'Erro ao aprovar repasse' };
    }
  }

  /**
   * Admin: executa pagamento do repasse via plataforma (Asaas PIX/TED). PATCH /payouts/:id/execute
   */
  async executePayout(id: string): Promise<{ success: boolean; data?: { id: string; status: string; transferId?: string }; error?: string }> {
    try {
      const res = await api.patch<{ id: string; status: string; transferId?: string }>(`/payouts/${id}/execute`, {});
      if (res.success && res.data) return { success: true, data: res.data };
      return { success: false, error: 'Erro ao executar pagamento' };
    } catch (e: any) {
      return { success: false, error: e?.response?.data?.message || e?.message || 'Erro ao executar pagamento' };
    }
  }

  /**
   * Admin: altera o status do repasse. PATCH /payouts/:id/status
   */
  async updatePayoutStatus(
    id: string,
    status: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await api.patch<{ id: string; status: string }>(`/payouts/${id}/status`, { status });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.response?.data?.message || e?.message || 'Erro ao atualizar status' };
    }
  }

  /**
   * Obtém a URL do comprovante do repasse (Asaas). GET /payouts/:id/receipt
   * Se o repasse foi pago via plataforma e o comprovante já estiver disponível, retorna a URL.
   * Se tiver asaasTransferId mas ainda não tiver URL, o backend busca no Asaas e atualiza.
   */
  async getPayoutReceipt(
    payoutId: string,
  ): Promise<{ success: boolean; receiptUrl?: string | null; error?: string }> {
    try {
      const res = await api.get<{ receiptUrl: string | null }>(`/payouts/${payoutId}/receipt`);
      if (res.success && res.data != null) {
        return { success: true, receiptUrl: res.data.receiptUrl ?? null };
      }
      return { success: false, receiptUrl: null };
    } catch (e: any) {
      return { success: false, receiptUrl: null, error: e?.response?.data?.message || e?.message || 'Erro ao buscar comprovante' };
    }
  }
}

export const financeService = new FinanceService();
