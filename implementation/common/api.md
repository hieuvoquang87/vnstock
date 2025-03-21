# Implementation of API Utilities

## Overview

The API Utilities module provides a centralized approach to handle API requests and responses across the vnstock library. It abstracts the complexity of making HTTP requests, handling errors, processing responses, and managing request configurations. These utilities serve as the foundation for all data source integrations in the vnstock ecosystem.

Key features of the API Utilities module include:

1. Unified request handling across all data sources
2. Consistent error handling and logging
3. Request configuration management
4. Support for various HTTP methods (GET, POST)
5. Timeout management and connection error handling
6. Request/response logging for debugging
7. JSON parsing and validation

## Component Structure

The API Utilities module is structured around the core `send_request` function, which serves as the central point for making API requests:

```
API Utilities
├── send_request() - Core function for making HTTP requests
│   ├── Request Configuration
│   │   ├── URL handling
│   │   ├── Method selection (GET/POST)
│   │   ├── Headers management
│   │   ├── Parameter handling
│   │   └── Payload processing
│   │
│   ├── Request Execution
│   │   ├── Connection management
│   │   ├── Timeout handling
│   │   └── Response capture
│   │
│   └── Response Processing
│       ├── Status code validation
│       ├── JSON parsing
│       ├── Error handling
│       └── Response formatting
│
└── Supporting components
    ├── get_headers() - Generate appropriate request headers
    └── logger - Logging utilities for request/response tracking
```

## Python Implementation

### Core Send Request Function

The core of the API Utilities module is the `send_request` function, which handles all aspects of making an API request:

```python
def send_request(url: str, headers: Dict[str, str], method: str = "GET",
                 params: Optional[Dict] = None, payload: Optional[Dict] = None,
                 show_log: bool = False, timeout: int = 30) -> Dict[str, Any]:
    """Centralized function for making API requests with consistent error handling.

    Parameters
    ----------
    url : str
        The URL to make the request to
    headers : Dict[str, str]
        Dictionary of HTTP headers to send with the request
    method : str, optional
        HTTP method to use ('GET' or 'POST'), by default "GET"
    params : Optional[Dict], optional
        URL parameters for GET requests, by default None
    payload : Optional[Dict], optional
        JSON payload for POST requests, by default None
    show_log : bool, optional
        Whether to log request and response details, by default False
    timeout : int, optional
        Request timeout in seconds, by default 30

    Returns
    -------
    Dict[str, Any]
        The parsed JSON response from the API

    Raises
    ------
    ConnectionError
        If the request fails or returns a non-200 status code
    """
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

### Header Utilities

The API Utilities also include functions for generating appropriate request headers:

```python
def get_headers(data_source: str = "vci", random_agent: bool = False) -> Dict[str, str]:
    """Generate appropriate headers for the specified data source.

    Parameters
    ----------
    data_source : str, optional
        The data source to generate headers for, by default "vci"
    random_agent : bool, optional
        Whether to use a random user agent string, by default False

    Returns
    -------
    Dict[str, str]
        Dictionary of HTTP headers
    """
    headers = {
        "Content-Type": "application/json",
        "User-Agent": get_random_user_agent() if random_agent else DEFAULT_USER_AGENT
    }

    # Add data source specific headers
    if data_source.lower() == "tcbs":
        headers["Authorization"] = "Bearer null"
    elif data_source.lower() == "vci":
        headers["Referer"] = "https://vci.vn/"
    elif data_source.lower() == "fmarket":
        headers["Referer"] = "https://fmarket.vn/"

    return headers
```

## TypeScript Implementation

### Core Send Request Function

The TypeScript implementation provides similar functionality with a more modern, Promise-based approach:

```typescript
/**
 * Request options for sending HTTP requests
 */
interface RequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  payload?: any;
  params?: Record<string, any>;
  timeout?: number;
  showLog?: boolean;
}

/**
 * Send an HTTP request with the specified options
 * @param options - Request options
 * @returns Promise with response data
 */
export async function sendRequest<T>(options: RequestOptions): Promise<T> {
  const {
    url,
    method = 'GET',
    headers = {},
    payload,
    params,
    timeout = 30000,
    showLog = false,
  } = options;

  if (showLog) {
    logger.info(`Sending ${method} request to ${url}`);
    if (payload) {
      logger.debug(`Request payload: ${JSON.stringify(payload)}`);
    }
  }

  try {
    const response = await axios({
      method,
      url,
      headers,
      data: payload,
      params,
      timeout,
    });

    if (showLog) {
      logger.info(
        `Received response from ${url} with status ${response.status}`
      );
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error(
        `Request failed: ${error.message} (${
          error.response?.status || 'unknown status'
        })`
      );
      if (error.response) {
        logger.debug(`Response data: ${JSON.stringify(error.response.data)}`);
      }
    } else {
      logger.error(`Request failed with error: ${error}`);
    }
    throw error;
  }
}
```

### Header Utilities

The TypeScript implementation also includes header generation utilities:

```typescript
/**
 * Generate appropriate headers for a specific data source
 *
 * @param dataSource - The data source to generate headers for
 * @param randomAgent - Whether to use a random user agent
 * @returns Headers object for API requests
 */
export function getHeaders(
  dataSource: string = 'vci',
  randomAgent: boolean = false
): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': randomAgent ? getRandomUserAgent() : DEFAULT_USER_AGENT,
  };

  // Add data source specific headers
  switch (dataSource.toLowerCase()) {
    case 'tcbs':
      headers['Authorization'] = 'Bearer null';
      break;
    case 'vci':
      headers['Referer'] = 'https://vci.vn/';
      break;
    case 'fmarket':
      headers['Referer'] = 'https://fmarket.vn/';
      break;
  }

  return headers;
}
```

## Usage Examples

### Python Examples

#### Basic GET Request

```python
from vnstock.core.utils.client import send_request
from vnstock.core.utils.user_agent import get_headers

