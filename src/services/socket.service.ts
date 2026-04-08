import { io, Socket } from "socket.io-client";
import type { ChatMessage } from "./chat.service";
import {
  getAccessTokenForRealm,
  getPathAuthRealm,
} from "./auth-session.storage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

let socket: Socket | null = null;

function getToken(): string | null {
  return getAccessTokenForRealm(getPathAuthRealm());
}

function getSocket(): Socket | null {
  const token = getToken();
  if (!token) return null;

  if (socket?.connected) return socket;

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(API_BASE_URL, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket"],
  });

  socket.on("connect_error", () => {
    // evita log excessivo
  });

  return socket;
}

export interface RealtimeNotificationPayload {
  id: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
  isRead: boolean;
  createdAt: string | Date;
}

export interface UnreadCountUpdatedPayload {
  unreadCount: number;
}

export interface NotificationMarkedReadPayload {
  notificationId: string;
  unreadCount: number;
}

export interface RealtimeChatMessagePayload {
  ticketId: string;
  message: ChatMessage;
}

export function subscribeNewNotifications(
  callback: (payload: RealtimeNotificationPayload) => void,
): () => void {
  const s = getSocket();
  if (!s) return () => {};

  const handler = (payload: RealtimeNotificationPayload) => callback(payload);
  s.on("new_notification", handler);

  return () => {
    s.off("new_notification", handler);
  };
}

export function subscribeUnreadCountUpdated(
  callback: (payload: UnreadCountUpdatedPayload) => void,
): () => void {
  const s = getSocket();
  if (!s) return () => {};

  const handler = (payload: UnreadCountUpdatedPayload) => callback(payload);
  s.on("unread_count_updated", handler);

  return () => {
    s.off("unread_count_updated", handler);
  };
}

export function subscribeNotificationMarkedRead(
  callback: (payload: NotificationMarkedReadPayload) => void,
): () => void {
  const s = getSocket();
  if (!s) return () => {};

  const handler = (payload: NotificationMarkedReadPayload) => callback(payload);
  s.on("notification_marked_read", handler);

  return () => {
    s.off("notification_marked_read", handler);
  };
}

export function subscribeChatMessages(
  callback: (payload: RealtimeChatMessagePayload) => void,
): () => void {
  const s = getSocket();
  if (!s) return () => {};

  const handler = (payload: RealtimeChatMessagePayload) => callback(payload);
  s.on("chat_message", handler);

  return () => {
    s.off("chat_message", handler);
  };
}

