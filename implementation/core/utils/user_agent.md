# Implementation of User Agent Module (Core Utilities)

**Original Python Implementation**: [user_agent.py](/vnstock/core/utils/user_agent.py)


## Overview

The `user_agent.py` module in the Python `vnstock` package provides functionality for generating and managing HTTP User-Agent headers for API requests. It creates appropriate headers for different data sources, optionally using random user agents to avoid detection or rate-limiting by APIs. This module is used by the client utilities to ensure that requests appear legitimate and are accepted by the target APIs.

## Functions and Constants

### Constants

```python
DEFAULT_HEADERS = {
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7',
    'Connection': 'keep-alive',
    'Content-Type': 'application/json',
    'Accept-Language': 'vi',
    'Cache-Control': 'no-cache',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-site',
    'DNT': '1',
    'Pragma': 'no-cache',
}

HEADERS_MAPPING_SOURCE = {
    'SSI': {'Referer': 'https://iboard.ssi.com.vn', 'Origin': 'https://iboard.ssi.com.vn'},
    'VND': {'Referer': 'https://dchart.vndirect.com.vn', 'Origin': 'https://dchart.vndirect.com.vn'},
    'TCBS': {'Referer': 'https://tcinvest.tcbs.com.vn/', 'Origin': 'https://tcinvest.tcbs.com.vn/'},
    'VCI': {'Referer': 'https://trading.vietcap.com.vn/', 'Origin': 'https://trading.vietcap.com.vn/'},
    'MSN': {'Referer': 'https://www.msn.com/', 'Origin': 'https://www.msn.com/'},
    'FMARKET': {'Referer': 'https://fmarket.vn/', 'Origin': 'https://fmarket.vn/'},
    'SJC': {'Referer': 'https://sjc.com.vn/bieu-do-gia-vang', 'Origin': 'https://sjc.com.vn'},
}
```

### Functions

#### `get_headers(data_source, random_agent)`

Creates headers for requests based on the specified data source.

##### Python Implementation

```python
def get_headers(data_source='SSI', random_agent=True):
    """
    Tạo headers cho request theo nguồn dữ liệu.
    """
    data_source = data_source.upper()
    ua = UserAgent(fallback='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36')
    headers = DEFAULT_HEADERS.copy()
    if random_agent:
        headers['User-Agent'] = ua.random
    else:
        headers['User-Agent'] = ua.chrome
    headers.update(HEADERS_MAPPING_SOURCE.get(data_source, {}))
    return headers
```

## TypeScript Implementation

### TypeScript Interfaces

```typescript
/**
 * Default HTTP headers used in requests
 */
interface DefaultHeaders {
  Accept: string;
  'Accept-Language': string;
  Connection: string;
  'Content-Type': string;
  'Cache-Control': string;
  'Sec-Fetch-Dest': string;
  'Sec-Fetch-Mode': string;
  'Sec-Fetch-Site': string;
  DNT: string;
  Pragma: string;
  [key: string]: string;
}

/**
 * Source-specific headers mapping
 */
interface HeadersMappingSource {
  [source: string]: {
    Referer: string;
    Origin: string;
    [key: string]: string;
  };
}

/**
 * User agent groups by browser type
 */
interface UserAgents {
  chrome: string[];
  firefox: string[];
  safari: string[];
  edge: string[];
  opera: string[];
}
```

### TypeScript Implementation

```typescript
import { getLogger } from './logger';

// Logger instance
const logger = getLogger('core.utils.user_agent');

/**
 * Default headers used in all requests
 */
export const DEFAULT_HEADERS: DefaultHeaders = {
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7',
  Connection: 'keep-alive',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-cache',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'same-site',
  DNT: '1',
  Pragma: 'no-cache',
};

/**
 * Source-specific headers mapping for different data providers
 */
export const HEADERS_MAPPING_SOURCE: HeadersMappingSource = {
  SSI: {
    Referer: 'https://iboard.ssi.com.vn',
    Origin: 'https://iboard.ssi.com.vn',
  },
  VND: {
    Referer: 'https://dchart.vndirect.com.vn',
    Origin: 'https://dchart.vndirect.com.vn',
  },
  TCBS: {
    Referer: 'https://tcinvest.tcbs.com.vn/',
    Origin: 'https://tcinvest.tcbs.com.vn/',
  },
  VCI: {
    Referer: 'https://trading.vietcap.com.vn/',
    Origin: 'https://trading.vietcap.com.vn/',
  },
  MSN: { Referer: 'https://www.msn.com/', Origin: 'https://www.msn.com/' },
  FMARKET: { Referer: 'https://fmarket.vn/', Origin: 'https://fmarket.vn/' },
  SJC: {
    Referer: 'https://sjc.com.vn/bieu-do-gia-vang',
    Origin: 'https://sjc.com.vn',
  },
};

/**
 * Collection of modern user agents by browser type
 */
const USER_AGENTS: UserAgents = {
  chrome: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  ],
  firefox: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0',
    'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/110.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/109.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0',
  ],
  safari: [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.2 Safari/605.1.15',
    'Mozilla/5.0 (iPad; CPU OS 16_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.3 Mobile/15E148 Safari/604.1',
  ],
  edge: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36 Edg/109.0.1518.78',
  ],
  opera: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 OPR/96.0.0.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 OPR/96.0.0.0',
  ],
};

/**
 * Default fallback user agent to use if others are unavailable
 */
const FALLBACK_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36';

/**
 * Get a random user agent from the specified browser or from all browsers
 *
 * @param browser The browser to get a user agent for (optional)
 * @returns A random user agent string
 */
export function getRandomUserAgent(browser?: keyof UserAgents): string {
  try {
    if (browser && USER_AGENTS[browser]) {
      const browserAgents = USER_AGENTS[browser];
      return browserAgents[Math.floor(Math.random() * browserAgents.length)];
    }

    // If no specific browser or invalid browser, get from all
    const allBrowsers = Object.keys(USER_AGENTS) as (keyof UserAgents)[];
    const randomBrowser =
      allBrowsers[Math.floor(Math.random() * allBrowsers.length)];
    const browserAgents = USER_AGENTS[randomBrowser];
    return browserAgents[Math.floor(Math.random() * browserAgents.length)];
  } catch (error) {
    logger.warn(
      `Error getting random user agent: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return FALLBACK_USER_AGENT;
  }
}

