import { createContext } from 'react';

export interface User {
    userId: number;
    username: string;
    fullName: string;
    email: string;
    userRole: string;
    schoolID: number;
    schoolName: string;
    permissions: string[];
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    hasPermission: (permission: string) => boolean;
    hasAnyPermission: (permissions: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
