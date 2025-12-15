# 📊 Análise dos Dados Mockados - AuMigoPet SaaS

## 📋 Resumo Executivo

Este documento apresenta uma análise completa dos dados mockados encontrados no projeto **AuMigoPet SaaS**, identificando padrões, problemas e recomendações para melhorias.

---

## 🔍 Arquivos com Dados Mockados Identificados

### 1. **Componentes Principais**

| Arquivo | Tipo de Dados Mockados | Linhas Aproximadas |
|---------|----------------------|-------------------|
| `pro-chat.tsx` | Conversas, mensagens, clientes | 110-232 |
| `pro-services.tsx` | Serviços oferecidos | 41-72 |
| `pro-finance.tsx` | Transações, repasses, resumo financeiro | 48-123 |
| `pro-kyc.tsx` | Perfil profissional, documentos KYC | 55-97 |
| `pro-bookings.tsx` | Agendamentos | 52-104 |
| `pro-availability.tsx` | Disponibilidade semanal, exceções | 48-61 |
| `pro-reviews.tsx` | Avaliações de clientes | 32-128 |
| `notification-center.tsx` | Notificações | 341-413 |
| `ads-billing.tsx` | Métodos de pagamento, faturas | 24-80 |
| `campaigns-list.tsx` | Campanhas de anúncios | 35-96 |
| `ads-overview.tsx` | Métricas de anúncios | 23-67 |

---

## 📊 Análise Detalhada por Categoria

### 1. **Dados de Chat (`pro-chat.tsx`)**

**Estrutura:**
- ✅ Funções geradoras: `generateMockConversations()`, `generateMockMessages()`
- ✅ Dados estruturados com tipos TypeScript
- ✅ Relacionamento entre conversas e mensagens

**Problemas Identificados:**
- ❌ Dados hardcoded diretamente no componente
- ❌ URLs de imagens externas (Unsplash) podem quebrar
- ❌ Lógica de geração misturada com apresentação

**Recomendações:**
- Extrair para arquivo separado: `src/data/mocks/chat.mock.ts`
- Usar imagens locais ou placeholders
- Criar factory functions reutilizáveis

---

### 2. **Dados de Serviços (`pro-services.tsx`)**

**Estrutura:**
- ✅ Array simples e direto
- ✅ Tipos bem definidos

**Problemas Identificados:**
- ❌ Dados inline no componente
- ❌ Sem variação de dados (sempre os mesmos 3 serviços)
- ❌ Imagens externas

**Recomendações:**
- Mover para `src/data/mocks/services.mock.ts`
- Criar função geradora com parâmetros configuráveis
- Adicionar mais variação de dados

---

### 3. **Dados Financeiros (`pro-finance.tsx`)**

**Estrutura:**
- ✅ Dados separados: `mockPayouts`, `mockTransactions`, `financialSummary`
- ✅ Valores em centavos (boa prática)

**Problemas Identificados:**
- ❌ Valores hardcoded sem lógica de cálculo
- ❌ Datas fixas que podem ficar desatualizadas
- ❌ Sem relação entre transações e repasses

**Recomendações:**
- Criar calculadora de valores baseada em regras de negócio
- Usar datas relativas (ex: `new Date()` com offsets)
- Estabelecer relacionamentos entre entidades

---

### 4. **Dados de KYC (`pro-kyc.tsx`)**

**Estrutura:**
- ✅ Perfil e documentos separados
- ✅ Status bem definidos

**Problemas Identificados:**
- ❌ Dados inline
- ❌ URLs de imagens externas
- ❌ Sem variação de estados (sempre PENDING)

**Recomendações:**
- Extrair para `src/data/mocks/kyc.mock.ts`
- Criar diferentes cenários (aprovado, rejeitado, pendente)
- Usar placeholders locais

---

### 5. **Dados de Agendamentos (`pro-bookings.tsx`)**

**Estrutura:**
- ✅ Array bem estruturado
- ✅ Relacionamento com clientes e serviços

