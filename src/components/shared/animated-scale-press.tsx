import { ReactNode } from 'react';
import { Pressable, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type AnimatedScalePressProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  scaleDown?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AnimatedScalePress({
  children,
  onPress,
  style,
  scaleDown = 0.97,
}: AnimatedScalePressProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => {
        scale.value = withSpring(scaleDown, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPress={onPress}
      style={[animatedStyle, style]}>
      {children}
    </AnimatedPressable>
  );
}
