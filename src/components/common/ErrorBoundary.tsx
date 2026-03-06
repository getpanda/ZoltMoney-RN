import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { Typography, Button } from './index';
import Theme from '../../theme/Theme';
import Logger from '../../utils/logger';

import { withTranslation, WithTranslation } from 'react-i18next';

interface Props extends WithTranslation {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Global Error Boundary to catch UI crashes and show a friendly fallback.
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Logger.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public render() {
    const { t } = this.props;
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="light-content" />
          <View style={styles.content}>
            <Typography style={styles.emoji}>
              {t('common.error_emoji')}
            </Typography>
            <Typography variant="h1" style={styles.title}>
              {t('error.boundary.title')}
            </Typography>
            <Typography variant="bodySecondary" style={styles.message}>
              {t('error.boundary.message')}
            </Typography>
            <Button
              title={t('error.boundary.button')}
              onPress={this.handleReset}
              style={styles.button}
            />
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Theme.SPACING.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Theme.SPACING.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.SPACING.md,
  },
  message: {
    textAlign: 'center',
    marginBottom: Theme.SPACING.xl,
  },
  button: {
    width: '100%',
  },
});

export default withTranslation()(ErrorBoundary);