# Make a simple GET request
url = "https://api.example.com/data"
headers = get_headers(data_source="vci")
response = send_request(url, headers=headers)

print(f"Received data: {response}")
```

#### POST Request with Payload

```python
from vnstock.core.utils.client import send_request
from vnstock.core.utils.user_agent import get_headers

# Make a POST request with payload
url = "https://api.example.com/submit"
headers = get_headers(data_source="tcbs")
payload = {
    "symbol": "VNM",
    "from_date": "2023-01-01",
    "to_date": "2023-12-31"
}

response = send_request(
    url,
    headers=headers,
    method="POST",
    payload=payload,
    show_log=True
)

print(f"Received data: {response}")
```

#### Handling Errors

```python
from vnstock.core.utils.client import send_request
from vnstock.core.utils.user_agent import get_headers

# Handle potential errors
url = "https://api.example.com/data"
headers = get_headers()

try:
    response = send_request(url, headers=headers, timeout=5)
    print(f"Received data: {response}")
except ConnectionError as e:
    print(f"Request failed: {str(e)}")
    # Implement fallback or retry logic
```

### TypeScript Examples

#### Basic GET Request

```typescript
import { sendRequest } from 'vnstock-ts/core/utils/client';
import { getHeaders } from 'vnstock-ts/core/utils/user_agent';

// Make a simple GET request
async function fetchData() {
  try {
    const headers = getHeaders('vci');
    const response = await sendRequest<any>({
      url: 'https://api.example.com/data',
      headers,
    });

    console.log('Received data:', response);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchData();
```

#### POST Request with Payload

```typescript
import { sendRequest } from 'vnstock-ts/core/utils/client';
import { getHeaders } from 'vnstock-ts/core/utils/user_agent';

// Make a POST request with payload
async function submitData() {
  try {
    const headers = getHeaders('tcbs');
    const payload = {
      symbol: 'VNM',
      fromDate: '2023-01-01',
      toDate: '2023-12-31',
    };

    const response = await sendRequest<any>({
      url: 'https://api.example.com/submit',
      method: 'POST',
      headers,
      payload,
      showLog: true,
    });

    console.log('Received data:', response);
  } catch (error) {
    console.error('Error submitting data:', error);
  }
}

submitData();
```

#### Using with Timeout and Error Handling

```typescript
import { sendRequest } from 'vnstock-ts/core/utils/client';
import { getHeaders } from 'vnstock-ts/core/utils/user_agent';

// Handle request with timeout and error handling
async function fetchDataWithTimeout() {
  try {
    const headers = getHeaders();
    const response = await sendRequest<any>({
      url: 'https://api.example.com/data',
      headers,
      timeout: 5000, // 5 seconds
    });

    return response;
  } catch (error) {
    console.error('Error fetching data:', error);

    // Implement fallback or retry logic
    return null;
  }
}

fetchDataWithTimeout();
```

## Implementation Details

### Error Handling

The API Utilities module implements a comprehensive error handling strategy:

1. **HTTP Status Validation**: Checks response status codes and raises appropriate errors
2. **Network Error Handling**: Catches and processes network-related errors
3. **Timeout Management**: Allows configurable timeouts to prevent hanging requests
4. **JSON Parsing Errors**: Handles failures in JSON parsing
5. **Detailed Error Messages**: Provides context-rich error messages for debugging

### Logging Strategy

The module integrates with the vnstock logging system to provide visibility into API requests:

1. **Configurable Verbosity**: The `show_log` parameter controls logging detail
2. **Request Logging**: Logs request URLs, methods, headers, and payloads
3. **Response Logging**: Logs response status codes and basic metadata
4. **Error Logging**: Detailed logging of errors with stack traces when appropriate

### Headers Management

The API Utilities module provides header management to handle different data sources:

1. **Source-Specific Headers**: Customizes headers based on data source requirements
2. **User-Agent Handling**: Manages user agent strings, optionally randomizing them
3. **Content-Type Management**: Sets appropriate content types for requests

### Timeout Strategy

The module implements timeout handling to prevent hanging requests:

1. **Default Timeout**: Conservative default of 30 seconds
2. **Configurable Timeout**: Allows customization per request
3. **Timeout Error Handling**: Proper error reporting for timeout failures

## Dependencies

### Python Dependencies

- `requests`: HTTP client for making API requests
- `json`: For JSON parsing and serialization
- Custom utilities:
  - `logger`: For logging request and response information
  - `user_agent`: For generating appropriate user agent strings

### TypeScript Dependencies

- `axios`: Modern HTTP client for making API requests
- Custom utilities:
  - `logger`: For logging request and response information
  - `user_agent`: For generating appropriate user agent strings

## Implementation Notes

1. **Centralized Request Handling**: All API requests flow through the `send_request` function, ensuring consistent behavior
2. **Error Normalization**: Converts various error types to a consistent format
3. **Connection Resilience**: Implements proper timeout handling to prevent hanging requests
4. **Error Context**: Provides detailed error messages for troubleshooting
5. **Flexible Configuration**: Allows customization of headers, methods, payloads, and other request parameters
6. **Consistent Interface**: Maintains a consistent interface between Python and TypeScript implementations
7. **Type Safety**: TypeScript implementation leverages generic types for better type safety
8. **Debugging Support**: Comprehensive logging helps with debugging API-related issues
9. **Data Source Abstraction**: Handles the specific requirements of different data sources
10. **Response Processing**: Standardizes response handling and validation
