import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { User } from '@shared/schema';

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for user in localStorage on initial load
    const storedUser = localStorage.getItem('sanctum_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('sanctum_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (phone: string) => {
    try {
      setIsLoading(true);
      const response = await apiRequest('POST', '/api/auth/login', { phone });
      const userData = await response.json();
      
      setUser(userData);
      localStorage.setItem('sanctum_user', JSON.stringify(userData));
      
      toast({
        title: "Welcome to The Sanctum",
        description: userData.name ? `Welcome back, ${userData.name}!` : "You're now logged in.",
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "We couldn't log you in. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sanctum_user');
    
    toast({
      title: "Logged Out",
      description: "You've been successfully logged out.",
    });
  };

  const updateUserProfile = async (name: string) => {
    if (!user) return;
    
    try {
      const response = await apiRequest('PUT', `/api/user/${user.id}`, { name });
      const updatedUser = await response.json();
      
      setUser(updatedUser);
      localStorage.setItem('sanctum_user', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "We couldn't update your profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isAdmin = !!user?.isAdmin;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      isAuthenticated,
      isLoading,
      login,
      logout,
      updateUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
