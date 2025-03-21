# DNSE Trading Connector Module

## Overview

The DNSE Trading Connector Module provides a comprehensive interface for interacting with DNSE's trading API. It enables users to authenticate, manage accounts, check balances, place and manage orders, and retrieve transaction information. This module is designed for traders and applications requiring programmatic access to DNSE's trading platform.

## Component Structure

```
connector/dnse/
└── trade.py         # Trading API implementation for DNSE
   └── Trade         # Main trading class for DNSE API integration
      ├── __init__   # Initializes the Trade class with token placeholders
      ├── login      # Authenticates user and obtains JWT token
      ├── account    # Retrieves user profile information
      ├── sub_accounts  # Gets list of sub-accounts
      ├── account_balance  # Retrieves account balance for a sub-account
      ├── email_otp  # Triggers email OTP request
      ├── get_trading_token  # Authenticates with OTP and gets trading token
      ├── loan_packages  # Retrieves loan packages for a sub-account
      ├── trade_capacities  # Gets buying/selling capacity for a specific stock
      ├── place_order  # Places stock or derivative order
      ├── order_list  # Retrieves list of orders
      ├── order_detail  # Gets details of a specific order
      ├── cancel_order  # Cancels an existing order
      └── deals_list  # Retrieves list of trade transactions
```

## Python Implementation

The DNSE Trading connector is implemented as a class with authentication and trading methods:

```python
import requests
import json
import pandas as pd
from pandas import json_normalize
from typing import Optional

class Trade:
    def __init__(self):
        self.token: Optional[str] = None
        self.trading_token: Optional[str] = None

    def login(self, user_name: str, password: str) -> Optional[str]:
        """
        Authenticate the user and obtain a JWT token for further API requests.

        Args:
            user_name (str): DNSE username. Can be 064CXXXXX, your email, or your phone number.
            password (str): Your DNSE password.

        Returns:
            Optional[str]: JWT token if authentication is successful, None otherwise.
        """
        # Implementation details for login...

    def account(self) -> Optional[pd.DataFrame]:
        """
        Get the full user profile from DNSE.

        Returns:
            Optional[pd.DataFrame]: A DataFrame containing the user profile if successful, None otherwise.
        """
        # Implementation details for account...

    # Additional methods for trading operations...
```

## TypeScript Implementation

The TypeScript implementation follows a similar structure, with strong typing for parameters and return values:

```typescript
import axios, { AxiosResponse } from 'axios';

interface TokenResponse {
  token: string;
}

interface AccountResponse {
  // Account details interface
}

interface OrderResponse {
  // Order details interface
}

class Trade {
  private token: string | null = null;
  private tradingToken: string | null = null;

  async login(userName: string, password: string): Promise<string | null> {
    const url = 'https://services.entrade.com.vn/dnse-user-service/api/auth';
    const payload = { username: userName, password: password };

    try {
      const response = await axios.post<TokenResponse>(url, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.status === 200) {
        console.log('Login successfully');
        this.token = response.data.token;
        return this.token;
      } else {
        console.log(`Login failed: ${response.statusText}`);
        return null;
      }
    } catch (error) {
      console.error(
        `Login error: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  // Additional methods with TypeScript implementation...
}
```

## Authentication Flow

The authentication process for DNSE Trading API follows these steps:

1. **Initial Authentication**:

   - Call `login()` with username and password
   - Receive and store JWT token

2. **Trading Authentication**:

   - (Optional) Request OTP via `email_otp()`
   - Authenticate with OTP using `get_trading_token()`
   - Receive and store trading token for order operations

3. **Session Management**:
   - Both tokens are stored in the instance
   - All subsequent API calls utilize these tokens

## Order Management Methods

### Retrieving Order Information

```typescript
// Get list of orders
async orderList(subAccount: string, assetType: 'stock' | 'derivative' = 'stock'): Promise<OrderList | null> {
  // Implementation details...
}

// Get order details
async orderDetail(orderId: string, subAccount: string, assetType: 'stock' | 'derivative' = 'stock'): Promise<OrderDetail | null> {
  // Implementation details...
}
```

### Placing and Canceling Orders

```typescript
// Place an order
async placeOrder(
  subAccount: string,
  symbol: string,
  side: 'buy' | 'sell',
  quantity: number,
  price: number,
  orderType: string,
  loanPackageId: number | null,
  assetType: 'stock' | 'derivative' = 'stock'
): Promise<OrderResponse | null> {
  // Implementation details...
}

// Cancel an order
async cancelOrder(
  orderId: string,
  subAccount: string,
  assetType: 'stock' | 'derivative' = 'stock'
): Promise<CancelResponse | null> {
  // Implementation details...
}
```

## Usage Examples

### Python Example

```python
from vnstock.connector.dnse.trade import Trade

# Initialize Trade object
trade = Trade()

