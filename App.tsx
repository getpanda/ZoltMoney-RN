import React, { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StatusBar, Platform } from 'react-native';
import {
  NavigationContainer,
  NavigationContainerRef,
  DefaultTheme,
} from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { withStallion } from 'react-native-stallion';
import Intercom from '@intercom/intercom-react-native';
import Config from 'react-native-config';

// Initialize i18n
import './src/i18n';
import * as Sentry from '@sentry/react-native';
import { PostHogProvider } from 'posthog-react-native';
import appsFlyer from 'react-native-appsflyer';
import { Settings } from 'react-native-fbsdk-next';

// Components & Services
import { StorageService } from './src/services/StorageService';
import Theme from './src/theme/Theme';
import AppNavigator from './src/navigation/AppNavigator';
import { ErrorBoundary } from './src/components/common';
import Logger from './src/utils/logger';

const AppTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Theme.COLORS.primary,
    background: Theme.COLORS.background,
    card: Theme.COLORS.surface,
    text: Theme.COLORS.text,
    border: Theme.COLORS.border,
    notification: Theme.COLORS.accent,
  },
};

/**
 * Checks storage to decide which screen to boot into.
 */
async function getInitialRoute(): Promise<string> {
  const token = await StorageService.getSecureItem(
    StorageService.KEYS.AUTH_TOKEN,
  );
  if (!token) return 'Landing';

  const sessionVerified = await StorageService.getItem(
    StorageService.KEYS.SESSION_BIOMETRIC_VERIFIED,
  );
  if (sessionVerified === '1') {
    return 'Home';
  }

  const step = await StorageService.getItem(
    StorageService.KEYS.ONBOARDING_STEP,
  );
  const flow = await StorageService.getItem(
    StorageService.KEYS.ONBOARDING_FLOW,
  );

  if (step === 'complete' || flow === 'login') {
    return 'BiometricLogin';
  }

  if (step === 'verify_email' || step === 'verifyEmail') {
    return 'EmailVerify';
  }

  return 'BiometricLogin';
}

function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  // ── Step 1: Initialization ──
  useEffect(() => {
    // Determine initial route
    getInitialRoute().then(route => {
      setInitialRoute(route);
    });

    // Initialize Sentry
    if (!__DEV__) {
      const sentryDsn = Platform.select({
        ios: Config.SENTRY_DSN_IOS,
        android: Config.SENTRY_DSN_ANDROID,
      });
      if (sentryDsn) {
        Sentry.init({
          dsn: sentryDsn,
        });
      }
    }

    // Initialize Facebook (Meta) SDK
    try {
      if (Config.FACEBOOK_APP_ID) {
        Settings.setAppID(Config.FACEBOOK_APP_ID);
      }
      if (Config.FACEBOOK_CLIENT_TOKEN) {
        Settings.setClientToken(Config.FACEBOOK_CLIENT_TOKEN);
      }
      Settings.initializeSDK();
      Logger.info('Facebook SDK initialized');
    } catch (e) {
      Logger.error('Facebook SDK initialization failed', e);
    }

    // Initialize AppsFlyer
    try {
      appsFlyer.initSdk(
        {
          devKey: Config.APPSFLYER_DEV_KEY || '',
          isDebug: __DEV__,
          appId: Config.APPSFLYER_APP_ID || '', // App ID for iOS
          onInstallConversionDataListener: true,
          onDeepLinkListener: true,
          timeToWaitForATTUserAuthorization: 10,
        },
        (result: any) => Logger.info('AppsFlyer initialized', result),
        (error: any) => Logger.error('AppsFlyer initialization failed', error),
      );
    } catch (e) {
      Logger.error('AppsFlyer setup failed', e);
    }

    // Initialize Intercom
    try {
      const appId = Config.INTERCOM_APP_ID;
      const iosApiKey = Config.INTERCOM_IOS_API_KEY;
      const androidApiKey = Config.INTERCOM_ANDROID_API_KEY;

      const apiKey = Platform.select({
        ios: iosApiKey,
        android: androidApiKey,
      });

      if (appId && apiKey && Intercom) {
        Intercom.initialize(appId, apiKey);
        Logger.info('Intercom initialized successfully');
      } else if (!Intercom) {
        Logger.error('Intercom native module is null');
      } else {
        Logger.warn('Intercom credentials missing in Config');
      }
    } catch (e) {
      Logger.error('Intercom initialization failed', e);
    }
  }, []);

  // ── Step 2: AppState listener — lock on background → foreground ──
  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      async (nextState: AppStateStatus) => {
        const prev = appState.current;
        appState.current = nextState;

        if (nextState === 'background') {
          Logger.debug('App moved to background, clearing session flag');
          await StorageService.removeItem(
            StorageService.KEYS.SESSION_BIOMETRIC_VERIFIED,
          );
        }

        if (
          (prev === 'background' || prev === 'inactive') &&
          nextState === 'active'
        ) {
          const token = await StorageService.getSecureItem(
            StorageService.KEYS.AUTH_TOKEN,
          );
          const sessionVerified = await StorageService.getItem(
            StorageService.KEYS.SESSION_BIOMETRIC_VERIFIED,
          );

          if (token && sessionVerified !== '1' && navigationRef.current) {
            Logger.info('Re-locking: sending user to biometric gate');
            navigationRef.current.navigate('BiometricLogin');
          }
        }
      },
    );

    return () => subscription.remove();
  }, []);

  if (!initialRoute) {
    return null;
  }

  return (
    <ErrorBoundary>
      <PostHogProvider
        apiKey={Config.POSTHOG_API_KEY || ''}
        options={{
          host: Config.POSTHOG_HOST || 'https://app.posthog.com',
        }}
      >
        <SafeAreaProvider>
          <StatusBar
            barStyle="light-content"
            backgroundColor={Theme.COLORS.background}
          />
          <NavigationContainer ref={navigationRef} theme={AppTheme}>
            <AppNavigator initialRoute={initialRoute} />
          </NavigationContainer>
        </SafeAreaProvider>
      </PostHogProvider>
    </ErrorBoundary>
  );
}

export default __DEV__ ? App : withStallion(App);
