import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { CategoryChip } from '@/components/cards/category-chip';
import { AppButton } from '@/components/shared/app-button';
import { GlassPanel } from '@/components/shared/glass-panel';
import { ScreenShell } from '@/components/shared/screen-shell';
import { categories } from '@/data/mock-books';
import { useProfile } from '@/lib/profile/use-profile';
import { useAppTheme } from '@/lib/theme/use-app-theme';

export default function PreferencesScreen() {
  const { colors } = useAppTheme();
  const { display, save } = useProfile();
  const [selected, setSelected] = useState<string[]>(display.favoriteGenres);
  const [saving, setSaving] = useState(false);

  function toggle(category: string) {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    );
  }

  async function handleContinue() {
    setSaving(true);
    try {
      if (selected.length > 0) await save({ favoriteGenres: selected });
    } catch {
      /* preferences are best-effort; don't block onboarding */
    } finally {
      setSaving(false);
      router.replace('/(tabs)/home');
    }
  }

  return (
    <ScreenShell>
      <Text style={[styles.title, { color: colors.text }]}>Pick your reading vibe</Text>
      <Text style={[styles.subtitle, { color: colors.mutedText }]}>
        Choose a few genres so Bookola can shape your home feed from day one.
      </Text>

      <GlassPanel style={styles.panel}>
        <View style={styles.chips}>
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              selected={selected.includes(category)}
              onPress={() => toggle(category)}
            />
          ))}
        </View>
        <AppButton
          label={saving ? 'Saving…' : 'Continue to Bookola'}
          onPress={saving ? undefined : handleContinue}
          rightSlot={saving ? <ActivityIndicator color="#FFFFFF" /> : undefined}
        />
      </GlassPanel>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 25,
    marginBottom: 24,
    maxWidth: 340,
  },
  panel: {
    padding: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
});
