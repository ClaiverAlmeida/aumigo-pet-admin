# 🔗 Plano de Integração Backend - Admin Panel

## 📊 Estado Atual

### ✅ O que já está pronto:

1. **Infraestrutura de API:**
   - ✅ `api.service.ts` - Serviço centralizado com Axios
   - ✅ `auth-pro.service.ts` - Autenticação para profissionais
   - ✅ Interceptors configurados (Bearer token, refresh token)
   - ✅ Cache e loading states
   - ✅ Tratamento de erros centralizado

2. **Backend:**
   - ✅ 13 módulos criados e registrados
   - ✅ Endpoints REST prontos (UniversalController)
   - ✅ Permissões CASL configuradas
   - ✅ Schema Prisma validado

### ❌ O que precisa ser feito:

1. **Serviços específicos por módulo:**
   - Criar serviços seguindo padrão do `aumigopet-app-lobocode`
   - Substituir dados mockados por chamadas reais à API

2. **Componentes a integrar:**
   - `pro-bookings.tsx` → `bookings.service.ts`
   - `pro-finance.tsx` → `payments.service.ts` + `payouts.service.ts`
   - `pro-kyc.tsx` → `kyc-documents.service.ts`
   - `pro-availability.tsx` → `availabilities.service.ts` + `availability-exceptions.service.ts`
   - `pro-settings.tsx` → `provider-settings.service.ts`
   - `pro-reviews.tsx` → `reviews.service.ts` (já existe no app)
   - `pro-services.tsx` → `services.service.ts` (já existe no app)
   - `notification-center.tsx` → `notifications.service.ts` (já existe no app)

---

## 🎯 Padrão de Serviço (Baseado no App)

### Estrutura:

```typescript
// src/services/bookings.service.ts
import { api } from './api.service';

export interface Booking {
  id: string;
  date: string;
  time: string;
  status: string;
  price: number;
  // ... outros campos
}

export class BookingsService {
  // Listar com filtros
  async list(filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    providerId?: string;
  }) {
    const result = await api.get<Booking[]>('/bookings', {
      params: filters,
      useCache: true,
      cacheTtl: 30000, // 30 segundos
    });
    return result;
  }

  // Buscar por ID
  async getById(id: string) {
    return api.get<Booking>(`/bookings/${id}`);
  }

  // Criar
  async create(data: Partial<Booking>) {
    return api.post<Booking>('/bookings', data);
  }

  // Atualizar
  async update(id: string, data: Partial<Booking>) {
    return api.patch<Booking>(`/bookings/${id}`, data);
  }

  // Deletar
  async delete(id: string) {
    return api.delete(`/bookings/${id}`);
  }

  // Ações específicas
  async confirm(id: string) {
    return api.patch(`/bookings/${id}`, { status: 'CONFIRMED' });
  }

  async cancel(id: string) {
    return api.patch(`/bookings/${id}`, { status: 'CANCELLED' });
  }
}

export const bookingsService = new BookingsService();
```

---

## 📋 Checklist de Integração

### Fase 1: Serviços Base (Prioridade Alta)

- [ ] **bookings.service.ts**
  - [ ] list()
  - [ ] getById()
  - [ ] create()
  - [ ] update()
  - [ ] delete()
  - [ ] confirm()
  - [ ] cancel()

- [ ] **payments.service.ts**
  - [ ] list()
  - [ ] getById()
  - [ ] getByBookingId()
  - [ ] getByProviderId()
  - [ ] getSummary()

- [ ] **payouts.service.ts**
  - [ ] list()
  - [ ] getById()
  - [ ] getByProviderId()
  - [ ] getSummary()

- [ ] **kyc-documents.service.ts**
  - [ ] list()
  - [ ] getById()
  - [ ] upload()
  - [ ] approve()
  - [ ] reject()

- [ ] **availabilities.service.ts**
  - [ ] list()
  - [ ] getByProviderId()
  - [ ] create()
  - [ ] update()
  - [ ] delete()
  - [ ] getWeeklySchedule()

- [ ] **availability-exceptions.service.ts**
  - [ ] list()
  - [ ] getByProviderId()
  - [ ] create()
  - [ ] update()
  - [ ] delete()

- [ ] **provider-settings.service.ts**
  - [ ] get()
  - [ ] update()
  - [ ] updateNotifications()
  - [ ] updatePayment()
  - [ ] updatePrivacy()

### Fase 2: Serviços de Suporte (Prioridade Média)

- [ ] **tickets.service.ts**
  - [ ] list()
  - [ ] getById()
  - [ ] create()
  - [ ] update()
  - [ ] assign()
  - [ ] close()

- [ ] **ticket-replies.service.ts**
  - [ ] list()
  - [ ] create()
  - [ ] update()
  - [ ] delete()

- [ ] **webhooks.service.ts**
  - [ ] list()
  - [ ] getById()
  - [ ] create()
  - [ ] update()
  - [ ] delete()
  - [ ] test()

- [ ] **webhook-logs.service.ts**
  - [ ] list()
  - [ ] getById()
  - [ ] getByWebhookId()

### Fase 3: Integração de Componentes (Prioridade Alta)

- [ ] **pro-bookings.tsx**
  - [ ] Substituir mock por `bookingsService.list()`
  - [ ] Implementar filtros reais
  - [ ] Adicionar loading states
  - [ ] Tratar erros

- [ ] **pro-finance.tsx**
  - [ ] Integrar `payments.service.ts`
  - [ ] Integrar `payouts.service.ts`
  - [ ] Calcular resumo financeiro real
  - [ ] Gráficos com dados reais

- [ ] **pro-kyc.tsx**
  - [ ] Integrar `kyc-documents.service.ts`
  - [ ] Upload de documentos real
  - [ ] Status em tempo real

