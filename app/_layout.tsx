import { useEffect } from 'react';
import { Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {
  useFonts,
  Cairo_400Regular,
  Cairo_700Bold,
} from '@expo-google-fonts/cairo';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/lib/supabase';
import logger from '../src/utils/logger';
import '../src/i18n';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

function PushTokenRegistrar() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    async function register() {
      if (!Device.isDevice) return;

      const { status: existing } = await Notifications.getPermissionsAsync();
      let finalStatus = existing;
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;

      const token = (await Notifications.getExpoPushTokenAsync({ projectId: '2e3e1640-26c3-422e-8c26-ae2d5256583a' })).data;
      if (!token) return;

      const { error } = await supabase.from('push_tokens').upsert(
        { user_id: user.id, token },
        { onConflict: 'user_id,token' },
      );
      if (error) logger.error('Push token upsert error:', error);
    }

    register();
  }, [user]);

  return null;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'Poppins': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
    'Cairo': Cairo_400Regular,
    'Cairo-Bold': Cairo_700Bold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <PushTokenRegistrar />
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="site/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="event/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="accommodation/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="bookings" options={{ headerShown: false }} />
          <Stack.Screen name="scanner" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
          <Stack.Screen name="solidarity" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
