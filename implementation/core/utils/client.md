# Implementation of HTTP Client

**Original Python Implementation**: [vnstock/core/utils/client.py](/vnstock/core/utils/client.py)

## Purpose

The HTTP Client module serves several critical purposes in the vnstock library:

1. **Centralized Communication**: Provides a single point of interaction with external APIs, ensuring consistent communication patterns
2. **Error Handling**: Implements standardized error handling for all network requests, including timeouts, connection issues, and API errors
3. **Request Standardization**: Normalizes the format of API requests across different data sources
4. **Logging Integration**: Integrates with the logging system to provide visibility into API communication for debugging
5. **Cross-Platform Compatibility**: Abstracts platform-specific networking code to work consistently in different environments

## Overview

The `client` module provides a centralized HTTP client utility for making API requests with consistent error handling across the `vnstock` package. It includes a simple wrapper around the Python `requests` library that standardizes request formatting, error handling, and logging.

## Functions

### API Request Sender

The main function for sending API requests to various data sources.

#### Python Implementation

```python
def send_request(url: str, headers: Dict[str, str], method: str = "GET",
                 params: Optional[Dict] = None, payload: Optional[Dict] = None,
                 show_log: bool = False, timeout: int = 30) -> Dict[str, Any]:
    """Centralized function for making API requests with consistent error handling."""
    if show_log:
        logger.info(f"{method} request to {url}")
        if params:
            logger.info(f"Params: {params}")
        if payload:
            logger.info(f"Payload: {payload}")

    try:
        if method.upper() == "GET":
            response = requests.get(url, headers=headers, params=params, timeout=timeout)
        else:  # POST
            response = requests.post(
                url,
                headers=headers,
                data=json.dumps(payload) if payload else None,
                timeout=timeout
            )

        if response.status_code != 200:
            raise ConnectionError(f"Failed to fetch data: {response.status_code} - {response.reason}")

        data = response.json()

        if show_log:
            logger.info(f"Response status: {response.status_code}")

        return data
    except requests.exceptions.RequestException as e:
        error_msg = f"API request failed: {str(e)}"
        logger.error(error_msg)
        raise ConnectionError(error_msg)
```

## TypeScript Implementation

The equivalent functionality in TypeScript can be implemented using either the native `fetch` API or libraries like `axios`. The following example uses the native `fetch` API for simplicity:

```typescript
import { Logger } from '../logger';

/**
 * Options for making an API request
 */
export interface RequestOptions {
  /** HTTP method to use */
  method?: 'GET' | 'POST';
  /** Query parameters for the request */
  params?: Record<string, string>;
  /** Payload data for POST requests */
  payload?: Record<string, any>;
  /** Whether to log request and response details */
  showLog?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Send an API request with consistent error handling
 *
 * @param url - The URL to send the request to
 * @param headers - HTTP headers to include in the request
 * @param options - Additional request options
 * @returns The parsed JSON response
 * @throws ConnectionError if the request fails
 */
export async function sendRequest(
  url: string,
  headers: Record<string, string>,
  options: RequestOptions = {}
): Promise<any> {
  const {
    method = 'GET',
    params = null,
    payload = null,
    showLog = false,
    timeout = 30000,
  } = options;

  const logger = Logger.getLogger('client');
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Prepare URL with query parameters if provided
  let requestUrl = url;
  if (params) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, value);
    });
    requestUrl = `${url}?${queryParams.toString()}`;
  }

  // Log request details if enabled
  if (showLog) {
    logger.info(`${method} request to ${requestUrl}`);
    if (params) {
      logger.info(`Params: ${JSON.stringify(params)}`);
    }
    if (payload) {
      logger.info(`Payload: ${JSON.stringify(payload)}`);
    }
  }

  try {
    // Prepare request options
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    // Add payload for POST requests
    if (method === 'POST' && payload) {
      requestOptions.body = JSON.stringify(payload);
    }

    // Send request
    const response = await fetch(requestUrl, requestOptions);

    // Clear timeout
    clearTimeout(timeoutId);

    // Check for successful response
    if (!response.ok) {
      throw new ConnectionError(
        `Failed to fetch data: ${response.status} - ${response.statusText}`,
        response.status,
        url
      );
    }

    // Parse and return response data
    const data = await response.json();

    if (showLog) {
      logger.info(`Response status: ${response.status}`);
    }

    return data;
  } catch (error) {
    // Clear timeout
    clearTimeout(timeoutId);

    // Handle AbortController timeout
    if (error.name === 'AbortError') {
      const timeoutError = new ConnectionError(
        `Request timeout after ${timeout}ms`,
        408,
        url
      );
      logger.error(timeoutError.message);
      throw timeoutError;
    }

    // Handle other errors
    if (error instanceof ConnectionError) {
      logger.error(`API request failed: ${error.message}`);
      throw error;
    } else {
      const requestError = new ConnectionError(
        `API request failed: ${error.message}`,
        0,
        url
      );
      logger.error(requestError.message);
      throw requestError;
    }
  }
}

/**
 * Error class for connection-related errors
 */
export class ConnectionError extends Error {
  /** HTTP status code */
  public statusCode: number;
  /** URL that was requested */
  public url: string;

  /**
   * Create a new ConnectionError
   *
   * @param message - Error message
   * @param statusCode - HTTP status code
   * @param url - The URL that was requested
   */
  constructor(message: string, statusCode: number = 0, url: string = '') {
    super(message);
    this.name = 'ConnectionError';
    this.statusCode = statusCode;
    this.url = url;
    // Maintain proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConnectionError);
    }
  }
}
```

