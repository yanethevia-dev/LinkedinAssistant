// Storage Service - Wrapper for chrome.storage.local

import type { UserSettings, StorageData } from '../shared/types';
import { DEFAULT_USER_SETTINGS } from '../shared/defaults';
import { DEBUG } from '../shared/constants';

class StorageService {
  /**
   * Initialize storage with default settings if needed
   */
  async init(): Promise<void> {
    if (DEBUG) console.log('[StorageService] Initializing...');

    try {
      const settings = await this.getSettings();

      if (!settings) {
        // First time initialization
        if (DEBUG) console.log('[StorageService] First time init - creating default settings');
        await this.updateSettings(DEFAULT_USER_SETTINGS);
      } else {
        if (DEBUG) console.log('[StorageService] Settings loaded:', settings);
      }
    } catch (error) {
      console.error('[StorageService] Init error:', error);
      throw error;
    }
  }

  /**
   * Get user settings from storage
   */
  async getSettings(): Promise<UserSettings | null> {
    try {
      const result = await chrome.storage.local.get('settings');

      if (result.settings) {
        // Merge with defaults in case new fields were added
        return this.mergeWithDefaults(result.settings);
      }

      return null;
    } catch (error) {
      console.error('[StorageService] Error getting settings:', error);
      throw error;
    }
  }

  /**
   * Update user settings (partial or full)
   */
  async updateSettings(updates: Partial<UserSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();

      const newSettings: UserSettings = {
        ...(currentSettings || DEFAULT_USER_SETTINGS),
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await chrome.storage.local.set({ settings: newSettings });

      if (DEBUG) {
        console.log('[StorageService] Settings updated:', newSettings);
      }
    } catch (error) {
      console.error('[StorageService] Error updating settings:', error);
      throw error;
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetSettings(): Promise<void> {
    if (DEBUG) console.log('[StorageService] Resetting to defaults');

    await this.updateSettings({
      ...DEFAULT_USER_SETTINGS,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Get all data from storage (for debugging)
   */
  async getAllData(): Promise<StorageData> {
    try {
      const result = await chrome.storage.local.get(null);
      return result as StorageData;
    } catch (error) {
      console.error('[StorageService] Error getting all data:', error);
      throw error;
    }
  }

  /**
   * Get storage usage info
   */
  async getStorageInfo(): Promise<{ bytesInUse: number; quota: number }> {
    try {
      const bytesInUse = await chrome.storage.local.getBytesInUse(null);
      const quota = chrome.storage.local.QUOTA_BYTES || 10485760; // 10MB default

      return { bytesInUse, quota };
    } catch (error) {
      console.error('[StorageService] Error getting storage info:', error);
      throw error;
    }
  }

  /**
   * Clear all storage (use with caution!)
   */
  async clearAll(): Promise<void> {
    if (DEBUG) console.warn('[StorageService] Clearing all storage!');

    try {
      await chrome.storage.local.clear();
      await this.init(); // Reinitialize with defaults
    } catch (error) {
      console.error('[StorageService] Error clearing storage:', error);
      throw error;
    }
  }

  /**
   * Merge current settings with defaults (for backwards compatibility)
   */
  private mergeWithDefaults(settings: Partial<UserSettings>): UserSettings {
    return {
      ...DEFAULT_USER_SETTINGS,
      ...settings,
      // Ensure nested objects are merged properly
      apiKeys: {
        ...DEFAULT_USER_SETTINGS.apiKeys,
        ...(settings.apiKeys || {})
      },
      providerByFeature: {
        ...DEFAULT_USER_SETTINGS.providerByFeature,
        ...(settings.providerByFeature || {})
      },
      models: {
        ...DEFAULT_USER_SETTINGS.models,
        ...(settings.models || {})
      }
    };
  }
}

// Export singleton instance
export const storageService = new StorageService();