**Problemas Identificados:**
- ❌ Datas fixas (2025-09-06) podem ficar desatualizadas
- ❌ Sem variação temporal
- ❌ Dados inline no componente

**Recomendações:**
- Usar datas relativas ao dia atual
- Criar gerador de agendamentos com diferentes status
- Mover para arquivo separado

---

### 6. **Dados de Disponibilidade (`pro-availability.tsx`)**

**Estrutura:**
- ✅ Estrutura de dias da semana clara
- ✅ Exceções separadas

**Problemas Identificados:**
- ❌ Dados inline
- ❌ Sem variação de horários
- ❌ Exceções com datas fixas

**Recomendações:**
- Extrair para `src/data/mocks/availability.mock.ts`
- Criar templates de horários reutilizáveis
- Usar datas relativas para exceções

---

### 7. **Dados de Avaliações (`pro-reviews.tsx`)**

**Estrutura:**
- ✅ Dados e estatísticas separados
- ✅ Relacionamento com clientes

**Problemas Identificados:**
- ❌ Dados inline
- ❌ URLs de imagens externas
- ❌ Estatísticas hardcoded sem cálculo real

**Recomendações:**
- Mover para `src/data/mocks/reviews.mock.ts`
- Calcular estatísticas a partir dos dados
- Usar placeholders locais

---

### 8. **Dados de Notificações (`notification-center.tsx`)**

**Estrutura:**
- ✅ Hook personalizado `useNotifications()`
- ✅ Dados dentro do `useEffect`

**Problemas Identificados:**
- ❌ Dados mockados dentro do hook (deveria ser externo)
- ❌ Timestamps fixos que ficam desatualizados
- ❌ Sem variação de tipos de notificação

**Recomendações:**
- Extrair dados para `src/data/mocks/notifications.mock.ts`
- Criar gerador de notificações com timestamps relativos
- Adicionar mais tipos de notificação

---

### 9. **Dados de Anúncios (`ads-billing.tsx`, `campaigns-list.tsx`, `ads-overview.tsx`)**

**Estrutura:**
- ✅ Dados separados por funcionalidade
- ✅ Métricas bem organizadas

**Problemas Identificados:**
- ❌ Dados inline em múltiplos arquivos
- ❌ Valores hardcoded sem lógica
- ❌ Sem relacionamento entre campanhas e faturas

**Recomendações:**
- Consolidar em `src/data/mocks/ads.mock.ts`
- Criar gerador de campanhas com métricas calculadas
- Estabelecer relacionamentos entre entidades

---

## 🚨 Problemas Críticos Identificados

### 1. **Violação das Diretrizes do Projeto**
- ❌ **Dados mockados em produção**: Conforme as regras do projeto, dados simulados devem ser usados **apenas em testes automatizados** ou em ambientes de desenvolvimento com propósito claro.
- ❌ **Nunca usar dados simulados em produção**: Os dados mockados estão sendo usados diretamente nos componentes, sem verificação de ambiente.

### 2. **Organização e Manutenibilidade**
- ❌ Dados espalhados em múltiplos arquivos
- ❌ Sem estrutura centralizada
- ❌ Difícil de manter e atualizar

### 3. **Qualidade dos Dados**
- ❌ URLs externas que podem quebrar
- ❌ Datas fixas que ficam desatualizadas
- ❌ Sem variação ou geração dinâmica

### 4. **Separação de Responsabilidades**
- ❌ Lógica de dados misturada com apresentação
- ❌ Componentes com responsabilidades múltiplas

---

## ✅ Recomendações de Melhoria

### 1. **Estrutura de Diretórios Proposta**

```
src/
├── data/
│   ├── mocks/
│   │   ├── chat.mock.ts
│   │   ├── services.mock.ts
│   │   ├── finance.mock.ts
│   │   ├── kyc.mock.ts
│   │   ├── bookings.mock.ts
│   │   ├── availability.mock.ts
│   │   ├── reviews.mock.ts
│   │   ├── notifications.mock.ts
│   │   └── ads.mock.ts
│   ├── factories/
│   │   ├── conversation.factory.ts
│   │   ├── booking.factory.ts
│   │   └── notification.factory.ts
│   └── utils/
│       ├── date.utils.ts
│       └── image.utils.ts
```

