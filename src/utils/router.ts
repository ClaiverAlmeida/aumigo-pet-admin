// 🚀 ROTEADOR SIMPLES - SEM DEPENDÊNCIAS EXTERNAS
// Usa window.location.pathname para navegação

export interface Route {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
}

export class SimpleRouter {
  private readonly routes: Route[] = [];
  private currentPath: string = '';

  constructor() {
    // Extrair apenas o pathname (sem query params)
    this.currentPath = globalThis.window.location.pathname;
    this.setupPopstateListener();
  }

  // Registrar rotas
  addRoute(route: Route) {
    this.routes.push(route);
  }

  // Navegar para uma rota
  navigate(path: string) {
    globalThis.window.history.pushState({}, '', path);
    // Extrair apenas o pathname (sem query params) para comparação de rotas
    this.currentPath = new URL(path, globalThis.window.location.origin).pathname;
    this.notifyListeners();
  }

  // Obter rota atual
  getCurrentRoute(): Route | null {
    return this.routes.find(route => {
      if (route.exact) {
        return route.path === this.currentPath;
      }
      return this.currentPath.startsWith(route.path);
    }) || null;
  }

  // Obter path atual (apenas pathname, sem query params)
  getCurrentPath(): string {
    return this.currentPath;
  }
  
  // Obter path completo com query params
  getFullPath(): string {
    return globalThis.window.location.pathname + globalThis.window.location.search;
  }

  // Verificar se está em uma rota específica
  isCurrentRoute(path: string): boolean {
    return this.currentPath === path;
  }

  // Listener para mudanças de URL
  private setupPopstateListener() {
    globalThis.window.addEventListener('popstate', () => {
      // Extrair apenas o pathname (sem query params)
      this.currentPath = globalThis.window.location.pathname;
      this.notifyListeners();
    });
  }

  // Notificar mudanças (para componentes que precisam reagir)
  private listeners: (() => void)[] = [];
  
  addListener(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// Instância global do roteador
export const router = new SimpleRouter();
