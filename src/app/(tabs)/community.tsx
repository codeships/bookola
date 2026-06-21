import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CategoryChip } from '@/components/cards/category-chip';
import { GlassPanel } from '@/components/shared/glass-panel';
import { ReviewCard } from '@/components/shared/review-card';
import { ScreenShell } from '@/components/shared/screen-shell';
import { SectionHeader } from '@/components/shared/section-header';
import { upsertReview } from '@/lib/api/reviews';
import { useAuth } from '@/lib/auth/auth-context';
import { useChallenges } from '@/lib/community/use-challenges';
import { useClubs } from '@/lib/community/use-clubs';
import { useLibrary } from '@/lib/library/use-library';
import { useReviews } from '@/lib/reviews/use-reviews';
import { useAppTheme } from '@/lib/theme/use-app-theme';
import type { Challenge } from '@/types/book';

export default function CommunityScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'feed' | 'clubs' | 'challenges'>('feed');

  const { reviews, loading: reviewsLoading, reload: reloadReviews, toggleLike } = useReviews();
  const { inProgress, items } = useLibrary();
  const { clubs, loading: clubsLoading, toggleMembership, create } = useClubs();
  const { challenges, loading: challengesLoading, join, addProgress } = useChallenges();

  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [creating, setCreating] = useState(false);

  // The feed composer posts a review on the book you're currently reading
  // (or any book in your library), so it lands back in the feed.
  async function handlePost() {
    const text = draft.trim();
    if (!text || !user) return;
    const target = inProgress[0] ?? items[0];
    if (!target) {
      Alert.alert('Add a book first', 'Open a book and add it to your library, then share a review.');
      return;
    }
    setPosting(true);
    try {
      await upsertReview(user.id, { bookId: target.id, rating: 5, body: text });
      setDraft('');
      await reloadReviews();
    } catch (e) {
      Alert.alert('Could not post', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setPosting(false);
    }
  }

  async function handleCreateClub() {
    const name = newClubName.trim();
    if (!name) return;
    setCreating(true);
    try {
      await create({ name });
      setNewClubName('');
      setShowCreate(false);
    } catch (e) {
      Alert.alert('Could not create club', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setCreating(false);
    }
  }

  const featuredChallenge = challenges[0];

  return (
    <ScreenShell>
      <Text style={[styles.title, { color: colors.text }]}>Community</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Reviews, clubs, and reading challenges from the Bookola community.
      </Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <CategoryChip label="📝 Feed" selected={activeTab === 'feed'} onPress={() => setActiveTab('feed')} />
        <CategoryChip label="👥 Clubs" selected={activeTab === 'clubs'} onPress={() => setActiveTab('clubs')} />
        <CategoryChip label="🏆 Challenges" selected={activeTab === 'challenges'} onPress={() => setActiveTab('challenges')} />
      </View>

      {/* Feed tab */}
      {activeTab === 'feed' && (
        <>
          {/* Write a review */}
          <GlassPanel style={styles.composeCard}>
            <Text style={[styles.composeLabel, { color: colors.text }]}>Share your thoughts</Text>
            <TextInput
              placeholder="Write a review of what you're reading..."
              placeholderTextColor={colors.mutedText}
              value={draft}
              onChangeText={setDraft}
              editable={!posting}
              style={[styles.composeInput, { color: colors.text, borderColor: colors.border }]}
              multiline
            />
            <Pressable
              onPress={posting || !draft.trim() ? undefined : handlePost}
              style={[
                styles.postButton,
                { backgroundColor: colors.text },
                !draft.trim() && { opacity: 0.5 },
              ]}>
              {posting ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.postButtonText, { color: colors.background }]}>Post</Text>
              )}
            </Pressable>
          </GlassPanel>

          <SectionHeader title="Latest Reviews" />
          {reviewsLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard key={review.id} review={review} onLike={() => toggleLike(review)} />
            ))
          ) : (
            <GlassPanel style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No reviews yet. Be the first to share your thoughts above.
              </Text>
            </GlassPanel>
          )}
        </>
      )}

      {/* Clubs tab */}
      {activeTab === 'clubs' && (
        <>
          <SectionHeader title="Reading Clubs" action="Create" onAction={() => setShowCreate((s) => !s)} />

          {showCreate && (
            <GlassPanel style={styles.composeCard}>
              <Text style={[styles.composeLabel, { color: colors.text }]}>New club</Text>
              <TextInput
                placeholder="Club name"
                placeholderTextColor={colors.mutedText}
                value={newClubName}
                onChangeText={setNewClubName}
                editable={!creating}
                style={[styles.clubInput, { color: colors.text, borderColor: colors.border }]}
              />
              <Pressable
                onPress={creating || !newClubName.trim() ? undefined : handleCreateClub}
                style={[
                  styles.postButton,
                  { backgroundColor: colors.text },
                  !newClubName.trim() && { opacity: 0.5 },
                ]}>
                {creating ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.postButtonText, { color: colors.background }]}>Create club</Text>
                )}
              </Pressable>
            </GlassPanel>
          )}

          {clubsLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            clubs.map((club) => (
              <GlassPanel key={club.id} style={styles.clubCard}>
                <View style={styles.clubRow}>
                  <Text style={styles.clubEmoji}>{club.emoji}</Text>
                  <View style={styles.clubInfo}>
                    <Text style={[styles.clubName, { color: colors.text }]}>{club.name}</Text>
                    <Text style={[styles.clubMembers, { color: colors.mutedText }]}>
                      {club.memberCount.toLocaleString()} members
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => toggleMembership(club)}
                    style={[
                      styles.joinButton,
                      { borderColor: colors.primary },
                      club.isMember && { backgroundColor: colors.primary },
                    ]}>
                    <Text
                      style={[
                        styles.joinText,
                        { color: club.isMember ? '#FFFFFF' : colors.primary },
                      ]}>
                      {club.isMember ? 'Joined' : 'Join'}
                    </Text>
                  </Pressable>
                </View>
              </GlassPanel>
            ))
          )}
        </>
      )}

      {/* Challenges tab */}
      {activeTab === 'challenges' && (
        <>
          <SectionHeader title="This Week's Challenge" />
          {challengesLoading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : featuredChallenge ? (
            <ChallengeCard
              challenge={featuredChallenge}
              onJoin={() => join(featuredChallenge)}
              onLog={() => addProgress(featuredChallenge, 10)}
            />
          ) : (
            <GlassPanel style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: colors.mutedText }]}>
                No active challenges right now. Check back soon!
              </Text>
            </GlassPanel>
          )}

          {challenges.slice(1).map((c) => (
            <ChallengeCard
              key={c.id}
              challenge={c}
              onJoin={() => join(c)}
              onLog={() => addProgress(c, 10)}
            />
          ))}

          <SectionHeader title="Past Challenges" />
          {['Read 5 Books in a Month', 'Listen to 10 Hours of Audiobooks', '30-Day Reading Streak'].map(
            (challenge, i) => (
              <GlassPanel key={i} style={styles.pastChallenge}>
                <View style={styles.pastRow}>
                  <Text style={[styles.pastIcon, { color: colors.success }]}>✓</Text>
                  <View style={styles.pastInfo}>
                    <Text style={[styles.pastTitle, { color: colors.text }]}>{challenge}</Text>
                    <Text style={[styles.pastMeta, { color: colors.mutedText }]}>Completed</Text>
                  </View>
                  <Text style={styles.pastBadge}>🏅</Text>
                </View>
              </GlassPanel>
            ),
          )}
        </>
      )}
    </ScreenShell>
  );
}

