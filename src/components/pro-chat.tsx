import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Archive,
  Star,
  CheckCheck,
  Check,
  Clock,
  User,
  Users,
  X,
  Bell,
  BellOff,
  Pin,
  Hash,
  FileText,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Plus,
  AlertCircle,
  Trash2,
  Edit3,
  Copy,
  Reply
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from './ui/dropdown-menu'
import { cn } from './ui/utils'
import { toast } from 'sonner'

// Tipos aprimorados com TypeScript completo
interface Client {
  id: number
  name: string
  avatar: string
  pets: Array<{
    id: number
    name: string
    breed?: string
  }>
  isOnline: boolean
  lastSeen?: Date
  phone?: string
  email?: string
}

interface Attachment {
  id: number
  name: string
  type: 'image' | 'document' | 'audio'
  url: string
  size?: number
}

interface Message {
  id: number
  text: string
  time: Date
  isFromMe: boolean
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  type: 'text' | 'image' | 'file' | 'audio'
  attachments?: Attachment[]
  replyTo?: number
  edited?: boolean
  editedAt?: Date
}

interface Conversation {
  id: number
  client: Client
  lastMessage: Message
  unreadCount: number
  isStarred: boolean
  isArchived: boolean
  isPinned: boolean
  isMuted: boolean
  isTyping: boolean
  typingTimeout?: NodeJS.Timeout
  createdAt: Date
  tags?: string[]
}

type FilterType = 'all' | 'unread' | 'starred' | 'archived' | 'pinned' | 'muted'
type SortType = 'recent' | 'name' | 'unread'

// Mock data aprimorado
const generateMockConversations = (): Conversation[] => {
  const now = new Date()
  const clients: Client[] = [
    {
      id: 1,
      name: "Ana Clara Silva",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
      pets: [
        { id: 1, name: "Luna", breed: "Golden Retriever" },
        { id: 2, name: "Bella", breed: "Poodle" }
      ],
      isOnline: true,
      phone: "(11) 99999-9999",
      email: "ana@email.com"
    },
    {
      id: 2,
      name: "Carlos Eduardo Santos",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      pets: [{ id: 3, name: "Rex", breed: "Pastor Alemão" }],
      isOnline: false,
      lastSeen: new Date(now.getTime() - 1000 * 60 * 60 * 2),
      phone: "(11) 88888-8888",
      email: "carlos@email.com"
    },
    {
      id: 3,
      name: "Mariana Santos Costa",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face",
      pets: [
        { id: 4, name: "Mimi", breed: "Siamês" },
        { id: 5, name: "Totó", breed: "Vira-lata" }
      ],
      isOnline: true,
      phone: "(11) 77777-7777",
      email: "mariana@email.com"
    },
    {
      id: 4,
      name: "Pedro Lima Oliveira",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
      pets: [{ id: 6, name: "Buddy", breed: "Labrador" }],
      isOnline: false,
      lastSeen: new Date(now.getTime() - 1000 * 60 * 60 * 5),
      phone: "(11) 66666-6666",
      email: "pedro@email.com"
    },
    {
      id: 5,
      name: "Juliana Costa Ferreira",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
      pets: [{ id: 7, name: "Princesa", breed: "Yorkshire" }],
      isOnline: true,
      phone: "(11) 55555-5555",
      email: "juliana@email.com"
    }
  ]

  return clients.map((client, index) => ({
    id: client.id,
    client,
    lastMessage: {
      id: index + 100,
      text: [
        "Obrigada pelo excelente serviço! A Luna adorou a consulta veterinária 🐕",
        "Qual horário você tem disponível amanhã para o Rex?",
        "Perfeito! Agendado para quinta-feira às 15h",
        "Posso agendar consulta veterinária para o Buddy?",
        "A Princesa está se comportando muito melhor após o adestramento!"
      ][index],
      time: new Date(now.getTime() - 1000 * 60 * (30 + index * 60)),
      isFromMe: index % 2 === 0,
      status: 'read' as const,
      type: 'text' as const
    },
    unreadCount: [0, 2, 0, 1, 0][index],
    isStarred: [true, false, false, true, false][index],
    isArchived: false,
    isPinned: [true, false, false, false, false][index],
    isMuted: [false, false, false, false, true][index],
    isTyping: [false, true, false, false, false][index],
    createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * (index + 1)),
    tags: [['vip'], [], ['regular'], ['new'], ['frequent']][index]
  }))
}

