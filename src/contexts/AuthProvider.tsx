import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/authService';
import { AuthContext, type User, type AuthContextType } from './AuthContext';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authService.isAuthenticated()) {
            setUser(authService.getCurrentUser());
        }
        setIsLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        const response = await authService.login({ username, password });
        setUser(response.user);
        window.location.href = '/dashboard';
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        window.location.href = '/login';
    };

    const hasPermission = (permission: string) => user?.permissions?.includes(permission) ?? false;
    const hasAnyPermission = (permissions: string[]) =>
        permissions.some(p => user?.permissions?.includes(p));

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        hasAnyPermission
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
