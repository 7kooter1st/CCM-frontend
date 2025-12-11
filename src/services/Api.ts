import { type UseCase } from '../types';

const BASE_URL = 'http://localhost:8000'; // Local backend address

// Mock data to serve when backend is unavailable
const MOCK_USE_CASES: UseCase[] = [
  {
    id: 1,
    title: "Просмотр видео (1080p)",
    description: "Потоковое воспроизведение видео в высоком качестве через Wi-Fi.",
    imageUrl: "https://images.unsplash.com/photo-1522869635100-1f4d061dd70f?q=80&w=600&auto=format&fit=crop",
    energyConsumption: 450
  },
  {
    id: 2,
    title: "Навигация GPS",
    description: "Активное использование GPS модулей и экрана на высокой яркости.",
    imageUrl: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=600&auto=format&fit=crop",
    energyConsumption: 800
  },
  {
    id: 3,
    title: "Мессенджеры (Текст)",
    description: "Фоновая работа и периодическая отправка текстовых сообщений.",
    imageUrl: "https://images.unsplash.com/photo-1611746345961-475397d57238?q=80&w=600&auto=format&fit=crop",
    energyConsumption: 150
  },
  {
    id: 4,
    title: "Видеозвонок",
    description: "Двусторонняя видеосвязь с использованием камеры и микрофона.",
    imageUrl: "https://images.unsplash.com/photo-1516387938699-a93567ec168e?q=80&w=600&auto=format&fit=crop",
    energyConsumption: 950
  },
  {
    id: 5,
    title: "3D Игры",
    description: "Интенсивная нагрузка на GPU и CPU.",
    imageUrl: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=600&auto=format&fit=crop",
    energyConsumption: 1200
  },
  {
    id: 6,
    title: "Прослушивание музыки",
    description: "Воспроизведение аудио с выключенным экраном.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop",
    energyConsumption: 80
  }
];

export const api = {
  /**
   * Fetch all use cases with optional search query for server-side filtering
   */
  getUseCases: async (search?: string): Promise<UseCase[]> => {
    try {
      // Construct URL with query param for server-side filtering
      const url = new URL(`${BASE_URL}/useCases`);
      if (search) {
        url.searchParams.append('title', search);
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error(`Error fetching scenarios: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn("API unavailable, serving mock data.", error);
      
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
    try {
      const response = await fetch(`${BASE_URL}/useCases/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching scenario: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.warn("API unavailable, serving mock data for ID.", error);
      // Return specific mock item
      const item = MOCK_USE_CASES.find(uc => uc.id === Number(id));
      return item || null;
    }
  }
};