import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, ChevronRight, Building2, Calendar, Loader2, MessageSquare, Search, Send, Briefcase, Eye, EyeOff } from 'lucide-react';
import { chatService, type ChatConversation, type ChatMessage, type ChatProposal } from '../services/chat.service';
import { companiesService } from '../services/companies.service';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { subscribeChatMessages } from '../services/socket.service';
import { useRouter } from '../hooks/useRouter';
import './pro-chat-live.css';

function tutorInitials(name: string | undefined): string {
  if (!name?.trim()) return 'T';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

const bookingStatusLabels: Record<string, string> = {
  PENDING: 'Pendente',
  AWAITING_PAYMENT: 'Aguardando pagamento',
  CONFIRMED: 'Confirmado',
  DONE: 'Concluído',
  CANCELLED: 'Cancelado',
};

const conversationStatusLabels: Record<string, string> = {
  OPEN: 'Aberta',
  IN_PROGRESS: 'Em andamento',
  WAITING: 'Aguardando',
  RESOLVED: 'Resolvida',
  CLOSED: 'Fechada',
};

/** Handoff ao abrir `/pro/chat` a partir de agendamentos (`pro-bookings`). */
const PRO_CHAT_SELECTED_TICKET_KEY = 'proChat:selectedTicketId';

type PaymentFlowType = 'INSTANT_BOOKING' | 'AFTER_PROVIDER_CONFIRMATION' | 'NEGOTIATED_VIA_CHAT';

function getContextTagClass(label: string): string {
  return 'border-aumigo-orange/20 bg-amber-50 text-amber-700';
}

function getBookingStatusTagClass(status: string | undefined): string {
  if (status === 'DONE') return 'border-gray-200 bg-green-50 text-green-700';
  if (status === 'CONFIRMED') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'CANCELLED') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function getConversationStatusTagClass(status: string | undefined): string {
  if (status === 'RESOLVED') return 'border-gray-200 bg-green-50 text-green-700';
  if (status === 'CLOSED') return 'border-gray-300 bg-gray-100 text-gray-700';
  if (status === 'IN_PROGRESS') return 'border-blue-200 bg-blue-50 text-blue-700';
  if (status === 'WAITING') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-gray-200 bg-green-50 text-green-700';
}

function getConversationContext(conversation: ChatConversation): {
  label: string;
  variant: 'secondary' | 'outline';
  description: string;
} {
  if (conversation.bookingId) {
    const bookingStatus = conversation.booking?.status
      ? bookingStatusLabels[conversation.booking.status] || 'Indefinido'
      : 'Indefinido';
    return {
      label: 'Agendamento',
      variant: 'secondary',
      description: `Status: ${bookingStatus}`,
    };
  }
  if (conversation.serviceId) {
    return {
      label: 'Item do serviço',
      variant: 'outline',
      description: conversation.service?.name
        ? `Item do serviço: ${conversation.service.name}`
        : 'Pré-agendamento por item do serviço',
    };
  }
  return {
    label: 'Serviço',
    variant: 'outline',
    description: 'Canal geral com a empresa para solicitação de serviço',
  };
}

function getPaymentFlowLabel(paymentFlowType: PaymentFlowType): string {
  if (paymentFlowType === 'AFTER_PROVIDER_CONFIRMATION') return 'Após confirmação do prestador';
  if (paymentFlowType === 'NEGOTIATED_VIA_CHAT') return 'Negociado via chat';
  return 'Reserva instantânea';
}

function getPaymentActions(conversation: ChatConversation, paymentFlowType: PaymentFlowType): string[] {
  if (paymentFlowType === 'INSTANT_BOOKING') {
    if (conversation.bookingId) return ['Ver pagamento do agendamento', 'Abrir agendamento'];
    return [];
  }

  if (paymentFlowType === 'AFTER_PROVIDER_CONFIRMATION') {
    if (conversation.bookingId) {
      return ['Confirmar disponibilidade no agendamento', 'Solicitar pagamento do agendamento'];
    }
    return [];
  }

  if (conversation.bookingId) {
    return ['Gerenciar pagamento do agendamento', 'Abrir agendamento'];
  }
  return [];
}

function getEffectivePaymentFlow(
  conversation: ChatConversation | null,
  companyPaymentFlowType: PaymentFlowType,
): PaymentFlowType {
  const bookingFlow = conversation?.booking?.paymentFlowType;
  if (bookingFlow) return bookingFlow;
  return companyPaymentFlowType;
}

function formatDatePtBr(dateValue?: string): string {
  if (!dateValue) return '-';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

/** Data/hora da última mensagem pública (preview em `replies`) ou última atualização do ticket. */
function formatLastMessageReceived(conversation: ChatConversation): string {
  const iso = conversation.replies?.[0]?.createdAt ?? conversation.updatedAt;
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMsgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `Há ${diffMin} min`;
  const timeShort = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (startOfToday.getTime() === startOfMsgDay.getTime()) {
    return `Hoje, ${timeShort}`;
  }
  const yesterday = new Date(startOfToday);
  yesterday.setDate(yesterday.getDate() - 1);
  if (startOfMsgDay.getTime() === yesterday.getTime()) {
    return `Ontem, ${timeShort}`;
  }
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Horário curto na bolha (hoje só HH:mm; outro dia dd/MM + hora). */
function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const sameCalendarDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  if (sameCalendarDay) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getProposalStatusLabel(status?: string): string {
  if (status === 'ACCEPTED_AWAITING_PAYMENT') return 'Aguardando pagamento';
  if (status === 'PAID') return 'Pagamento concluído';
  if (status === 'REJECTED') return 'Recusada';
  if (status === 'CANCELLED') return 'Cancelada';
  return 'Enviada para aprovação';
}

const MESSAGE_PREVIEW_MAX_CHARS = 120;
const COLLAPSED_MSG_MAX_HEIGHT_PX = 168;

function CollapsibleMessageText({ content, mine }: { content: string; mine: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const textRef = useRef<HTMLParagraphElement | null>(null);
  const [needsToggle, setNeedsToggle] = useState(() => content.length > MESSAGE_PREVIEW_MAX_CHARS);

  const measure = useCallback(() => {
    const el = textRef.current;
    if (!el) return;
    if (expanded) {
      setNeedsToggle(true);
      return;
    }
    const overflow = el.scrollHeight > el.clientHeight + 2;
    const longChars = content.length > MESSAGE_PREVIEW_MAX_CHARS;
    setNeedsToggle(overflow || longChars);
  }, [content, expanded]);

  useLayoutEffect(() => {
    measure();
    const id = requestAnimationFrame(() => measure());
    return () => cancelAnimationFrame(id);
  }, [measure]);

  useEffect(() => {
    const el = textRef.current;
    if (!el || expanded) return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, expanded]);

  const collapsedStyle: React.CSSProperties = {
    margin: 0,
    maxHeight: COLLAPSED_MSG_MAX_HEIGHT_PX,
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  };

  const expandedStyle: React.CSSProperties = {
    margin: 0,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    wordBreak: 'break-word',
  };

  return (
    <div className="min-w-0">
      <p ref={textRef} style={expanded ? expandedStyle : collapsedStyle}>
        {content}
      </p>
      {needsToggle ? (
        <button
          type="button"
          className={`mt-1 inline-block bg-transparent p-0 text-xs font-semibold underline underline-offset-2 hover:opacity-90 ${mine ? 'text-white/90' : 'text-aumigo-teal'}`}
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? 'Ler menos' : 'Ler mais'}
        </button>
      ) : null}
    </div>
  );
}

export function ProChatLive() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 1023px)').matches;
  });
  const [mobileScreen, setMobileScreen] = useState<'list' | 'chat'>('list');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatTypeTab, setChatTypeTab] = useState<'all' | 'service' | 'booking' | 'direct'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | ChatConversation['status']>('all');
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [conversationPage, setConversationPage] = useState(1);
  const [conversationsPagination, setConversationsPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const selectedTicketIdRef = useRef<string | null>(selectedTicketId);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messageScrollRootRef = useRef<HTMLDivElement | null>(null);
  const preserveScrollOnPrependRef = useRef(false);
  const prependAnchorMessageIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedTicketIdRef.current = selectedTicketId;
  }, [selectedTicketId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [olderMessagesPage, setOlderMessagesPage] = useState<number | null>(null);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [companyPaymentFlowType, setCompanyPaymentFlowType] = useState<PaymentFlowType>('INSTANT_BOOKING');
  const [loadingPaymentFlow, setLoadingPaymentFlow] = useState(true);
  const [loadingNegotiatedSummary, setLoadingNegotiatedSummary] = useState(false);
  const [negotiatedProposal, setNegotiatedProposal] = useState<ChatProposal | null>(null);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [creatingProposal, setCreatingProposal] = useState(false);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalAmount, setProposalAmount] = useState('');
  const [proposalDate, setProposalDate] = useState('');
  const [proposalTime, setProposalTime] = useState('');
  const chatTypeOptions: Array<{ id: 'all' | 'service' | 'booking' | 'direct'; label: string; icon: React.ReactNode }> = [
    { id: 'all', label: 'Todas', icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: 'service', label: 'Serviço', icon: <Briefcase className="h-3.5 w-3.5" /> },
    { id: 'booking', label: 'Agendamento', icon: <Calendar className="h-3.5 w-3.5" /> },
    { id: 'direct', label: 'Direto', icon: <Building2 className="h-3.5 w-3.5" /> },
  ];

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedTicketId) || null,
    [conversations, selectedTicketId],
  );
  const effectivePaymentFlowType = getEffectivePaymentFlow(
    selectedConversation,
    companyPaymentFlowType,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(max-width: 1023px)');
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const loadPaymentFlowType = async () => {
      setLoadingPaymentFlow(true);
      const res = await companiesService.getMyCompany();
      if (res.success && res.data?.paymentFlowType) {
        setCompanyPaymentFlowType(res.data.paymentFlowType);
      }
      setLoadingPaymentFlow(false);
    };
    void loadPaymentFlowType();
  }, []);

  const loadNegotiatedSummary = useCallback(async () => {
    if (!selectedConversation || effectivePaymentFlowType !== 'NEGOTIATED_VIA_CHAT') {
      setNegotiatedProposal(null);
      return;
    }
    if (selectedConversation.bookingId) {
      setNegotiatedProposal(null);
      return;
    }
    setLoadingNegotiatedSummary(true);
    const res = await chatService.listProposalsByTicket(selectedConversation.id);
    setLoadingNegotiatedSummary(false);
    if (!res.success || !res.data) {
      setNegotiatedProposal(null);
      return;
    }
    const proposals = Array.isArray(res.data) ? res.data : [];
    const sortedByDate = [...proposals].sort((a, b) => {
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bDate - aDate;
    });
    setNegotiatedProposal(sortedByDate[0] || null);
  }, [selectedConversation, effectivePaymentFlowType]);

  useEffect(() => {
    void loadNegotiatedSummary();
  }, [loadNegotiatedSummary]);

  useEffect(() => {
    if (!isMobile) {
      setMobileScreen('list');
      return;
    }
    if (selectedTicketId) {
      setMobileScreen('chat');
    } else {
      setMobileScreen('list');
    }
  }, [isMobile, selectedTicketId]);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conversations.filter((item) => {
      if (chatTypeTab === 'booking' && !item.bookingId) return false;
      if (chatTypeTab === 'service' && !item.serviceId) return false;
      if (chatTypeTab === 'direct' && (item.bookingId || item.serviceId)) return false;
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (!term) return true;
      const tutorName = item.createdBy?.name || '';
      const company = item.company?.name || '';
      const service = item.service?.name || '';
      const contextLabel = getConversationContext(item).label;
      return `${tutorName} ${company} ${service} ${contextLabel}`.toLowerCase().includes(term);
    });
  }, [conversations, search, chatTypeTab, statusFilter]);

  const loadConversations = async (page = conversationPage) => {
    setLoadingConversations(true);
    const res = await chatService.listConversations(page, 20);
    setLoadingConversations(false);
    if (!res.success || !res.data) {
      toast.error(res.error || 'Erro ao carregar conversas');
      return;
    }
    const list = Array.isArray(res.data.data) ? res.data.data : [];
    setConversations(list);
    const p = res.data.pagination;
    if (p) {
      setConversationsPagination({
        page: p.page,
        totalPages: p.totalPages,
        total: p.total,
        hasNextPage: p.hasNextPage,
        hasPreviousPage: p.hasPreviousPage,
      });
    }
  };

  const loadLatestMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    const firstPageRes = await chatService.listMessages(ticketId, 1, 30);
    if (!firstPageRes.success || !firstPageRes.data) {
      setLoadingMessages(false);
      toast.error(firstPageRes.error || 'Erro ao carregar mensagens');
      return;
    }
    const totalPages = Math.max(1, firstPageRes.data.pagination?.totalPages || 1);
    const totalMsgCount = firstPageRes.data.pagination?.total ?? 0;
    const latestMessages: ChatMessage[] = [];
    let cursorPage = totalPages;
    while (cursorPage >= 1 && latestMessages.length < 30) {
      const pageRes = await chatService.listMessages(ticketId, cursorPage, 30);
      if (!pageRes.success || !pageRes.data) break;
      const batch = Array.isArray(pageRes.data.data) ? pageRes.data.data : [];
      if (batch.length === 0) break;
      // Monta do mais antigo para o mais recente mantendo ordem cronológica final.
      latestMessages.unshift(...batch);
      if (latestMessages.length > 30) {
        latestMessages.splice(0, latestMessages.length - 30);
      }
      cursorPage -= 1;
    }
    setLoadingMessages(false);
    setMessages(latestMessages);
    let nextOlder: number | null = cursorPage >= 1 ? cursorPage : null;
    if (nextOlder == null && totalMsgCount > latestMessages.length) {
      nextOlder = Math.max(1, totalPages - 1);
    }
    setOlderMessagesPage(nextOlder);
  };

  const loadOlderMessages = async () => {
    if (!selectedTicketId || !olderMessagesPage || loadingOlderMessages) return;
    prependAnchorMessageIdRef.current = messages[0]?.id ?? null;
    setLoadingOlderMessages(true);
    const res = await chatService.listMessages(selectedTicketId, olderMessagesPage, 30);
    setLoadingOlderMessages(false);
    if (!res.success || !res.data) {
      return;
    }
    const olderBatch = Array.isArray(res.data.data) ? res.data.data : [];
    preserveScrollOnPrependRef.current = true;
    setMessages((prev) => {
      const existingIds = new Set(prev.map((m) => m.id));
      const uniqueOlder = olderBatch.filter((m) => !existingIds.has(m.id));
      return [...uniqueOlder, ...prev];
    });
    setOlderMessagesPage(olderMessagesPage > 1 ? olderMessagesPage - 1 : null);
  };

  useEffect(() => {
    void loadConversations(conversationPage);
  }, [conversationPage]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(PRO_CHAT_SELECTED_TICKET_KEY);
      if (!raw?.trim()) return;
      localStorage.removeItem(PRO_CHAT_SELECTED_TICKET_KEY);
      setSelectedTicketId(raw.trim());
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!selectedTicketId || loadingConversations) return;
    if (conversations.some((c) => c.id === selectedTicketId)) return;

    let cancelled = false;
    void (async () => {
      const res = await chatService.getConversationDetail(selectedTicketId);
      if (cancelled || !res.success || !res.data?.data) return;
      const conv = res.data.data;
      setConversations((prev) => {
        if (prev.some((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedTicketId, loadingConversations, conversations]);

  useEffect(() => {
    if (!selectedTicketId) {
      setMessages([]);
      setOlderMessagesPage(null);
      return;
    }
    void loadLatestMessages(selectedTicketId);
  }, [selectedTicketId]);

  useEffect(() => {
    setShowPaymentDetails(false);
  }, [selectedTicketId]);

  useEffect(() => {
    const el = messageScrollRootRef.current;
    if (!el) return;
    const handleScroll = () => {
      if (el.scrollTop <= 100) {
        void loadOlderMessages();
      }
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [selectedTicketId, olderMessagesPage, loadingOlderMessages]);

  // ============================================================================
  // 💬 Realtime do chat (evento `chat_message`)
  // ============================================================================
  useEffect(() => {
    const unsub = subscribeChatMessages((payload) => {
      const currentId = selectedTicketIdRef.current;
      if (!currentId) return;
      if (payload.ticketId !== currentId) return;

      const raw = payload.message as any;
      const normalized: ChatMessage = {
        ...raw,
        createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : new Date(raw.createdAt ?? Date.now()).toISOString(),
        updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date(raw.updatedAt ?? raw.createdAt ?? Date.now()).toISOString(),
      };

      setMessages((prev) => {
        const exists = prev.some((m) => m.id === normalized.id);
        if (exists) return prev;
        return [...prev, normalized];
      });
    });

    return () => unsub();
  }, []);

  /** Sempre mostra o fim da conversa ao abrir, carregar ou receber mensagem. */
  useLayoutEffect(() => {
    if (!selectedTicketId || loadingMessages) return;
    if (preserveScrollOnPrependRef.current) {
      const anchorId = prependAnchorMessageIdRef.current;
      if (!anchorId) {
        preserveScrollOnPrependRef.current = false;
        return;
      }
      const scrollRoot = messageScrollRootRef.current;
      const anchorEl = scrollRoot?.querySelector(`[data-message-id="${anchorId}"]`) as HTMLDivElement | null;
      if (anchorEl) {
        anchorEl.scrollIntoView({ block: 'start' });
      }
      preserveScrollOnPrependRef.current = false;
      prependAnchorMessageIdRef.current = null;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  }, [selectedTicketId, loadingMessages, messages]);

  const sendMessage = async () => {
    if (!selectedTicketId || !text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    const res = await chatService.sendMessage(selectedTicketId, content);
    setSending(false);
    if (!res.success || !res.data?.data) {
      toast.error(res.error || 'Erro ao enviar mensagem');
      return;
    }
    setMessages((prev) => {
      const msg = res.data!.data;
      const exists = prev.some((m) => m.id === msg.id);
      return exists ? prev : [...prev, msg];
    });
    setText('');
  };

  const paymentActions = selectedConversation
    ? getPaymentActions(selectedConversation, effectivePaymentFlowType)
    : [];
  const isNegotiatedChatWithoutBooking =
    effectivePaymentFlowType === 'NEGOTIATED_VIA_CHAT' &&
    !!selectedConversation &&
    !selectedConversation.bookingId;

  const createProposalInChat = async () => {
    if (!selectedConversation) return;
    const amountAsNumber = Number(proposalAmount.replace(',', '.'));
    if (!Number.isFinite(amountAsNumber) || amountAsNumber <= 0) {
      toast.error('Informe um valor válido para a proposta.');
      return;
    }
    if (!proposalDate || !proposalTime) {
      toast.error('Informe data e horário da proposta.');
      return;
    }
    setCreatingProposal(true);
    const amountInCents = Math.round(amountAsNumber * 100);
    const title = selectedConversation.service?.name
      ? `Proposta - ${selectedConversation.service.name}`
      : 'Proposta de atendimento';
    const res = await chatService.createProposal({
      ticketId: selectedConversation.id,
      title,
      amount: amountInCents,
      ...(selectedConversation.serviceId
        ? { serviceId: selectedConversation.serviceId }
        : {}),
      appointmentDate: proposalDate,
      appointmentTime: proposalTime,
    });
    setCreatingProposal(false);
    if (!res.success) {
      toast.error(res.error || 'Não foi possível criar a proposta.');
      return;
    }
    setShowProposalForm(false);
    setProposalAmount('');
    setProposalDate('');
    setProposalTime('');
    await loadNegotiatedSummary();
    const createdProposalId =
      (res.data as { id?: string } | undefined)?.id ||
      (res.data as { data?: { id?: string } } | undefined)?.data?.id ||
      null;
    const amountLabel = amountAsNumber.toFixed(2).replace('.', ',');
    const summaryText = `Proposta enviada: R$ ${amountLabel} para ${formatDatePtBr(proposalDate)} às ${proposalTime}.`;
    const sendRes = await chatService.sendMessage(selectedConversation.id, summaryText);
    if (sendRes.success && sendRes.data?.data) {
      setMessages((prev) => {
        const msg = sendRes.data!.data;
        const exists = prev.some((m) => m.id === msg.id);
        return exists ? prev : [...prev, msg];
      });
      if (createdProposalId) {
        const linkRes = await chatService.linkProposalMessage(createdProposalId, sendRes.data.data.id);
        if (!linkRes.success) {
          toast.error(linkRes.error || 'A proposta foi criada, mas não foi vinculada à mensagem.');
        }
      }
    }
    await loadNegotiatedSummary();
    toast.success('Proposta enviada. O pagamento sera definido no app do tutor.');
  };

  const handlePaymentActionClick = (action: string) => {
    if (action.includes('agendamento')) {
      navigate('/pro/bookings');
      return;
    }
    if (action.includes('proposta')) {
      toast.info('Próximo passo: conectar criação de proposta neste chat.');
      return;
    }
    if (action.includes('Fluxo instantâneo')) {
      toast.info('No fluxo instantâneo, o pagamento nasce ao criar agendamento.');
      return;
    }
    navigate('/pro/finance');
  };

  const conversationsCard = (
    <Card className="lg:col-span-1 border-aumigo-teal/20 shadow-sm">
      <CardHeader className="pb-3 bg-gradient-to-b from-aumigo-teal/10 to-transparent rounded-t-lg">
        <CardTitle className="text-base flex items-center gap-2 text-aumigo-teal">
          <MessageSquare className="h-4 w-4" />
          Conversas
        </CardTitle>
        <p className="text-xs text-aumigo-gray">
          Filtre por tipo, status e busca rápida.
        </p>
        <div className="rounded-xl border border-aumigo-teal/20 bg-aumigo-teal/5 p-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {chatTypeOptions.map((option) => {
              const active = chatTypeTab === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setChatTypeTab(option.id)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors inline-flex items-center justify-center gap-1.5 ${active
                    ? 'border-aumigo-teal bg-aumigo-teal text-white shadow-sm'
                    : 'border-aumigo-teal/20 bg-white text-aumigo-teal hover:border-aumigo-teal/30'
                    }`}
                >
                  {option.icon}
                  {option.label}
                </button>
              );
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
            <div className="min-w-0 flex-1">
              <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as 'all' | ChatConversation['status'])}>
                <SelectTrigger className="w-full border-aumigo-teal/30 bg-white focus-visible:ring-2 focus-visible:ring-ring/50">
                  <SelectValue placeholder="Status da conversa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="OPEN">Abertas</SelectItem>
                  <SelectItem value="IN_PROGRESS">Em andamento</SelectItem>
                  <SelectItem value="WAITING">Aguardando</SelectItem>
                  <SelectItem value="RESOLVED">Resolvidas</SelectItem>
                  <SelectItem value="CLOSED">Fechadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline" className="shrink-0 justify-center self-center border-aumigo-teal/30 text-aumigo-teal bg-white sm:self-auto">
              {filteredConversations.length} resultado(s)
            </Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-aumigo-gray" />
            <Input
              placeholder="Buscar por tutor, empresa, serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 border-aumigo-teal/30 bg-white focus-visible:ring-2 focus-visible:ring-ring/50"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <ScrollArea style={{ height: '60vh' }}>
          {loadingConversations ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-aumigo-teal" /></div>
          ) : filteredConversations.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhuma conversa.</p>
          ) : (
            <div className="space-y-2">
              {filteredConversations.map((item) => {
                const tutorName = item.createdBy?.name || 'Tutor';
                const photo = item.createdBy?.profilePicture;
                const context = getConversationContext(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedTicketId(item.id);
                      if (isMobile) setMobileScreen('chat');
                    }}
                    className={`w-full text-left rounded-lg border px-3 py-2 flex items-start gap-3 ${selectedTicketId === item.id ? 'border-aumigo-teal bg-aumigo-teal/5' : 'border-gray-200'
                      }`}
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10 shrink-0 border border-gray-100">
                          <AvatarImage src={photo || undefined} alt={tutorName} />
                          <AvatarFallback className="bg-aumigo-teal/15 text-aumigo-teal text-xs font-semibold">
                            {tutorInitials(item.createdBy?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{tutorName}</p>
                          <div className="mt-1">
                            <p className="text-xs text-gray-500 truncate">{item.company?.name || 'Empresa'}</p>
                            <p className="text-xs text-gray-400 truncate">{item.service?.name || item.title}</p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-md border border-gray-200 bg-gray-50 p-2">
                        <div className="mt-2 flex gap-2">
                          <div className="min-w-0 flex-1 flex flex-col gap-1">
                            <span
                              className="font-medium uppercase tracking-wide text-gray-500"
                              style={{ fontSize: 10, lineHeight: 1.2 }}
                            >
                              Status
                            </span>
                            <span
                              className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-center text-xs font-medium ${getConversationStatusTagClass(item.status)}`}
                              style={{ minHeight: '1.5rem' }}
                            >
                              {conversationStatusLabels[item.status || ''] || 'Indefinido'}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col gap-1">
                            <span
                              className="font-medium uppercase tracking-wide text-gray-500"
                              style={{ fontSize: 10, lineHeight: 1.2 }}
                            >
                              Assunto
                            </span>
                            <span
                              className={`inline-flex items-center justify-center rounded-full border px-2 py-0.5 text-center text-xs font-medium ${getContextTagClass(context.label)}`}
                              style={{ minHeight: '1.5rem' }}
                            >
                              {context.label}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 border-t border-gray-200 pt-2">
                          <span
                            className="font-medium uppercase tracking-wide text-gray-500"
                            style={{ fontSize: 10, lineHeight: 1.2 }}
                          >
                            Última mensagem
                          </span>
                          <span className="text-xs font-medium text-gray-700 tabular-nums shrink-0" title={formatDatePtBr(item.replies?.[0]?.createdAt ?? item.updatedAt)}>
                            {formatLastMessageReceived(item)}
                          </span>
                        </div>
                        {item.bookingId ? (
                          <div className="mt-2 flex flex-col gap-1">
                            <span
                              className="font-medium uppercase tracking-wide text-gray-500"
                              style={{ fontSize: 10, lineHeight: 1.2 }}
                            >
                              Agendamento
                            </span>
                            <span
                              className={`inline-flex w-full items-center justify-center rounded-full border px-3 py-1.5 text-center text-sm font-semibold ${getBookingStatusTagClass(item.booking?.status)}`}
                              style={{ minHeight: '2.25rem' }}
                            >
                              {bookingStatusLabels[item.booking?.status || ''] || 'Indefinido'}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-xs text-gray-500">
            Página {conversationsPagination.page} de {Math.max(1, conversationsPagination.totalPages)}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConversationPage((p) => Math.max(1, p - 1))}
              disabled={!conversationsPagination.hasPreviousPage || loadingConversations}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConversationPage((p) => p + 1)}
              disabled={!conversationsPagination.hasNextPage || loadingConversations}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const chatCardStyle: React.CSSProperties = {
    height: isMobile ? 'calc(100dvh - 8.5rem)' : 'calc(100dvh - 10rem)',
    maxHeight: isMobile ? 'calc(100dvh - 8.5rem)' : 'calc(100dvh - 10rem)',
    overflow: 'hidden',
  };

  const chatCard = (
    <Card className="lg:col-span-2 flex min-h-0 flex-col" style={chatCardStyle}>
      <CardHeader className="shrink-0 pt-2 pb-0 border-b px-4" style={{ paddingBottom: '5px' }}>
        <div className="flex items-start gap-4 min-w-0">
          <div className="flex w-8 shrink-0 flex-col items-center gap-2">
            {isMobile ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setMobileScreen('list')}
                aria-label="Voltar para conversas"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            ) : null}
            {selectedConversation?.createdBy ? (
              <Avatar className="h-10 w-10 border border-gray-100">
                <AvatarImage
                  src={selectedConversation.createdBy.profilePicture || undefined}
                  alt={selectedConversation.createdBy.name}
                />
                <AvatarFallback className="bg-aumigo-teal/15 text-aumigo-teal text-xs font-semibold">
                  {tutorInitials(selectedConversation.createdBy.name)}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-xs truncate leading-tight">
              {selectedConversation?.company?.name || 'Selecione uma conversa'}
            </CardTitle>
            <p
              className="text-sm text-gray-500 mt-0.5 leading-tight break-words"
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {selectedConversation
                ? `${selectedConversation.createdBy?.name || 'Tutor'} · ${selectedConversation.service?.name || selectedConversation.title || '-'}`
                : '-'}
            </p>
            {selectedConversation ? (
              <div className="mt-0.5">
                <span className={`inline-flex h-4 items-center rounded-md border px-1.5 text-xs p-2 font-medium ${getContextTagClass(getConversationContext(selectedConversation).label)}`}>
                  {getConversationContext(selectedConversation).label}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col min-h-0 flex-1 overflow-hidden" style={{ marginTop: '0px' }}>
        {selectedConversation ? (
          <div className="mb-1 shrink-0 rounded-lg border border-aumigo-teal/20 bg-aumigo-teal/5 px-2 py-1.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex items-center gap-2">
                <span className="inline-flex h-5 items-center rounded-md border border-aumigo-teal/20 bg-white/90 px-2 text-xs font-semibold text-aumigo-teal">
                  Pagamento
                </span>
                <span className="truncate text-xs font-semibold text-aumigo-teal">
                  {getPaymentFlowLabel(effectivePaymentFlowType)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {loadingPaymentFlow ? <Loader2 className="h-3 w-3 animate-spin text-aumigo-teal" /> : null}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-aumigo-teal hover:bg-aumigo-teal/10"
                  onClick={() => setShowPaymentDetails((prev) => !prev)}
                  aria-label={showPaymentDetails ? 'Ocultar detalhes de pagamento' : 'Visualizar detalhes de pagamento'}
                  title={showPaymentDetails ? 'Ocultar detalhes' : 'Visualizar detalhes'}
                >
                  {showPaymentDetails ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <div className="mt-1 text-xs text-aumigo-gray">
              {selectedConversation.booking?.paymentFlowType ? 'Vínculo: com agendamento' : 'Vínculo: sem agendamento'}
            </div>

            {showPaymentDetails ? (
              <>
                {isNegotiatedChatWithoutBooking ? (
                  <div className="mt-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium  tracking-wide text-aumigo-gray">
                        Status da proposta:
                      </span>
                      <span className="inline-flex h-5 items-center rounded-full border border-aumigo-teal/20 bg-aumigo-teal/10 px-2 text-xs font-medium text-aumigo-teal">
                        {getProposalStatusLabel(negotiatedProposal?.status)}
                      </span>
                    </div>
                    <>
                      {negotiatedProposal ? (
                        <p className="text-xs text-aumigo-gray">
                          Proposta enviada. O metodo de pagamento sera escolhido no app do tutor na etapa de pagamento.
                        </p>
                      ) : null}
                      {!showProposalForm ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-md border border-aumigo-teal/30 bg-white px-3 text-xs font-medium text-aumigo-teal hover:bg-aumigo-teal/10"
                          onClick={() => setShowProposalForm(true)}
                        >
                          Solicitar pagamento
                        </Button>
                      ) : (
                        <div
                          className="grid gap-2 rounded-md border border-aumigo-teal/20 bg-white sm:grid-cols-2"
                          style={{ padding: '0.625rem' }}
                        >
                          <div className="space-y-1">
                            <Label htmlFor="proposal-amount" className="text-xs font-medium text-aumigo-gray">
                              Valor (R$)
                            </Label>
                            <Input
                              id="proposal-amount"
                              type="text"
                              inputMode="decimal"
                              placeholder="0,00"
                              value={proposalAmount}
                              onChange={(e) => setProposalAmount(e.target.value)}
                              className="h-8 border-aumigo-teal/30 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="proposal-appointment-date" className="text-xs font-medium text-aumigo-gray">
                              Data do agendamento
                            </Label>
                            <Input
                              id="proposal-appointment-date"
                              type="date"
                              value={proposalDate}
                              onChange={(e) => setProposalDate(e.target.value)}
                              className="h-8 border-aumigo-teal/30 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor="proposal-appointment-time" className="text-xs font-medium text-aumigo-gray">
                              Horário do agendamento
                            </Label>
                            <Input
                              id="proposal-appointment-time"
                              type="time"
                              value={proposalTime}
                              onChange={(e) => setProposalTime(e.target.value)}
                              className="h-8 border-aumigo-teal/30 text-xs"
                            />
                          </div>
                          <div className="flex items-center justify-end gap-2 sm:col-span-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => setShowProposalForm(false)}
                            >
                              Cancelar
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 bg-aumigo-teal px-2.5 text-xs hover:bg-aumigo-teal/90"
                              onClick={() => { void createProposalInChat(); }}
                              disabled={creatingProposal}
                            >
                              {creatingProposal ? 'Criando...' : 'Enviar proposta'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  </div>
                ) : paymentActions.length > 0 ? (
                  <div className="mt-1 flex gap-1.5 overflow-x-auto pb-0.5">
                    {paymentActions.map((action) => (
                      <Button
                        key={action}
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 shrink-0 whitespace-nowrap rounded-md border border-aumigo-teal/30 bg-white px-2.5 text-xs font-medium text-aumigo-teal hover:bg-aumigo-teal/10"
                        onClick={() => handlePaymentActionClick(action)}
                        disabled={false}
                      >
                        {action}
                      </Button>
                    ))}
                  </div>
                ) : null}

                {effectivePaymentFlowType === 'NEGOTIATED_VIA_CHAT' ? (
                  <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                    {loadingNegotiatedSummary ? (
                      <span className="text-aumigo-gray">Carregando resumo...</span>
                    ) : (
                      <>
                        <span className="inline-flex items-center rounded-md border border-aumigo-orange/20 bg-white px-2 py-0.5 text-aumigo-teal">
                          Serviço: {selectedConversation.service?.name || negotiatedProposal?.service?.name || negotiatedProposal?.title || '-'}
                        </span>
                        <span className="inline-flex items-center rounded-md border border-aumigo-orange/20 bg-white px-2 py-0.5 text-aumigo-teal">
                          Data: {selectedConversation.booking?.date
                            ? formatDatePtBr(selectedConversation.booking.date)
                            : formatDatePtBr(negotiatedProposal?.appointmentDate || undefined)}
                        </span>
                        <span className="inline-flex items-center rounded-md border border-aumigo-orange/20 bg-white px-2 py-0.5 text-aumigo-teal">
                          Hora: {selectedConversation.booking?.time || negotiatedProposal?.appointmentTime || '-'}
                        </span>
                      </>
                    )}
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
        <div ref={messageScrollRootRef} className="pro-chat-messages-scroll flex-1 min-h-0">
          {loadingMessages ? (
            <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-aumigo-teal" /></div>
          ) : messages.length === 0 ? (
            <p className="text-sm text-gray-500">Sem mensagens.</p>
          ) : (
            <div className="space-y-2">
              {olderMessagesPage ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => void loadOlderMessages()}
                    disabled={loadingOlderMessages}
                    className="pro-chat-load-link"
                  >
                    {loadingOlderMessages ? 'Carregando...' : 'Ler mais'}
                  </button>
                </div>
              ) : null}
              {loadingOlderMessages ? (
                <div className="py-1 flex justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-aumigo-teal" />
                </div>
              ) : null}
              {messages.map((msg) => {
                const mine = msg.authorId === user?.id;
                const isLinkedProposalMessage = negotiatedProposal?.messageId === msg.id;
                return (
                  <div key={msg.id} data-message-id={msg.id} className={`flex px-2 ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`flex flex-col gap-0.5 rounded-xl px-3 py-2 text-sm ${mine ? 'bg-aumigo-orange text-white' : 'bg-gray-100 text-gray-800'} ${isLinkedProposalMessage ? 'border-2 border-aumigo-teal/30' : ''}`}
                      style={{ maxWidth: '80%' }}
                    >
                      {isLinkedProposalMessage ? (
                        <p className={`mb-1 text-xs font-semibold uppercase tracking-wide ${mine ? 'text-white/90' : 'text-aumigo-teal'}`}>
                          Mensagem de proposta
                        </p>
                      ) : null}
                      <CollapsibleMessageText content={msg.content} mine={mine} />
                      <time
                        className={mine ? 'pro-msg-meta-time pro-msg-meta-time-mine' : 'pro-msg-meta-time pro-msg-meta-time-theirs'}
                        dateTime={msg.createdAt}
                        title={formatDatePtBr(msg.createdAt)}
                      >
                        {formatMessageTime(msg.createdAt)}
                      </time>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} aria-hidden className="h-1 shrink-0" />
            </div>
          )}
        </div>
        <div className="mt-2 flex shrink-0 gap-2">
          <Input
            placeholder="Digite uma mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void sendMessage(); }}
            disabled={!selectedTicketId}
          />
          <Button onClick={() => void sendMessage()} disabled={!selectedTicketId || !text.trim() || sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="pro-chat-live p-4 sm:p-6 space-y-4">
      {!(isMobile && mobileScreen === 'chat') ? (
        <div>
          <h1 className="text-aumigo-teal text-2xl sm:text-3xl font-semibold mb-1">Chat com clientes</h1>
          <p className="text-aumigo-gray text-sm sm:text-base">Conversas por serviço, agendamento ou contato direto.</p>
        </div>
      ) : null}

      {isMobile ? (
        <div className="grid min-h-0 grid-cols-1 gap-4 [&>*]:min-h-0">
          {mobileScreen === 'list' ? conversationsCard : chatCard}
        </div>
      ) : (
        <div className="grid min-h-0 grid-cols-1 gap-4 lg:grid-cols-3 [&>*]:min-h-0">
          {conversationsCard}
          {chatCard}
        </div>
      )}

    </div>
  );
}

