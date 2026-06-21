import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GlassPanel } from '@/components/shared/glass-panel';
import { IconButton } from '@/components/shared/icon-button';
import { ScreenShell } from '@/components/shared/screen-shell';
import { clearDownloads, formatBytes } from '@/lib/api/downloads';
import { useAuth } from '@/lib/auth/auth-context';
import { useLibrary } from '@/lib/library/use-library';
import { useProfile } from '@/lib/profile/use-profile';
import { useAppSettings } from '@/lib/settings/app-settings';
import { useAppTheme } from '@/lib/theme/use-app-theme';

type SettingRowProps = {
  icon: string;
  label: string;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  onPress?: () => void;
};

function SettingRow({
  icon,
  label,
  value,
  hasSwitch,
  switchValue,
  onSwitchChange,
  onPress,
}: SettingRowProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable onPress={onPress} style={[styles.row, { borderBottomColor: colors.border }]}>
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary + '66' }}
          thumbColor={switchValue ? colors.primary : colors.mutedText}
        />
      ) : (
        <View style={styles.rowRight}>
          {value && <Text style={[styles.rowValue, { color: colors.mutedText }]}>{value}</Text>}
          {onPress && <Text style={[styles.chevron, { color: colors.mutedText }]}>›</Text>}
        </View>
      )}
    </Pressable>
  );
}

const FONT_LABELS: Record<number, string> = { 14: 'Small', 17: 'Medium', 20: 'Large', 22: 'X-Large' };
function fontLabel(size: number) {
  return FONT_LABELS[size] ?? `${size}px`;
}

