import { useState } from 'react';
import { authService, formatApiError } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';

export function useSignupWebController() {
  const setToken = useAuthStore((s) => s.setToken);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const signup = async (onSuccess: () => void) => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authService.signup({ email, password, full_name: fullName || undefined });
    } catch (err) {
      setError(
        formatApiError(err, 'Signup failed. Check that the backend is running and reachable.')
      );
      setLoading(false);
      return;
    }
    try {
      // Auto-login keeps signup and first session as a single flow.
      const data = await authService.login(email, password);
      await setToken(data.access_token);
    } catch {
      setError('Account created! Go back and sign in.');
      setLoading(false);
      return;
    }
    setLoading(false);
    onSuccess();
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    loading,
    error,
    setError,
    signup,
  };
}
