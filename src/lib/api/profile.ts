import { supabase } from '@/utils/supabase';

export type Profile = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  favoriteGenres: string[];
  subscriptionTier: 'free' | 'premium';
  dailyGoalMinutes: number;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  favorite_genres: string[] | null;
  subscription_tier: string;
  daily_goal_minutes: number | null;
};

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    favoriteGenres: row.favorite_genres ?? [],
    subscriptionTier: row.subscription_tier === 'premium' ? 'premium' : 'free',
    dailyGoalMinutes: row.daily_goal_minutes ?? 30,
  };
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, favorite_genres, subscription_tier, daily_goal_minutes')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProfile(data as ProfileRow) : null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<{
    fullName: string;
    avatarUrl: string;
    favoriteGenres: string[];
    subscriptionTier: 'free' | 'premium';
    dailyGoalMinutes: number;
  }>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (patch.fullName !== undefined) row.full_name = patch.fullName;
  if (patch.avatarUrl !== undefined) row.avatar_url = patch.avatarUrl;
  if (patch.favoriteGenres !== undefined) row.favorite_genres = patch.favoriteGenres;
  if (patch.subscriptionTier !== undefined) row.subscription_tier = patch.subscriptionTier;
  if (patch.dailyGoalMinutes !== undefined) row.daily_goal_minutes = patch.dailyGoalMinutes;

  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (error) throw error;
}
