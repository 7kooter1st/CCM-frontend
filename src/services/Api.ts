import { type UseCase, type AuthResponse } from '../types';
import { api_proxy_addr } from '../../target_config';

const VITE_API_URL = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL
  ? String(import.meta.env.VITE_API_URL).replace(/\/$/, '')
  : '';

/** В браузере: прокси /api (локально) или VITE_API_URL (продакшен). В Tauri — прямой URL бэкенда. */
function getApiBase(): string {
  if (typeof window === 'undefined') return VITE_API_URL ? `${VITE_API_URL}/api` : '/api';
  if ((window as unknown as { __TAURI__?: unknown }).__TAURI__) {
    return `${api_proxy_addr}/api`;
  }
  if (VITE_API_URL) return `${VITE_API_URL}/api`;
  return '/api';
}

/** На GitHub Pages и других статических хостах нет бэкенда — не дергаем API, сразу отдаём mock. */
function isStaticHostNoBackend(): boolean {
  if (typeof window === 'undefined') return false;
  if (VITE_API_URL) return false;
  const host = window.location.hostname;
  return host !== 'localhost' && host !== '127.0.0.1';
}

// Mock data to serve when backend is unavailable
const MOCK_USE_CASES: UseCase[] = [
  {
    id: 1,
    title: "Просмотр данного сайта",
    description: "Если нет других сценариев",
    imageUrl: "https://images.unsplash.com/photo-1522869635100-1f4d061dd70f?q=80&w=600&auto=format&fit=crop",
    energyConsumption: 200
  },
];

const getHeaders = (isPost: boolean = false) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {};
  
  if (isPost) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper to normalize backend response data (handling PascalCase vs camelCase)
const normalizeUseCase = (data: any): UseCase => {
  return {
    id: data.id ?? data.ID,
    // Backend returns "Name", Frontend expects "title"
    title: data.title ?? data.Title ?? data.Name ?? "Без названия",
    description: data.description ?? data.Description,
    // Backend returns "URL", Frontend expects "imageUrl"
    imageUrl: data.imageUrl ?? data.ImageUrl ?? data.image_url ?? data.URL,
    // Backend returns "Consumption", Frontend expects "energyConsumption"
    energyConsumption: data.energyConsumption ?? data.EnergyConsumption ?? data.energy_consumption ?? data.Consumption ?? 0
  };
};

export const api = {
  /**
   * Fetch all use cases with optional search query for server-side filtering
   */
  getUseCases: async (search?: string): Promise<UseCase[]> => {
    if (isStaticHostNoBackend()) {
      const list = search
        ? MOCK_USE_CASES.filter((uc) => uc.title.toLowerCase().includes(search.toLowerCase()))
        : MOCK_USE_CASES;
      return list;
    }
    try {
      const apiBase = getApiBase();
      const baseUrl = apiBase.startsWith('http') ? apiBase : `${window.location.origin}${apiBase}`;
      const url = new URL(`${baseUrl}/usecases/`);
      if (search) url.searchParams.append('title', search);

      const response = await fetch(url.toString(), { method: 'GET', headers: getHeaders(false) });
      if (!response.ok) {
        throw new Error(`Error fetching scenarios: ${response.status} ${response.statusText}`);
      }
      const json = await response.json();
      if (Array.isArray(json)) {
        const activeItems = json.filter((item: any) => item.IsDelete !== true);
        return activeItems.map(normalizeUseCase);
      }
      return [];
    } catch (error) {
      console.warn("API unavailable (using mock):", error);
      if (search) {
        return MOCK_USE_CASES.filter((uc) => uc.title.toLowerCase().includes(search.toLowerCase()));
      }
      return MOCK_USE_CASES;
    }
  },

  /**
   * Fetch a single use case by ID
   */
  getUseCaseById: async (id: string): Promise<UseCase | null> => {
    if (!id || id === 'undefined') return null;
    if (isStaticHostNoBackend()) {
      return MOCK_USE_CASES.find((uc) => uc.id === Number(id)) ?? null;
    }
    try {
      const apiBase = getApiBase();
      const baseUrl = apiBase.startsWith('http') ? apiBase : `${window.location.origin}${apiBase}`;
      const response = await fetch(`${baseUrl}/usecases/${id}/`, {
        method: 'GET',
        headers: getHeaders(false),
      });
      if (!response.ok) throw new Error(`Error fetching scenario: ${response.statusText}`);
      const json = await response.json();
      return normalizeUseCase(json);
    } catch (error) {
      console.warn("API unavailable (using mock):", error);
      return MOCK_USE_CASES.find((uc) => uc.id === Number(id)) ?? null;
    }
  },

  /**
   * Login user
   */
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const apiBase = getApiBase();
      const baseUrl = apiBase.startsWith('http') ? apiBase : `${window.location.origin}${apiBase}`;
      const response = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ username, password })
      });
      
      if (!response.ok) throw new Error("Login failed");
      return await response.json();
    } catch (error) {
       console.warn("API login failed, using mock login", error);
       // Mock login success
       return { access_token: "mock-jwt-token-123", token_type: "bearer" };
    }
  },

  /**
   * Register user
   */
  register: async (username: string, password: string, email: string): Promise<AuthResponse> => {
     try {
      const apiBase = getApiBase();
      const baseUrl = apiBase.startsWith('http') ? apiBase : `${window.location.origin}${apiBase}`;
      const response = await fetch(`${baseUrl}/auth/register`, {
        method: 'POST',
        headers: getHeaders(true),
        body: JSON.stringify({ username, password, email })
      });
      
      if (!response.ok) throw new Error("Registration failed");
      return await response.json();
    } catch (error) {
       console.warn("API register failed, using mock register", error);
       return { access_token: "mock-jwt-token-123", token_type: "bearer" };
    }
  }
};