### 2. **Padrão de Implementação**

**Exemplo para Chat:**
```typescript
// src/data/mocks/chat.mock.ts
import { Conversation, Message, Client } from '@/types/chat'

export const generateMockClients = (count: number = 5): Client[] => {
  // Lógica de geração
}

export const generateMockConversations = (): Conversation[] => {
  // Lógica de geração
}

export const generateMockMessages = (conversationId: number): Message[] => {
  // Lógica de geração
}
```

### 3. **Verificação de Ambiente**

```typescript
// src/utils/env.utils.ts
export const isDevelopment = () => {
  return import.meta.env.MODE === 'development'
}

export const shouldUseMockData = () => {
  return isDevelopment() && import.meta.env.VITE_USE_MOCK_DATA === 'true'
}
```

### 4. **Hooks Personalizados com Fallback**

```typescript
// src/hooks/use-chat-data.ts
import { shouldUseMockData } from '@/utils/env.utils'
import { generateMockConversations } from '@/data/mocks/chat.mock'
import { chatService } from '@/services/chat.service'

export const useChatData = () => {
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    if (shouldUseMockData()) {
      setConversations(generateMockConversations())
    } else {
      chatService.getConversations().then(setConversations)
    }
  }, [])

  return { conversations }
}
```

### 5. **Factory Functions para Dados Dinâmicos**

```typescript
// src/data/factories/booking.factory.ts
export const createMockBooking = (overrides?: Partial<Booking>): Booking => {
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + Math.floor(Math.random() * 30))

  return {
    id: `BK${Date.now()}`,
    date: baseDate.toISOString().split('T')[0],
    status: 'PENDING',
    ...overrides
  }
}
```

### 6. **Utilitários para Datas e Imagens**

```typescript
// src/data/utils/date.utils.ts
export const getRelativeDate = (daysOffset: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}

// src/data/utils/image.utils.ts
export const getPlaceholderImage = (type: 'avatar' | 'pet' | 'service'): string => {
  return `/images/placeholders/${type}.png`
}
```

---

## 📈 Plano de Ação Recomendado

### Fase 1: Organização (Prioridade Alta)
1. ✅ Criar estrutura de diretórios `src/data/mocks/`
2. ✅ Extrair todos os dados mockados dos componentes
3. ✅ Criar arquivos separados por domínio

### Fase 2: Melhoria de Qualidade (Prioridade Média)
1. ✅ Implementar factory functions
2. ✅ Adicionar utilitários para datas e imagens
3. ✅ Criar variação de dados

### Fase 3: Integração com Ambiente (Prioridade Alta)
1. ✅ Implementar verificação de ambiente
2. ✅ Criar hooks com fallback para API
3. ✅ Adicionar variáveis de ambiente

### Fase 4: Documentação (Prioridade Baixa)
1. ✅ Documentar estrutura de dados
2. ✅ Criar exemplos de uso
3. ✅ Adicionar comentários explicativos

---

## 🎯 Conclusão

Os dados mockados estão **bem estruturados em termos de tipos TypeScript**, mas apresentam problemas críticos de **organização, manutenibilidade e conformidade com as diretrizes do projeto**.

**Principais pontos de atenção:**
1. ⚠️ Dados mockados não devem ser usados em produção
2. ⚠️ Necessidade de verificação de ambiente
3. ⚠️ Organização centralizada dos dados
4. ⚠️ Melhoria na qualidade e variação dos dados

**Próximos passos sugeridos:**
1. Implementar verificação de ambiente
2. Extrair dados mockados para arquivos separados
3. Criar estrutura de dados centralizada
4. Implementar factory functions para geração dinâmica

---

**Data da Análise:** 2025-01-27  
**Versão do Projeto:** 0.1.0  
**Analisado por:** Auto (AI Assistant)


