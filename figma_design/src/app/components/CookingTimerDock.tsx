import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, Pause, Play, X } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { useTimerStore, type Timer } from '@/lib/useTimerStore';

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getTimerRemaining(timer: Timer) {
  return Math.max(0, timer.remaining);
}

export function CookingTimerDock() {
  const timers = useTimerStore((s) => s.timers);
  const toggleTimer = useTimerStore((s) => s.toggleTimer);
  const removeTimer = useTimerStore((s) => s.removeTimer);

  const [timerDockExpanded, setTimerDockExpanded] = useState(true);
  const [timerToDelete, setTimerToDelete] = useState<string | null>(null);

  if (timers.length === 0) return null;

  const activeCount = timers.filter((t) => t.status !== 'completed').length;

  const confirmDeleteTimer = () => {
    if (timerToDelete) {
      removeTimer(timerToDelete);
      setTimerToDelete(null);
    }
  };

  return (
    <>
      <div className="border-t border-border bg-card shrink-0">
        <button
          type="button"
          onClick={() => setTimerDockExpanded(!timerDockExpanded)}
          className="w-full px-4 py-2 flex items-center justify-between hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Active Timers ({activeCount})</span>
          </div>
          {timerDockExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>

        {timerDockExpanded && (
          <div className="px-4 pb-4 space-y-2 max-h-48 overflow-auto no-scrollbar">
            {timers.map((timer) => {
              const remaining = getTimerRemaining(timer);
              const isFinished = timer.status === 'completed';

              return (
                <div
                  key={timer.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isFinished ? 'bg-destructive/10 border border-destructive' : 'bg-muted'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-sm font-medium truncate">{timer.label}</div>
                    <div className={`text-lg tabular-nums ${isFinished ? 'text-destructive' : ''}`}>
                      {isFinished ? "Time's up!" : formatTime(remaining)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isFinished && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => toggleTimer(timer.id)}>
                        {timer.status === 'paused' ? (
                          <Play className="w-4 h-4" />
                        ) : (
                          <Pause className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button type="button" size="sm" variant="ghost" onClick={() => setTimerToDelete(timer.id)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!timerToDelete} onOpenChange={(open) => !open && setTimerToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Timer?</DialogTitle>
            <DialogDescription>Are you sure you want to delete this timer?</DialogDescription>
          </DialogHeader>
          {timerToDelete &&
            (() => {
              const timer = timers.find((t) => t.id === timerToDelete);
              if (!timer) return null;
              const remaining = getTimerRemaining(timer);
              return (
                <div className="space-y-2 py-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Timer:</span>
                    <span className="font-medium truncate">{timer.label}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Time remaining:</span>
                    <span className="font-medium tabular-nums">{formatTime(remaining)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-muted-foreground">Total duration:</span>
                    <span className="font-medium tabular-nums">{formatTime(timer.duration)}</span>
                  </div>
                </div>
              );
            })()}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setTimerToDelete(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeleteTimer}>
              Delete Timer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