# Login and authenticate
token = trade.login("your_username", "your_password")
if token:
    # Get account information
    profile = trade.account()
    print(profile)

    # Get sub-accounts
    sub_accounts = trade.sub_accounts()
    if not sub_accounts.empty:
        sub_account_no = sub_accounts.iloc[0]["accountNo"]

        # Get account balance
        balance = trade.account_balance(sub_account_no)
        print(f"Balance: {balance}")

        # Request OTP and get trading token
        trade.email_otp()
        otp_code = input("Enter OTP received via email: ")
        trading_token = trade.get_trading_token(otp_code, smart_otp=False)

        if trading_token:
            # Place an order
            order_result = trade.place_order(
                sub_account=sub_account_no,
                symbol="VNM",
                side="buy",
                quantity=100,
                price=80000,
                order_type="LO",
                loan_package_id=None,
                asset_type="stock"
            )

            if order_result is not None:
                order_id = order_result.iloc[0]["orderId"]
                print(f"Order placed with ID: {order_id}")

                # Check order details
                order_detail = trade.order_detail(order_id, sub_account_no)
                print(order_detail)

                # Cancel the order
                cancel_result = trade.cancel_order(order_id, sub_account_no)
                print(f"Order cancelled: {cancel_result}")
```

### TypeScript Example

```typescript
import { Trade } from './connector/dnse/trade';

async function tradeExample() {
  // Initialize Trade object
  const trade = new Trade();

  try {
    // Login and authenticate
    const token = await trade.login('your_username', 'your_password');
    if (!token) {
      console.error('Authentication failed');
      return;
    }

    // Get account information
    const profile = await trade.account();
    console.log('Profile:', profile);

    // Get sub-accounts
    const subAccounts = await trade.subAccounts();
    if (!subAccounts || subAccounts.length === 0) {
      console.error('No sub-accounts found');
      return;
    }

    const subAccountNo = subAccounts[0].accountNo;

    // Get account balance
    const balance = await trade.accountBalance(subAccountNo);
    console.log(`Balance:`, balance);

    // Request OTP and get trading token
    await trade.emailOtp();
    const otpCode = prompt('Enter OTP received via email:');
    if (!otpCode) return;

    const tradingToken = await trade.getTradingToken(otpCode, false);
    if (!tradingToken) {
      console.error('Failed to get trading token');
      return;
    }

    // Place an order
    const orderResult = await trade.placeOrder({
      subAccount: subAccountNo,
      symbol: 'VNM',
      side: 'buy',
      quantity: 100,
      price: 80000,
      orderType: 'LO',
      loanPackageId: null,
      assetType: 'stock',
    });

    if (orderResult) {
      const orderId = orderResult.orderId;
      console.log(`Order placed with ID: ${orderId}`);

      // Check order details
      const orderDetail = await trade.orderDetail(orderId, subAccountNo);
      console.log('Order details:', orderDetail);

      // Cancel the order
      const cancelResult = await trade.cancelOrder(orderId, subAccountNo);
      console.log('Order cancelled:', cancelResult);
    }
  } catch (error) {
    console.error('Error in trading example:', error);
  }
}
```

## Implementation Details

### Data Flow

1. **Authentication**:

   - User credentials → API → JWT token
   - OTP authentication → API → Trading token

2. **Account Operations**:

   - JWT token → API → Account/profile data
   - JWT token → API → Sub-accounts data
   - JWT token + Sub-account → API → Balance data

3. **Trading Operations**:
   - JWT token + Trading token → API → Order placement/cancellation
   - JWT token → API → Order list/details

### Error Handling

The module implements comprehensive error handling:

- All API calls are wrapped in try-catch blocks
- HTTP error status codes are properly handled and logged
- Failed operations return `null` or empty results
- Error messages are displayed for debugging purposes

### Caching Strategy

- Tokens are cached in the instance for the duration of the session
- No persistent caching is implemented for security reasons
- Fresh data is retrieved for each API call to ensure accuracy

## Dependencies

### Python Implementation

- `requests`: For HTTP requests to the API
- `pandas`: For data manipulation and DataFrame creation
- `json`: For serializing and deserializing JSON data
- `typing`: For type hints in Python

### TypeScript Implementation

- `axios`: For HTTP requests to the API
- TypeScript type interfaces for request/response objects
- `dayjs` (recommended): For date manipulation and formatting
- Optional `form-data` for file uploads if needed

## Security Considerations

1. **Credential Management**:

   - Never store passwords or tokens in client-side storage
   - Use secure credential storage methods
   - Consider using environment variables for sensitive information

2. **Token Handling**:

   - Implement token expiration handling
   - Use HTTPS for all API communications
   - Clear tokens when the session ends

3. **OTP Security**:
   - Implement proper validation for OTP inputs
   - Use secure channels for OTP transmission
   - Add rate limiting for OTP requests
