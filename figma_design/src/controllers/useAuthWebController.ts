import { useState } from 'react';
import { authService, formatApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

export function useAuthWebController() {
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (onSuccess: () => void) => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await authService.login(email, password);
      await setToken(data.access_token);
      onSuccess();
    } catch (err) {
      setError(formatApiError(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    error,
    setError,
    login,
  };
}
