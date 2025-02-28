'use client';

import { useCallback, useState } from 'react';

/**
 * Generic class for managing configurations in localStorage
 */
class StorageManager<T extends Record<string, unknown>> {
  private readonly key: string;
  private readonly defaultConfig: T;
  private readonly validator?: (config: unknown) => boolean;

  constructor(key: string, defaultConfig: T, validator?: (config: unknown) => boolean) {
    this.key = key;
    this.defaultConfig = defaultConfig;
    this.validator = validator;
  }

  save(config: Partial<T>): void {
    try {
      const currentConfig = this.get();
      const newConfig = { ...currentConfig, ...config };
      localStorage.setItem(this.key, JSON.stringify(newConfig));
    } catch (error) {
      console.error(`Error saving ${this.key} to localStorage:`, error);
    }
  }

  get(): T {
    try {
      const config = localStorage.getItem(this.key);

      if (config) {
        const parsed = JSON.parse(config) as unknown;
        if (this.isValidConfig(parsed)) {
          return { ...this.defaultConfig, ...(parsed as Partial<T>) };
        }
      }

      return this.defaultConfig;
    } catch (error) {
      console.error(`Error reading ${this.key} from localStorage:`, error);
      return this.defaultConfig;
    }
  }

  private isValidConfig(config: unknown): boolean {
    if (this.validator) {
      return this.validator(config);
    }

    // Default validation: ensure it's an object
    return typeof config === 'object' && config !== null;
  }

  clear(): void {
    try {
      localStorage.removeItem(this.key);
    } catch (error) {
      console.error(`Error clearing ${this.key} from localStorage:`, error);
    }
  }

  update<K extends keyof T>(key: K, value: T[K]): void {
    const currentConfig = this.get();
    this.save({ ...currentConfig, [key]: value });
  }
}

/**
 * Hook for managing configurations in localStorage
 * 
 * @param storageKey - The key to use for localStorage
 * @param defaultConfig - The default configuration to use if none exists
 * @param validator - Optional function to validate the configuration
 * @returns An object with the current configuration and methods to update it
 */
export function useStorageConfigs<T extends Record<string, unknown>>(
  storageKey: string,
  defaultConfig: T,
  validator?: (config: unknown) => boolean,
  persistent = true
) {
  // Initialize configs state directly from localStorage if available
  const [configs, setConfigs] = useState<T>(() => {
    if (typeof window === 'undefined' || !persistent) {
      return defaultConfig;
    }
    
    try {
      const storageManager = new StorageManager<T>(storageKey, defaultConfig, validator);
      return storageManager.get();
    } catch (error) {
      console.error(`Error initializing configs from localStorage:`, error);
      return defaultConfig;
    }
  });
  
  const [storageManager] = useState(() => new StorageManager<T>(storageKey, defaultConfig, validator));

  // Update a specific config value
  const updateConfig = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setConfigs(prev => ({ ...prev, [key]: value }));
    
    if (persistent && typeof window !== 'undefined') {
      storageManager.update(key, value);
    }
  }, [storageManager, persistent]);

  // Update multiple config values at once
  const updateConfigs = useCallback((newConfigs: Partial<T>) => {
    setConfigs(prev => ({ ...prev, ...newConfigs }));
    
    if (persistent && typeof window !== 'undefined') {
      storageManager.save(newConfigs);
    }
  }, [storageManager, persistent]);

  // Reset configs to default
  const resetConfigs = useCallback(() => {
    setConfigs(defaultConfig);
    
    if (persistent && typeof window !== 'undefined') {
      storageManager.clear();
    }
  }, [defaultConfig, storageManager, persistent]);

  return {
    configs,
    updateConfig,
    updateConfigs,
    resetConfigs,
  };
}

export default useStorageConfigs; 