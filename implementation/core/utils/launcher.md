# Launcher Utilities

**Original Python Implementation**: [vnstock/core/utils/launcher.py](/vnstock/core/utils/launcher.py)

## Overview

The Launcher Utilities module provides functionality for initializing and bootstrapping the vnstock library. It handles the initial setup, configuration loading, and environment detection needed before the library can be used effectively.

## Purpose

The Launcher Utilities module serves several key purposes:

1. **Library Initialization**: Provides functions to initialize the library with custom configuration
2. **Auto-detection**: Automatically detects runtime environment and adapts accordingly
3. **Configuration Loading**: Loads and applies default and user-provided configuration
4. **Dependency Verification**: Ensures required dependencies are available
5. **Feature Registration**: Registers available features and components

## Key Components

### Library Initialization

```typescript
/**
 * Initialize the vnstock library with optional configuration
 * @param config Optional configuration object
 * @returns Initialized library instance
 */
export function initialize(config?: Partial<VNStockConfig>): VNStock {
  // Create instance and apply configuration
  const instance = new VNStock();

  if (config) {
    instance.config.update(config);
  }

  // Detect environment and load appropriate modules
  instance.detectEnvironment();

  // Return the configured instance
  return instance;
}
```

### Automatic Bootstrap

```typescript
/**
 * Auto-bootstrap the library based on detected environment
 * @returns Initialized library instance
 */
export function autoBootstrap(): VNStock {
  // Auto-detect configuration from the environment
  const envConfig = detectConfigFromEnv();

  // Initialize with detected configuration
  return initialize(envConfig);
}
```

## Usage Examples

### Basic Initialization

```typescript
import { initialize } from 'vnstock/core/utils/launcher';

// Initialize with default configuration
const vnstock = initialize();

// Use the library
const stockQuote = await vnstock.getQuote('VCB');
```

### Custom Configuration

```typescript
import { initialize } from 'vnstock/core/utils/launcher';

// Initialize with custom configuration
const vnstock = initialize({
  api: {
    timeout: 10000,
    retries: 3,
  },
  logging: {
    level: 'debug',
  },
});

// The library will use the provided configuration
```

## Implementation Notes

When using the Launcher Utilities:

1. Call `initialize()` early in your application to set up the library
2. Provide any custom configuration during initialization
3. Store the returned instance for later use if needed
4. The launcher handles environment detection automatically

# Launcher Utilities Implementation

## Overview

The Launcher Utilities module provides functionality for initializing and bootstrapping the vnstock library. It handles library setup, configuration loading, environment detection, and feature registration. This module ensures that the library is properly configured before any operations are performed, making it essential for the correct functioning of the library.

## Purpose

The Launcher Utilities module serves several key purposes:

1. **Library Initialization**: Initializes the vnstock library with proper configuration
2. **Auto-detection**: Automatically detects the runtime environment and adapts accordingly
3. **Configuration Loading**: Loads appropriate configuration based on the environment
4. **Dependency Verification**: Verifies that required dependencies are available
5. **Feature Registration**: Registers library features and extensions

## TypeScript Implementation

The Launcher Utilities module provides a set of functions for initializing the library and ensuring it's ready for use. Here's how the key components can be implemented in TypeScript:

### Library Initialization Function

```typescript
/**
 * Initializes the vnstock library with the provided configuration
 * @param config Optional configuration object to override defaults
 * @returns A promise that resolves when initialization is complete
 */
export async function initialize(config?: LibraryConfig): Promise<void> {
  // Load environment variables if in Node.js environment
  if (isNodeEnvironment()) {
    await loadEnvironmentVariables();
  }

  // Initialize logger
  initializeLogger(config?.logLevel || getDefaultLogLevel());

  // Load and merge configurations
  const mergedConfig = {
    ...getDefaultConfig(),
    ...config,
  };

  // Verify required dependencies
  verifyDependencies();

  // Register extensions
  registerExtensions();

  // Initialize data sources
  await initializeDataSources(mergedConfig.dataSources);

  // Log initialization success
  logger.info('vnstock library initialized successfully');
}

/**
 * Automatically bootstraps the library with default configuration
 * This is used when the library needs to initialize itself
 * @returns A promise that resolves to the library instance
 */
export async function autoBootstrap(): Promise<VNStockLibrary> {
  const config = getDefaultConfig();
  await initialize(config);
  return createLibraryInstance();
}

/**
 * Checks if the library is running in a Node.js environment
 * @returns true if in Node.js, false otherwise
 */
function isNodeEnvironment(): boolean {
  return (
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null
  );
}

/**
 * Creates and returns the library instance
 * @returns The configured library instance
 */
function createLibraryInstance(): VNStockLibrary {
  return {
    explorers: createExplorers(),
    connectors: createConnectors(),
    utils: exportUtilities(),
  };
}
```

### Configuration Interfaces

```typescript
/**
 * Library configuration interface
 */
interface LibraryConfig {
  /** Log level for the library */
  logLevel?: LogLevel;
  /** Data source configuration */
  dataSources?: DataSourcesConfig;
  /** API configuration */
  api?: APIConfig;
  /** Feature flags */
  features?: FeatureFlags;
}

/**
 * Data sources configuration
 */
interface DataSourcesConfig {
  /** VCI data source configuration */
  vci?: {
    enabled: boolean;
    endpoint?: string;
  };
  /** TCBS data source configuration */
  tcbs?: {
    enabled: boolean;
    endpoint?: string;
  };
  /** Other data sources... */
}

/**
 * Feature flags for enabling/disabling library features
 */
interface FeatureFlags {
  /** Enable caching */
  enableCaching?: boolean;
  /** Enable automatic retries */
  enableRetries?: boolean;
  /** Enable real-time updates */
  enableRealtime?: boolean;
}
```

## Usage Examples

### Basic Initialization

```typescript
import { initialize } from 'vnstock/core/utils/launcher';

// Initialize with default configuration
await initialize();

// Now the library is ready to use
```

### Custom Configuration

```typescript
import { initialize } from 'vnstock/core/utils/launcher';
import { LogLevel } from 'vnstock/core/utils/logger';

// Initialize with custom configuration
await initialize({
  logLevel: LogLevel.DEBUG,
  dataSources: {
    vci: {
      enabled: true,
      endpoint: 'https://custom-vci-endpoint.com/api',
    },
    tcbs: {
      enabled: false,
    },
  },
  features: {
    enableCaching: true,
    enableRetries: true,
  },
});
```

### Auto-Bootstrap

```typescript
import { autoBootstrap } from 'vnstock/core/utils/launcher';

// Auto-bootstrap the library and get the instance
const vnstock = await autoBootstrap();

// Use the library
const quotes = await vnstock.explorers.vci.quote.getQuotes(['VNM', 'FPT']);
```

## Implementation Notes

- The Launcher Utilities should be designed to work in both Node.js and browser environments
- Consider implementing a plugin system to allow extending the library with custom features
- Ensure that initialization is idempotent (can be called multiple times without side effects)
- Use feature detection rather than environment detection when possible
- Keep initialization fast by deferring resource-intensive operations until they're needed
- Consider implementing a shutdown/cleanup function to release resources when the library is no longer needed
