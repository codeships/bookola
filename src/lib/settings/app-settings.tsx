import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { storage } from '@/utils/storage';

// `storage` is a synchronous key/value store (SQLite-backed on native, the
// browser's localStorage on web), so we can read the persisted settings during
// the initial render.

export type ThemePreference = 'light' | 'dark' | 'system';

export type AppSettings = {
  themePreference: ThemePreference;
  /** Base font size (px) for the reader. */
  readerFontSize: number;
  /** Line-height multiplier for the reader. */
  readerLineSpacing: number;
  notifications: boolean;
  autoPlayNext: boolean;
  offlineMode: boolean;
};

const DEFAULTS: AppSettings = {
  themePreference: 'system',
  readerFontSize: 17,
  readerLineSpacing: 1.75,
  notifications: true,
  autoPlayNext: true,
  offlineMode: false,
};

const STORAGE_KEY = 'bookola.settings';

function loadSettings(): AppSettings {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) };
  } catch {
    return DEFAULTS;
  }
}

function persist(settings: AppSettings) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* best-effort */
  }
}

type AppSettingsContextValue = {
  settings: AppSettings;
  update: (patch: Partial<AppSettings>) => void;
};

// Default context so consumers (e.g. useAppTheme) work even before the provider
// mounts; the no-op `update` is only ever hit outside the provider tree.
const AppSettingsContext = createContext<AppSettingsContextValue>({
  settings: DEFAULTS,
  update: () => {},
});

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      persist(next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ settings, update }), [settings, update]);

  return <AppSettingsContext.Provider value={value}>{children}</AppSettingsContext.Provider>;
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
