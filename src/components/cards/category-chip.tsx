import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/lib/theme/use-app-theme';

type CategoryChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export function CategoryChip({ label, selected = false, onPress }: CategoryChipProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.text : colors.surfaceStrong,
          borderColor: selected ? colors.text : colors.border,
        },
      ]}>
      <Text style={[styles.label, { color: selected ? '#FFFFFF' : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 40,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 999,
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
