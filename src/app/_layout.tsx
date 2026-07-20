import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/lib/auth/auth-context';
import { BooksProvider } from '@/lib/books/books-provider';
import { AppSettingsProvider } from '@/lib/settings/app-settings';

function RootNavigator() {
  const { session, initializing } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;

    const group = segments[0] as string | undefined;
    const isPasswordRecovery = group === 'reset-password';
    const inAuthFlow = group === '(auth)' || group === undefined; // (auth) screens + onboarding (index)

    if (session && inAuthFlow && !isPasswordRecovery) {
      router.replace('/(tabs)/home');
    } else if (!session && !inAuthFlow && !isPasswordRecovery) {
      router.replace('/(auth)/login');
    }
  }, [session, initializing, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="book/[id]" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="reader/[id]" options={{ animation: 'fade' }} />
      <Stack.Screen name="player/[id]" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="settings/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="subscription/index" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="upload/index" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="reset-password" options={{ animation: 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <BooksProvider>
          <RootNavigator />
        </BooksProvider>
      </AuthProvider>
    </AppSettingsProvider>
  );
}
