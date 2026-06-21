import { useCallback, useEffect, useState } from 'react';

import { createClub, fetchClubs, joinClub, leaveClub } from '@/lib/api/clubs';
import { useAuth } from '@/lib/auth/auth-context';
import type { Club } from '@/types/book';

/** Loads reading clubs and exposes join / leave / create mutations. */
export function useClubs() {
  const { user } = useAuth();
  const userId = user?.id;
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setClubs(await fetchClubs(userId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load clubs.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleMembership = useCallback(
    async (club: Club) => {
      if (!userId) return;
      const joining = !club.isMember;
      // Optimistic: flip membership and nudge the displayed count.
      setClubs((prev) =>
        prev.map((c) =>
          c.id === club.id
            ? { ...c, isMember: joining, memberCount: Math.max(0, c.memberCount + (joining ? 1 : -1)) }
            : c,
        ),
      );
      try {
        if (joining) await joinClub(userId, club.id);
        else await leaveClub(userId, club.id);
      } catch {
        reload();
      }
    },
    [userId, reload],
  );

  const create = useCallback(
    async (input: { name: string; description?: string; emoji?: string }) => {
      if (!userId) return;
      const club = await createClub(userId, input);
      setClubs((prev) => [club, ...prev]);
      return club;
    },
    [userId],
  );

  return { clubs, loading, error, reload, toggleMembership, create };
}
