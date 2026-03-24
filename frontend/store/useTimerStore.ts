import { create } from 'zustand';
import * as Haptics from 'expo-haptics';

export interface Timer {
  id: string;
  label: string;
  duration: number; // total seconds
  remaining: number;
  status: 'running' | 'paused' | 'completed';
}

interface TimerState {
  timers: Timer[];
  addTimer: (label: string, duration: number) => void;
  removeTimer: (id: string) => void;
  toggleTimer: (id: string) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  timers: [],
  addTimer: (label, duration) => set((state) => ({
    timers: [...state.timers, {
      id: Math.random().toString(36).substr(2, 9),
      label,
      duration,
      remaining: duration,
      status: 'running'
    }]
  })),
  removeTimer: (id) => set((state) => ({
    timers: state.timers.filter(t => t.id !== id)
  })),
  toggleTimer: (id) => set((state) => ({
    timers: state.timers.map(t => 
      t.id === id ? { ...t, status: t.status === 'running' ? 'paused' : 'running' } : t
    )
  })),
  tick: () => set((state) => ({
    timers: state.timers.map((t) => {
      if (t.status !== 'running') return t;
      const next = t.remaining - 1;
      if (next <= 0) {
        try {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch {
          /* no-op on web / unsupported */
        }
        return { ...t, remaining: 0, status: 'completed' as const };
      }
      return { ...t, remaining: next };
    }),
  })),
}));