export default function SettingsScreen() {
  const { colors, isDark } = useAppTheme();
  const { signOut } = useAuth();
  const { settings, update } = useAppSettings();
  const { display, save } = useProfile();
  const { downloaded } = useLibrary();

  const [editing, setEditing] = useState(false);
  const [nameDraft, setNameDraft] = useState(display.name);
  const [savingName, setSavingName] = useState(false);
  const [cacheLabel, setCacheLabel] = useState<string | null>(null);

  async function handleSignOut() {
    await signOut();
    router.replace('/(auth)/login');
  }

  // Cycle the reader font size through the supported sizes.
  function cycleFont() {
    const sizes = [14, 17, 20, 22];
    const idx = sizes.indexOf(settings.readerFontSize);
    update({ readerFontSize: sizes[(idx + 1) % sizes.length] ?? 17 });
  }

  // Cycle the theme preference: System → Light → Dark.
  function cycleTheme() {
    const order: Array<typeof settings.themePreference> = ['system', 'light', 'dark'];
    const idx = order.indexOf(settings.themePreference);
    update({ themePreference: order[(idx + 1) % order.length] });
  }

  function cycleLineSpacing() {
    const steps = [1.4, 1.75, 2.1];
    const idx = steps.indexOf(settings.readerLineSpacing);
    update({ readerLineSpacing: steps[(idx + 1) % steps.length] ?? 1.75 });
  }

  // Cycle the daily reading goal and persist it to the profile.
  function cycleGoal() {
    const goals = [15, 30, 45, 60];
    const idx = goals.indexOf(display.dailyGoalMinutes);
    save({ dailyGoalMinutes: goals[(idx + 1) % goals.length] ?? 30 }).catch(() => {});
  }

  async function handleSaveName() {
    const name = nameDraft.trim();
    if (!name) return;
    setSavingName(true);
    try {
      await save({ fullName: name });
      setEditing(false);
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setSavingName(false);
    }
  }

  function handleClearCache() {
    Alert.alert('Clear cache', 'Remove downloaded book files from this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          const { files, bytes } = clearDownloads();
          setCacheLabel(files > 0 ? `Freed ${formatBytes(bytes)}` : 'Already empty');
        },
      },
    ]);
  }

  const openLink = (url: string) => WebBrowser.openBrowserAsync(url).catch(() => {});

  return (
    <ScreenShell>
      {/* Header */}
      <View style={styles.header}>
        <IconButton icon="←" onPress={() => router.back()} variant="glass" size={40} />
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Edit profile modal */}
      {editing && (
        <GlassPanel style={styles.editCard}>
          <Text style={[styles.editLabel, { color: colors.text }]}>Edit Profile</Text>
          <TextInput
            value={nameDraft}
            onChangeText={setNameDraft}
            placeholder="Full name"
            placeholderTextColor={colors.mutedText}
            editable={!savingName}
            style={[styles.editInput, { color: colors.text, borderColor: colors.border }]}
          />
          <View style={styles.editActions}>
            <Pressable onPress={() => setEditing(false)} style={styles.editCancel}>
              <Text style={[styles.editCancelText, { color: colors.mutedText }]}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={savingName || !nameDraft.trim() ? undefined : handleSaveName}
              style={[styles.editSave, { backgroundColor: colors.text }, !nameDraft.trim() && { opacity: 0.5 }]}>
              {savingName ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.editSaveText, { color: colors.background }]}>Save</Text>
              )}
            </Pressable>
          </View>
        </GlassPanel>
      )}

      {/* Appearance */}
      <Text style={[styles.sectionLabel, { color: colors.primary }]}>Appearance</Text>
      <GlassPanel style={styles.section}>
        <SettingRow
          icon="🌓"
          label="Dark Mode"
          hasSwitch
          switchValue={isDark}
          onSwitchChange={(val) => update({ themePreference: val ? 'dark' : 'light' })}
        />
        <SettingRow
          icon="🎨"
          label="Theme Preference"
          value={settings.themePreference === 'system' ? 'System' : settings.themePreference === 'dark' ? 'Dark' : 'Light'}
          onPress={cycleTheme}
        />
        <SettingRow icon="🔤" label="Font Size" value={fontLabel(settings.readerFontSize)} onPress={cycleFont} />
        <SettingRow icon="📐" label="Line Spacing" value={`${settings.readerLineSpacing.toFixed(2)}x`} onPress={cycleLineSpacing} />
      </GlassPanel>

      {/* Reading */}
      <Text style={[styles.sectionLabel, { color: colors.primary }]}>Reading</Text>
      <GlassPanel style={styles.section}>
        <SettingRow
          icon="📊"
          label="Daily Reading Goal"
          value={`${display.dailyGoalMinutes} min/day`}
          onPress={cycleGoal}
        />
        <SettingRow
          icon="▶️"
          label="Auto-play Next Chapter"
          hasSwitch
          switchValue={settings.autoPlayNext}
          onSwitchChange={(val) => update({ autoPlayNext: val })}
        />
      </GlassPanel>

      {/* Notifications */}
      <Text style={[styles.sectionLabel, { color: colors.primary }]}>Notifications</Text>
      <GlassPanel style={styles.section}>
        <SettingRow
          icon="🔔"
          label="Push Notifications"
          hasSwitch
          switchValue={settings.notifications}
          onSwitchChange={(val) => update({ notifications: val })}
        />
      </GlassPanel>

      {/* Storage */}
      <Text style={[styles.sectionLabel, { color: colors.primary }]}>Storage & Data</Text>
      <GlassPanel style={styles.section}>
        <SettingRow
          icon="📥"
          label="Offline Mode"
          hasSwitch
          switchValue={settings.offlineMode}
          onSwitchChange={(val) => update({ offlineMode: val })}
        />
        <SettingRow
          icon="💾"
          label="Downloaded Books"
          value={`${downloaded.length} book${downloaded.length !== 1 ? 's' : ''}`}
          onPress={() => router.push('/library')}
        />
        <SettingRow
          icon="🗑️"
          label="Clear Cache"
          value={cacheLabel ?? undefined}
          onPress={handleClearCache}
        />
      </GlassPanel>

      {/* Account */}
      <Text style={[styles.sectionLabel, { color: colors.primary }]}>Account</Text>
      <GlassPanel style={styles.section}>
        <SettingRow
          icon="👤"
          label="Edit Profile"
          onPress={() => {
            setNameDraft(display.name);
            setEditing(true);
          }}
        />
        <SettingRow
          icon="⭐"
          label="Subscription"
          value={display.tier === 'premium' ? 'Premium' : 'Free'}
          onPress={() => router.push('/subscription')}
        />
        <SettingRow
          icon="🔒"
          label="Privacy & Security"
          onPress={() => openLink('https://bookola.app/privacy')}
        />
        <SettingRow
          icon="📄"
          label="Terms of Service"
          onPress={() => openLink('https://bookola.app/terms')}
        />
        <SettingRow
          icon="ℹ️"
          label="About Bookola"
          value="v1.0.0"
          onPress={() =>
            Alert.alert(
              'Bookola',
              'Version 1.0.0\n\nA calm, AI-powered space to read, listen, and grow.',
            )
          }
        />
      </GlassPanel>

      {/* Sign out */}
      <Pressable
        onPress={handleSignOut}
        style={[styles.signOutButton, { borderColor: colors.danger }]}>
        <Text style={[styles.signOutText, { color: colors.danger }]}>Sign Out</Text>
      </Pressable>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 8,
    paddingLeft: 4,
  },
  section: {
    marginBottom: 16,
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
  },
  rowIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowValue: {
    fontSize: 14,
  },
  chevron: {
    fontSize: 22,
    fontWeight: '300',
  },
  editCard: {
    padding: 18,
    marginBottom: 16,
  },
  editLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  editInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 12,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  editCancel: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  editCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  editSave: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 999,
    minWidth: 84,
    alignItems: 'center',
  },
  editSaveText: {
    fontSize: 14,
    fontWeight: '700',
  },
  signOutButton: {
    marginTop: 8,
    marginBottom: 20,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
