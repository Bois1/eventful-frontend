import api from './api';
import { User } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'CREATOR' | 'EVENTEE';
}

interface AuthResponse {
  accessToken: string;
  sessionId: string;
  user: User;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, sessionId, user } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { accessToken, sessionId, user };
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    const { accessToken, sessionId, user } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('sessionId', sessionId);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { accessToken, sessionId, user };
  },

  async logout(): Promise<void> {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      await api.post('/auth/logout', { sessionId });
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.data;
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
};