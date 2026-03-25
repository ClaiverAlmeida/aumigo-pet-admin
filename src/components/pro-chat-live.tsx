import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Loader2, MessageSquare, Send } from 'lucide-react';
import { chatService, type ChatConversation, type ChatMessage } from '../services/chat.service';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { subscribeChatMessages } from '../services/socket.service';

function tutorInitials(name: string | undefined): string {
  if (!name?.trim()) return 'T';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function ProChatLive() {
  const { user } = useAuth();
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const [text, setText] = useState('');
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const PRO_CHAT_LOCAL_STORAGE_KEY = 'proChat:selectedTicketId';
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(PRO_CHAT_LOCAL_STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const selectedTicketIdRef = useRef<string | null>(selectedTicketId);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    selectedTicketIdRef.current = selectedTicketId;
  }, [selectedTicketId]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const selectedConversation = useMemo(
    () => conversations.find((item) => item.id === selectedTicketId) || null,
    [conversations, selectedTicketId],
  );

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((item) => {
      const tutorName = item.createdBy?.name || '';
      const company = item.company?.name || '';
      const service = item.service?.name || '';
      return `${tutorName} ${company} ${service}`.toLowerCase().includes(term);
    });
  }, [conversations, search]);

  const loadConversations = async () => {
    setLoadingConversations(true);
    const res = await chatService.listConversations(1, 50);
    setLoadingConversations(false);
    if (!res.success || !res.data) {
      toast.error(res.error || 'Erro ao carregar conversas');
      return;
    }
    const list = Array.isArray(res.data.data) ? res.data.data : [];
    setConversations(list);
    if (!selectedTicketId && list.length > 0) setSelectedTicketId(list[0].id);
  };

  const loadMessages = async (ticketId: string) => {
    setLoadingMessages(true);
    const res = await chatService.listMessages(ticketId, 1, 100);
    setLoadingMessages(false);
    if (!res.success || !res.data) {
      toast.error(res.error || 'Erro ao carregar mensagens');
      return;
    }
    setMessages(Array.isArray(res.data.data) ? res.data.data : []);
  };

  useEffect(() => {
    void loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedTicketId) return;
    // Após usar o ticket pré-selecionado via notificação, limpa o localStorage
    try {
      const stored = localStorage.getItem(PRO_CHAT_LOCAL_STORAGE_KEY);
      if (stored && stored === selectedTicketId) {
        localStorage.removeItem(PRO_CHAT_LOCAL_STORAGE_KEY);
      }
    } catch {
      // ignore
    }
  }, [selectedTicketId]);

  useEffect(() => {
    if (!selectedTicketId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedTicketId);
  }, [selectedTicketId]);

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

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className="text-aumigo-teal text-2xl sm:text-3xl font-semibold mb-1">Chat com clientes</h1>
        <p className="text-aumigo-gray text-sm sm:text-base">Conversa por serviço e empresa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Conversas</CardTitle>
            <Input
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[60vh]">
              {loadingConversations ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-aumigo-teal" /></div>
              ) : filteredConversations.length === 0 ? (
                <p className="text-sm text-gray-500">Nenhuma conversa.</p>
              ) : (
                <div className="space-y-2">
                  {filteredConversations.map((item) => {
                    const tutorName = item.createdBy?.name || 'Tutor';
                    const photo = item.createdBy?.profilePicture;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          try {
                            localStorage.removeItem(PRO_CHAT_LOCAL_STORAGE_KEY);
                          } catch {
                            // ignore
                          }
                          setSelectedTicketId(item.id);
                        }}
                        className={`w-full text-left rounded-lg border px-3 py-2 flex items-start gap-3 ${
                          selectedTicketId === item.id ? 'border-aumigo-teal bg-aumigo-teal/5' : 'border-gray-200'
                        }`}
                      >
                        <Avatar className="h-10 w-10 shrink-0 border border-gray-100">
                          <AvatarImage src={photo || undefined} alt={tutorName} />
                          <AvatarFallback className="bg-aumigo-teal/15 text-aumigo-teal text-xs font-semibold">
                            {tutorInitials(item.createdBy?.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{tutorName}</p>
                          <p className="text-xs text-gray-500 truncate">{item.company?.name || 'Empresa'}</p>
                          <p className="text-xs text-gray-400 truncate">{item.service?.name || item.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                {selectedConversation?.createdBy ? (
                  <Avatar className="h-10 w-10 shrink-0 border border-gray-100">
                    <AvatarImage
                      src={selectedConversation.createdBy.profilePicture || undefined}
                      alt={selectedConversation.createdBy.name}
                    />
                    <AvatarFallback className="bg-aumigo-teal/15 text-aumigo-teal text-xs font-semibold">
                      {tutorInitials(selectedConversation.createdBy.name)}
                    </AvatarFallback>
                  </Avatar>
                ) : null}
                <div className="min-w-0">
                  <CardTitle className="text-base truncate">
                    {selectedConversation?.company?.name || 'Selecione uma conversa'}
                  </CardTitle>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {selectedConversation
                      ? `${selectedConversation.createdBy?.name || 'Tutor'} · ${selectedConversation.service?.name || selectedConversation.title || '-'}`
                      : '-'}
                  </p>
                </div>
              </div>
              {/* {selectedConversation ? <Badge variant="outline">{selectedConversation.status}</Badge> : null} */}
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <ScrollArea className="h-[48vh] pr-1">
              {loadingMessages ? (
                <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-aumigo-teal" /></div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-gray-500">Sem mensagens.</p>
              ) : (
                <div className="space-y-2">
                  {messages.map((msg) => {
                    const mine = msg.authorId === user?.id;
                    return (
                      <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${mine ? 'bg-aumigo-orange text-white' : 'bg-gray-100 text-gray-800'}`}>
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} aria-hidden className="h-1 shrink-0" />
                </div>
              )}
            </ScrollArea>

            <div className="mt-3 flex gap-2">
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
      </div>
    </div>
  );
}

