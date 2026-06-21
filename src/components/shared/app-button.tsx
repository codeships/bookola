import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useAppTheme } from '@/lib/theme/use-app-theme';

type AppButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  style?: ViewStyle;
  rightSlot?: ReactNode;
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  style,
  rightSlot,
}: AppButtonProps) {
  const { colors } = useAppTheme();

  const variantStyle =
    variant === 'primary'
      ? {
          backgroundColor: colors.text,
          borderColor: colors.text,
          textColor: '#FFFFFF',
        }
      : variant === 'secondary'
        ? {
            backgroundColor: colors.surfaceStrong,
            borderColor: colors.border,
            textColor: colors.text,
          }
        : {
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            textColor: colors.mutedText,
          };

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
        },
        style,
      ]}>
      <Text style={[styles.label, { color: variantStyle.textColor }]}>{label}</Text>
      {rightSlot}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
});
