# Environment Utilities

**Original Python Implementation**: [env.py](/vnstock/core/utils/env.py)


## Overview

The Environment Utilities module provides functionality for accessing and managing environment variables and runtime configuration settings in the vnstock library. This module ensures consistent access to environment-specific settings across different runtime environments (Node.js, browser, etc.) and provides fallback mechanisms for missing configuration values.

## Purpose

The Environment Utilities module serves several key purposes:

1. **Environment Variable Access**: Provides a consistent interface for accessing environment variables
2. **Runtime Detection**: Determines the current runtime environment (Node.js, browser, test, etc.)
3. **Configuration Validation**: Validates required environment variables exist and have proper values
4. **Default Values**: Supplies sensible defaults for missing environment variables
5. **Secret Management**: Provides secure access to sensitive configuration values

## TypeScript Implementation

### Environment Variable Access

The core function for accessing environment variables:

```typescript
/**
 * Get environment variable value
 * @param name Environment variable name
 * @param defaultValue Optional default value if the variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv(
  name: string,
  defaultValue?: string
): string | undefined {
  // Node.js environment
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name] || defaultValue;
  }

  // Browser environment with window.ENV
  if (typeof window !== 'undefined' && window.ENV) {
    return (window.ENV as Record<string, string>)[name] || defaultValue;
  }

  // Default case
  return defaultValue;
}

/**
 * Get required environment variable
 * @param name Environment variable name
 * @throws Error if the environment variable is not set
 * @returns The environment variable value
 */
export function getRequiredEnv(name: string): string {
  const value = getEnv(name);
  if (value === undefined) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}
```

### Runtime Environment Detection

Functions for determining the current runtime environment:

```typescript
/**
 * Runtime environment types
 */
export enum RuntimeEnvironment {
  NODE = 'node',
  BROWSER = 'browser',
  WORKER = 'worker',
  UNKNOWN = 'unknown',
}

/**
 * Detect the current runtime environment
 * @returns The detected runtime environment
 */
export function detectRuntime(): RuntimeEnvironment {
  if (
    typeof process !== 'undefined' &&
    process.versions &&
    process.versions.node
  ) {
    return RuntimeEnvironment.NODE;
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return RuntimeEnvironment.BROWSER;
  }

  if (typeof self !== 'undefined' && typeof WorkerGlobalScope !== 'undefined') {
    return RuntimeEnvironment.WORKER;
  }

  return RuntimeEnvironment.UNKNOWN;
}

/**
 * Check if running in a specific environment
 * @param env The environment to check for
 * @returns True if running in the specified environment
 */
export function isRunningIn(env: RuntimeEnvironment): boolean {
  return detectRuntime() === env;
}
```

### Environment-Specific Configuration

Utilities for managing environment-specific configuration:

```typescript
/**
 * Environment types
 */
export enum Environment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

/**
 * Get the current environment
 * @returns The current environment
 */
export function getCurrentEnvironment(): Environment {
  const env = getEnv('NODE_ENV', 'development').toLowerCase();

  switch (env) {
    case 'production':
      return Environment.PRODUCTION;
    case 'staging':
      return Environment.STAGING;
    case 'test':
    case 'testing':
      return Environment.TESTING;
    default:
      return Environment.DEVELOPMENT;
  }
}

/**
 * Check if running in a specific environment
 * @param env The environment to check for
 * @returns True if running in the specified environment
 */
export function isEnvironment(env: Environment): boolean {
  return getCurrentEnvironment() === env;
}

/**
 * Check if running in development mode
 * @returns True if running in development
 */
export function isDevelopment(): boolean {
  return isEnvironment(Environment.DEVELOPMENT);
}

/**
 * Check if running in production mode
 * @returns True if running in production
 */
export function isProduction(): boolean {
  return isEnvironment(Environment.PRODUCTION);
}
```

### Configuration Loading

Utilities for loading configuration from different sources:

