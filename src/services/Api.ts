import { type UseCase } from '../types';

const BASE_URL = 'http://localhost:8000'; // Local backend address

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
      console.error("API Error:", error);
      // Fallback for demonstration if server is offline, so the UI still renders something
      return [];
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
      console.error("API Error:", error);
      return null;
    }
  }
};
