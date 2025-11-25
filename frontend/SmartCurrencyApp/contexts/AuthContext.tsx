import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router'; 
const API_URL = 'http://192.168.0.160:5000';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  collections: Set<string>;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  addCollection: (currencyCode: string) => Promise<void>; 
  fetchCollections: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const getToken = async (): Promise<string | null> => {
    // 優先使用 state 中的 token，如果沒有，再從 SecureStore 讀取
    return accessToken || await SecureStore.getItemAsync('accessToken');
  };

  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const userString = await SecureStore.getItemAsync('user');
        
        if (token && userString) {
          setAccessToken(token);
          setUser(JSON.parse(userString)); 
        }
      } catch (e) {
        console.error('Failed to load auth data from storage', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthData();
  }, []);

  const fetchCollections = async () => {
    const token = await getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/me/collections`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCollections(new Set(data.collections));
      } else {
        if (data.msg === "Token has expired") {
          console.log("Token has expired, logging out.");
          // 如果 token 過期，就自動觸發登出程序
          await logout();
        } else {
          console.error('Fetch collections failed:', data);
        }
      }
    } catch (e) {
      console.error("Failed to fetch collections", e);
    }
  };
  
  useEffect(() => {
    if (accessToken) { 
      fetchCollections();
    }
  }, [accessToken]);

  const addCollection = async (currencyCode: string) => {
    const token = await getToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/me/collections`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currency_code: currencyCode }),
      });
      if (response.ok) {
        // Optimistic Update: 立即更新前端 UI，提供更好的使用者體驗
        setCollections(prev => {
            const newCollections = new Set(prev);
            newCollections.add(currencyCode);
            return newCollections;
        });
      } else {
         const errorData = await response.json();
         console.error('Add collection failed:', errorData);
      }
    } catch (e) {
      console.error("Failed to add collection", e);
    }
  };

  const login = async (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    await SecureStore.setItemAsync('accessToken', token);
    await SecureStore.setItemAsync('user', JSON.stringify(userData)); 
  };

  const logout = async () => {
    setAccessToken(null);
    setUser(null);
    setCollections(new Set());
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('user');
    setTimeout(() => router.replace('/login'), 0);
  };

  const value = {
    accessToken, user, isAuthenticated: !!accessToken, isLoading, collections,
    login, logout, addCollection, fetchCollections,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};