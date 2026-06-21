import { useColorScheme } from 'react-native';

import { useAppSettings } from '@/lib/settings/app-settings';
import { darkColors, lightColors } from './colors';

export function useAppTheme() {
  const scheme = useColorScheme();
  const { settings } = useAppSettings();

  // Respect an explicit light/dark override; otherwise follow the system.
  const isDark =
    settings.themePreference === 'system'
      ? scheme === 'dark'
      : settings.themePreference === 'dark';

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
}
