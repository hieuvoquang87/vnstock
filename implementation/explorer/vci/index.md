# VCI Explorer Implementation

**Original Python Implementation**: [__init__.py](/vnstock/explorer/vci/__init__.py)


## Overview

The VCI Explorer module provides access to financial data from the VCI (VietCapital) data source, one of the primary brokers in the Vietnamese market. This module enables retrieval of stock quotes, company information, financial data, trading statistics, and other market information through the VCI API.

## Purpose

The VCI Explorer serves several key purposes:

1. **Market Data Access**: Provides access to real-time and historical market data
2. **Company Research**: Enables retrieval of company profiles and fundamental information
3. **Financial Analysis**: Facilitates access to financial statements and ratios
4. **Trading Statistics**: Provides trading volume, foreign flows, and other market activity data
5. **Technical Analysis**: Offers access to price data suitable for technical analysis

## Structure

The VCI Explorer is organized into several components:

```
explorer/vci/
├── analysis.md     - Technical analysis functionality
├── company.md      - Company information retrieval
├── const.md        - Constants and configuration
├── financial.md    - Financial data and ratios
├── listing.md      - Stock listings and market data
├── models.md       - Data validation models
├── quote.md        - Price and quote data
├── stock.md        - Stock component integration
└── trading.md      - Trading data and statistics
```

## Data Flow

The VCI Explorer components follow a consistent data flow pattern:

1. **Input Validation**: User inputs are validated using models
2. **Request Preparation**: API requests are prepared with necessary parameters
3. **API Communication**: Requests are sent to VCI endpoints
4. **Response Handling**: Responses are parsed and transformed
5. **Data Transformation**: Data is converted into standardized formats
6. **Error Handling**: Errors are caught and processed appropriately

## TypeScript Implementation

In the TypeScript implementation, the VCI Explorer is structured as a modular set of classes and functions.

### Module Structure

```typescript
// Main explorer class for VCI
export class VCIExplorer implements DataExplorer {
  private client: HttpClient;
  private baseUrl: string;

  constructor(config?: VCIConfig) {
    this.baseUrl = config?.baseUrl || 'https://api.vci.com.vn';
    this.client = new HttpClient(config?.httpOptions);
  }

  // Factory methods for creating component instances
  quote(symbol: string): QuoteComponent {
    return new VCIQuoteComponent(symbol, this.client, this.baseUrl);
  }

  company(symbol: string): CompanyComponent {
    return new VCICompanyComponent(symbol, this.client, this.baseUrl);
  }

  financial(symbol: string): FinancialComponent {
    return new VCIFinancialComponent(symbol, this.client, this.baseUrl);
  }

  // Additional factory methods...
}
```

### Component Classes

Each functional area is implemented as a component class:

```typescript
// Example of a component implementation
export class VCIQuoteComponent implements QuoteComponent {
  constructor(
    private symbol: string,
    private client: HttpClient,
    private baseUrl: string
  ) {}

  /**
   * Get real-time quote data for a symbol
   */
  async getRealtime(): Promise<QuoteData> {
    try {
      const endpoint = `${this.baseUrl}/quote/realtime`;
      const response = await this.client.get(endpoint, {
        params: { symbol: this.symbol },
      });

      return transformQuoteResponse(response.data);
    } catch (error) {
      handleApiError(error, 'VCI Quote Realtime');
      throw error;
    }
  }

  /**
   * Get historical price data for a symbol
   */
  async getHistory(options: HistoryOptions): Promise<HistoricalData[]> {
    // Implementation details
  }

  // Additional methods...
}
```

## API Endpoints

The VCI Explorer interacts with several API endpoints:

| Endpoint           | Description                      | Component |
| ------------------ | -------------------------------- | --------- |
| `/stock/quote`     | Real-time and historical quotes  | Quote     |
| `/stock/company`   | Company profiles and information | Company   |
| `/stock/financial` | Financial statements and ratios  | Financial |
| `/stock/trading`   | Trading activity and statistics  | Trading   |
| `/stock/listing`   | Market listings and symbols      | Listing   |

## Authentication

Most VCI endpoints do not require authentication for basic data access. However, some advanced features may require API keys or authentication:

```typescript
// Example of authenticated request
async function getAdvancedData(
  symbol: string,
  apiKey: string
): Promise<AdvancedData> {
  const client = new HttpClient({
    headers: {
      'X-API-KEY': apiKey,
    },
  });

  const response = await client.get('/advanced-data', {
    params: { symbol },
  });

  return response.data;
}
```

## Error Handling

The VCI Explorer implements centralized error handling:

```typescript
/**
 * Handle API errors from VCI endpoints
 * @param error The error object from the HTTP client
 * @param context The context where the error occurred
 */
export function handleApiError(error: any, context: string): never {
  const logger = getLogger('VCIExplorer');

  if (axios.isAxiosError(error)) {
    // Handle HTTP errors
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 429) {
      logger.warn(`Rate limit exceeded in ${context}`);
      throw new RateLimitError('VCI API rate limit exceeded', error);
    } else if (status === 404) {
      logger.error(`Resource not found in ${context}: ${error.config?.url}`);
      throw new ResourceNotFoundError('Resource not found', error);
    } else {
      logger.error(
        `API error in ${context}: ${status} - ${JSON.stringify(data)}`
      );
      throw new ApiError(`VCI API error: ${status}`, error);
    }
  } else {
    // Handle non-HTTP errors
    logger.error(`Non-HTTP error in ${context}: ${error.message}`);
    throw new ApiError('VCI API error', error);
  }
}
```

## Usage Examples

The VCI Explorer can be used as follows:

```typescript
import { VCIExplorer } from 'vnstock/explorer/vci';

async function getStockData() {
  // Create an explorer instance
  const explorer = new VCIExplorer();

  // Get quote data
  const quoteData = await explorer.quote('VNM').getRealtime();
  console.log(`Current price: ${quoteData.price}`);

  // Get company information
  const companyInfo = await explorer.company('VNM').getProfile();
  console.log(`Company name: ${companyInfo.name}`);

  // Get financial ratios
  const ratios = await explorer.financial('VNM').getRatios({
    period: 'quarterly',
    limit: 4,
  });
  console.log(`Latest P/E ratio: ${ratios[0].pe}`);
}
```

## References

For detailed information about specific components, refer to:

- [Quote Component](./quote.md)
- [Company Component](./company.md)
- [Financial Component](./financial.md)
- [Trading Component](./trading.md)
- [Listing Component](./listing.md)
- [Analysis Component](./analysis.md)
- [Stock Component](./stock.md)
- [Models and Validation](./models.md)
- [Constants and Configuration](./const.md)
