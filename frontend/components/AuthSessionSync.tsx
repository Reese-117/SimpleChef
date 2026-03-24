import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';

/**
 * After logout (e.g. 401), send users to login when they are on a protected segment.
 * Avoids relying on the root index redirect while already inside (tabs) or stack screens.
 */
export function AuthSessionSync() {
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().loadToken();
  }, []);

  useEffect(() => {
    if (!isHydrated || token) return;
    const root = segments[0];
    const protectedRoots = new Set([
      '(tabs)',
      'recipe',
      'cooking',
      'add',
      'modal',
    ]);
    if (root && protectedRoots.has(String(root))) {
      router.replace('/login');
    }
  }, [token, isHydrated, segments, router]);

  return null;
}
