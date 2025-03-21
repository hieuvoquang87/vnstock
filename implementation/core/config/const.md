# Implementation of Configuration Module (Data Modules)

## Overview

The configuration module in the `vnstock` package provides centralized management of global settings and constants used across the library. It includes default data sources, timeouts, API endpoints, and other configurable parameters that affect the behavior of data retrieval and processing functions. The primary implementation is in two files: `const.py` for constants and through the `Config` class in the data_explorer module.

## Constants

### 1. `const.py`

The `const.py` file contains basic constants used throughout the application:

#### Python Implementation

```python
# Default data source to use when not specified
DEFAULT_SOURCE = 'VCI'

# Default HTTP timeout in seconds
DEFAULT_TIMEOUT = 30

# User agent strings for HTTP requests
UA = {
    'chrome': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    'edge': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.51',
    'safari': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15'
}
```

### 2. `Config` Class

The `Config` class in `data_explorer.py` extends the basic constants with additional settings and provides a method to update configuration at runtime:

#### Python Implementation

```python
class Config:
    DEFAULT_SOURCE = "VCI"
    DEFAULT_TIMEOUT = 30  # seconds
    DEFAULT_RETRIES = 3
    CACHE_SIZE = 128
    LOG_LEVEL = logging.INFO

    @classmethod
    def setup(cls, **kwargs):
        """Update configuration settings with provided values."""
        for key, value in kwargs.items():
            if hasattr(cls, key):
                setattr(cls, key, value)
                logger.info(f"Updated config: {key}={value}")
```

## Environment Variables

The `vnstock` package can also be configured using environment variables:

#### Python Implementation

```python
# Check for environment variables and override defaults
import os

if 'VNSTOCK_DATA_SOURCE' in os.environ:
    DEFAULT_SOURCE = os.environ['VNSTOCK_DATA_SOURCE']

if 'VNSTOCK_TIMEOUT' in os.environ:
    try:
        DEFAULT_TIMEOUT = int(os.environ['VNSTOCK_TIMEOUT'])
    except ValueError:
        # Keep default if conversion fails
        pass
```

## API Endpoints

The configuration includes URL endpoints for different data sources:

#### Python Implementation

```python
# Base URLs for different data sources
API_URLS = {
    'VCI': {
        'base': 'https://api-market.vci.com.vn/v2',
        'ohlc': 'https://api-market.vci.com.vn/v2/stock/bars',
        'quote': 'https://api-market.vci.com.vn/v2/stock/quote',
        'listing': 'https://api-market.vci.com.vn/v2/stock/information'
    },
    'TCBS': {
        'base': 'https://apicd.tcbs.com.vn',
        'ohlc': 'https://apicd.tcbs.com.vn/stock/bars',
        'finance': 'https://finance.tcbs.com.vn',
        'screener': 'https://apicd.tcbs.com.vn/tc-price/v1/stocks/filter'
    },
    'MSN': {
        'base': 'https://www.msn.com/api',
        'finance': 'https://www.msn.com/api/finance'
    },
    'FMARKET': {
        'base': 'https://fund.vietdata.vn/api',
        'funds': 'https://fund.vietdata.vn/api/funds'
    }
}
```

## Data Source Configuration

Configuration for supported data sources and their capabilities:

#### Python Implementation

```python
# Data source capabilities
SOURCE_CAPABILITIES = {
    'VCI': {
        'quote': True,
        'listing': True,
        'trading': True,
        'company': True,
        'finance': True
    },
    'TCBS': {
        'quote': True,
        'listing': False,
        'trading': True,
        'company': True,
        'finance': True,
        'screener': True
    },
    'MSN': {
        'quote': True,
        'listing': True,
        'trading': False,
        'company': False,
        'finance': False
    },
    'FMARKET': {
        'fund': True
    }
}
```

## TypeScript Implementation

### TypeScript Interfaces

```typescript
/**
 * Configuration options interface
 */
interface ConfigOptions {
  defaultSource?: string;
  defaultTimeout?: number;
  defaultRetries?: number;
  cacheSize?: number;
  logLevel?: LogLevel;
}

/**
 * API URLs for different data sources
 */
interface ApiUrls {
  [source: string]: {
    base: string;
    [endpoint: string]: string;
  };
}

/**
 * Source capabilities interface
 */
interface SourceCapabilities {
  [source: string]: {
    [capability: string]: boolean;
  };
}

/**
 * User agent strings
 */
interface UserAgents {
  [browser: string]: string;
}
```

### TypeScript Implementation

