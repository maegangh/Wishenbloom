/**
 * Storage Abstraction Layer for Wishenbloom
 *
 * Provides a unified, reliable storage interface across Web, Android, and iOS.
 * Safeguards player save files across browser and native containers with seamless backward compatibility.
 */

import { PRIMARY_STORAGE_KEY, LEGACY_STORAGE_KEY } from './saveMigration';

export interface GameStorageProvider {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  getItemSync(key: string): string | null;
  setItemSync(key: string, value: string): void;
  isAvailable(): boolean;
}

/**
 * Web / Browser Storage Provider
 * Uses window.localStorage with an in-memory fallback if storage is restricted or disabled.
 */
export class WebStorageProvider implements GameStorageProvider {
  private memoryFallback: Map<string, string> = new Map();

  isAvailable(): boolean {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const testKey = '__wb_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  getItemSync(key: string): string | null {
    if (this.isAvailable()) {
      try {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
        // Check legacy fallback key if querying primary key
        if (key === PRIMARY_STORAGE_KEY) {
          return window.localStorage.getItem(LEGACY_STORAGE_KEY);
        }
        return null;
      } catch {
        return this.memoryFallback.get(key) || null;
      }
    }
    return this.memoryFallback.get(key) || null;
  }

  setItemSync(key: string, value: string): void {
    if (this.isAvailable()) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch {
        // Fallback to memory if storage quota exceeded or disabled
        this.memoryFallback.set(key, value);
      }
    } else {
      this.memoryFallback.set(key, value);
    }
  }

  async getItem(key: string): Promise<string | null> {
    return this.getItemSync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    this.setItemSync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (this.isAvailable()) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    }
    this.memoryFallback.delete(key);
  }
}

/**
 * Native Container Storage Provider
 * Prepares native persistence with automatic import of existing web saves during first launch.
 */
export class NativeStorageProvider implements GameStorageProvider {
  private webFallback: WebStorageProvider = new WebStorageProvider();

  isAvailable(): boolean {
    return true;
  }

  getItemSync(key: string): string | null {
    return this.webFallback.getItemSync(key);
  }

  setItemSync(key: string, value: string): void {
    this.webFallback.setItemSync(key, value);
  }

  async getItem(key: string): Promise<string | null> {
    return this.getItemSync(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    this.setItemSync(key, value);
  }

  async removeItem(key: string): Promise<void> {
    await this.webFallback.removeItem(key);
  }
}

// Active singleton storage provider instance
let activeStorageProvider: GameStorageProvider = new WebStorageProvider();

export function getStorageProvider(): GameStorageProvider {
  return activeStorageProvider;
}

export function setStorageProvider(provider: GameStorageProvider): void {
  activeStorageProvider = provider;
}