const generateMockMessages = (conversationId: number): Message[] => {
  const now = new Date()
  const messageTemplates = [
    // Conversa 1 - Ana Clara
    [
      { text: "Olá! Gostaria de agendar uma consulta veterinária para a Luna", isFromMe: false, hours: 8 },
      { text: "Olá Ana! Claro, posso sim. Que dia seria melhor para você?", isFromMe: true, hours: 7 },
      { text: "Seria possível na sexta-feira pela manhã?", isFromMe: false, hours: 6 },
      { text: "Perfeito! Tenho disponibilidade às 10h. Confirmo para você?", isFromMe: true, hours: 5 },
      { text: "Sim, por favor! A Luna vai adorar ❤️", isFromMe: false, hours: 4 },
      { text: "Agendamento confirmado! Sexta-feira às 10h para consulta veterinária com Dr. Ana da Luna. Até lá! 🐕✨", isFromMe: true, hours: 3 },
      { text: "Obrigada pelo excelente serviço! A Luna adorou o banho 🐕", isFromMe: false, hours: 0.5 }
    ],
    // Conversa 2 - Carlos Eduardo
    [
      { text: "Boa tarde! Preciso agendar um passeio para o Rex", isFromMe: false, hours: 2 },
      { text: "Qual horário você tem disponível amanhã?", isFromMe: false, hours: 1 }
    ],
    // Conversa 3 - Mariana Santos
    [
      { text: "Oi! Como está a Mimi depois da consulta?", isFromMe: true, hours: 4 },
      { text: "Ela está bem melhor! Obrigada pela recomendação do veterinário", isFromMe: false, hours: 3 },
      { text: "Que bom! Qualquer coisa me avise", isFromMe: true, hours: 2.5 },
      { text: "Perfeito! Agendado para quinta-feira às 15h", isFromMe: true, hours: 2 }
    ]
  ]

  const messages = messageTemplates[conversationId - 1] || []
  return messages.map((msg, index) => ({
    id: index + 1,
    text: msg.text,
    time: new Date(now.getTime() - 1000 * 60 * 60 * msg.hours),
    isFromMe: msg.isFromMe,
    status: (msg.isFromMe ? 'read' : 'read') as const,
    type: 'text' as const
  }))
}

// Hook personalizado para gerenciar conversas
const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>(() => generateMockConversations())
  const [messages, setMessages] = useState<Record<number, Message[]>>({})

  const updateConversation = useCallback((id: number, updates: Partial<Conversation>) => {
    setConversations(prev => 
      prev.map(conv => conv.id === id ? { ...conv, ...updates } : conv)
    )
  }, [])

  const addMessage = useCallback((conversationId: number, message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now() + Math.random()
    }

    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }))

    // Atualizar última mensagem na conversa
    updateConversation(conversationId, {
      lastMessage: newMessage,
      unreadCount: message.isFromMe ? 0 : (conversations.find(c => c.id === conversationId)?.unreadCount || 0) + 1
    })

    return newMessage
  }, [conversations, updateConversation])

  const loadMessages = useCallback((conversationId: number) => {
    if (!messages[conversationId]) {
      setMessages(prev => ({
        ...prev,
        [conversationId]: generateMockMessages(conversationId)
      }))
    }
  }, [messages])

  return {
    conversations,
    messages,
    updateConversation,
    addMessage,
    loadMessages
  }
}

