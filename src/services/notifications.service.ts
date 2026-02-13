import { api } from "./api.service";

export interface Notification {
  id: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
}

export const notificationsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    entityType?: string;
    dateFrom?: string;
    dateTo?: string;
    includeDeleted?: boolean;
  }): Promise<{ success: boolean; data?: NotificationsResponse; error?: string }> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append("page", String(params.page));
      if (params?.limit) query.append("limit", String(params.limit));
      if (params?.isRead !== undefined) query.append("isRead", String(params.isRead));
      if (params?.entityType) query.append("entityType", params.entityType);
      if (params?.dateFrom) query.append("dateFrom", params.dateFrom);
      if (params?.dateTo) query.append("dateTo", params.dateTo);
      if (params?.includeDeleted) query.append("includeDeleted", "true");

      const url = `/notifications${query.toString() ? `?${query}` : ""}`;
      const result = await api.get<NotificationsResponse>(url, { useCache: false });

      if (result.success && result.data) {
        const data = result.data as any;
        return {
          success: true,
          data: {
            notifications: data.notifications ?? [],
            total: data.total ?? 0,
          },
        };
      }
      return { success: false, error: (result as any).error ?? "Erro ao buscar notificações" };
    } catch (e: any) {
      return { success: false, error: e.message ?? "Erro ao buscar notificações" };
    }
  },

  async getUnreadCount(): Promise<{ success: boolean; count?: number; error?: string }> {
    try {
      const result = await api.get<{ count: number }>("/notifications/unread-count", {
        useCache: false,
      });
      if (result.success && result.data) {
        const data = result.data as any;
        return { success: true, count: data.count ?? 0 };
      }
      return { success: false };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async markAsRead(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.put(`/notifications/${id}/read`, {});
      return { success: result.success };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async markAllAsRead(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.put("/notifications/read-all", {});
      return { success: result.success };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async remove(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete(`/notifications/${id}`);
      return { success: result.success };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  async clearAll(): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await api.delete("/notifications/clear-all");
      return { success: result.success };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  exportToCsv(
    notifications: Array<{
      title: string;
      message?: string;
      description?: string;
      entityType?: string;
      type?: string;
      entityId?: string;
      bookingId?: string;
      isRead?: boolean;
      read?: boolean;
      createdAt?: string;
      timestamp?: Date;
    }>
  ): void {
    const header = "Título;Mensagem;Tipo;ID Entidade;Lida;Data\n";
    const rows = notifications
      .map((n) => {
        const msg = n.message ?? n.description ?? "";
        const entityType = n.entityType ?? n.type ?? "";
        const entityId = n.entityId ?? n.bookingId ?? "";
        const isRead = n.isRead ?? n.read ?? false;
        const date = n.createdAt ?? n.timestamp?.toISOString?.() ?? "";
        return `"${(n.title || "").replace(/"/g, '""')}";"${String(msg).replace(/"/g, '""')}";${entityType};${entityId};${isRead ? "Sim" : "Não"};${date}`;
      })
      .join("\n");
    const csv = "\uFEFF" + header + rows; // BOM para UTF-8 no Excel
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `notificacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  },
};
