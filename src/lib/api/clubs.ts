import type { Club } from '@/types/book';
import { supabase } from '@/utils/supabase';

type ClubRow = {
  id: string;
  name: string;
  description: string | null;
  emoji: string;
  member_count: number;
};

/** All clubs, with the current user's membership flagged. */
export async function fetchClubs(userId?: string): Promise<Club[]> {
  const { data, error } = await supabase
    .from('clubs')
    .select('id, name, description, emoji, member_count')
    .order('member_count', { ascending: false });
  if (error) throw error;

  const memberOf = new Set<string>();
  if (userId) {
    const { data: memberships } = await supabase
      .from('club_members')
      .select('club_id')
      .eq('user_id', userId);
    (memberships ?? []).forEach((m: { club_id: string }) => memberOf.add(m.club_id));
  }

  return (data as ClubRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    emoji: row.emoji,
    memberCount: row.member_count,
    isMember: memberOf.has(row.id),
  }));
}

export async function joinClub(userId: string, clubId: string): Promise<void> {
  const { error } = await supabase
    .from('club_members')
    .upsert({ club_id: clubId, user_id: userId }, { onConflict: 'club_id,user_id' });
  if (error) throw error;
}

export async function leaveClub(userId: string, clubId: string): Promise<void> {
  const { error } = await supabase
    .from('club_members')
    .delete()
    .eq('club_id', clubId)
    .eq('user_id', userId);
  if (error) throw error;
}

/** Create a club owned by the user and join it. Returns the new club. */
export async function createClub(
  userId: string,
  input: { name: string; description?: string; emoji?: string },
): Promise<Club> {
  const { data, error } = await supabase
    .from('clubs')
    .insert({
      name: input.name,
      description: input.description ?? null,
      emoji: input.emoji ?? '📚',
      member_count: 1,
      created_by: userId,
    })
    .select('id, name, description, emoji, member_count')
    .single();
  if (error) throw error;

  const row = data as ClubRow;
  // Best-effort: register the creator as a member too.
  await supabase
    .from('club_members')
    .upsert({ club_id: row.id, user_id: userId }, { onConflict: 'club_id,user_id' });

  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    emoji: row.emoji,
    memberCount: row.member_count,
    isMember: true,
  };
}
