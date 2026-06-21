import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { softShadow } from '@/lib/theme/shadows';
import { useAppTheme } from '@/lib/theme/use-app-theme';

type GlassPanelProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function GlassPanel({ children, style }: GlassPanelProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.panel,
        softShadow,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 28,
    overflow: 'hidden',
  },
});
