import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { useResponsive } from '@/lib/theme/breakpoints';
import { useAppTheme } from '@/lib/theme/use-app-theme';

function TabIcon({ icon, focused, color }: { icon: string; label?: string; focused: boolean; color: string }) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Text style={[styles.icon, { color }]}>{icon}</Text>
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useAppTheme();
  const { isPhone, contentMaxWidth } = useResponsive();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          backgroundColor: colors.surfaceStrong,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          elevation: 0,
          shadowColor: colors.shadow,
          shadowOpacity: 0.06,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -8 },
          // Center the bar on tablet/desktop instead of stretching full width.
          ...(isPhone ? null : { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🏠" label="Home" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="🔍" label="Search" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="📚" label="Library" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="👥" label="Community" focused={focused} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => <TabIcon icon="👤" label="Profile" focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  iconWrapActive: {
    backgroundColor: 'rgba(91, 140, 255, 0.12)',
  },
  icon: {
    fontSize: 18,
  },
});
