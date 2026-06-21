import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchProfile, updateProfile, type Profile } from '@/lib/api/profile';
import { useAuth } from '@/lib/auth/auth-context';

/** Loads the signed-in user's profile row, falling back to auth metadata. */
export function useProfile() {
  const { user } = useAuth();
  const userId = user?.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setProfile(await fetchProfile(userId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const save = useCallback(
    async (
      patch: Partial<{
        fullName: string;
        avatarUrl: string;
        favoriteGenres: string[];
        subscriptionTier: 'free' | 'premium';
        dailyGoalMinutes: number;
      }>,
    ) => {
      if (!userId) return;
      await updateProfile(userId, patch);
      await reload();
    },
    [userId, reload],
  );

  // Display values, preferring the profile row then auth metadata then email.
  const meta = (user?.user_metadata ?? {}) as { full_name?: string; avatar_url?: string };
  const display = useMemo(() => {
    const email = user?.email ?? '';
    const name = profile?.fullName || meta.full_name || email.split('@')[0] || 'Reader';
    return {
      name,
      email,
      avatarUrl: profile?.avatarUrl || meta.avatar_url || null,
      initials: name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join(''),
      tier: profile?.subscriptionTier ?? 'free',
      favoriteGenres: profile?.favoriteGenres ?? [],
      dailyGoalMinutes: profile?.dailyGoalMinutes ?? 30,
    };
  }, [profile, user, meta.full_name, meta.avatar_url]);

  return { profile, display, loading, error, reload, save };
}