/**
 * Get a Chrome user agent (either random or the default)
 *
 * @returns A Chrome user agent string
 */
export function getChromeUserAgent(): string {
  return USER_AGENTS.chrome[0];
}

/**
 * Get a user agent string, either random or a specific Chrome one
 *
 * @param randomAgent Whether to use a random user agent
 * @returns A user agent string
 */
export function getUserAgent(randomAgent: boolean = false): string {
  return randomAgent ? getRandomUserAgent() : getChromeUserAgent();
}

/**
 * Get headers for a request based on the specified data source
 *
 * @param dataSource The data source identifier (e.g., 'SSI', 'TCBS')
 * @param randomAgent Whether to use a random user agent
 * @returns Headers object for API requests
 */
export function getHeaders(
  dataSource: string = 'SSI',
  randomAgent: boolean = true
): Record<string, string> {
  try {
    // Convert data source to uppercase for case-insensitive comparison
    const source = dataSource.toUpperCase();

    // Create a copy of the default headers
    const headers = { ...DEFAULT_HEADERS };

    // Add user agent
    headers['User-Agent'] = getUserAgent(randomAgent);

    // Add source-specific headers if available
    if (HEADERS_MAPPING_SOURCE[source]) {
      Object.assign(headers, HEADERS_MAPPING_SOURCE[source]);
    }

    return headers;
  } catch (error) {
    logger.error(
      `Error creating headers: ${
        error instanceof Error ? error.message : String(error)
      }`
    );

    // Return basic headers with fallback user agent in case of error
    return {
      ...DEFAULT_HEADERS,
      'User-Agent': FALLBACK_USER_AGENT,
    };
  }
}
```

## Implementation Details

### Key Function Behaviors

1. **User Agent Variation**:

   - The Python implementation uses the `fake_useragent` library to generate random user agents
   - The TypeScript implementation includes a predefined list of modern user agents

2. **Headers Management**:

   - Both implementations maintain default headers used across all requests
   - Source-specific headers (Referer, Origin) are added based on the data source

3. **Error Handling**:
   - The TypeScript implementation adds robust error handling with fallbacks
   - This ensures that even if there's an error, a valid user agent will be provided

### Data Flow

1. A module needs to make an API request to a specific data source
2. It calls `getHeaders` with the data source name and whether to use a random agent
3. The function combines the default headers with source-specific headers
4. It adds an appropriate User-Agent header (random or Chrome-based)
5. The complete headers object is returned for use in API requests

## Dependencies

### Required Packages

For the Python implementation:

- **fake_useragent**: For generating random user agents

For the TypeScript implementation:

- No external dependencies; uses predefined user agent strings
- **logger.ts**: Custom logging implementation from the package

## Usage Examples

### Basic Usage

```typescript
import { getHeaders } from './user_agent';

// Get headers for VCI with a random user agent
const headers = getHeaders('VCI', true);
console.log(headers);

// Get headers for TCBS with a specific Chrome user agent
const tcbsHeaders = getHeaders('TCBS', false);
console.log(tcbsHeaders);
```

### Getting Just a User Agent

```typescript
import {
  getUserAgent,
  getRandomUserAgent,
  getChromeUserAgent,
} from './user_agent';

// Get a random user agent
const randomUA = getRandomUserAgent();
console.log(randomUA);

// Get a random Chrome user agent
const chromeUA = getRandomUserAgent('chrome');
console.log(chromeUA);

// Get the default Chrome user agent
const defaultUA = getChromeUserAgent();
console.log(defaultUA);

// Get a user agent based on preference
const ua = getUserAgent(true); // random=true
console.log(ua);
```

### Using with Axios

```typescript
import axios from 'axios';
import { getHeaders } from './user_agent';

async function fetchData(url: string, source: string) {
  try {
    const headers = getHeaders(source, true);
    const response = await axios.get(url, { headers });
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
```

## Implementation Notes

1. **Library Differences**:

   - Python uses the `fake_useragent` library which dynamically fetches user agents
   - TypeScript uses a predefined list to avoid external dependencies

2. **Browser Support**:

   - TypeScript implementation organizes user agents by browser type
   - This allows for browser-specific agent selection when needed

3. **Maintainability**:

   - The predefined list in TypeScript should be periodically updated
   - Consider adding a mechanism to update the list from an external source

4. **Custom User Agents**:

   - The implementation could be extended to support custom user agents
   - This would be useful for specialized API integrations

5. **Privacy Considerations**:
   - User agent rotation helps prevent tracking and rate limiting
   - Consider implementing more sophisticated rotation strategies for high-volume requests

By implementing these user agent utilities in TypeScript, the package will have consistent and reliable header generation for all API requests, helping to avoid detection and rate limiting by data sources.
