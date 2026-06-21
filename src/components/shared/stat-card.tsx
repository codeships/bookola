import { StyleSheet, Text, ViewStyle } from 'react-native';

import { GlassPanel } from '@/components/shared/glass-panel';
import { useAppTheme } from '@/lib/theme/use-app-theme';

type StatCardProps = {
  value: string;
  label: string;
  icon?: string;
  style?: ViewStyle;
};

export function StatCard({ value, label, icon, style }: StatCardProps) {
  const { colors } = useAppTheme();

  return (
    <GlassPanel style={[styles.card, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.label, { color: colors.mutedText }]}>{label}</Text>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
    marginBottom: 8,
  },
  value: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
