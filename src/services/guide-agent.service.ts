import axios from "axios";
import { getAccessTokenForRealm, getPathAuthRealm } from "./auth-session.storage";
import { getUserFromToken } from "./jwt";

const GUIDE_AGENT_BASE_URL =
  import.meta.env.VITE_AI_AGENT_URL || "http://localhost:8088";

export type GuideAgentAction =
  | "NONE"
  | "NAVIGATE"
  | "DEEP_LINK"
  | "REFRESH"
  | "BACKEND_OK"
  | "BACKEND_ERROR";

export type GuideAgentProfile = "tutor" | "professional" | "admin";

export interface GuideTurnRequest {
  message: string;
  profile?: GuideAgentProfile;
  role?: string;
  confirmation_token?: string;
}

export interface GuideTurnResponse {
  version: string;
  message: string;
  action: GuideAgentAction;
  payload?: Record<string, unknown> | null;
  backend?: Record<string, unknown> | null;
  rag?: Record<string, unknown> | null;
  intent?: string;
  requires_confirmation?: boolean;
  confirmation_token?: string | null;
}

export interface GuideTurnResult {
  success: boolean;
  data?: GuideTurnResponse;
  error?: string;
  status?: number;
  meta: {
    requestId: string;
    elapsedMs: number;
  };
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

class GuideAgentService {
  private readonly baseUrl: string;

  constructor() {
    this.baseUrl = GUIDE_AGENT_BASE_URL;
  }

  private resolveProfileFromPath(): GuideAgentProfile {
    if (typeof window === "undefined") return "professional";
    const path = window.location.pathname;
    if (path.startsWith("/admin")) return "admin";
    if (path.startsWith("/pro")) return "professional";
    return "tutor";
  }

  private resolveRoleFromToken(token?: string): string | undefined {
    const tokenUser = token ? getUserFromToken(token) : null;
    return typeof tokenUser?.role === "string" && tokenUser.role.trim().length > 0
      ? tokenUser.role
      : undefined;
  }

  private resolveRequestContext() {
    const realm = getPathAuthRealm();
    const token = getAccessTokenForRealm(realm);
    const profile = this.resolveProfileFromPath();
    const role = this.resolveRoleFromToken(token ?? undefined);
    return { token, profile, role };
  }

  async health(): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.get(`${this.baseUrl}/health`, { timeout: 6000 });
      return { success: true };
    } catch {
      return { success: false, error: "Agent indisponível" };
    }
  }

  async turn(message: string, confirmationToken?: string): Promise<GuideTurnResult> {
    const requestId = createRequestId();
    const startedAt = performance.now();
    const { token, profile, role } = this.resolveRequestContext();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await axios.post<GuideTurnResponse>(
        `${this.baseUrl}/v1/guide/turn`,
        {
          message,
          profile,
          role,
          confirmation_token: confirmationToken,
        } satisfies GuideTurnRequest,
        {
          headers,
          timeout: 20000,
        }
      );

      const elapsedMs = Math.round(performance.now() - startedAt);
      return {
        success: true,
        data: response.data,
        status: response.status,
        meta: { requestId, elapsedMs },
      };
    } catch (error: any) {
      const elapsedMs = Math.round(performance.now() - startedAt);
      const status = error?.response?.status as number | undefined;
      const detail = error?.response?.data?.detail;
      const backendMessage = error?.response?.data?.message;
      const fallback = error?.message || "Falha ao consultar o assistente";
      const messageText =
        typeof detail === "string"
          ? detail
          : typeof backendMessage === "string"
            ? backendMessage
            : fallback;

      return {
        success: false,
        error: messageText,
        status,
        meta: { requestId, elapsedMs },
      };
    }
  }

  async starterQuestions(): Promise<{ success: boolean; questions: string[]; error?: string }> {
    const { token, role } = this.resolveRequestContext();
    if (!role) {
      return { success: true, questions: [] };
    }
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    try {
      const response = await axios.get<{ role: string; questions: string[] }>(
        `${this.baseUrl}/v1/guide/starter-questions`,
        {
          params: { role },
          headers,
          timeout: 8000,
        }
      );
      return { success: true, questions: Array.isArray(response.data.questions) ? response.data.questions : [] };
    } catch {
      return { success: false, questions: [], error: "Nao foi possivel carregar perguntas guiadas." };
    }
  }
}

export const guideAgentService = new GuideAgentService();
