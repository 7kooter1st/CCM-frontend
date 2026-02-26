/**
 * API-клиент на axios для взаимодействия с бэкендом.
 * Auth: POST /users/login, /users/register (без префикса /api).
 * Остальное: /api/...
 */
import axios, { type AxiosInstance } from 'axios';
import { api_proxy_addr } from '../../target_config';
import type {
  LoginResponse,
  RegisterResponse,
  UserData,
  UseCase,
  DraftInfo,
  ConsumptionListItem,
  ConsumptionDetail,
  ConsumptionFilter,
} from '../types';

const isTauri = typeof window !== 'undefined' && !!(window as unknown as { __TAURI__?: unknown }).__TAURI__;

const VITE_API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : '';

const origin = typeof window !== 'undefined' ? window.location.origin : '';

/** Базовый URL для /api. На продакшене (GitHub Pages) задаётся через VITE_API_URL. */
const apiBase = isTauri
  ? `${api_proxy_addr}/api`
  : VITE_API_URL
    ? `${VITE_API_URL}/api`
    : `${origin}/api`;
/** Базовый URL для /users (логин, регистрация) */
const usersBase = isTauri ? api_proxy_addr : VITE_API_URL || origin;

function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: apiBase,
    headers: { 'Content-Type': 'application/json' },
  });
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
}

function createUsersClient(): AxiosInstance {
  return axios.create({
    baseURL: usersBase,
    headers: { 'Content-Type': 'application/json' },
  });
}

const apiClient = createApiClient();
const usersClient = createUsersClient();

const normalizeUseCase = (data: Record<string, unknown>): UseCase => ({
  id: Number(data.id ?? data.ID),
  title: (data.title ?? data.Title ?? data.Name ?? 'Без названия') as string,
  description: (data.description ?? data.Description) as string | undefined,
  imageUrl: (data.imageUrl ?? data.ImageUrl ?? data.URL ?? data.image) as string | undefined,
  energyConsumption: Number(data.energyConsumption ?? data.Consumption ?? data.consumption ?? 0),
});

/** Auth (без /api) */
export const authApi = {
  login: (login: string, password: string) =>
    usersClient.post<LoginResponse>('/users/login', { login, password }),

  register: (login: string, password: string) =>
    usersClient.post<RegisterResponse>('/users/register', { login, password }),

  refresh: (refreshToken: string) =>
    usersClient.post<{ access_token: string; refresh_token: string }>('/users/refresh', {
      refresh_token: refreshToken,
    }),
};

/** Защищённые маршруты (с токеном) */
export const protectedApi = {
  getMe: () => apiClient.get<UserData>('/users/me'),
  logout: () => apiClient.post('/users/logout'),

  getUseCases: (params?: { title?: string }) =>
    apiClient.get<unknown[]>('/usecases/', { params }).then((r) => (Array.isArray(r.data) ? r.data.filter((x): x is Record<string, unknown> => typeof x === 'object' && x !== null && (x as Record<string, unknown>).IsDelete !== true).map((x) => normalizeUseCase(x)) : [])),

  getUseCaseById: (id: number | string) =>
    apiClient.get<Record<string, unknown>>(`/usecases/${id}`).then((r) => normalizeUseCase(r.data)),

  getDraft: (userId: number) =>
    apiClient.get<DraftInfo>('/consumptions/draft', { params: { user_id: userId } }),

  getConsumptions: (params?: ConsumptionFilter) =>
    apiClient.get<ConsumptionListItem[]>('/consumptions/', { params }),

  getConsumption: (id: number, userId: number) =>
    apiClient.get<ConsumptionDetail>(`/consumptions/${id}`, { params: { user_id: userId } }),

  createConsumption: (userId: number) =>
    apiClient.post<DraftInfo>('/consumptions/', null, { params: { user_id: userId } }),

  deleteConsumption: (id: number) => apiClient.delete(`/consumptions/${id}`),

  formateConsumption: (id: number, userId: number) =>
    apiClient.put(`/consumptions/${id}/formate`, null, { params: { user_id: userId } }),

  addUseCaseToConsumption: (consumptionId: number, useCaseId: number, userId: number) =>
    apiClient.post(
      `/consumptions/${consumptionId}/usecases`,
      { use_case_id: useCaseId },
      { params: { user_id: userId } }
    ),

  changeUseCaseDuration: (consumptionId: number, useCaseId: number, duration: number, userId: number) =>
    apiClient.put(`/consumptions/${consumptionId}/usecases/${useCaseId}`, { duration }, { params: { user_id: userId } }),

  deleteUseCaseFromConsumption: (consumptionId: number, useCaseId: number, userId: number) =>
    apiClient.delete(`/consumptions/${consumptionId}/usecases/${useCaseId}`, {
      params: { user_id: userId },
    }),

  moderatorAction: (consumptionId: number, action: string, moderatorId: number) =>
    apiClient.put(`/consumptions/${consumptionId}/moderate`, { action, moderator_id: moderatorId }),
};

export { apiClient };
