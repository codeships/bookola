// Native (iOS/Android) default. React Native has no `localStorage`, so we
// install expo-sqlite's synchronous SQLite-backed polyfill. The web build uses
// storage.web.ts instead, which avoids pulling in wa-sqlite's .wasm module.
import 'expo-sqlite/localStorage/install';

/** Synchronous key/value store used for the Supabase session + app settings. */
export const storage: Storage = localStorage;