- [ ] **pro-availability.tsx**
  - [ ] Integrar `availabilities.service.ts`
  - [ ] Integrar `availability-exceptions.service.ts`
  - [ ] Salvar disponibilidade real

- [ ] **pro-settings.tsx**
  - [ ] Integrar `provider-settings.service.ts`
  - [ ] Salvar configurações reais
  - [ ] Validação de dados

- [ ] **pro-reviews.tsx**
  - [ ] Integrar `reviews.service.ts` (copiar do app)
  - [ ] Listar avaliações reais

- [ ] **pro-services.tsx**
  - [ ] Integrar `services.service.ts` (copiar do app)
  - [ ] CRUD de serviços real

### Fase 4: Serviços Administrativos (Prioridade Baixa - apenas para admins)

- [ ] **incidents.service.ts**
- [ ] **incident-updates.service.ts**

---

## 🔄 Fluxo de Integração por Componente

### Exemplo: `pro-bookings.tsx`

**Antes (Mock):**
```typescript
const mockBookings = [
  { id: '1', date: '2025-01-15', status: 'PENDING', ... },
  // ...
];
```

**Depois (Real):**
```typescript
import { bookingsService } from '../services/bookings.service';
import { useState, useEffect } from 'react';

const [bookings, setBookings] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  loadBookings();
}, []);

const loadBookings = async () => {
  setLoading(true);
  const result = await bookingsService.list({
    status: filters.status,
    dateFrom: filters.dateFrom,
  });
  
  if (result.success) {
    setBookings(result.data);
  } else {
    setError(result.error);
  }
  setLoading(false);
};
```

---

## 📁 Estrutura de Arquivos Proposta

```
src/
├── services/
│   ├── api.service.ts          ✅ Já existe
│   ├── auth-pro.service.ts     ✅ Já existe
│   ├── bookings.service.ts     ⏳ Criar
│   ├── payments.service.ts     ⏳ Criar
│   ├── payouts.service.ts      ⏳ Criar
│   ├── kyc-documents.service.ts ⏳ Criar
│   ├── availabilities.service.ts ⏳ Criar
│   ├── availability-exceptions.service.ts ⏳ Criar
│   ├── provider-settings.service.ts ⏳ Criar
│   ├── tickets.service.ts      ⏳ Criar
│   ├── ticket-replies.service.ts ⏳ Criar
│   ├── webhooks.service.ts     ⏳ Criar
│   ├── webhook-logs.service.ts ⏳ Criar
│   ├── reviews.service.ts      ⏳ Copiar do app
│   ├── services.service.ts     ⏳ Copiar do app
│   └── index.ts                ⏳ Atualizar exports
```

---

## 🚀 Próximos Passos

1. **Criar serviços base** (Fase 1)
2. **Integrar componente por componente** (Fase 3)
3. **Testar cada integração** antes de passar para o próximo
4. **Remover dados mockados** após integração completa

---

## 📝 Notas Importantes

- **Padrão de resposta:** Todos os endpoints retornam `{ success: boolean, data?: T, error?: string }`
- **Cache:** Usar cache para listagens (30s-1min), não usar para mutações
- **Loading states:** Usar `api.isLoadingEndpoint()` ou estados locais
- **Erros:** Tratar erros e mostrar mensagens amigáveis ao usuário
- **Validação:** Validar dados antes de enviar (usar Zod ou similar)

---

## 🔗 Endpoints Disponíveis

### Bookings
- `GET /bookings` - Listar
- `GET /bookings/:id` - Buscar por ID
- `POST /bookings` - Criar
- `PATCH /bookings/:id` - Atualizar
- `DELETE /bookings/:id` - Deletar

### Payments
- `GET /payments` - Listar
- `GET /payments/:id` - Buscar por ID
- `POST /payments` - Criar
- `PATCH /payments/:id` - Atualizar

### Payouts
- `GET /payouts` - Listar
- `GET /payouts/:id` - Buscar por ID
- `POST /payouts` - Criar
- `PATCH /payouts/:id` - Atualizar

### KYC Documents
- `GET /kyc-documents` - Listar
- `GET /kyc-documents/:id` - Buscar por ID
- `POST /kyc-documents` - Criar
- `PATCH /kyc-documents/:id` - Atualizar (aprovar/rejeitar)

### Availability
- `GET /availabilities` - Listar
- `POST /availabilities` - Criar
- `PATCH /availabilities/:id` - Atualizar
- `DELETE /availabilities/:id` - Deletar

### Availability Exceptions
- `GET /availability-exceptions` - Listar
- `POST /availability-exceptions` - Criar
- `PATCH /availability-exceptions/:id` - Atualizar
- `DELETE /availability-exceptions/:id` - Deletar

### Provider Settings
- `GET /provider-settings` - Buscar (único por provider)
- `POST /provider-settings` - Criar
- `PATCH /provider-settings/:id` - Atualizar

### Tickets
- `GET /tickets` - Listar
- `GET /tickets/:id` - Buscar por ID
- `POST /tickets` - Criar
- `PATCH /tickets/:id` - Atualizar

### Ticket Replies
- `GET /ticket-replies` - Listar
- `POST /ticket-replies` - Criar
- `PATCH /ticket-replies/:id` - Atualizar

### Webhooks
- `GET /webhooks` - Listar
- `GET /webhooks/:id` - Buscar por ID
- `POST /webhooks` - Criar
- `PATCH /webhooks/:id` - Atualizar
- `DELETE /webhooks/:id` - Deletar

### Webhook Logs
- `GET /webhook-logs` - Listar
- `GET /webhook-logs/:id` - Buscar por ID
