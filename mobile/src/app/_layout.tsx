import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { useSession } from '@/lib/auth/use-session';
import { ActivityIndicator, View } from 'react-native';

export const unstable_settings = {
  initialRouteName: 'index',
};

const queryClient = new QueryClient();

// Custom light theme with black/white palette
const LocoMotionTheme = {
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
  const { data: session, isPending } = useSession();

  // Show loading while checking auth state
  if (isPending) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ThemeProvider value={LocoMotionTheme}>
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
        {/* Auth screens - only shown when NOT logged in */}
        <Stack.Protected guard={!session?.user}>
          <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          <Stack.Screen name="verify-otp" options={{ headerShown: false }} />
        </Stack.Protected>

        {/* Protected screens - only shown when logged in */}
        <Stack.Protected guard={!!session?.user}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="role-select" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="creator-onboard" options={{ headerShown: false }} />
          <Stack.Screen name="browse-creators" options={{ headerShown: false }} />
          <Stack.Screen name="business-onboard" options={{ headerShown: false }} />
          <Stack.Screen name="business/index" options={{ title: 'LOCO•MOTION', headerBackVisible: false }} />
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
        </Stack.Protected>
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
