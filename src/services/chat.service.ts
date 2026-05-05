import { api } from './api.service';

export interface ChatConversation {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
  category: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  companyId?: string | null;
  providerId?: string | null;
  serviceId?: string | null;
  bookingId?: string | null;
  createdBy?: {
    id: string;
    name: string;
    profilePicture?: string | null;
  };
  company?: { id: string; name: string } | null;
  provider?: { id: string; name: string } | null;
  service?: { id: string; name: string } | null;
  booking?: {
    id: string;
    date?: string;
    time?: string;
    status?: string;
    paymentFlowType?: 'INSTANT_BOOKING' | 'AFTER_PROVIDER_CONFIRMATION' | 'NEGOTIATED_VIA_CHAT';
  } | null;
  replies?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  ticketId: string;
  content: string;
  authorId: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    profilePicture?: string | null;
  };
}

export interface ChatPaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ChatProposal {
  id: string;
  ticketId: string;
  messageId?: string | null;
  serviceId?: string | null;
  title: string;
  status?: string;
  amount?: number;
  appointmentDate?: string | null;
  appointmentTime?: string | null;
  createdAt?: string;
  service?: {
    id: string;
    name: string;
  } | null;
  message?: {
    id: string;
    content?: string;
    createdAt?: string;
  } | null;
}

export interface CreateChatProposalPayload {
  ticketId: string;
  title: string;
  amount: number;
  serviceId?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

class ChatService {
  async listConversations(page = 1, limit = 20) {
    return api.get<ChatPaginatedResponse<ChatConversation>>('/tickets/chat', {
      params: { page, limit },
      useCache: false,
    });
  }

  async listMessages(ticketId: string, page = 1, limit = 30) {
    return api.get<ChatPaginatedResponse<ChatMessage>>(`/tickets/chat/${ticketId}/messages`, {
      params: { page, limit },
      useCache: false,
    });
  }

  /** Cabeçalho da conversa (inclui tickets ainda sem mensagens). */
  async getConversationDetail(ticketId: string) {
    return api.get<{ data: ChatConversation }>(`/tickets/chat/${ticketId}/detail`, {
      useCache: false,
    });
  }

  async sendMessage(ticketId: string, content: string) {
    return api.post<{ data: ChatMessage }>(
      `/tickets/chat/${ticketId}/messages`,
      { content },
      { useCache: false },
    );
  }

  async openByBooking(bookingId: string) {
    return api.post<{ data: ChatConversation; isNew: boolean }>(
      '/tickets/chat/open-by-booking',
      { bookingId },
      { useCache: false },
    );
  }

  async listProposalsByTicket(ticketId: string) {
    return api.get<ChatProposal[]>(`/proposals/by-ticket/${ticketId}`, {
      useCache: false,
    });
  }

  async createProposal(payload: CreateChatProposalPayload) {
    return api.post<{ data: ChatProposal }>('/proposals', payload, {
      useCache: false,
    });
  }

  async requestProposalPayment(
    proposalId: string,
    payload: { method: 'pix' | 'boleto' | 'credit_card'; description?: string },
  ) {
    return api.post(`/proposals/${proposalId}/request-payment`, payload, {
      useCache: false,
    });
  }

  async linkProposalMessage(proposalId: string, messageId: string) {
    return api.post(`/proposals/${proposalId}/link-message`, { messageId }, {
      useCache: false,
    });
  }
}

export const chatService = new ChatService();