```typescript
import { LogLevel } from './logger';

/**
 * Environment variable utility to get typed values
 */
class Environment {
  static getString(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  static getNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (value === undefined) return defaultValue;

    const parsed = Number(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  static getBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key]?.toLowerCase();
    if (value === undefined) return defaultValue;

    return value === 'true' || value === '1' || value === 'yes';
  }
}

/**
 * Constants for the application
 */
export const Constants = {
  // User agent strings for HTTP requests
  UA: {
    chrome:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36 Edg/114.0.1823.51',
    safari:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
  } as UserAgents,

  // API URLs for different data sources
  API_URLS: {
    VCI: {
      base: 'https://api-market.vci.com.vn/v2',
      ohlc: 'https://api-market.vci.com.vn/v2/stock/bars',
      quote: 'https://api-market.vci.com.vn/v2/stock/quote',
      listing: 'https://api-market.vci.com.vn/v2/stock/information',
    },
    TCBS: {
      base: 'https://apicd.tcbs.com.vn',
      ohlc: 'https://apicd.tcbs.com.vn/stock/bars',
      finance: 'https://finance.tcbs.com.vn',
      screener: 'https://apicd.tcbs.com.vn/tc-price/v1/stocks/filter',
    },
    MSN: {
      base: 'https://www.msn.com/api',
      finance: 'https://www.msn.com/api/finance',
    },
    FMARKET: {
      base: 'https://fund.vietdata.vn/api',
      funds: 'https://fund.vietdata.vn/api/funds',
    },
  } as ApiUrls,

  // Source capabilities configuration
  SOURCE_CAPABILITIES: {
    VCI: {
      quote: true,
      listing: true,
      trading: true,
      company: true,
      finance: true,
    },
    TCBS: {
      quote: true,
      listing: false,
      trading: true,
      company: true,
      finance: true,
      screener: true,
    },
    MSN: {
      quote: true,
      listing: true,
      trading: false,
      company: false,
      finance: false,
    },
    FMARKET: {
      fund: true,
    },
  } as SourceCapabilities,
};

/**
 * Global configuration class
 */
export class Config {
  static DEFAULT_SOURCE = Environment.getString('VNSTOCK_DATA_SOURCE', 'VCI');
  static DEFAULT_TIMEOUT = Environment.getNumber('VNSTOCK_TIMEOUT', 30);
  static DEFAULT_RETRIES = Environment.getNumber('VNSTOCK_RETRIES', 3);
  static CACHE_SIZE = Environment.getNumber('VNSTOCK_CACHE_SIZE', 128);
  static LOG_LEVEL = LogLevel.Info;

  /**
   * Update configuration with provided options
   */
  static setup(options: ConfigOptions): void {
    Object.entries(options).forEach(([key, value]) => {
      const configKey = key as keyof typeof Config;

      if (key in this && value !== undefined) {
        (this as any)[configKey] = value;
        console.info(`Updated config: ${key}=${value}`);
      }
    });
  }

  /**
   * Get API URL for a specific source and endpoint
   */
  static getApiUrl(source: string, endpoint: string): string {
    const sourceUrls = Constants.API_URLS[source.toUpperCase()];
    if (!sourceUrls) {
      throw new Error(`No API URLs defined for source: ${source}`);
    }

    const url = sourceUrls[endpoint];
    if (!url) {
      throw new Error(`No ${endpoint} URL defined for source: ${source}`);
    }

    return url;
  }

  /**
   * Check if a source supports a specific capability
   */
  static hasCapability(source: string, capability: string): boolean {
    const capabilities = Constants.SOURCE_CAPABILITIES[source.toUpperCase()];
    return capabilities ? !!capabilities[capability] : false;
  }
}
```

## Implementation Details

### Configuration Management Approach

1. **Layered Configuration**:

   - Constants are defined in `const.py` for basic, rarely changing values
   - The `Config` class provides runtime-configurable settings
   - Environment variables allow for configuration without code changes

2. **Source-Specific Configuration**:

   - URLs and capabilities are organized by data source
   - This allows the application to adapt behavior based on the selected source

3. **Runtime Configuration**:
   - The `setup()` method allows updating configuration at runtime
   - This facilitates testing with different configurations
   - It also enables application-specific customization

### Environment Variables

The following environment variables can be used to configure the library:

| Variable            | Type   | Default | Description                             |
| ------------------- | ------ | ------- | --------------------------------------- |
| VNSTOCK_DATA_SOURCE | String | "VCI"   | Default data source                     |
| VNSTOCK_TIMEOUT     | Number | 30      | Default HTTP timeout in seconds         |
| VNSTOCK_RETRIES     | Number | 3       | Number of retry attempts for API calls  |
| VNSTOCK_CACHE_SIZE  | Number | 128     | Size of LRU cache for API results       |
| VNSTOCK_LOG_LEVEL   | String | "INFO"  | Log level (DEBUG, INFO, WARNING, ERROR) |

## Dependencies

The configuration module has minimal dependencies:

- `os` - For accessing environment variables in Python
- `logging` - For logging configuration changes
- Custom logger implementation in TypeScript

## Usage Examples

### Python Example

```python
from vnstock import Config

# Update configuration at runtime
Config.setup(
    DEFAULT_SOURCE='TCBS',
    DEFAULT_TIMEOUT=60,
    DEFAULT_RETRIES=5,
    CACHE_SIZE=256,
    LOG_LEVEL=logging.DEBUG
)

# Use the configuration in a component
from vnstock import Quote

# This will use TCBS as the source
quote = Quote('VNM')
```

### TypeScript Example

```typescript
import { Config } from './config';
import { LogLevel } from './logger';

// Update configuration at runtime
Config.setup({
  defaultSource: 'TCBS',
  defaultTimeout: 60,
  defaultRetries: 5,
  cacheSize: 256,
  logLevel: LogLevel.Debug,
});

// Check source capabilities
const hasTcbsScreener = Config.hasCapability('TCBS', 'screener');
console.log(`TCBS has screener capability: ${hasTcbsScreener}`);

// Get API URL
const tcbsScreenerUrl = Config.getApiUrl('TCBS', 'screener');
console.log(`TCBS screener URL: ${tcbsScreenerUrl}`);
```

## Implementation Notes

1. **Environment Variable Handling**:

   - Python uses `os.environ` directly
   - TypeScript provides a typed wrapper to handle type conversion

2. **Configuration Validation**:

   - The Python implementation has minimal validation
   - The TypeScript implementation includes more robust checking of values

3. **API URL Management**:

   - Both implementations store URLs by source and endpoint
   - TypeScript adds a helper method to retrieve URLs with error checking

4. **Source Capability Checking**:

   - Source capabilities are defined in a structured way
   - TypeScript adds a helper method to check capabilities with error handling

5. **Configuration Design**:
   - Static class properties are used for configuration
   - This makes the configuration globally accessible
   - Consider alternatives like dependency injection for better testability
