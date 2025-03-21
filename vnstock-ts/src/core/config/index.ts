/**
 * Configuration module exports
 */

export * from './const';

// Default config instance
import { ConfigManager, DEFAULT_CONFIG } from './const';
import { VnstockConfig } from '../../types/config';

/**
 * Global config instance
 */
export const config = new ConfigManager();

/**
 * Configure the library with custom settings
 * @param customConfig - Partial configuration object to override defaults
 */
export function configure(customConfig: Partial<VnstockConfig>) {
  // Apply each setting to the global config
  Object.entries(customConfig).forEach(([key, value]) => {
    config.set(key as keyof VnstockConfig, value as any);
  });

  return config;
}
