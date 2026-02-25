# Notificações no Admin – Análise (Pro x Admin)

## Como está no Profissional (Pro)

### Frontend
- **Header** (`header.tsx`): exibe `<NotificationBell showFullCenter={false} maxPreview={10} />`.
- **NotificationBell** usa o hook `useNotifications()` do `notification-center.tsx`, que:
  - Chama `notificationsService.getAll()`, `markAsRead()`, `markAllAsRead()`, etc.
  - Todas as requisições usam o **mesmo** `api` (axios) com `Authorization: Bearer ${localStorage.getItem('auth_token')}`.
- **api.service**: envia sempre o `auth_token` do localStorage; não diferencia Pro e Admin.

### Backend
- **Controller** (`notification.controller.ts`): `@UseGuards(AuthGuard)` em todas as rotas.
- **AuthGuard**: extrai o JWT, decodifica, busca `User` por `payload.sub` em `prisma.user.findUnique` e preenche `req.user`.
- Admin no sistema é um **User** com `role = ADMIN` ou `SYSTEM_ADMIN` (tabela `User` do Prisma).
- **Login admin** (`POST /auth/login/admin`): retorna o mesmo formato de JWT (access_token, user); o `sub` do token é o `User.id` do admin.
- **notification.service**:
  - `buscarDoUsuario(userId, filters)` retorna notificações em que existe `NotificationRecipient` com esse `userId`.
  - `userId` vem de `req.user.id` (qualquer usuário autenticado, inclusive admin).

Conclusão: o backend já trata notificações por “usuário autenticado” (incluindo admin). Não há rota ou lógica separada “só para Pro”.

---

## O que já foi feito para o Admin

### Frontend
- No **admin-layout.tsx** o botão fixo de notificações foi trocado por:
  - `<NotificationBell showFullCenter={false} maxPreview={10} />`
- O mesmo componente e o mesmo `notificationsService` são usados; o token enviado é o do admin (`auth_token` após login em `/auth/login/admin`).

Nenhuma outra alteração de frontend é necessária para o admin “ver” as notificações que o backend devolver para o seu `User.id`.

---

## O que já funciona (sem mudança)

| Aspecto | Pro | Admin |
|--------|-----|--------|
| Token nas requisições | `auth_token` (User do Pro) | `auth_token` (User do Admin) |
| Endpoints usados | GET/PUT/DELETE `/notifications*` | Idem |
| Quem é `req.user` no backend | User (pro/tutor) | User (admin) |
| Listar / marcar lidas / limpar | Por `req.user.id` | Por `req.user.id` |

Ou seja: a **leitura** de notificações no admin já está coberta pela implementação atual (front + backend).

---

## Quando o admin passa a “receber” notificações

O admin só vê notificações para as quais existir um **NotificationRecipient** com `userId` = id do User admin.

Hoje, na criação de notificações:

- **Bookings / Reviews / Shared-tutors / Reminders**: em geral usam `recipients` explícitos (ex.: dono do provider, cliente). Esses fluxos **não** incluem admins.
- **obterDestinatarios(companyId)** no backend: quando **não** se passam `recipients`, ele retorna usuários com `role in ['ADMIN','SYSTEM_ADMIN']` (e `companyId` quando informado). Ou seja, admins **podem** ser destinatários se o fluxo de criação não passar `recipients` e passar só `companyId`, ou se passar explicitamente os ids dos admins.

Para o admin receber notificações em eventos de **painel admin** (ex.: novo ticket de suporte, documento KYC pendente, novo usuário para aprovação), é necessário que, nesses fluxos, o backend **crie** a notificação com destinatários = admins.

### Backend – sugestão para notificações “para admin”

Quando implementar eventos que devem notificar o admin:

1. **Opção A – Destinatários explícitos**  
   Ao criar a notificação, obter os ids dos Users com role ADMIN/SYSTEM_ADMIN (e eventualmente filtrar por `companyId`) e passar em `recipients`:

   ```ts
   // Exemplo em um futuro TicketsService ou KycService
   const adminIds = await this.getActiveAdminUserIds(); // Users com role ADMIN/SYSTEM_ADMIN
   await this.notificationHelper.criar({
     title: 'Novo ticket de suporte',
     message: `Ticket #${ticketId} aberto por ${customerName}.`,
     userId: customerId,
     entityType: 'ticket',
     entityId: ticketId,
     recipients: adminIds,
   });
   ```

2. **Opção B – Usar obterDestinatarios**  
   Se a notificação for “global” (sem company), criar **sem** `recipients` e **sem** `companyId` no `notificationService.criar`. Hoje `obterDestinatarios(undefined)` retorna todos os Users com role ADMIN/SYSTEM_ADMIN ativos. É preciso apenas garantir que, nesse caso, o `notificationService.criar` chame `obterDestinatarios(companyId)` com `companyId` undefined quando fizer sentido (e que o tipo `CreateNotificationData` permita companyId opcional).

Nenhuma alteração no **controller** de notificações nem no **AuthGuard** é necessária para isso; só na **criação** das notificações (quais usuários você coloca em `recipients` ou como destinatários padrão).

---

## Resumo

| Onde | Status | Ação |
|------|--------|------|
| **Front admin** | Ok | NotificationBell já está no admin-layout; usa o mesmo serviço e token. |
| **Backend – ler notificações** | Ok | Controller usa `req.user.id`; admin é um User; já funciona. |
| **Backend – Xxcriar notificações para admin** | Sob demanda | Quando houver eventos “para admin” (ticket, KYC, etc.), criar a notificação com `recipients` = ids dos admins ou usando o fluxo sem `recipients`/com `companyId` conforme regra de negócio. |

Não é obrigatório mudar nada agora no backend para o sino de notificações do admin funcionar: ele já lista, marca como lida e limpa com base no usuário logado. O que falta é apenas **enviar** notificações para os admins nos eventos que você quiser (implementando esses fluxos quando existirem módulos de ticket, KYC, etc.).
