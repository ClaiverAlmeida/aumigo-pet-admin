import axios, { AxiosInstance } from "axios";

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

// Interface para opções da API
interface ApiOptions {
  showLoader?: boolean;
  useCache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

// Interface para resposta da API
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 🚀 SERVIÇO CENTRALIZADO DE API
 *
 * - ✅ Bearer token automático em todas as requisições
 * - ✅ Refresh token automático em caso de 401
 * - ✅ Cache inteligente com TTL
 * - ✅ Loading states por endpoint
 * - ✅ Tratamento de erros centralizado
 * - ✅ Interface simples e limpa
 */
class ApiService {
  private axiosInstance: AxiosInstance;
  private baseUrl: string;
  private cache: Map<
    string,
    { data: any; timestamp: number; expiresAt: number }
  > = new Map();
  private loadingStates: Map<string, boolean> = new Map();

  constructor() {
    this.baseUrl = API_BASE_URL;

    this.axiosInstance = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  /**
   * 🔧 CONFIGURAÇÃO DOS INTERCEPTORS
   * - Adiciona Bearer token automaticamente
   * - Refresh token automático em 401
   * - Evita loops infinitos
   */
  private setupInterceptors(): void {
    // Interceptor de requisição - Adiciona token automaticamente
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor de resposta - Refresh token automático
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Evitar loop infinito - não tentar refresh em endpoints de auth
        const isAuthEndpoint = originalRequest?.url?.includes("/auth/");

        // Tentar refresh token se erro 401 e não for endpoint de auth
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          !isAuthEndpoint
        ) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
              const response = await this.axiosInstance.post("/auth/refresh", {
                refreshToken: refreshToken,
              });

              // Atualizar tokens
              localStorage.setItem("auth_token", response.data.access_token);
              localStorage.setItem(
                "refresh_token",
                response.data.refresh_token
              );

              // Reenviar requisição com novo token
              originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Se refresh falhar, limpar tokens e redirecionar
            localStorage.removeItem("auth_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("aumigopet_admin");

            if (typeof window !== "undefined") {
              window.location.href = "/admin";
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ========== MÉTODOS PÚBLICOS DA API ==========

  /**
   * 📥 GET com cache e loading state
   */
  async get<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const cacheKey =
      options.cacheKey ||
      this.generateCacheKey("GET", endpoint, options.params);

    // Verificar cache se habilitado
    if (options.useCache !== false) {
      const cached = this.getCachedData<T>(cacheKey);
      if (cached) {
        return { success: true, data: cached };
      }
    }

    // Configurar loading state
    if (options.showLoader !== false) {
      this.setLoadingState(cacheKey, true);
    }

    try {
      const response = await this.axiosInstance.get(endpoint, {
        params: options.params,
        headers: options.headers,
      });

      const result = { success: true, data: response.data };

      // Salvar no cache se habilitado
      if (options.useCache !== false) {
        this.setCachedData(cacheKey, response.data, options.cacheTtl);
      }

      return result;
    } catch (error: any) {
      return this.handleError(error);
    } finally {
      if (options.showLoader !== false) {
        this.setLoadingState(cacheKey, false);
      }
    }
  }

  /**
   * 📤 POST
   */
  async post<T = any>(
    endpoint: string,
    body: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const loadingKey = this.generateCacheKey("POST", endpoint);

    if (options.showLoader !== false) {
      this.setLoadingState(loadingKey, true);
    }

    try {
      const response = await this.axiosInstance.post(endpoint, body, {
        headers: options.headers,
      });

      // Invalidar cache relacionado após mutação
      this.invalidateRelatedCache(endpoint);

      return { success: true, data: response.data };
    } catch (error: any) {
      return this.handleError(error);
    } finally {
      if (options.showLoader !== false) {
        this.setLoadingState(loadingKey, false);
      }
    }
  }

  /**
   * 🔄 PUT
   */
  async put<T = any>(
    endpoint: string,
    body: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const loadingKey = this.generateCacheKey("PUT", endpoint);

    if (options.showLoader !== false) {
      this.setLoadingState(loadingKey, true);
    }

    try {
      const response = await this.axiosInstance.put(endpoint, body, {
        headers: options.headers,
      });

      this.invalidateRelatedCache(endpoint);
      return { success: true, data: response.data };
    } catch (error: any) {
      return this.handleError(error);
    } finally {
      if (options.showLoader !== false) {
        this.setLoadingState(loadingKey, false);
      }
    }
  }

  /**
   * 🔧 PATCH
   */
  async patch<T = any>(
    endpoint: string,
    body: any,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const loadingKey = this.generateCacheKey("PATCH", endpoint);

    if (options.showLoader !== false) {
      this.setLoadingState(loadingKey, true);
    }

    try {
      const response = await this.axiosInstance.patch(endpoint, body, {
        headers: options.headers,
      });

      this.invalidateRelatedCache(endpoint);
      return { success: true, data: response.data };
    } catch (error: any) {
      return this.handleError(error);
    } finally {
      if (options.showLoader !== false) {
        this.setLoadingState(loadingKey, false);
      }
    }
  }

  /**
   * 🗑️ DELETE
   */
  async delete<T = any>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<ApiResponse<T>> {
    const loadingKey = this.generateCacheKey("DELETE", endpoint);

    if (options.showLoader !== false) {
      this.setLoadingState(loadingKey, true);
    }

    try {
      const response = await this.axiosInstance.delete(endpoint, {
        headers: options.headers,
      });

      this.invalidateRelatedCache(endpoint);
      return { success: true, data: response.data };
    } catch (error: any) {
      return this.handleError(error);
    } finally {
      if (options.showLoader !== false) {
        this.setLoadingState(loadingKey, false);
      }
    }
  }

  // ========== MÉTODOS DE CACHE ==========

  clearCache(): void {
    this.cache.clear();
  }

  clearCacheByKey(key: string): void {
    this.cache.delete(key);
  }

  clearCacheByPattern(pattern: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
      key.includes(pattern)
    );
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  // ========== MÉTODOS DE LOADING ==========

  isLoadingEndpoint(endpoint: string): boolean {
    return Array.from(this.loadingStates.keys()).some(
      (key) => key.includes(endpoint) && this.loadingStates.get(key)
    );
  }

  get isLoading(): boolean {
    return Array.from(this.loadingStates.values()).some((loading) => loading);
  }

  // ========== MÉTODOS PRIVADOS ==========

  private generateCacheKey(
    method: string,
    endpoint: string,
    params?: Record<string, any>
  ): string {
    const paramsStr = params ? JSON.stringify(params) : "";
    return `${method}:${endpoint}:${paramsStr}`;
  }

  private getCachedData<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  private setCachedData<T>(
    key: string,
    data: T,
    ttl: number = 5 * 60 * 1000
  ): void {
    const entry = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };

    this.cache.set(key, entry);
  }

  private setLoadingState(key: string, loading: boolean): void {
    if (loading) {
      this.loadingStates.set(key, true);
    } else {
      this.loadingStates.delete(key);
    }
  }

  private invalidateRelatedCache(endpoint: string): void {
    const resource = endpoint.split("/")[0];

    Array.from(this.cache.keys())
      .filter((key) => key.startsWith("GET:") && key.includes(resource))
      .forEach((key) => this.cache.delete(key));
  }

  private handleError(error: any): ApiResponse {
    let errorMessage = "Erro desconhecido";

    if (error.response) {
      // Tentar extrair mensagem específica do backend
      const backendMessage = error.response?.data?.message || 
                            error.response?.data?.error?.message ||
                            error.response?.data?.error;
      
      if (backendMessage) {
        errorMessage = backendMessage;
      } else {
        // Fallback para mensagens padrão por status
        switch (error.response.status) {
          case 400:
            errorMessage = "Requisição inválida";
            break;
          case 401:
            errorMessage = "Não autorizado";
            break;
          case 403:
            errorMessage = "Acesso negado";
            break;
          case 404:
            errorMessage = "Recurso não encontrado";
            break;
          case 422:
            errorMessage = "Dados inválidos";
            break;
          case 500:
            errorMessage = "Erro interno do servidor";
            break;
          default:
            errorMessage = `Erro ${error.response.status}: ${error.message}`;
        }
      }
    } else if (error.request) {
      errorMessage = "Erro de conexão";
    }

    return { success: false, error: errorMessage };
  }
}

// 🎯 INSTÂNCIA ÚNICA E GLOBAL
export const api = new ApiService();

// Exportar tipos para uso externo
export type { ApiResponse, ApiOptions };
