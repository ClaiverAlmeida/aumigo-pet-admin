import { api } from './api.service';

export type CouponDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';
export interface Coupon {
  id: string;
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  usageLimit?: number;
  usedCount?: number;
  providerId: string;
}

export interface CreateCouponPayload {
  code: string;
  title: string;
  discountType: CouponDiscountType;
  discountValue: number;
  startsAt: string;
  endsAt: string;
  usageLimit?: number;
  providerId: string;
}

class CouponsService {
  async list(): Promise<{ success: boolean; data?: Coupon[]; error?: string }> {
    const result = await api.get<any>('/coupons');
    if (!result.success || !result.data) return { success: false, error: result.error || 'Erro ao listar cupons' };
    const raw = result.data as any;
    const data = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    return { success: true, data };
  }
  async create(payload: CreateCouponPayload): Promise<{ success: boolean; data?: Coupon; error?: string }> {
    const result = await api.post<any>('/coupons', payload);
    if (!result.success || !result.data) return { success: false, error: result.error || 'Erro ao criar cupom' };
    const raw = result.data as any;
    return { success: true, data: raw?.data || raw };
  }
  async update(id: string, payload: Partial<CreateCouponPayload> & { active?: boolean }): Promise<{ success: boolean; data?: Coupon; error?: string }> {
    const result = await api.patch<any>(`/coupons/${id}`, payload);
    if (!result.success || !result.data) return { success: false, error: result.error || 'Erro ao atualizar cupom' };
    const raw = result.data as any;
    return { success: true, data: raw?.data || raw };
  }
  async delete(id: string): Promise<{ success: boolean; error?: string }> {
    const result = await api.delete<any>(`/coupons/${id}`);
    if (!result.success) return { success: false, error: result.error || 'Erro ao excluir cupom' };
    return { success: true };
  }
}

export const couponsService = new CouponsService();
