import type { Challenge } from '@/types/book';
import { supabase } from '@/utils/supabase';

type ChallengeRow = {
  id: string;
  title: string;
  description: string | null;
  emoji: string;
  target_value: number;
  target_unit: Challenge['targetUnit'];
  participant_count: number;
  ends_at: string;
};

type UserChallengeRow = {
  challenge_id: string;
  progress: number;
  completed: boolean;
};

function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

function mapChallenge(row: ChallengeRow, mine?: UserChallengeRow): Challenge {
  const progress = mine?.progress ?? 0;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    emoji: row.emoji,
    targetValue: row.target_value,
    targetUnit: row.target_unit,
    participantCount: row.participant_count,
    endsAt: row.ends_at,
    daysLeft: daysUntil(row.ends_at),
    joined: !!mine,
    progress,
    percent: Math.min(100, Math.round((progress / row.target_value) * 100)),
    completed: mine?.completed ?? false,
  };
}

/** Active challenges (ending in the future) with the user's progress merged in. */
export async function fetchChallenges(userId?: string): Promise<Challenge[]> {
  const { data, error } = await supabase
    .from('challenges')
    .select(
      'id, title, description, emoji, target_value, target_unit, participant_count, ends_at',
    )
    .order('ends_at', { ascending: true });
  if (error) throw error;

  const mineById = new Map<string, UserChallengeRow>();
  if (userId) {
    const { data: mine } = await supabase
      .from('user_challenges')
      .select('challenge_id, progress, completed')
      .eq('user_id', userId);
    (mine ?? []).forEach((m: UserChallengeRow) => mineById.set(m.challenge_id, m));
  }

  return (data as ChallengeRow[]).map((row) => mapChallenge(row, mineById.get(row.id)));
}

export async function joinChallenge(userId: string, challengeId: string): Promise<void> {
  const { error } = await supabase
    .from('user_challenges')
    .upsert(
      { user_id: userId, challenge_id: challengeId },
      { onConflict: 'user_id,challenge_id', ignoreDuplicates: true },
    );
  if (error) throw error;
}

/** Set a user's progress in a challenge, flagging completion at/over target. */
export async function setChallengeProgress(
  userId: string,
  challengeId: string,
  progress: number,
  targetValue: number,
): Promise<void> {
  const clamped = Math.max(0, progress);
  const { error } = await supabase
    .from('user_challenges')
    .upsert(
      {
        user_id: userId,
        challenge_id: challengeId,
        progress: clamped,
        completed: clamped >= targetValue,
      },
      { onConflict: 'user_id,challenge_id' },
    );
  if (error) throw error;
}
