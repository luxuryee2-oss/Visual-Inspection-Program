import {api} from './client';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'inspector' | 'admin';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const {data} = await api.post<LoginResponse>('/auth/login', {username, password});
  return data;
}

export async function getCurrentUser(): Promise<User> {
  const token = localStorage.getItem('auth_token');
  const {data} = await api.get<User>('/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return data;
}

export function setAuthToken(token: string) {
  localStorage.setItem('auth_token', token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function removeAuthToken() {
  localStorage.removeItem('auth_token');
}

