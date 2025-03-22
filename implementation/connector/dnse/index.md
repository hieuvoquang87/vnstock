# DNSE Connector Implementation

**Original Python Implementation**: [__init__.py](/vnstock/connector/dnse/__init__.py)


## Overview

The DNSE Connector provides integration with the DNSE (Direct Network Stock Exchange) trading platform, allowing users to perform real-time trading operations programmatically. This connector enables authentication, order placement, account management, and execution tracking through the DNSE API.

## Purpose

The DNSE Connector serves several key purposes:

1. **Trading Automation**: Enables algorithmic trading through the DNSE platform
2. **Portfolio Management**: Provides programmatic access to account positions and balances
3. **Order Execution**: Facilitates placing, modifying, and canceling orders
4. **Market Access**: Enables participation in the Vietnamese stock market
5. **Integration Layer**: Serves as an abstraction layer over the DNSE API

## Features

The DNSE Connector provides the following key features:

### Authentication

- Secure login and session management
- Two-factor authentication support (if required)
- Token management and renewal
- Credential security and encryption

### Order Management

- Market, limit, and stop order placement
- Order modification and cancellation
- Order status tracking and notifications
- Conditional order types

### Account Information

- Cash balance and buying power
- Position details and profit/loss tracking
- Transaction history and statements
- Fee calculation and reporting

### Market Data Access

- Real-time price quotes for trading decisions
- Market depth and order book information
- Historical order execution data
- Market session status and trading hours

## TypeScript Implementation

The DNSE Connector is implemented as a class that implements the TradingConnector interface:

```typescript
import {
  TradingConnector,
  AuthCredentials,
  OrderRequest,
  Position,
} from '../trading-connector';

/**
 * DNSE trading platform connector
 */
export class DNSEConnector implements TradingConnector {
  private baseUrl: string;
  private apiKey: string | null = null;
  private sessionToken: string | null = null;
  private logger: Logger;

  /**
   * Create a new DNSE connector instance
   * @param config Configuration options for the connector
   */
  constructor(config: DNSEConnectorConfig) {
    this.baseUrl = config.baseUrl || 'https://api.dnse.com.vn';
    this.apiKey = config.apiKey || null;
    this.logger = getLogger('DNSEConnector');
  }

  /**
   * Authenticate with the DNSE platform
   * @param credentials Authentication credentials
   * @returns Authentication response with session information
   */
  async authenticate(credentials: DNSECredentials): Promise<DNSEAuthResponse> {
    this.logger.info('Authenticating with DNSE');

    try {
      const response = await sendRequest<DNSEAuthResponse>(
        `${this.baseUrl}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey || '',
          },
          body: JSON.stringify(credentials),
        }
      );

      this.sessionToken = response.token;
      this.logger.info('Authentication successful');

      return response;
    } catch (error) {
      this.logger.error('Authentication failed', error);
      throw new DNSEAuthenticationError(
        'Failed to authenticate with DNSE',
        error
      );
    }
  }

  // Additional method implementations...
}
```

## Authentication Flow

The authentication flow for the DNSE platform works as follows:

1. **Initial Authentication**: Client calls `authenticate()` with credentials
2. **Token Generation**: DNSE API validates credentials and returns a session token
3. **Token Storage**: Connector stores session token for subsequent API calls
4. **Token Renewal**: Connector automatically renews token when it expires
5. **Token Invalidation**: Session is closed on logout or session expiration

## Error Handling

The DNSE Connector implements comprehensive error handling:

- **Network Errors**: Detect and handle connectivity issues
- **Authentication Errors**: Handle invalid credentials and session expiration
- **API Errors**: Parse and handle platform-specific error codes
- **Rate Limit Errors**: Implement backoff strategies for rate limiting
- **Custom Error Types**: Provide specific error classes for different scenarios

## Usage Examples

```typescript
import { DNSEConnector } from 'vnstock/connector/dnse';

async function tradingExample() {
  // Initialize connector
  const connector = new DNSEConnector({
    baseUrl: 'https://api.dnse.com.vn',
    apiKey: 'YOUR_API_KEY',
  });

  try {
    // Authenticate
    await connector.authenticate({
      username: 'your_username',
      password: 'your_password',
    });

    // Get account information
    const accountInfo = await connector.getAccountInfo();
    console.log(`Available balance: ${accountInfo.availableBalance} VND`);

    // Place a buy order
    const orderResult = await connector.placeOrder({
      symbol: 'VNM',
      side: 'BUY',
      type: 'LIMIT',
      quantity: 100,
      price: 80000,
      timeInForce: 'DAY',
    });

    console.log(`Order placed: ${orderResult.orderId}`);

    // Monitor order status
    const orderStatus = await connector.getOrderStatus(orderResult.orderId);
    console.log(`Order status: ${orderStatus.status}`);
  } catch (error) {
    console.error('Error in trading flow:', error);
  }
}
```

## Security Considerations

When using the DNSE Connector, consider these security best practices:

1. **Secure Credentials**: Never hardcode credentials in source code
2. **Environment Variables**: Use environment variables or secure vaults for sensitive data
3. **HTTPS Only**: Always use secure connections for API communications
4. **Token Management**: Properly handle and store session tokens
5. **Minimal Permissions**: Use the principle of least privilege for API keys

## Implementation Notes

When implementing or extending the DNSE Connector:

1. Follow the established error handling patterns
2. Use the logging infrastructure for troubleshooting
3. Respect rate limits to avoid account restrictions
4. Consider implementing circuit breakers for API stability
5. Use proper TypeScript typing for all methods and properties

## References

For detailed information about specific trading functionality, refer to:

- [Trading Implementation](./trade.md)
