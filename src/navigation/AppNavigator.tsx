import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import Theme from '../theme/Theme';

// Screen Imports
import LandingScreen from '../screens/LandingScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import DetailsScreen from '../screens/DetailsScreen';
import BiometricLoginScreen from '../screens/BiometricLoginScreen';
import SupportChatScreen from '../screens/SupportChatScreen';
import OtpScreen from '../screens/OtpScreen';
import EmailVerifyScreen from '../screens/EmailVerifyScreen';
import EmailOtpScreen from '../screens/EmailOtpScreen';
import BiometricSetupScreen from '../screens/BiometricSetupScreen';
import ReferralScreen from '../screens/ReferralScreen';

const Stack = createNativeStackNavigator();

interface AppNavigatorProps {
  initialRoute: string;
}

export const AppNavigator = ({ initialRoute }: AppNavigatorProps) => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerStyle: { backgroundColor: Theme.COLORS.surface },
        headerTintColor: Theme.COLORS.primary,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* ── Auth / Onboarding ── */}
      <Stack.Screen
        name="Landing"
        component={LandingScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OtpVerification"
        component={OtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Referral"
        component={ReferralScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmailVerify"
        component={EmailVerifyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmailOtpVerify"
        component={EmailOtpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BiometricSetup"
        component={BiometricSetupScreen}
        options={{ headerShown: false }}
      />

      {/* ── Biometric Re-auth Gate ── */}
      <Stack.Screen
        name="BiometricLogin"
        component={BiometricLoginScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />

      {/* ── App ── */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: t('common.explore') }}
      />
      <Stack.Screen
        name="SupportChat"
        component={SupportChatScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
