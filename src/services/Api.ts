import { type UseCase, type AuthResponse } from '../types';

const BASE_URL = 'http://localhost:8000'; // Local backend address

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
    try {
      // Construct URL with query param for server-side filtering
      // ADDED: Trailing slash to match backend router expectations and avoid 301 Redirects
      const url = new URL(`${BASE_URL}/useCases/`);
      if (search) {
        url.searchParams.append('title', search);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: getHeaders(false)
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching scenarios: ${response.status} ${response.statusText}`);
      }
      
      const json = await response.json();
      if (Array.isArray(json)) {
        // Filter out items where IsDelete is true (based on backend JSON structure)
        const activeItems = json.filter((item: any) => item.IsDelete !== true);
        return activeItems.map(normalizeUseCase);
      }
      return [];
    } catch (error) {
      console.warn("API unavailable (using mock):", error);
      
      // Return mock data filtered by search term if API fails
      if (search) {
        return MOCK_USE_CASES.filter(uc => 
          uc.title.toLowerCase().includes(search.toLowerCase())
        );
      }
      return MOCK_USE_CASES;
    }
  },

  /**
   * Fetch a single use case by ID
   */
  getUseCaseById: async (id: string): Promise<UseCase | null> => {
    if (!id || id === 'undefined') return null;
    
    try {
      // ADDED: Trailing slash
      const response = await fetch(`${BASE_URL}/useCases/${id}/`, {
        method: 'GET',
        headers: getHeaders(false)
      });
      if (!response.ok) {
        throw new Error(`Error fetching scenario: ${response.statusText}`);
      }
      const json = await response.json();
      return normalizeUseCase(json);
    } catch (error) {
      console.warn("API unavailable (using mock):", error);
      // Return specific mock item
      const item = MOCK_USE_CASES.find(uc => uc.id === Number(id));
      return item || null;
    }
  },

  /**
   * Login user
   */
  login: async (username: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
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
      const response = await fetch(`${BASE_URL}/auth/register`, {
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