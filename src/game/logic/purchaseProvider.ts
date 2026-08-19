import { StoreProduct } from '../types';
import { ALL_STORE_PRODUCTS, getStoreProduct, STARTER_WELCOME_PACK } from '../data/storeProducts';
import { getAppEnvironment, getPlatformType } from '../config/version';

export interface PurchaseResult {
  success: boolean;
  transactionId?: string;
  productId?: string;
  sku?: string;
  error?: string;
  isMockTransaction: boolean;
}

export interface PurchaseEntitlement {
  sku: string;
  productId: string;
  isOneTime: boolean;
  grantedAt: number;
}

export interface PurchaseProvider {
  initialize(): Promise<boolean>;
  getProducts(): Promise<StoreProduct[]>;
  purchase(productIdOrSku: string): Promise<PurchaseResult>;
  restorePurchases(ownedOneTimeSkus: string[]): Promise<string[]>;
  isMock(): boolean;
}

/**
 * MockPurchaseProvider
 *
 * Implements a safe, fully functional mock purchase pipeline for development and AI Studio testing.
 *
 * CRITICAL SAFETY NOTICES:
 * 1. This provider operates ENTIRELY in local development/mock mode.
 * 2. It does NOT connect to real Google Play Billing or Apple StoreKit.
 * 3. No real credit card or bank charges will ever occur.
 * 4. Production builds will substitute this mock provider with native Google Play / Apple StoreKit bridges
 *    with server-authoritative token validation.
 */
export class MockPurchaseProvider implements PurchaseProvider {
  private isInitialized = false;

  async initialize(): Promise<boolean> {
    this.isInitialized = true;
    return true;
  }

  async getProducts(): Promise<StoreProduct[]> {
    return ALL_STORE_PRODUCTS;
  }

  /**
   * Simulates processing a real-money product purchase.
   */
  async purchase(productIdOrSku: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const product = getStoreProduct(productIdOrSku);
    if (!product) {
      return {
        success: false,
        error: `Unknown store product '${productIdOrSku}'.`,
        isMockTransaction: true,
      };
    }

    // Generate unique mock transaction ID
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const txId = `tx_mock_${Date.now()}_${randomSuffix}`;

    return {
      success: true,
      transactionId: txId,
      productId: product.id,
      sku: product.sku,
      isMockTransaction: true,
    };
  }

  isMock(): boolean {
    return true;
  }

  restorePurchasesSync(ownedOneTimeSkus: string[]): string[] {
    return ownedOneTimeSkus.filter((sku) => sku === STARTER_WELCOME_PACK.sku);
  }

  /**
   * Simulates purchase restoration for one-time entitlements (e.g. Welcome Pack).
   * Note: Consumables (Gem packs) are NOT restorable per standard mobile store guidelines.
   */
  async restorePurchases(ownedOneTimeSkus: string[]): Promise<string[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // In mock mode, returns valid known one-time SKUs that the account holds
    return this.restorePurchasesSync(ownedOneTimeSkus);
  }
}

/**
 * DisabledPurchaseProvider
 *
 * Secure provider used when live native store billing is not yet configured or disabled in production.
 * NEVER grants free premium currency or fake entitlements.
 */
export class DisabledPurchaseProvider implements PurchaseProvider {
  async initialize(): Promise<boolean> {
    return true;
  }

  async getProducts(): Promise<StoreProduct[]> {
    return ALL_STORE_PRODUCTS;
  }

  async purchase(productIdOrSku: string): Promise<PurchaseResult> {
    return {
      success: false,
      sku: productIdOrSku,
      error: 'STORE_UNAVAILABLE: Store billing is unavailable in this build.',
      isMockTransaction: false,
    };
  }

  async restorePurchases(): Promise<string[]> {
    return [];
  }

  isMock(): boolean {
    return false;
  }
}

/**
 * GooglePlayPurchaseProvider (Stub / Architecture Preparation)
 *
 * Designed to bind to Google Play Billing Client in native Android release builds.
 */
export class GooglePlayPurchaseProvider implements PurchaseProvider {
  async initialize(): Promise<boolean> {
    return false;
  }

  async getProducts(): Promise<StoreProduct[]> {
    return ALL_STORE_PRODUCTS;
  }

  async purchase(productIdOrSku: string): Promise<PurchaseResult> {
    return {
      success: false,
      sku: productIdOrSku,
      error: 'NOT_CONFIGURED: Google Play Billing is not configured in this build.',
      isMockTransaction: false,
    };
  }

  async restorePurchases(): Promise<string[]> {
    return [];
  }

  isMock(): boolean {
    return false;
  }
}

/**
 * AppleStorePurchaseProvider (Stub / Architecture Preparation)
 *
 * Designed to bind to Apple StoreKit 2 in native iOS release builds.
 */
export class AppleStorePurchaseProvider implements PurchaseProvider {
  async initialize(): Promise<boolean> {
    return false;
  }

  async getProducts(): Promise<StoreProduct[]> {
    return ALL_STORE_PRODUCTS;
  }

  async purchase(productIdOrSku: string): Promise<PurchaseResult> {
    return {
      success: false,
      sku: productIdOrSku,
      error: 'NOT_CONFIGURED: Apple StoreKit is not configured in this build.',
      isMockTransaction: false,
    };
  }

  async restorePurchases(): Promise<string[]> {
    return [];
  }

  isMock(): boolean {
    return false;
  }
}

// Singleton instances
export const mockPurchaseProvider = new MockPurchaseProvider();
export const disabledPurchaseProvider = new DisabledPurchaseProvider();
export const googlePlayPurchaseProvider = new GooglePlayPurchaseProvider();
export const appleStorePurchaseProvider = new AppleStorePurchaseProvider();

let customPurchaseProvider: PurchaseProvider | null = null;

/**
 * Resolves the appropriate purchase provider based on environment and platform.
 * Ensures beta and production builds NEVER silently fall back to mock purchases.
 */
export function getActivePurchaseProvider(): PurchaseProvider {
  if (customPurchaseProvider) {
    return customPurchaseProvider;
  }

  const env = getAppEnvironment();
  const platform = getPlatformType();

  // In Beta and Production builds: Mock purchases are STRICTLY FORBIDDEN
  if (env === 'production' || env === 'beta') {
    if (platform === 'android') return googlePlayPurchaseProvider;
    if (platform === 'ios') return appleStorePurchaseProvider;
    return disabledPurchaseProvider;
  }

  // Explicit Development mode (Web or Dev Native):
  return mockPurchaseProvider;
}

export function setActivePurchaseProvider(provider: PurchaseProvider | null): void {
  customPurchaseProvider = provider;
}
