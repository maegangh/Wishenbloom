/**
 * Wishenbloom Centralized Version & App Identity Configuration
 */

export const APP_IDENTITY = {
  name: 'Wishenbloom',
  appName: 'Wishenbloom',
  publisher: 'Mythic Crown Studios LLC',
  appId: 'com.mythiccrownstudios.wishenbloom',
  androidApplicationId: 'com.mythiccrownstudios.wishenbloom',
  iosBundleIdentifier: 'com.mythiccrownstudios.wishenbloom',
  version: '0.1.0',
  androidVersionCode: 1,
  iosBuildNumber: '1',
  targetOrientation: 'portrait',
} as const;

export type AppEnvironment = 'development' | 'beta' | 'production';

export function getAppEnvironment(): AppEnvironment {
  // Check Vite environment variable if defined
  const meta = import.meta as unknown as { env?: Record<string, string> };
  const envVal = meta?.env?.VITE_APP_ENV || meta?.env?.MODE;
  if (envVal === 'production') return 'production';
  if (envVal === 'beta') return 'beta';
  return 'development';
}

export function isPlatformNative(): boolean {
  if (typeof window === 'undefined') return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return typeof cap?.isNativePlatform === 'function' ? cap.isNativePlatform() : false;
}

export function getPlatformType(): 'web' | 'android' | 'ios' {
  if (typeof window === 'undefined') return 'web';
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const platform = typeof cap?.getPlatform === 'function' ? cap.getPlatform() : 'web';
  if (platform === 'android') return 'android';
  if (platform === 'ios') return 'ios';
  return 'web';
}