## Axios Implementation Alternative

For projects that prefer using `axios` over the native `fetch` API, here's an equivalent implementation:

```typescript
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { Logger } from '../logger';

/**
 * Options for making an API request
 */
export interface RequestOptions {
  /** HTTP method to use */
  method?: 'GET' | 'POST';
  /** Query parameters for the request */
  params?: Record<string, string>;
  /** Payload data for POST requests */
  payload?: Record<string, any>;
  /** Whether to log request and response details */
  showLog?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
}

/**
 * Send an API request with consistent error handling using axios
 *
 * @param url - The URL to send the request to
 * @param headers - HTTP headers to include in the request
 * @param options - Additional request options
 * @returns The response data
 * @throws ConnectionError if the request fails
 */
export async function sendRequest(
  url: string,
  headers: Record<string, string>,
  options: RequestOptions = {}
): Promise<any> {
  const {
    method = 'GET',
    params = null,
    payload = null,
    showLog = false,
    timeout = 30000,
  } = options;

  const logger = Logger.getLogger('client');

  // Log request details if enabled
  if (showLog) {
    logger.info(`${method} request to ${url}`);
    if (params) {
      logger.info(`Params: ${JSON.stringify(params)}`);
    }
    if (payload) {
      logger.info(`Payload: ${JSON.stringify(payload)}`);
    }
  }

  try {
    // Prepare request configuration
    const config: AxiosRequestConfig = {
      method,
      url,
      headers,
      timeout,
    };

    // Add parameters and payload
    if (params) {
      config.params = params;
    }

    if (method === 'POST' && payload) {
      config.data = payload;
    }

    // Send request
    const response: AxiosResponse = await axios(config);

    if (showLog) {
      logger.info(`Response status: ${response.status}`);
    }

    return response.data;
  } catch (error) {
    // Handle axios errors
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;

      // Handle timeout
      if (axiosError.code === 'ECONNABORTED') {
        const timeoutError = new ConnectionError(
          `Request timeout after ${timeout}ms`,
          408,
          url
        );
        logger.error(timeoutError.message);
        throw timeoutError;
      }

      // Handle response errors
      if (axiosError.response) {
        const connectionError = new ConnectionError(
          `Failed to fetch data: ${axiosError.response.status} - ${axiosError.response.statusText}`,
          axiosError.response.status,
          url
        );
        logger.error(connectionError.message);
        throw connectionError;
      }

      // Handle request errors
      const requestError = new ConnectionError(
        `API request failed: ${axiosError.message}`,
        0,
        url
      );
      logger.error(requestError.message);
      throw requestError;
    } else {
      // Handle generic errors
      const genericError = new ConnectionError(
        `API request failed: ${error.message}`,
        0,
        url
      );
      logger.error(genericError.message);
      throw genericError;
    }
  }
}
```

