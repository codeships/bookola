import { ReactNode } from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, View } from 'react-native';

import { useResponsive } from '@/lib/theme/breakpoints';
import { useAppTheme } from '@/lib/theme/use-app-theme';

type ScreenShellProps = {
  children: ReactNode;
  scrollable?: boolean;
};

export function ScreenShell({ children, scrollable = true }: ScreenShellProps) {
  const { colors, isDark } = useAppTheme();
  const { contentMaxWidth, horizontalPadding } = useResponsive();

  const content = (
    <View
      style={[
        styles.inner,
        { paddingHorizontal: horizontalPadding, maxWidth: contentMaxWidth },
      ]}>
      <View style={[styles.orb, styles.orbOne, { backgroundColor: colors.primary + '22' }]} />
      <View style={[styles.orb, styles.orbTwo, { backgroundColor: colors.accent + '22' }]} />
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {scrollable ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
    width: '100%',
    alignSelf: 'center',
    paddingTop: 16,
    paddingBottom: 40,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOne: {
    width: 190,
    height: 190,
    top: 24,
    right: -40,
  },
  orbTwo: {
    width: 160,
    height: 160,
    bottom: 160,
    left: -50,
  },
});
