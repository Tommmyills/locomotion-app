import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

// Custom light theme with black/white palette
const LocalPromoteTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#000000',
    background: '#ffffff',
    card: '#ffffff',
    text: '#000000',
    border: '#e5e5e5',
    notification: '#ef4444',
  },
};

function RootLayoutNav() {
  return (
    <ThemeProvider value={LocalPromoteTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
          headerTintColor: '#000000',
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="role-select" options={{ headerShown: false }} />
        <Stack.Screen name="business/index" options={{ title: 'LocalPromote', headerBackVisible: false }} />
        <Stack.Screen name="business/creator/[id]" options={{ title: 'Creator Profile' }} />
        <Stack.Screen name="business/booking/[slotId]" options={{ title: 'Book Slot' }} />
        <Stack.Screen name="business/confirmation" options={{ title: 'Booking Confirmed', headerBackVisible: false }} />
        <Stack.Screen name="business/my-bookings" options={{ title: 'My Bookings' }} />
        <Stack.Screen name="creator/index" options={{ title: 'Creator Dashboard', headerBackVisible: false }} />
        <Stack.Screen name="creator/slots" options={{ title: 'Manage Slots' }} />
        <Stack.Screen name="creator/bookings" options={{ title: 'My Bookings' }} />
        <Stack.Screen name="creator/upload-proof/[id]" options={{ title: 'Upload Proof' }} />
        <Stack.Screen name="admin/index" options={{ title: 'Admin Dashboard', headerBackVisible: false }} />
        <Stack.Screen name="admin/creators" options={{ title: 'Manage Creators' }} />
        <Stack.Screen name="admin/bookings" options={{ title: 'All Bookings' }} />
      </Stack>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <StatusBar style="dark" />
          <RootLayoutNav />
        </KeyboardProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