```typescript
/**
 * Load configuration from environment file
 * @param path Path to the environment file
 * @returns Object containing the loaded configuration
 */
export function loadEnvFile(path: string): Record<string, string> {
  // Only available in Node.js
  if (isRunningIn(RuntimeEnvironment.NODE)) {
    try {
      // Load dotenv in Node.js environment
      require('dotenv').config({ path });

      // Return a copy of the process.env
      return { ...process.env };
    } catch (error) {
      console.warn(`Failed to load environment file: ${path}`, error);
      return {};
    }
  }

  // Not applicable in other environments
  console.warn('Environment file loading is only supported in Node.js');
  return {};
}

/**
 * Parse boolean environment value
 * @param name Environment variable name
 * @param defaultValue Optional default value
 * @returns Boolean value
 */
export function getBooleanEnv(name: string, defaultValue = false): boolean {
  const value = getEnv(name);
  if (value === undefined) {
    return defaultValue;
  }

  return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
}

/**
 * Parse numeric environment value
 * @param name Environment variable name
 * @param defaultValue Optional default value
 * @returns Numeric value
 */
export function getNumericEnv(name: string, defaultValue = 0): number {
  const value = getEnv(name);
  if (value === undefined) {
    return defaultValue;
  }

  const parsedValue = parseFloat(value);
  return isNaN(parsedValue) ? defaultValue : parsedValue;
}
```

## Usage Examples

### Basic Environment Variable Access

```typescript
import { getEnv, getRequiredEnv } from 'vnstock/core/utils/env';

// Access optional environment variable with default
const apiTimeout = getNumericEnv('VNSTOCK_API_TIMEOUT', 30000);

// Access required environment variable
try {
  const apiKey = getRequiredEnv('VNSTOCK_API_KEY');
  console.log(`Using API key: ${apiKey}`);
} catch (error) {
  console.error('Missing required API key:', error);
}
```

### Environment Detection

```typescript
import {
  detectRuntime,
  RuntimeEnvironment,
  isRunningIn,
} from 'vnstock/core/utils/env';

// Determine the current runtime
const runtime = detectRuntime();

// Conditional logic based on environment
if (isRunningIn(RuntimeEnvironment.NODE)) {
  // Node.js specific code
  console.log('Running in Node.js environment');
} else if (isRunningIn(RuntimeEnvironment.BROWSER)) {
  // Browser specific code
  console.log('Running in browser environment');
}
```

### Environment-Specific Configuration

```typescript
import {
  getCurrentEnvironment,
  Environment,
  isProduction,
  isDevelopment,
} from 'vnstock/core/utils/env';

// Get current environment
const env = getCurrentEnvironment();
console.log(`Current environment: ${env}`);

// Conditional logic based on environment
if (isProduction()) {
  console.log('Running in production mode');
} else if (isDevelopment()) {
  console.log('Running in development mode');

  // Enable additional logging in development
  enableDebugLogging();
}
```

### Loading Configuration from Files

```typescript
import { loadEnvFile } from 'vnstock/core/utils/env';

// Load environment variables from .env file
const config = loadEnvFile('.env');
console.log('Loaded configuration:', config);

// Load environment-specific configuration
const envSpecificConfig = loadEnvFile(`.env.${process.env.NODE_ENV}`);
```

## Integration with Other Modules

The Environment Utilities module integrates with several other modules:

1. **Core Configuration**: Provides environment variable access for configuration loading
2. **Logging**: Controls logging behavior based on environment
3. **API Client**: Configures API endpoints and timeouts based on environment
4. **Security**: Manages access to sensitive credentials

## Best Practices

When working with environment variables:

1. **Default Values**: Always provide sensible defaults for optional environment variables
2. **Validation**: Validate required environment variables early in application startup
3. **Type Conversion**: Use appropriate type conversion functions for boolean and numeric values
4. **Sensitive Data**: Never log sensitive environment variables like API keys or passwords
5. **Documentation**: Document all expected environment variables and their purpose

## Dependencies

The Environment Utilities module has minimal dependencies:

1. `dotenv` (for Node.js environments only, optional)
2. No external dependencies required for browser environments

## Implementation Notes

When implementing or extending the Environment Utilities module:

1. **Cross-Platform Support**: Ensure utilities work in both Node.js and browser environments
2. **Error Handling**: Provide clear error messages for missing required variables
3. **Performance**: Cache environment detection results rather than re-detecting every time
4. **Security**: Be careful not to expose sensitive environment variables in client-side code
5. **Testing**: Make environment detection and variables overridable for testing purposes

## References

For related functionality, refer to:

- [Core Configuration Module](../../core/config/index.md)
- [Logger Utility](./logger.md)
