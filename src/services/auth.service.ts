import { api } from "./api.service";
import { getUserFromToken } from "./jwt";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[];
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly refreshTokenKey = 'refresh_token';
  private readonly userKey = 'aumigopet_admin'; // Chave específica para admin

  // Estado reativo (similar ao Angular signals)
  private authState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };

  // Listeners para mudanças de estado
  private listeners: ((state: AuthState) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  // Inicializar autenticação do localStorage
  private initializeAuth() {
    try { 
      const storedUser = localStorage.getItem(this.userKey);
      const storedToken = localStorage.getItem(this.tokenKey);
      const storedRefreshToken = localStorage.getItem(this.refreshTokenKey);

      if (storedUser && storedToken) {
        this.authState = {
          ...this.authState,
          user: JSON.parse(storedUser),
          accessToken: storedToken,
          refreshToken: storedRefreshToken,
          isAuthenticated: true,
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Erro ao inicializar autenticação:', error);
      this.clearAuth();
    }
  }

  // Adicionar listener para mudanças de estado
  addAuthListener(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Retornar função para remover listener
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notificar listeners sobre mudanças
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.authState));
  }

  // Obter estado atual
  getAuthState(): AuthState {
    return { ...this.authState };
  }

  // Login
  async login(login: string, password: string) {
    this.setLoading(true);
    this.setError(null);

    try {
      const result = await api.post("/auth/login/admin", {
        login,
        password,
      });

      if (result.success) {
        const user = getUserFromToken(result.data.access_token);
        
        this.setAuthData({
          user,
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token,
          isAuthenticated: true,
        });

        return { success: true, data: { ...result.data, user } };
      } else {
        this.setError(result.error || 'Erro ao fazer login');
        return { success: false, error: result.error };
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Erro ao fazer login';
      this.setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      this.setLoading(false);
    }
  }

  // Logout
  async logout() {
    this.setLoading(true);

    try {
      // Tentar fazer logout no servidor (opcional)
      // IMPORTANTE: Fazer logout ANTES de limpar o auth para manter o token
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch (error) {
      console.warn('Erro no logout do servidor:', error);
    } finally {
      // Limpar auth APÓS a requisição
      this.clearAuth();
    }
  }

  // Refresh token
  async refreshToken() {
    if (!this.authState.refreshToken) {
      throw new Error('Refresh token não disponível');
    }

    try {
      const result = await api.post("/auth/refresh", {
        refreshToken: this.authState.refreshToken,
      });

      if (result.success) {
        this.setAuthData({
          ...this.authState,
          accessToken: result.data.access_token,
          refreshToken: result.data.refresh_token,
        });

        return { success: true, data: result.data };
      } else {
        this.clearAuth();
        throw new Error(result.error || 'Erro ao renovar token');
      }
    } catch (error: any) {
      this.clearAuth();
      throw error;
    }
  }

  // Métodos privados para gerenciar estado
  private setLoading(loading: boolean) {
    this.authState = { ...this.authState, isLoading: loading };
    this.notifyListeners();
  }

  private setError(error: string | null) {
    this.authState = { ...this.authState, error };
    this.notifyListeners();
  }

  private setAuthData(data: Partial<AuthState>) {
    this.authState = { ...this.authState, ...data };
    
    // Salvar no localStorage
    if (data.user) {
      localStorage.setItem(this.userKey, JSON.stringify(data.user));
    } 
    if (data.accessToken) {
      localStorage.setItem(this.tokenKey, data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem(this.refreshTokenKey, data.refreshToken);
    }

    this.notifyListeners();
  }

  private clearAuth() {
    this.authState = {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    };

    // Limpar localStorage
    localStorage.removeItem(this.userKey);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);

    this.notifyListeners();
  }
}

export const authService = new AuthService();