// Componente de lista de conversas otimizado
interface ConversationListProps {
  conversations: Conversation[]
  selectedConversation: number | null
  onSelectConversation: (id: number) => void
  searchTerm: string
  filter: FilterType
  sortBy: SortType
  onToggleStar: (id: number) => void
  onTogglePin: (id: number) => void
  onToggleMute: (id: number) => void
  onArchive: (id: number) => void
  onDelete: (id: number) => void
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  searchTerm,
  filter,
  sortBy,
  onToggleStar,
  onTogglePin,
  onToggleMute,
  onArchive,
  onDelete
}) => {
  const filteredAndSortedConversations = useMemo(() => {
    let filtered = conversations.filter(conv => {
      // Filtro por termo de busca
      const matchesSearch = !searchTerm || (
        conv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.client.pets.some(pet => pet.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        conv.lastMessage.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      if (!matchesSearch) return false

      // Filtro por tipo
      switch (filter) {
        case 'unread':
          return conv.unreadCount > 0
        case 'starred':
          return conv.isStarred
        case 'archived':
          return conv.isArchived
        case 'pinned':
          return conv.isPinned
        case 'muted':
          return conv.isMuted
        default:
          return !conv.isArchived
      }
    })

    // Ordenação
    filtered.sort((a, b) => {
      // Conversas fixadas sempre no topo
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      switch (sortBy) {
        case 'name':
          return a.client.name.localeCompare(b.client.name)
        case 'unread':
          return b.unreadCount - a.unreadCount
        default: // 'recent'
          return b.lastMessage.time.getTime() - a.lastMessage.time.getTime()
      }
    })

    return filtered
  }, [conversations, searchTerm, filter, sortBy])

  const formatTime = useCallback((date: Date) => {
    const now = new Date()
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60)
    
    if (diffInMinutes < 1) return 'Agora'
    if (diffInMinutes < 60) return `${Math.floor(diffInMinutes)}min`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`
    if (diffInMinutes < 10080) return date.toLocaleDateString('pt-BR', { weekday: 'short' })
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
  }, [])

  const getStatusText = useCallback((client: Client) => {
    if (client.isOnline) {
      return { text: 'Online agora', className: 'text-aumigo-mint' }
    }
    
    if (!client.lastSeen) {
      return { text: 'Visto há muito tempo', className: 'text-muted-foreground' }
    }
    
    const diffInMinutes = (Date.now() - client.lastSeen.getTime()) / (1000 * 60)
    if (diffInMinutes < 60) {
      return { text: `Visto há ${Math.floor(diffInMinutes)}min`, className: 'text-muted-foreground' }
    } else if (diffInMinutes < 1440) {
      return { text: `Visto há ${Math.floor(diffInMinutes / 60)}h`, className: 'text-muted-foreground' }
    } else {
      return { text: `Visto há ${Math.floor(diffInMinutes / 1440)}d`, className: 'text-muted-foreground' }
    }
  }, [])

  if (filteredAndSortedConversations.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="font-medium text-foreground mb-2">
          {searchTerm ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa'}
        </h3>
        <p className="text-muted-foreground text-sm">
          {searchTerm ? 'Tente ajustar o termo de busca' : 'Suas conversas aparecerão aqui'}
        </p>
        {searchTerm && (
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => {/* limpar busca */}}
          >
            Limpar busca
          </Button>
        )}
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-2">
        {filteredAndSortedConversations.map((conversation) => {
          const statusInfo = getStatusText(conversation.client)
          
          return (
            <div 
              key={conversation.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:bg-muted/50 border border-transparent rounded-lg p-3 mx-2 my-1 group",
                selectedConversation === conversation.id && "bg-aumigo-orange/10 border-aumigo-orange/30 shadow-sm"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <div>
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={conversation.client.avatar} alt={conversation.client.name} />
                      <AvatarFallback className="bg-aumigo-blue/20 text-aumigo-teal">
                        {conversation.client.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.client.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-aumigo-mint border-2 border-white rounded-full" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {conversation.isPinned && (
                          <Pin className="h-3 w-3 text-aumigo-blue flex-shrink-0 fill-current" />
                        )}
                        <h4 className="font-medium text-foreground truncate">
                          {conversation.client.name}
                        </h4>
                        {conversation.isStarred && (
                          <Star className="h-3 w-3 text-yellow-500 fill-current flex-shrink-0" />
                        )}
                        {conversation.isMuted && (
                          <BellOff className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(conversation.lastMessage.time)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs border-aumigo-gray/30 text-aumigo-gray">
                        {conversation.client.pets.map(pet => pet.name).join(', ')}
                      </Badge>
                      {conversation.tags && conversation.tags.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {conversation.tags[0]}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {conversation.lastMessage.isFromMe && (
                          <div className="flex-shrink-0">
                            {conversation.lastMessage.status === 'read' && (
                              <CheckCheck className="h-3 w-3 text-aumigo-blue" />
                            )}
                            {conversation.lastMessage.status === 'delivered' && (
                              <CheckCheck className="h-3 w-3 text-muted-foreground" />
                            )}
                            {conversation.lastMessage.status === 'sent' && (
                              <Check className="h-3 w-3 text-muted-foreground" />
                            )}
                            {conversation.lastMessage.status === 'sending' && (
                              <Clock className="h-3 w-3 text-muted-foreground animate-spin" />
                            )}
                            {conversation.lastMessage.status === 'failed' && (
                              <AlertCircle className="h-3 w-3 text-destructive" />
                            )}
                          </div>
                        )}
                        <p className={cn(
                          "text-sm truncate",
                          conversation.isTyping ? "text-aumigo-blue italic" : "text-muted-foreground",
                          conversation.unreadCount > 0 && !conversation.lastMessage.isFromMe && "font-medium text-foreground"
                        )}>
                          {conversation.isTyping ? "Digitando..." : conversation.lastMessage.text}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-aumigo-orange text-white text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </Badge>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              onTogglePin(conversation.id)
                            }}>
                              <Pin className="h-4 w-4 mr-2" />
                              {conversation.isPinned ? 'Desafixar' : 'Fixar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              onToggleStar(conversation.id)
                            }}>
                              <Star className="h-4 w-4 mr-2" />
                              {conversation.isStarred ? 'Remover favorito' : 'Favoritar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              onToggleMute(conversation.id)
                            }}>
                              {conversation.isMuted ? (
                                <Bell className="h-4 w-4 mr-2" />
                              ) : (
                                <BellOff className="h-4 w-4 mr-2" />
                              )}
                              {conversation.isMuted ? 'Ativar notificações' : 'Silenciar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                onArchive(conversation.id)
                              }}
                            >
                              <Archive className="h-4 w-4 mr-2" />
                              Arquivar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                onDelete(conversation.id)
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="mt-1">
                      <span className={cn("text-xs", statusInfo.className)}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}

// Componente da área de chat aprimorado
interface ChatAreaProps {
  conversation: Conversation | null
  messages: Message[]
  onSendMessage: (text: string) => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
}

const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  onSendMessage,
  isFullscreen,
  onToggleFullscreen
}) => {
  const [messageText, setMessageText] = useState('')
  const [replyTo, setReplyTo] = useState<Message | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const newHeight = Math.min(textarea.scrollHeight, 120)
      textarea.style.height = `${newHeight}px`
    }
  }, [messageText])

  const handleSend = useCallback(() => {
    const trimmedText = messageText.trim()
    if (trimmedText) {
      onSendMessage(trimmedText)
      setMessageText('')
      setReplyTo(null)
      textareaRef.current?.focus()
    }
  }, [messageText, onSendMessage])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  const formatMessageTime = useCallback((date: Date) => {
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    } else if (isYesterday) {
      return `Ontem ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }, [])

  const getStatusText = useCallback((client: Client) => {
    if (client.isOnline) return 'Online agora'
    if (!client.lastSeen) return 'Visto há muito tempo'
    
    const diffInMinutes = (Date.now() - client.lastSeen.getTime()) / (1000 * 60)
    if (diffInMinutes < 60) {
      return `Visto há ${Math.floor(diffInMinutes)}min`
    } else if (diffInMinutes < 1440) {
      return `Visto há ${Math.floor(diffInMinutes / 60)}h`
    } else {
      return `Visto há ${Math.floor(diffInMinutes / 1440)}d`
    }
  }, [])

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 p-8">
        <div className="text-center max-w-md">
          <div className="bg-aumigo-orange/10 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-12 w-12 text-aumigo-orange" />
          </div>
          <h3 className="font-medium text-foreground mb-2">Selecione uma conversa</h3>
          <p className="text-muted-foreground mb-4">
            Escolha uma conversa da lista ao lado para começar a chat com seus clientes
          </p>
          <Button 
            className="bg-aumigo-orange hover:bg-aumigo-orange/90"
            onClick={() => toast.info('Busca de novos clientes em desenvolvimento')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova conversa
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header da conversa */}
      <div className="bg-card border-b border-border/50 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.client.avatar} alt={conversation.client.name} />
                <AvatarFallback className="bg-aumigo-blue/20 text-aumigo-teal text-sm">
                  {conversation.client.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {conversation.client.isOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-aumigo-mint border-2 border-white rounded-full" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-foreground text-base">{conversation.client.name}</h3>
              <div className="flex items-center gap-2 text-xs mt-1">
                <Badge variant="outline" className="border-aumigo-gray/30 text-aumigo-gray text-xs px-2 py-1">
                  {conversation.client.pets.map(pet => pet.name).join(', ')}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className={cn(
                  "text-muted-foreground text-xs",
                  conversation.client.isOnline && "text-aumigo-mint"
                )}>
                  {getStatusText(conversation.client)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-aumigo-blue hover:bg-aumigo-blue/10 h-8 w-8 p-0"
              onClick={() => toast.success('Chamada de voz iniciada')}
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-aumigo-blue hover:bg-aumigo-blue/10 h-8 w-8 p-0"
              onClick={() => toast.success('Videochamada iniciada')}
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onToggleFullscreen}
              className="text-muted-foreground hover:text-foreground h-8 w-8 p-0"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Informações do Cliente</DropdownMenuLabel>
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Ver perfil completo
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Histórico de serviços
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar conversa
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="h-4 w-4 mr-2" />
                  Favoritar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => {
            const showDateSeparator = index === 0 || 
              message.time.toDateString() !== messages[index - 1]?.time.toDateString()
            
            return (
              <div key={message.id}>
                {showDateSeparator && (
                  <div className="flex items-center gap-4 my-6">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full whitespace-nowrap">
                      {message.time.toLocaleDateString('pt-BR', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                )}
                
                <div className={cn("flex group", message.isFromMe ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-3 text-sm relative",
                    message.isFromMe
                      ? "bg-aumigo-orange text-white"
                      : "bg-card border shadow-sm text-foreground"
                  )}>
                    <p className="leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                    <div className={cn(
                      "flex items-center gap-1 mt-2 text-xs",
                      message.isFromMe ? "text-white/80 justify-end" : "text-muted-foreground"
                    )}>
                      {message.edited && (
                        <span className="mr-1">(editado)</span>
                      )}
                      <span>{formatMessageTime(message.time)}</span>
                      {message.isFromMe && (
                        <div className="ml-1 flex-shrink-0">
                          {message.status === 'read' && <CheckCheck className="h-3 w-3 text-white/80" />}
                          {message.status === 'delivered' && <CheckCheck className="h-3 w-3 text-white/60" />}
                          {message.status === 'sent' && <Check className="h-3 w-3 text-white/60" />}
                          {message.status === 'sending' && <Clock className="h-3 w-3 text-white/60 animate-spin" />}
                          {message.status === 'failed' && <AlertCircle className="h-3 w-3 text-red-300" />}
                        </div>
                      )}
                    </div>

                    {/* Menu de ações da mensagem */}
                    <div className={cn(
                      "absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1",
                      message.isFromMe ? "-left-16" : "-right-16"
                    )}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 bg-background shadow-sm border"
                        onClick={() => setReplyTo(message)}
                      >
                        <Reply className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 bg-background shadow-sm border"
                        onClick={() => {
                          navigator.clipboard.writeText(message.text)
                          toast.success('Mensagem copiada!')
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {conversation.isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 150, 300].map((delay, i) => (
                      <div 
                        key={i}
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" 
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">Digitando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Área de resposta */}
      {replyTo && (
        <div className="bg-muted/50 border-t p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Reply className="h-4 w-4 text-aumigo-blue" />
              <span className="text-sm text-muted-foreground">Respondendo:</span>
              <span className="text-sm text-foreground truncate max-w-xs">{replyTo.text}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input de mensagem */}
      <div className="bg-card border-t p-4 flex-shrink-0">
        <div className="flex items-end gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-aumigo-orange flex-shrink-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top">
              <DropdownMenuItem onClick={() => toast.info('Envio de arquivo em desenvolvimento')}>
                <FileText className="h-4 w-4 mr-2" />
                Documento
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info('Envio de imagem em desenvolvimento')}>
                <ImageIcon className="h-4 w-4 mr-2" />
                Imagem
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              placeholder="Digite uma mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              className="min-h-[44px] max-h-[120px] resize-none pr-12 bg-input-background border focus:border-aumigo-orange rounded-2xl"
              style={{ height: 'auto' }}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="absolute right-2 bottom-2 text-muted-foreground hover:text-aumigo-orange"
              onClick={() => toast.info('Emojis em desenvolvimento')}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button 
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="bg-aumigo-orange hover:bg-aumigo-orange/90 text-white flex-shrink-0 rounded-full w-11 h-11 p-0 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground">
          Pressione Enter para enviar, Shift+Enter para quebrar linha
        </div>
      </div>
    </div>
  )
}

// Componente principal
export function ProChat() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('recent')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const {
    conversations,
    messages,
    updateConversation,
    addMessage,
    loadMessages
  } = useConversations()

  const selectedConversationData = useMemo(() => 
    conversations.find(c => c.id === selectedConversation), 
    [conversations, selectedConversation]
  )

  const totalUnread = useMemo(() => 
    conversations.reduce((sum, conv) => sum + conv.unreadCount, 0), 
    [conversations]
  )

  const currentMessages = useMemo(() => 
    selectedConversation ? messages[selectedConversation] || [] : [], 
    [messages, selectedConversation]
  )

  const handleSelectConversation = useCallback((id: number) => {
    setSelectedConversation(id)
    loadMessages(id)
    
    // Marcar como lida
    updateConversation(id, { unreadCount: 0 })
  }, [loadMessages, updateConversation])

  const handleSendMessage = useCallback((text: string) => {
    if (!selectedConversation) return

    const message = addMessage(selectedConversation, {
      text,
      time: new Date(),
      isFromMe: true,
      status: 'sending',
      type: 'text'
    })

    // Simular status de entrega progressivo
    const updateStatus = (status: Message['status'], delay: number) => {
      setTimeout(() => {
        // Aqui seria uma atualização real do status da mensagem
        toast.success('Mensagem enviada!')
      }, delay)
    }

    updateStatus('sent', 500)
    updateStatus('delivered', 1500)
    updateStatus('read', 3000)
  }, [selectedConversation, addMessage])

  const handleToggleStar = useCallback((id: number) => {
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      updateConversation(id, { isStarred: !conversation.isStarred })
      const action = conversation.isStarred ? 'removida dos favoritos' : 'adicionada aos favoritos'
      toast.success(`Conversa ${action}!`)
    }
  }, [conversations, updateConversation])

  const handleTogglePin = useCallback((id: number) => {
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      updateConversation(id, { isPinned: !conversation.isPinned })
      const action = conversation.isPinned ? 'desafixada' : 'fixada'
      toast.success(`Conversa ${action}!`)
    }
  }, [conversations, updateConversation])

  const handleToggleMute = useCallback((id: number) => {
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      updateConversation(id, { isMuted: !conversation.isMuted })
      const action = conversation.isMuted ? 'reativadas' : 'silenciadas'
      toast.success(`Notificações ${action}!`)
    }
  }, [conversations, updateConversation])

  const handleArchive = useCallback((id: number) => {
    updateConversation(id, { isArchived: true })
    if (selectedConversation === id) {
      setSelectedConversation(null)
    }
    toast.success('Conversa arquivada!')
  }, [selectedConversation, updateConversation])

  const handleDelete = useCallback((id: number) => {
    if (confirm('Tem certeza que deseja excluir esta conversa? Esta ação não pode ser desfeita.')) {
      // Aqui seria implementada a remoção da conversa
      if (selectedConversation === id) {
        setSelectedConversation(null)
      }
      toast.success('Conversa excluída!')
    }
  }, [selectedConversation])

  // Auto-selecionar primeira conversa se não houver seleção
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      const firstUnarchived = conversations.find(c => !c.isArchived)
      if (firstUnarchived) {
        handleSelectConversation(firstUnarchived.id)
      }
    }
  }, [conversations, selectedConversation, handleSelectConversation])

  // Função para limpar busca
  const clearSearch = useCallback(() => {
    setSearchTerm('')
    setFilter('all')
  }, [])

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <div className="h-full flex flex-col">
          {/* Header fullscreen */}
          <div className="flex items-center justify-between p-6 border-b bg-card">
            <div>
              <h1 className="text-foreground mb-2">Chat com Clientes</h1>
              <p className="text-muted-foreground">
                Gerencie suas conversas e atenda seus clientes em tempo real
              </p>
            </div>
            <div className="flex items-center gap-3">
              {totalUnread > 0 && (
                <Badge className="bg-aumigo-orange text-white animate-pulse">
                  {totalUnread} não {totalUnread === 1 ? 'lida' : 'lidas'}
                </Badge>
              )}
              <Button 
                variant="outline" 
                className="border-aumigo-blue text-aumigo-blue hover:bg-aumigo-blue hover:text-white"
                onClick={() => toast.info('Lista de clientes em desenvolvimento')}
              >
                <Users className="h-4 w-4 mr-2" />
                Todos os clientes
              </Button>
            </div>
          </div>

          {/* Content fullscreen */}
          <div className="flex-1 grid grid-cols-12 gap-6 p-6">
            <div className="col-span-3">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Conversas
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setFilter('all')}>
                          <Hash className="h-4 w-4 mr-2" />
                          Todas as conversas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('unread')}>
                          <Bell className="h-4 w-4 mr-2" />
                          Não lidas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('starred')}>
                          <Star className="h-4 w-4 mr-2" />
                          Favoritas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('pinned')}>
                          <Pin className="h-4 w-4 mr-2" />
                          Fixadas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('muted')}>
                          <BellOff className="h-4 w-4 mr-2" />
                          Silenciadas
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setFilter('archived')}>
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivadas
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setSortBy('recent')}>
                          Recentes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('name')}>
                          Nome
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setSortBy('unread')}>
                          Não lidas
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar conversas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-input-background border focus:border-aumigo-orange"
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                        onClick={clearSearch}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <div className="flex-1 overflow-hidden">
                  <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    onSelectConversation={handleSelectConversation}
                    searchTerm={searchTerm}
                    filter={filter}
                    sortBy={sortBy}
                    onToggleStar={handleToggleStar}
                    onTogglePin={handleTogglePin}
                    onToggleMute={handleToggleMute}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                </div>
              </Card>
            </div>

            <div className="col-span-9">
              <Card className="h-full flex flex-col overflow-hidden">
                <ChatArea
                  conversation={selectedConversationData || null}
                  messages={currentMessages}
                  onSendMessage={handleSendMessage}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                />
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b bg-card flex-shrink-0">
        <div>
          <h1 className="text-foreground mb-2">Chat com Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie suas conversas e atenda seus clientes em tempo real
          </p>
        </div>
        <div className="flex items-center gap-3">
          {totalUnread > 0 && (
            <Badge className="bg-aumigo-orange text-white animate-pulse">
              {totalUnread} não {totalUnread === 1 ? 'lida' : 'lidas'}
            </Badge>
          )}
          <Button 
            variant="outline" 
            className="border-aumigo-blue text-aumigo-blue hover:bg-aumigo-blue hover:text-white"
            onClick={() => toast.info('Lista de clientes em desenvolvimento')}
          >
            <Users className="h-4 w-4 mr-2" />
            Todos os clientes
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 grid grid-cols-12 gap-6 p-6 overflow-hidden">
        {/* Lista de conversas */}
        <div className="col-span-4">
          <Card className="h-full flex flex-col border-border/50 shadow-sm">
            <CardHeader className="pb-4 flex-shrink-0 border-b border-border/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5" />
                  Conversas
                </CardTitle>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setFilter('all')}>
                      <Hash className="h-4 w-4 mr-2" />
                      Todas as conversas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('unread')}>
                      <Bell className="h-4 w-4 mr-2" />
                      Não lidas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('starred')}>
                      <Star className="h-4 w-4 mr-2" />
                      Favoritas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('pinned')}>
                      <Pin className="h-4 w-4 mr-2" />
                      Fixadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('muted')}>
                      <BellOff className="h-4 w-4 mr-2" />
                      Silenciadas
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('archived')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Arquivadas
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setSortBy('recent')}>
                      Recentes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('name')}>
                      Nome
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setSortBy('unread')}>
                      Não lidas
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar conversas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-background border border-border/50 focus:border-aumigo-orange rounded-lg"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={clearSearch}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardHeader>
            
            <div className="flex-1 overflow-hidden">
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                searchTerm={searchTerm}
                filter={filter}
                sortBy={sortBy}
                onToggleStar={handleToggleStar}
                onTogglePin={handleTogglePin}
                onToggleMute={handleToggleMute}
                onArchive={handleArchive}
                onDelete={handleDelete}
              />
            </div>
          </Card>
        </div>

        {/* Área de chat */}
        <div className="col-span-8">
          <Card className="h-full flex flex-col overflow-hidden border-border/50 shadow-sm">
            <ChatArea
              conversation={selectedConversationData || null}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              isFullscreen={isFullscreen}
              onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}