# Core Configuration Module Implementation

**Original Python Implementation**: [__init__.py](/vnstock/core/config/__init__.py)


## Overview

The Core Configuration module manages the configuration settings, constants, and environment-specific parameters used throughout the vnstock library. It provides a centralized mechanism for defining, accessing, and modifying configuration values that control the behavior of various components and features.

## Purpose

The Core Configuration module serves several key purposes:

1. **Centralized Settings**: Provides a single source of truth for configuration values
2. **Environment Management**: Handles different settings for development, testing, and production
3. **Feature Toggling**: Enables enabling/disabling features through configuration
4. **API Endpoint Management**: Maintains URLs and endpoints for various data sources
5. **Default Parameters**: Defines sensible defaults for optional parameters

## Structure

The Core Configuration module contains the following components:

```
core/config/
├── constants.md   - Global constants and default values
├── endpoints.md   - API endpoint configurations
└── settings.md    - User-configurable settings
```

## TypeScript Implementation

In the TypeScript implementation, the Core Configuration module leverages TypeScript's type system to provide type safety for configuration values.

### Configuration Management

The configuration system can be implemented using TypeScript interfaces and a central configuration manager:

```typescript
/**
 * Global configuration interface
 */
export interface VNStockConfig {
  // API configuration
  api: {
    baseUrls: Record<DataSource, string>;
    timeout: number;
    retries: number;
    userAgent: string;
  };

  // Feature flags
  features: {
    enableCaching: boolean;
    enableAutoRetry: boolean;
    useProxyForInternational: boolean;
  };

  // Logging configuration
  logging: {
    level: LogLevel;
    format: LogFormat;
    destination: LogDestination;
  };

  // Data handling settings
  data: {
    defaultDateFormat: string;
    timezone: string;
    locale: string;
  };
}

/**
 * Configuration manager class
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: VNStockConfig;

  private constructor() {
    // Initialize with default configuration
    this.config = DEFAULT_CONFIG;

    // Load environment-specific overrides
    this.loadEnvironmentConfig();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get current configuration
   */
  public getConfig(): VNStockConfig {
    return this.config;
  }

  /**
   * Update configuration
   * @param updates Partial configuration updates
   */
  public updateConfig(updates: Partial<VNStockConfig>): void {
    this.config = deepMerge(this.config, updates);
  }

  /**
   * Load configuration from environment variables
   */
  private loadEnvironmentConfig(): void {
    // Implementation details for loading from environment
  }
}
```

### Constants Management

Constants should be defined using TypeScript enums or const objects:

```typescript
/**
 * Data source types
 */
export enum DataSource {
  VCI = 'VCI',
  TCBS = 'TCBS',
  FMARKET = 'FMARKET',
  MSN = 'MSN',
  MISC = 'MISC',
}

/**
 * Exchange identifiers
 */
export enum Exchange {
  HOSE = 'HOSE',
  HNX = 'HNX',
  UPCOM = 'UPCOM',
}

/**
 * Default API endpoints
 */
export const DEFAULT_ENDPOINTS = {
  [DataSource.VCI]: {
    baseUrl: 'https://api.vci.com.vn',
    quote: '/stock/quote',
    company: '/stock/company',
    // Additional endpoints...
  },
  [DataSource.TCBS]: {
    baseUrl: 'https://api.tcbs.com.vn',
    // Endpoints...
  },
  // Additional data sources...
};
```

## Usage Examples

The Core Configuration module can be used as follows:

```typescript
import { ConfigManager, DataSource } from 'vnstock/core/config';

// Get the configuration manager instance
const configManager = ConfigManager.getInstance();

// Access configuration values
const config = configManager.getConfig();
console.log(`API timeout: ${config.api.timeout}ms`);

// Update configuration
configManager.updateConfig({
  api: {
    timeout: 10000,
    retries: 3,
  },
  features: {
    enableCaching: true,
  },
});

// Get API endpoint for a specific data source
function getApiEndpoint(dataSource: DataSource, endpointName: string): string {
  const config = ConfigManager.getInstance().getConfig();
  const baseUrl = config.api.baseUrls[dataSource];
  const endpoints = DEFAULT_ENDPOINTS[dataSource];

  return `${baseUrl}${endpoints[endpointName]}`;
}

// Example usage
const quoteEndpoint = getApiEndpoint(DataSource.VCI, 'quote');
```

## Environment-Specific Configuration

The configuration system supports different environments through environment variables:

```typescript
/**
 * Load environment-specific configuration
 */
private loadEnvironmentConfig(): void {
  // Example of loading from environment variables
  if (process.env.VNSTOCK_API_TIMEOUT) {
    this.config.api.timeout = parseInt(process.env.VNSTOCK_API_TIMEOUT, 10);
  }

  if (process.env.VNSTOCK_ENABLE_CACHING) {
    this.config.features.enableCaching =
      process.env.VNSTOCK_ENABLE_CACHING === 'true';
  }

  // Load additional environment variables
}
```

## Overriding Configuration

Users can override configuration settings when initializing the library:

```typescript
import { initialize } from 'vnstock';

// Initialize with custom configuration
initialize({
  api: {
    timeout: 15000,
    retries: 5,
  },
  logging: {
    level: 'debug',
    destination: 'file',
  },
});
```

## Dependencies

The Core Configuration module has minimal dependencies:

1. Environment utilities for accessing environment variables
2. Deep merge utility for combining configuration objects
3. Validation utilities for verifying configuration values

## Implementation Notes

When implementing or extending the Core Configuration module:

1. Use TypeScript interfaces to define configuration structures
2. Implement proper validation for configuration values
3. Provide sensible defaults for all configuration options
4. Document all configuration properties and their effects
5. Use a singleton pattern for the configuration manager

## References

For detailed implementation of specific aspects of configuration, refer to:

- [Constants and Default Values](./constants.md)
- [API Endpoint Configuration](./endpoints.md)
- [User-Configurable Settings](./settings.md)
