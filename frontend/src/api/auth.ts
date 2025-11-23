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

export async function register(
  username: string,
  name: string,
  password: string,
  role: 'inspector' | 'admin' = 'inspector'
): Promise<User> {
  const {data} = await api.post<User>('/auth/register', {username, name, password, role});
  return data;
}

export async function getCurrentUser(): Promise<User> {
  // api 인스턴스의 인터셉터가 자동으로 토큰을 추가하므로 헤더에 직접 넣을 필요 없음
  const {data} = await api.get<User>('/auth/me');
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
