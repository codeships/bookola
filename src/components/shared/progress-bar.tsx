import { StyleSheet, View, ViewStyle } from 'react-native';

import { useAppTheme } from '@/lib/theme/use-app-theme';

type ProgressBarProps = {
  progress: number;
  height?: number;
  color?: string;
  style?: ViewStyle;
};

export function ProgressBar({ progress, height = 6, color, style }: ProgressBarProps) {
  const { colors } = useAppTheme();
  const fillColor = color ?? colors.primary;
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <View style={[styles.track, { height, backgroundColor: colors.border }, style]}>
      <View
        style={[
          styles.fill,
          {
            height,
            width: `${clampedProgress}%`,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
});
