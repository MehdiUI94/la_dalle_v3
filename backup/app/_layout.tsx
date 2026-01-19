// IMPORTANT: Charger le mock de react-native-reanimated AVANT tout autre import sur le web
// Cela évite les problèmes avec react-native-web qui essaie d'étendre des classes non définies
if (typeof window !== 'undefined') {
  // On est sur le web
  try {
    require('../react-native-reanimated.web');
  } catch (e) {
    // Ignorer si le mock n'est pas disponible
  }
}

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

// Importer react-native-reanimated uniquement sur les plateformes natives
if (Platform.OS !== 'web') {
  require('react-native-reanimated');
}

import { useColorScheme } from '@/hooks/use-color-scheme';
import { handleAuthDeepLink } from '../config/supabase';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Gérer les deep links au démarrage de l'app
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        await handleAuthDeepLink(initialUrl);
      }
    };

    handleInitialURL();

    // Écouter les deep links pendant l'utilisation de l'app
    const subscription = Linking.addEventListener('url', async (event) => {
      await handleAuthDeepLink(event.url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="auth-callback" options={{ headerShown: false }} />
        <Stack.Screen name="map" options={{ headerShown: false }} />
        <Stack.Screen 
          name="restaurant-detail" 
          options={{ 
            presentation: 'card',
            title: 'Détails',
            headerStyle: { backgroundColor: '#101828' },
            headerTintColor: '#F97316',
          }} 
        />
        <Stack.Screen 
          name="qr-code" 
          options={{ 
            presentation: 'modal',
            title: 'QR Code',
            headerStyle: { backgroundColor: '#101828' },
            headerTintColor: '#F97316',
          }} 
        />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
