# Connector Module Implementation

**Original Python Implementation**: [__init__.py](/vnstock/connector/__init__.py)


## Overview

The Connector module provides integration with external trading platforms, brokers, and financial services, enabling direct interaction with market infrastructure. Unlike the Explorer module which focuses on data retrieval, the Connector module handles bidirectional communication with trading platforms, including authentication, order placement, and account management.

## Purpose

The Connector module serves several key purposes:

1. **Trading Integration**: Enables placing orders, managing positions, and executing trades
2. **Authentication**: Handles secure authentication with trading platforms
3. **Account Management**: Provides access to account information and portfolio data
4. **Market Orders**: Facilitates the creation and submission of various order types
5. **Execution Reporting**: Tracks and reports on order execution status

## Structure

The Connector module is organized by trading platform:

```
connector/
└── dnse/      - DNSE trading platform connector
    ├── index.md - DNSE module documentation
    └── trade.md - DNSE trading functionality documentation
```

Additional connectors may be added for other trading platforms in the future.

### DNSE Connector

The DNSE connector provides integration with the DNSE trading platform:

- Authentication and session management
- Order placement and cancellation
- Account and position information
- Cash balance and margin status
- Order history and execution reports

## TypeScript Implementation

In the TypeScript implementation, the Connector module abstracts the complexity of trading platform APIs while providing a type-safe interface.

### Common Interface

All trading connectors should implement a common interface to ensure consistency:

```typescript
/**
 * Interface for trading platform connectors
 */
export interface TradingConnector {
  /**
   * Authenticate with the trading platform
   * @param credentials Authentication credentials
   */
  authenticate(credentials: AuthCredentials): Promise<AuthResponse>;

  /**
   * Place an order with the trading platform
   * @param order Order details
   */
  placeOrder(order: OrderRequest): Promise<OrderResponse>;

  /**
   * Cancel an existing order
   * @param orderId ID of the order to cancel
   */
  cancelOrder(orderId: string): Promise<CancelResponse>;

  /**
   * Get account information
   */
  getAccountInfo(): Promise<AccountInfo>;

  /**
   * Get current positions
   */
  getPositions(): Promise<Position[]>;

  /**
   * Get order history
   * @param options Filter options
   */
  getOrderHistory(options?: HistoryOptions): Promise<Order[]>;
}
```

### DNSE Implementation

The DNSE implementation follows this interface:

```typescript
/**
 * DNSE trading platform connector
 */
export class DNSEConnector implements TradingConnector {
  private baseUrl: string;
  private session: Session | null = null;

  /**
   * Create a new DNSE connector
   * @param config Configuration options
   */
  constructor(config: DNSEConfig) {
    this.baseUrl = config.baseUrl || 'https://api.dnse.com.vn';
  }

  /**
   * Authenticate with DNSE platform
   * @param credentials Authentication credentials
   */
  async authenticate(credentials: DNSECredentials): Promise<AuthResponse> {
    // Implementation details
  }

  /**
   * Place an order with DNSE
   * @param order Order details
   */
  async placeOrder(order: DNSEOrderRequest): Promise<OrderResponse> {
    // Implementation details
  }

  // Additional method implementations
}
```

## Security Considerations

The Connector module handles sensitive information and operations, requiring special attention to security:

1. **Credential Management**: Secure handling of authentication credentials
2. **Session Security**: Proper management of authentication sessions
3. **Transport Security**: Ensuring all communication uses secure protocols (HTTPS)
4. **Error Handling**: Proper handling of errors without leaking sensitive information
5. **Rate Limiting**: Respecting platform rate limits to avoid account lockouts

## Usage Examples

The Connector module can be used to interact with trading platforms:

```typescript
import { DNSEConnector } from 'vnstock/connector/dnse';

async function tradingExample() {
  // Create and configure the connector
  const connector = new DNSEConnector({
    baseUrl: 'https://api.dnse.com.vn',
  });

  // Authenticate with the platform
  await connector.authenticate({
    username: 'your_username',
    password: 'your_password',
    // Additional authentication factors if required
  });

  // Get account information
  const account = await connector.getAccountInfo();
  console.log(`Account balance: ${account.balance}`);

  // Place a buy order
  const orderResult = await connector.placeOrder({
    symbol: 'VNM',
    side: 'BUY',
    type: 'LIMIT',
    quantity: 100,
    price: 80.5,
    timeInForce: 'DAY',
  });

  console.log(`Order placed with ID: ${orderResult.orderId}`);

  // Get current positions
  const positions = await connector.getPositions();
  positions.forEach((position) => {
    console.log(
      `${position.symbol}: ${position.quantity} shares at avg. price ${position.averagePrice}`
    );
  });
}
```

## Dependencies

The Connector module has the following dependencies:

1. Core utilities for HTTP requests, authentication, and error handling
2. Secure storage for credentials (if applicable)
3. Logging utilities for tracking API communication
4. Configuration management for platform settings

## Implementation Notes

When implementing the Connector module in TypeScript:

1. Use TypeScript interfaces to define clear contracts for each API
2. Implement proper error handling for network issues and API errors
3. Use secure credential management practices
4. Consider implementing retry logic for transient failures
5. Provide detailed logging for troubleshooting (without sensitive information)

## References

For detailed implementation of specific connectors, refer to their respective documentation:

- [DNSE Connector](./dnse/index.md)
