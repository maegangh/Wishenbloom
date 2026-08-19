/**
 * Haptics Abstraction Layer for Wishenbloom
 *
 * Provides tactile feedback for merges, order completions, rewards, and generator taps.
 * Works seamlessly across native Capacitor (Android/iOS) and web browsers.
 */

import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isPlatformNative } from '../config/version';

export interface HapticsProvider {
  impact(style?: 'light' | 'medium' | 'heavy'): Promise<void>;
  notification(type?: 'success' | 'warning' | 'error'): Promise<void>;
  vibrate(durationMs?: number): Promise<void>;
  selectionStart(): Promise<void>;
  selectionChanged(): Promise<void>;
  selectionEnd(): Promise<void>;
}

export class CapacitorHapticsProvider implements HapticsProvider {
  private enabled = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async impact(style: 'light' | 'medium' | 'heavy' = 'light'): Promise<void> {
    if (!this.enabled) return;

    if (isPlatformNative()) {
      try {
        let capStyle = ImpactStyle.Light;
        if (style === 'medium') capStyle = ImpactStyle.Medium;
        if (style === 'heavy') capStyle = ImpactStyle.Heavy;
        await Haptics.impact({ style: capStyle });
        return;
      } catch {
        // Fallback
      }
    }

    // Web fallback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        const ms = style === 'heavy' ? 40 : style === 'medium' ? 25 : 12;
        navigator.vibrate(ms);
      } catch {
        // Ignore browser vibration failure
      }
    }
  }

  async notification(type: 'success' | 'warning' | 'error' = 'success'): Promise<void> {
    if (!this.enabled) return;

    if (isPlatformNative()) {
      try {
        let capType = NotificationType.Success;
        if (type === 'warning') capType = NotificationType.Warning;
        if (type === 'error') capType = NotificationType.Error;
        await Haptics.notification({ type: capType });
        return;
      } catch {
        // Fallback
      }
    }

    // Web fallback
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'success') navigator.vibrate([20, 50, 20]);
        else if (type === 'error') navigator.vibrate([40, 60, 40]);
        else navigator.vibrate(30);
      } catch {
        // Ignore
      }
    }
  }

  async vibrate(durationMs = 50): Promise<void> {
    if (!this.enabled) return;

    if (isPlatformNative()) {
      try {
        await Haptics.vibrate({ duration: durationMs });
        return;
      } catch {
        // Fallback
      }
    }

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(durationMs);
      } catch {
        // Ignore
      }
    }
  }

  async selectionStart(): Promise<void> {
    if (!this.enabled || !isPlatformNative()) return;
    try {
      await Haptics.selectionStart();
    } catch {
      // Ignore
    }
  }

  async selectionChanged(): Promise<void> {
    if (!this.enabled || !isPlatformNative()) return;
    try {
      await Haptics.selectionChanged();
    } catch {
      // Ignore
    }
  }

  async selectionEnd(): Promise<void> {
    if (!this.enabled || !isPlatformNative()) return;
    try {
      await Haptics.selectionEnd();
    } catch {
      // Ignore
    }
  }
}

export const haptics = new CapacitorHapticsProvider();
