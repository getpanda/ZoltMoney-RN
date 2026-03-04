import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { withStallion } from 'react-native-stallion';

import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import DetailsScreen from './src/screens/DetailsScreen';
import BiometricLoginScreen from './src/screens/BiometricLoginScreen';
import SupportChatScreen from './src/screens/SupportChatScreen';
import OtpScreen from './src/screens/OtpScreen';
import EmailVerifyScreen from './src/screens/EmailVerifyScreen';
import EmailOtpScreen from './src/screens/EmailOtpScreen';
import BiometricSetupScreen from './src/screens/BiometricSetupScreen';
import { StorageService } from './src/services/StorageService';

const Stack = createNativeStackNavigator();

/**
 * Checks storage to decide which screen to boot into.
 * - Has auth token  → BiometricLogin (biometric prompt → Home on success)
 * - No token        → Landing
 */
async function getInitialRoute(): Promise<string> {
  const token = await StorageService.getItem(StorageService.KEYS.AUTH_TOKEN);
  return token ? 'BiometricLogin' : 'Landing';
}

function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);
  // Track whether the user is fully authenticated in this session
  const isAuthenticated = useRef(false);

  // ── Step 1: Determine initial route ──
  useEffect(() => {
    getInitialRoute().then(route => {
      setInitialRoute(route);
      if (route === 'BiometricLogin') {
        isAuthenticated.current = false; // will be set true after biometric success
      }
    });
  }, []);

  // ── Step 2: AppState listener — lock on background → foreground ──
  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextState: AppStateStatus) => {
      const prev = appState.current;
      appState.current = nextState;

      // When app comes back to foreground from background/inactive
      if ((prev === 'background' || prev === 'inactive') && nextState === 'active') {
        const token = await StorageService.getItem(StorageService.KEYS.AUTH_TOKEN);
        if (token && navigationRef.current) {
          // Re-lock: send user to biometric gate
          isAuthenticated.current = false;
          navigationRef.current.navigate('BiometricLogin');
        }
      }
    });

    return () => subscription.remove();
  }, []);

  if (!initialRoute) {
    // Waiting for storage check — render nothing (splash is still visible)
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: { backgroundColor: '#021511' },
            headerTintColor: '#D4BA7F',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {/* ── Auth / Onboarding ── */}
          <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="OtpVerification" component={OtpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmailVerify" component={EmailVerifyScreen} options={{ headerShown: false }} />
          <Stack.Screen name="EmailOtpVerify" component={EmailOtpScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BiometricSetup" component={BiometricSetupScreen} options={{ headerShown: false }} />

          {/* ── Biometric Re-auth Gate ── */}
          <Stack.Screen name="BiometricLogin" component={BiometricLoginScreen} options={{ headerShown: false, gestureEnabled: false }} />

          {/* ── App ── */}
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Explore' }} />
          <Stack.Screen name="SupportChat" component={SupportChatScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default __DEV__ ? App : withStallion(App);
