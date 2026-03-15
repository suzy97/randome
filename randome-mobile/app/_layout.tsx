import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { RandomeProvider } from '@/src/context/randome-context';
import { colors } from '@/src/ui';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <RandomeProvider>
      <ThemeProvider
        value={{
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            background: colors.background,
            card: colors.surface,
            primary: colors.navy,
            text: colors.ink,
            border: colors.line,
            notification: colors.coral,
          },
        }}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="sentence/[sentenceId]"
            options={{
              title: 'Sentence',
              headerBackTitle: 'Back',
              headerTintColor: colors.navy,
              headerStyle: { backgroundColor: colors.background },
            }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </RandomeProvider>
  );
}
