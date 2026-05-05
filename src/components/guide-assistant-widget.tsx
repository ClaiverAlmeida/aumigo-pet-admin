import { useEffect, useState } from 'react';
import { Bot, Loader2, Send, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { toast } from 'sonner';
import { guideAgentService } from '../services/guide-agent.service';
import { useRouter } from '../hooks/useRouter';

const PRO_PAGES = new Set([
  'overview',
  'services',
  'availability',
  'bookings',
  'ads',
  'kyc',
  'finance',
  'reviews',
  'chat',
  'settings',
  'coupons',
  'notifications',
]);

function resolveAgentPath(rawPath: unknown): string | null {
  if (typeof rawPath !== 'string' || !rawPath.trim()) return null;
  const path = rawPath.trim();
  if (path.startsWith('/pro/') || path.startsWith('/admin/')) return path;

  const compact = path.replace(/^\/+/, '');
  if (PRO_PAGES.has(compact)) return `/pro/${compact}`;
  return null;
}

function formatAssistantMessage(raw: string): string {
  const message = raw.trim();
  if (!message) return raw;
  if (!message.includes('Exemplos:')) return message;

  let normalized = message.replace(/([.!?])\s+Exemplos:/g, '$1\nExemplos:');
  normalized = normalized.replace(/Exemplos:\s*[-–]\s*/g, 'Exemplos:\n- ');
  normalized = normalized.replace(/\s+[-–]\s+/g, '\n- ');
  return normalized;
}

interface GuideAssistantWidgetProps {
  open: boolean;
  onClose: () => void;
}

export function GuideAssistantWidget({ open, onClose }: GuideAssistantWidgetProps) {
  const { navigate } = useRouter();
  const [sending, setSending] = useState(false);
  const [healthy, setHealthy] = useState<boolean | null>(null);
  const [text, setText] = useState('');
  const [starterQuestions, setStarterQuestions] = useState<string[]>([]);
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{ id: string; role: 'user' | 'assistant'; text: string; action?: string }>>([]);

  useEffect(() => {
    if (!open) return;
    void guideAgentService.health().then((result) => setHealthy(result.success));
    void guideAgentService.starterQuestions().then((result) => {
      if (result.success && result.questions.length > 0) {
        setStarterQuestions(result.questions);
        return;
      }
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      if (path.startsWith('/admin')) {
        setStarterQuestions([
          'Listar usuários do sistema',
          'Listar empresas cadastradas',
          'Listar serviços disponíveis',
          'Resumo operacional do sistema',
        ]);
        return;
      }
      if (path.startsWith('/pro')) {
        setStarterQuestions([
          'Listar meus serviços',
          'Mostrar minha agenda',
          'Consultar disponibilidade',
          'Ver minhas avaliações',
        ]);
        return;
      }
      setStarterQuestions([
        'Listar meus pets',
        'Mostrar meus agendamentos',
        'Ver minhas notificações',
      ]);
    });
  }, [open]);

  const sendMessage = async (forcedMessage?: string) => {
    if (sending) return;
    const content = (forcedMessage ?? text).trim();
    if (!content) return;
    setText('');
    setMessages((prev) => [...prev, { id: `u_${Date.now()}`, role: 'user', text: content }]);
    setSending(true);
    const res = await guideAgentService.turn(content, confirmationToken ?? undefined);
    setSending(false);

    if (!res.success || !res.data) {
      const fallback =
        res.status === 401 || res.status === 403
          ? 'Sua sessão expirou. Faça login novamente para continuar.'
          : res.error || 'Erro ao consultar o assistente.';
      toast.error(fallback);
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: 'assistant', text: fallback, action: 'BACKEND_ERROR' }]);
      return;
    }

    const response = res.data;
    if (response.requires_confirmation && response.confirmation_token) {
      setConfirmationToken(response.confirmation_token);
    } else {
      setConfirmationToken(null);
    }
    setMessages((prev) => [
      ...prev,
      {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: formatAssistantMessage(response.message),
        action: response.action,
      },
    ]);

    if (response.action === 'NAVIGATE') {
      const targetPath = resolveAgentPath(response.payload?.path);
      if (!targetPath) {
        toast.warning('Assistente sugeriu navegação fora das rotas deste painel.');
        return;
      }
      navigate(targetPath);
      toast.success(`Abrindo ${targetPath}`);
      onClose();
      return;
    }

    if (response.action === 'BACKEND_ERROR') {
      const backendMessage =
        typeof response.backend?.message === 'string'
          ? response.backend.message
          : response.message;
      toast.error(backendMessage || 'Falha ao executar ação no backend');
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 88,
        zIndex: 10000,
        pointerEvents: open ? 'auto' : 'none',
        visibility: open ? 'visible' : 'hidden',
      }}
    >
      <Card
        className={`border-0 shadow-2xl transition-all duration-300 ease-out ${
          open ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'
        }`}
        style={{
          width: 'min(370px, calc(100vw - 32px))',
          minWidth: '280px',
        }}
      >
        <CardHeader className="relative rounded-t-xl border-b bg-gradient-to-r from-aumigo-teal via-cyan-600 to-aumigo-orange text-white pr-14">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bot className="h-4 w-4" />
              AuMigoPet Assistente
              <Sparkles className="h-4 w-4 opacity-90" />
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge className="bg-black/25 text-white hover:bg-black/25">
                {healthy === null ? 'Checando...' : healthy ? 'Online' : 'Offline'}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 bg-white text-aumigo-teal hover:bg-white/90 hover:text-aumigo-teal"
            onClick={onClose}
            aria-label="Fechar chat"
          >
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 bg-white p-3">
          <ScrollArea className="h-[260px] rounded-md border bg-slate-50 p-2">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Use uma sugestão para começar no fluxo correto para o seu perfil.
                </p>
                <div className="flex flex-wrap gap-2">
                  {starterQuestions.map((question) => (
                    <Button
                      key={question}
                      variant="outline"
                      size="sm"
                      className="h-auto whitespace-normal text-left text-[11px]"
                      onClick={() => void sendMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((msg) => {
                  const mine = msg.role === 'user';
                  return (
                    <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[88%] rounded-xl px-3 py-2 text-xs ${
                          mine ? 'bg-aumigo-orange text-white' : 'bg-white text-slate-700 shadow-sm'
                        }`}
                      >
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
          <div className="flex gap-2">
            <Input
              placeholder="Ex.: quais serviços eu tenho?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void sendMessage();
              }}
              disabled={sending}
            />
            <Button onClick={() => void sendMessage()} disabled={!text.trim() || sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          {confirmationToken ? (
            <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-2 py-1">
              <p className="text-[11px] text-amber-800">Ação de escrita pendente de confirmação.</p>
              <Button size="sm" variant="outline" onClick={() => void sendMessage('Confirmar operação pendente')}>
                Confirmar
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
