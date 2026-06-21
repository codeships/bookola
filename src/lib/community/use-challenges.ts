import { useCallback, useEffect, useState } from 'react';

import {
  fetchChallenges,
  joinChallenge,
  setChallengeProgress,
} from '@/lib/api/challenges';
import { useAuth } from '@/lib/auth/auth-context';
import type { Challenge } from '@/types/book';

/** Loads active challenges with the user's progress, plus join / log mutations. */
export function useChallenges() {
  const { user } = useAuth();
  const userId = user?.id;
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setChallenges(await fetchChallenges(userId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load challenges.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const join = useCallback(
    async (challenge: Challenge) => {
      if (!userId || challenge.joined) return;
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challenge.id
            ? { ...c, joined: true, participantCount: c.participantCount + 1 }
            : c,
        ),
      );
      try {
        await joinChallenge(userId, challenge.id);
      } catch {
        reload();
      }
    },
    [userId, reload],
  );

  /** Add `amount` units of progress (e.g. pages) to a joined challenge. */
  const addProgress = useCallback(
    async (challenge: Challenge, amount: number) => {
      if (!userId) return;
      const next = Math.min(challenge.targetValue, challenge.progress + amount);
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challenge.id
            ? {
                ...c,
                joined: true,
                progress: next,
                percent: Math.min(100, Math.round((next / c.targetValue) * 100)),
                completed: next >= c.targetValue,
              }
            : c,
        ),
      );
      try {
        await setChallengeProgress(userId, challenge.id, next, challenge.targetValue);
      } catch {
        reload();
      }
    },
    [userId, reload],
  );

  return { challenges, loading, error, reload, join, addProgress };
}