function ChallengeCard({
  challenge,
  onJoin,
  onLog,
}: {
  challenge: Challenge;
  onJoin: () => void;
  onLog: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <GlassPanel style={styles.challengeCard}>
      <Text style={styles.challengeEmoji}>{challenge.emoji}</Text>
      <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
      <Text style={[styles.challengeMeta, { color: colors.mutedText }]}>
        {challenge.participantCount.toLocaleString()} participants • {challenge.daysLeft} days left
      </Text>

      {challenge.joined ? (
        <>
          <View style={[styles.challengeBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.challengeFill,
                { width: `${challenge.percent}%`, backgroundColor: colors.success },
              ]}
            />
          </View>
          <Text style={[styles.challengeProgress, { color: colors.success }]}>
            {challenge.progress}/{challenge.targetValue} {challenge.targetUnit} • {challenge.percent}%
          </Text>
          {!challenge.completed ? (
            <Pressable
              onPress={onLog}
              style={[styles.logButton, { backgroundColor: colors.primary }]}>
              <Text style={styles.logButtonText}>+10 {challenge.targetUnit}</Text>
            </Pressable>
          ) : (
            <Text style={[styles.challengeDone, { color: colors.success }]}>🎉 Completed!</Text>
          )}
        </>
      ) : (
        <Pressable onPress={onJoin} style={[styles.logButton, { backgroundColor: colors.primary }]}>
          <Text style={styles.logButtonText}>Join challenge</Text>
        </Pressable>
      )}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  loader: {
    marginVertical: 24,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  composeCard: {
    padding: 18,
    marginBottom: 18,
  },
  composeLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  composeInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  clubInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  postButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 84,
    alignItems: 'center',
  },
  postButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  clubCard: {
    padding: 16,
    marginBottom: 12,
  },
  clubRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clubEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  clubMembers: {
    fontSize: 13,
  },
  joinButton: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  joinText: {
    fontSize: 13,
    fontWeight: '700',
  },
  challengeCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 18,
  },
  challengeEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  challengeMeta: {
    fontSize: 13,
    marginBottom: 16,
  },
  challengeBar: {
    width: '100%',
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 8,
  },
  challengeFill: {
    height: 8,
    borderRadius: 999,
  },
  challengeProgress: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
  },
  challengeDone: {
    fontSize: 15,
    fontWeight: '700',
  },
  logButton: {
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 999,
  },
  logButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pastChallenge: {
    padding: 16,
    marginBottom: 10,
  },
  pastRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pastIcon: {
    fontSize: 20,
    fontWeight: '800',
    marginRight: 14,
  },
  pastInfo: {
    flex: 1,
  },
  pastTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  pastMeta: {
    fontSize: 12,
  },
  pastBadge: {
    fontSize: 22,
  },
});
