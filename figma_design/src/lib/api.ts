import axios from 'axios';
import { useAuthStore } from './authStore';

const getBaseUrl = () => {
  const env = import.meta.env.VITE_API_URL as string | undefined;
  if (env?.trim()) return env.trim().replace(/\/$/, '');
  return 'http://localhost:8000/api/v1';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/login/access-token', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  signup: async (data: { email: string; password: string; full_name?: string }) => {
    const response = await api.post('/users/', data);
    return response.data;
  },
};

export type RecipeListParams = {
  q?: string;
  difficulty?: string;
  tag?: string;
  tags_all?: string;
  max_total_minutes?: number;
  skip?: number;
  limit?: number;
};

export const recipeService = {
  getAll: async (params?: RecipeListParams) => {
    const response = await api.get('/recipes/', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/recipes/${id}`);
    return response.data;
  },
  create: async (data: unknown) => {
    const response = await api.post('/recipes/', data);
    return response.data;
  },
  update: async (id: number, data: unknown) => {
    const response = await api.put(`/recipes/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    const response = await api.delete(`/recipes/${id}`);
    return response.data;
  },
  parse: async (text: string) => {
    const response = await api.post('/recipes/parse', null, { params: { text } });
    return response.data;
  },
};

export const userService = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  patchMe: async (data: Record<string, unknown>) => {
    const response = await api.patch('/users/me', data);
    return response.data;
  },
};

export const plannerService = {
  getDaySummary: async (date: string) => {
    const response = await api.get('/planner/day-summary', { params: { date } });
    return response.data;
  },
  getPlans: async (startDate: string, endDate: string) => {
    const response = await api.get('/planner/', { params: { start_date: startDate, end_date: endDate } });
    return response.data;
  },
  addPlan: async (data: unknown) => {
    const response = await api.post('/planner/', data);
    return response.data;
  },
  updatePlan: async (id: number, data: unknown) => {
    const response = await api.patch(`/planner/${id}`, data);
    return response.data;
  },
  deletePlan: async (id: number) => {
    await api.delete(`/planner/${id}`);
  },
};

export const groceryService = {
  get: async () => {
    const response = await api.get('/grocery/');
    return response.data;
  },
  addItem: async (data: {
    name: string;
    quantity?: number;
    unit?: string | null;
    category?: string | null;
  }) => {
    const response = await api.post('/grocery/items', data);
    return response.data;
  },
  updateItem: async (id: number, data: unknown) => {
    const response = await api.put(`/grocery/items/${id}`, data);
    return response.data;
  },
  deleteItem: async (id: number) => {
    await api.delete(`/grocery/items/${id}`);
  },
  mergeFromPlan: async (startDate: string, endDate: string) => {
    const response = await api.post('/grocery/from-plan', null, {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  },
  exportText: async (): Promise<string> => {
    const response = await api.get('/grocery/export.txt', { responseType: 'text' });
    return response.data as string;
  },
};

export function formatApiError(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { detail?: unknown } }; message?: string };
  const detail = e.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return String(detail[0].msg);
  return e.message || fallback;
}