## Usage Example

### Python Example

```python
from vnstock.core.utils.client import send_request
from vnstock.core.utils.user_agent import get_headers

# Define request parameters
url = "https://api.example.com/data"
headers = get_headers("VCI")
params = {"symbol": "VNM", "start": "2023-01-01", "end": "2023-12-31"}

# Send a GET request
try:
    data = send_request(url, headers, params=params, show_log=True)
    print(f"Received data: {data}")
except ConnectionError as e:
    print(f"Error: {e}")

# Send a POST request
payload = {"symbols": ["VNM", "VCB", "FPT"], "fields": ["close", "volume"]}
try:
    data = send_request(url, headers, method="POST", payload=payload, show_log=True)
    print(f"Received data: {data}")
except ConnectionError as e:
    print(f"Error: {e}")
```

### TypeScript Example

```typescript
import { sendRequest } from './client';
import { getHeaders } from './user_agent';

async function fetchData() {
  // Define request parameters
  const url = 'https://api.example.com/data';
  const headers = getHeaders('VCI');
  const params = { symbol: 'VNM', start: '2023-01-01', end: '2023-12-31' };

  // Send a GET request
  try {
    const data = await sendRequest(url, headers, {
      params,
      showLog: true,
    });
    console.log('Received data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }

  // Send a POST request
  const payload = {
    symbols: ['VNM', 'VCB', 'FPT'],
    fields: ['close', 'volume'],
  };

  try {
    const data = await sendRequest(url, headers, {
      method: 'POST',
      payload,
      showLog: true,
    });
    console.log('Received data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Implementation Details

### Error Handling

The client utility provides consistent error handling across the package. It catches request exceptions, logs appropriate error messages, and raises a standardized `ConnectionError` with a descriptive message that includes:

1. The nature of the error
2. The HTTP status code (if available)
3. Error details from the original exception

### Logging

The client includes optional logging functionality that can be enabled with the `show_log` parameter:

1. Before sending the request, it logs the request method, URL, parameters, and payload
2. After receiving the response, it logs the response status code
3. If an error occurs, it logs detailed error information

### Request Timeouts

The client implements request timeouts to prevent applications from hanging indefinitely if a server is unresponsive. The TypeScript implementation adds timeout logic using:

- `AbortController` with the native fetch API
- The `timeout` option in axios

### Content Type Handling

The Python implementation automatically handles JSON serialization for:

- Converting Python dictionaries to JSON strings for request payloads
- Parsing JSON response data to Python dictionaries

The TypeScript implementation similarly handles JSON data, with automatic parsing and stringification as needed.

## Dependencies

### Python Dependencies

- `requests`: For making HTTP requests
- `json`: For JSON serialization and deserialization
- `typing`: For type annotations
- `vnstock.core.utils.logger`: For logging

### TypeScript Dependencies

- Native `fetch` API or `axios` library: For making HTTP requests
- Custom `Logger` implementation: For logging
- `ConnectionError` class: For consistent error handling

## Implementation Notes

1. **Request Method Support**: Both implementations support GET and POST methods, which cover most API interaction needs.

2. **Parameter Handling**: URL query parameters are automatically encoded in both implementations.

3. **Error Categorization**: The TypeScript implementation enhances error categorization to distinguish between different types of failures:

   - Timeout errors (408)
   - Server-side errors (5xx)
   - Client-side errors (4xx)
   - Network errors

4. **Content Type**: The implementations assume JSON as the content format for both request payloads and responses.

5. **TypeScript Options Object**: The TypeScript implementation uses an options object pattern for better readability and parameter flexibility.

6. **Retries**: Neither implementation includes automatic retry logic. If needed, retry functionality should be implemented at a higher level, possibly using a library like `tenacity` (Python) or `async-retry` (TypeScript).
