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
  createdBy?: {
    id: string;
    name: string;
    profilePicture?: string | null;
  };
  company?: { id: string; name: string } | null;
  provider?: { id: string; name: string } | null;
  service?: { id: string; name: string } | null;
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

  async sendMessage(ticketId: string, content: string) {
    return api.post<{ data: ChatMessage }>(
      `/tickets/chat/${ticketId}/messages`,
      { content },
      { useCache: false },
    );
  }
}

export const chatService = new ChatService();

