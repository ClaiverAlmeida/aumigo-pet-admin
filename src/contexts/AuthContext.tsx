import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { authProService } from '../services/auth-pro.service';
import { getUserFromToken } from '../services/jwt';
import { usersService } from '../services/users.service';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  profilePicture?: string;
  specialty?: string;
  kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
  isFirstLogin?: boolean;
  created_at?: string;
  role?: string;
  companyId?: string;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'operations' | 'support' | 'finance';
  permissions?: string[];
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  accessToken: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpPro: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    businessName: string;
    cnpj?: string; // CNPJ (empresa) ou CPF (autônomo)
    website?: string;
    zipCode?: string;
    address?: string;
    addressNumber?: string;
    city?: string;
    state?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  signInAdmin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  signOutAdmin: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para carregar dados completos do usuário do backend
  const loadUserProfile = async (userId: string, accessToken: string) => {
    try {
      const result = await usersService.getMyProfile();
      if (result.success && result.data) {
        const profileData = result.data;
        const tokenUser = getUserFromToken(accessToken);
        
        // Mesclar dados do perfil com dados do token
        const userData: User = {
          id: profileData.id || userId,
          email: profileData.email || tokenUser?.email || '',
          name: profileData.name || tokenUser?.name || '',
          phone: profileData.phone || tokenUser?.phone,
          profilePicture: profileData.profilePicture || tokenUser?.avatar || tokenUser?.profilePicture,
          specialty: tokenUser?.specialty,
          kycStatus: tokenUser?.kycStatus as 'PENDING' | 'APPROVED' | 'REJECTED' | undefined,
          isFirstLogin: tokenUser?.isFirstLogin,
          role: tokenUser?.role,
          companyId: tokenUser?.companyId,
          created_at: tokenUser?.created_at || new Date().toISOString()
        };
        
        setUser(userData);
        localStorage.setItem('aumigopet_user', JSON.stringify(userData));
        return userData;
      }
    } catch (error) {
      console.log('Error loading user profile:', error);
    }
    return null;
  };

  // Check for existing session on mount - Seguindo EXATAMENTE o padrão do app
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Verificar usuário profissional - Seguindo padrão do app
        const storedUser = localStorage.getItem('aumigopet_user');
        const storedAccessToken = localStorage.getItem('auth_token');
        
        if (storedUser && storedAccessToken) {
          const parsedUser = JSON.parse(storedUser);
          
          // Mapear avatar para profilePicture se necessário (compatibilidade)
          if (parsedUser.avatar && !parsedUser.profilePicture) {
            parsedUser.profilePicture = parsedUser.avatar;
            delete parsedUser.avatar;
            localStorage.setItem('aumigopet_user', JSON.stringify(parsedUser));
          }
          
          setUser(parsedUser);
          setAccessToken(storedAccessToken);
          
          // Carregar dados completos do backend para garantir que profilePicture está atualizado
          if (parsedUser.id) {
            await loadUserProfile(parsedUser.id, storedAccessToken);
          }
        }

        // Verificar admin
        const storedAdminUser = localStorage.getItem('aumigopet_admin');
        if (storedAdminUser) {
          setAdminUser(JSON.parse(storedAdminUser));
        }
      } catch (error) {
        console.log('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  // Login profissional - Seguindo EXATAMENTE o padrão do app
  const signIn = async (email: string, password: string) => {
    try { 
      // Usar serviço real de autenticação - Seguindo padrão do app
      const result = await authProService.login(email, password); 
      if (result.success && result.data?.user) {
        const tokenUser = getUserFromToken(result.data.access_token);
        const userId = tokenUser?.sub || result.data.user.id || result.data.user.sub;
        
        // Dados iniciais do token/login
        const initialUserData: User = {
          id: userId,
          email: result.data.user.email || tokenUser?.email,
          name: result.data.user.name || tokenUser?.name || email.split('@')[0],
          phone: result.data.user.phone,
          profilePicture: result.data.user.profilePicture || result.data.user.avatar || tokenUser?.avatar || tokenUser?.profilePicture,
          specialty: result.data.user.specialty,
          kycStatus: result.data.user.kycStatus,
          isFirstLogin: result.data.user.isFirstLogin,
          role: tokenUser?.role || result.data.user.role,
          companyId: tokenUser?.companyId || result.data.user.companyId,
          created_at: new Date().toISOString()
        };
        
        setUser(initialUserData);
        setAccessToken(result.data.access_token);
        
        // Store in localStorage - Seguindo EXATAMENTE o padrão do app
        localStorage.setItem('aumigopet_user', JSON.stringify(initialUserData));
        localStorage.setItem('refresh_token', result.data.refresh_token);
        localStorage.setItem('auth_token', result.data.access_token);

        // Carregar dados completos do backend após login para garantir profilePicture atualizado
        if (userId) {
          await loadUserProfile(userId, result.data.access_token);
        }

        return { success: true };
      } else {
        return { success: false, error: result.error || 'Erro ao fazer login' };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  // Cadastro profissional (PRO) - usuário + empresa (Company)
  const signUpPro = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    businessName: string;
    cnpj?: string;
    website?: string;
    zipCode?: string;
    address?: string;
    addressNumber?: string;
    city?: string;
    state?: string;
  }) => {
    try {
      const result = await authProService.register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        businessName: data.businessName,
        cnpj: data.cnpj,
        website: data.website,
        zipCode: data.zipCode,
        address: data.address,
        addressNumber: data.addressNumber,
        city: data.city,
        state: data.state,
      });

      if (result.success && result.data?.user) {
        const tokenUser = getUserFromToken(result.data.access_token);
        const userData: User = {
          id: tokenUser?.sub || tokenUser?.id,
          email: tokenUser?.email || data.email,
          name: tokenUser?.name || data.name,
          phone: data.phone,
          specialty: 'OTHER', // Categoria será definida depois no catálogo
          kycStatus: 'PENDING',
          isFirstLogin: true,
          role: tokenUser?.role || 'SERVICE_PROVIDER',
          created_at: new Date().toISOString(),
        };

        setUser(userData);
        setAccessToken(result.data.access_token);

        // Garantir que o user salvo tenha os campos do cadastro (telefone/categoria)
        localStorage.setItem('aumigopet_user', JSON.stringify(userData));

        return { success: true };
      }

      return { success: false, error: result.error || 'Erro ao registrar' };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Erro ao registrar' };
    }
  };

  // Login admin - Seguindo padrão do app
  const signInAdmin = async (email: string, password: string) => {
    try { 
      // Usar serviço real de autenticação - Seguindo padrão do app
      const result = await authService.login(email, password);
      if (result.success && result.data?.user) {
        const adminData: AdminUser = {
          id: result.data.user.id || result.data.user.sub,
          email: result.data.user.email,
          name: result.data.user.name || email.split('@')[0],
          role: 'super_admin', // Todos os admins válidos são super_admin no painel
          permissions: result.data.user.permissions || [],
          lastLogin: new Date().toISOString()
        };

        setAdminUser(adminData);
        setAccessToken(result.data.access_token);

        // Store in localStorage - Seguindo padrão do app
        localStorage.setItem('aumigopet_admin', JSON.stringify(adminData));
        localStorage.setItem('refresh_token', result.data.refresh_token);
        localStorage.setItem('auth_token', result.data.access_token);

        return { success: true };
      } else {
        return { success: false, error: result.error || 'Erro ao fazer login' };
      }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  // Logout profissional - Seguindo EXATAMENTE o padrão do app
  const signOut = async () => {
    try {
      // Usar serviço real de logout - Seguindo EXATAMENTE o padrão do app
      await authProService.logout();
      
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem('aumigopet_user');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  // Logout admin - Seguindo EXATAMENTE o padrão do app
  const signOutAdmin = async () => {
    try {
      // Usar serviço real de logout - Seguindo EXATAMENTE o padrão do app
      await authService.logout();
      
      setAdminUser(null);
      setAccessToken(null);
      localStorage.removeItem('aumigopet_admin');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('auth_token');
    } catch (error) {
      console.log('Sign out error:', error);
    }
  };

  // Update profile - Seguindo EXATAMENTE o padrão do app
  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'Não autenticado' };
      }

      // Atualizar no backend
      const result = await usersService.updateMyProfile(updates);
      
      if (result.success && result.data) {
        const updatedUser = { ...user, ...result.data };
        setUser(updatedUser);
        
        // Update localStorage - Seguindo EXATAMENTE o padrão do app
        localStorage.setItem('aumigopet_user', JSON.stringify(updatedUser));
        
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Erro ao atualizar perfil' };
      }
    } catch (error) {
      console.log('Profile update error:', error);
      return { success: false, error: 'Erro ao atualizar perfil' };
    }
  };

  const value = {
    user,
    adminUser,
    accessToken,
    loading,
    signIn,
    signUpPro,
    signInAdmin,
    signOut,
    signOutAdmin,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
