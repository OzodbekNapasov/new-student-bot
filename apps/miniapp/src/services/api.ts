/// <reference types="vite/client" />
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('smp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function loginWithTelegram(initDataRaw: string, testTgId?: string) {
  try {
    const res = await api.post('/auth/telegram-login', {
      initData: initDataRaw,
      testTelegramId: testTgId,
    });
    if (res.data.token) {
      localStorage.setItem('smp_token', res.data.token);
    }
    return res.data;
  } catch (err) {
    console.warn('API connection failed, returning fallback context:', err);
    return null;
  }
}
