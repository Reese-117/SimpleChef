import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (__DEV__) {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = debuggerHost?.split(':')[0];

    if (localhost) {
      return `http://${localhost}:8000/api/v1`;
    }

    return Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://localhost:8000/api/v1';
  }

  return 'http://localhost:8000/api/v1';
};

export const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const { useAuthStore } = await import('../store/useAuthStore');
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only 401: invalid/expired JWT. Do not use 403 here — recipe/grocery owner checks return 403.
    if (error.response?.status === 401) {
      const { useAuthStore } = require('../store/useAuthStore');
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
  addItem: async (data: any) => {
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