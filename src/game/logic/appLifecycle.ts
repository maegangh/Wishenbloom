/**
 * App Lifecycle & Native Event Handling for Wishenbloom
 *
 * Manages background saving, foreground resumption, offline updates, and Android back button handling.
 */

import { App as CapApp } from '@capacitor/app';
import { isPlatformNative } from '../config/version';

export interface AppLifecycleHandlers {
  onBackground?: () => void;
  onResume?: () => void;
  onBackButton?: () => boolean; // return true if handled (e.g. modal closed), false if default
}

export function registerAppLifecycle(handlers: AppLifecycleHandlers): () => void {
  let isSubscribed = true;

  // 1. Capacitor Native Lifecycle
  if (isPlatformNative()) {
    try {
      CapApp.addListener('appStateChange', (state) => {
        if (!isSubscribed) return;
        if (!state.isActive) {
          handlers.onBackground?.();
        } else {
          handlers.onResume?.();
        }
      });

      CapApp.addListener('backButton', () => {
        if (!isSubscribed) return;
        const handled = handlers.onBackButton ? handlers.onBackButton() : false;
        if (!handled) {
          // If no modal or subview is open at root, minimize/exit
          CapApp.exitApp();
        }
      });
    } catch {
      // Fall back to web events
    }
  }

  // 2. Web / Browser Lifecycle Fallback
  const handleVisibilityChange = () => {
    if (!isSubscribed) return;
    if (document.visibilityState === 'hidden') {
      handlers.onBackground?.();
    } else if (document.visibilityState === 'visible') {
      handlers.onResume?.();
    }
  };

  const handlePageHide = () => {
    if (!isSubscribed) return;
    handlers.onBackground?.();
  };

  if (typeof window !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handlePageHide);
  }

  return () => {
    isSubscribed = false;
    if (isPlatformNative()) {
      try {
        CapApp.removeAllListeners();
      } catch {
        // Ignore
      }
    }
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handlePageHide);
    }
  };
}
