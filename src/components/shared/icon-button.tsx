import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { useAppTheme } from '@/lib/theme/use-app-theme';

type IconButtonProps = {
  icon: string;
  onPress?: () => void;
  size?: number;
  style?: ViewStyle;
  variant?: 'glass' | 'ghost' | 'filled';
  active?: boolean;
};

export function IconButton({
  icon,
  onPress,
  size = 44,
  style,
  variant = 'glass',
  active = false,
}: IconButtonProps) {
  const { colors } = useAppTheme();

  const bgColor =
    variant === 'filled'
      ? colors.primary
      : variant === 'glass'
        ? colors.surface
        : 'transparent';

  const textColor = active
    ? colors.primary
    : variant === 'filled'
      ? '#FFFFFF'
      : colors.text;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
          borderColor: variant === 'ghost' ? 'transparent' : colors.border,
          borderWidth: variant === 'ghost' ? 0 : 1,
        },
        style,
      ]}>
      <Text style={[styles.icon, { fontSize: size * 0.45, color: textColor }]}>{icon}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    textAlign: 'center',
  },
});
