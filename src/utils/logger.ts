/**
 * logger.ts
 * Centralized logging utility for consistent error reporting and debugging.
 */

export const Logger = {
    info(message: string, ...args: any[]) {
        if (__DEV__) {
            console.info(`[INFO] ${message}`, ...args);
        }
    },

    warn(message: string, ...args: any[]) {
        console.warn(`[WARN] ${message}`, ...args);
    },

    error(message: string, error?: any, ...args: any[]) {
        console.error(`[ERROR] ${message}`, error, ...args);
        // In production, this is where you would integrate with Sentry or Bugsnag
    },

    debug(message: string, ...args: any[]) {
        if (__DEV__) {
            console.debug(`[DEBUG] ${message}`, ...args);
        }
    }
};

export default Logger;
