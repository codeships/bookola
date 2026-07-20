// Web build. Browsers already provide a synchronous `window.localStorage`, so
// there's no need for expo-sqlite's polyfill (which would import a .wasm module
// the web bundler can't resolve).

/** Synchronous key/value store used for the Supabase session + app settings. */
export const supabaseStorage: Storage = localStorage;
