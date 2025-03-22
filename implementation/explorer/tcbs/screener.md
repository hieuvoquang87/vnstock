# TCBS Stock Screener Implementation

**Original Python Implementation**: [screener.py](/vnstock/explorer/tcbs/screener.py)


## Overview

This document details the implementation of the stock screener functionality in the TCBS explorer. The screener allows users to find stocks that match specific financial criteria, technical indicators, and other filters, enabling powerful stock discovery and analysis.

## Screener API

### Endpoint Information

The TCBS stock screener API provides a flexible interface for filtering stocks based on various criteria.

- **Base URL**: `https://apipubaws.tcbs.com.vn/screener/v1/scanner`
- **Screener Endpoint**: `/query`
- **Method**: POST
- **Content Type**: application/json
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

#### Request Format

The API accepts a JSON payload with the following structure:

```json
{
  "exchange": "HOSE,HNX,UPCOM",
  "industryCode": null,
  "criteria": [
    {
      "field": "marketCap",
      "operator": "gte",
      "value": 1000000000000
    },
    {
      "field": "pe",
      "operator": "between",
      "value": [5, 20]
    },
    {
      "field": "roe",
      "operator": "gte",
      "value": 15
    }
  ],
  "limit": 50,
  "offset": 0,
  "orderBy": "marketCap",
  "orderDir": "desc"
}
```

#### Response Format

The API returns screened stocks with the following structure:

```json
{
  "data": {
    "hits": [
      {
        "symbol": "VNM",
        "companyName": "Công ty Cổ phần Sữa Việt Nam",
        "exchange": "HOSE",
        "industry": "Food & Beverages",
        "industryCode": "3020",
        "marketCap": 168276050000000,
        "pe": 15.2,
        "pb": 5.4,
        "roe": 30.5,
        "roa": 22.7,
        "eps": 5300,
        "financialInfo": {
          "revenue": 60000000000000,
          "profit": 11000000000000,
          "debtToEquity": 0.21
        },
        "technicalInfo": {
          "price": 80500,
          "change": -500,
          "percentChange": -0.62,
          "high52Week": 92300,
          "low52Week": 68200,
          "avgVolume10d": 1456780
        }
      }
      // Additional stocks...
    ],
    "total": 142
  },
  "status": "success",
  "message": null
}
```

### Implementation

The stock screener functionality can be implemented with the following TypeScript code:

```typescript
import { TcbsResponse, TcbsScreenedStock } from './models';
import {
  TCBS_ENDPOINTS,
  TcbsExchange,
  TcbsScreenerField,
  TcbsScreenerOperator
} from './const';
import { BaseExplorer } from '../base';

export class TcbsExplorer extends BaseExplorer {
  // Constructor and other methods...

  /**
   * Criterion for stock screening
   */
  interface TcbsScreenerCriterion {
    field: TcbsScreenerField | string;
    operator: TcbsScreenerOperator;
    value: number | number[] | string | string[];
  }

  /**
   * Parameters for stock screening
   */
  interface TcbsScreenerParams {
    /** Exchange to filter by (can be combined with comma) */
    exchange?: string;
    /** Industry code to filter by */
    industryCode?: string;
    /** Array of screening criteria */
    criteria: TcbsScreenerCriterion[];
    /** Maximum number of results to return */
    limit?: number;
    /** Number of results to skip (for pagination) */
    offset?: number;
    /** Field to order results by */
    orderBy?: TcbsScreenerField | string;
    /** Sort direction */
    orderDir?: 'asc' | 'desc';
  }

  /**
   * Screen stocks based on financial metrics and other criteria
   *
   * @param params Screening parameters
   * @returns Promise resolving to screened stocks data
   */
  async screenStocks(params: TcbsScreenerParams): Promise<TcbsResponse<{
    hits: TcbsScreenedStock[];
    total: number;
  }>> {
    if (!params.criteria || params.criteria.length === 0) {
      throw new Error('At least one criterion is required');
    }

    // Validate limit
    if (params.limit && (params.limit < 1 || params.limit > 500)) {
      throw new Error('Limit must be between 1 and 500');
    }

    // Prepare the request body
    const requestBody = {
      exchange: params.exchange,
      industryCode: params.industryCode,
      criteria: params.criteria,
      limit: params.limit || 50,
      offset: params.offset || 0,
      orderBy: params.orderBy || 'marketCap',
      orderDir: params.orderDir || 'desc'
    };

    const response = await this.sendRequest<TcbsResponse<{
      hits: TcbsScreenedStock[];
      total: number;
    }>>(
      TCBS_ENDPOINTS.SCREENER,
      'POST',
      requestBody
    );

    return response;
  }

  /**
   * Helper method to create a criterion for the stock screener
   *
   * @param field Field to filter on
   * @param operator Comparison operator
   * @param value Value or range to compare with
   * @returns Criterion object
   */
  createCriterion(
    field: TcbsScreenerField | string,
    operator: TcbsScreenerOperator,
    value: number | number[] | string | string[]
  ): TcbsScreenerCriterion {
    // Validate operator and value combinations
    if (operator === TcbsScreenerOperator.BETWEEN && !Array.isArray(value)) {
      throw new Error('BETWEEN operator requires an array of two values');
    }

    if (operator === TcbsScreenerOperator.IN && !Array.isArray(value)) {
      throw new Error('IN operator requires an array of values');
    }

    return { field, operator, value };
  }

  /**
   * Find high ROE stocks with reasonable P/E ratios
   *
   * @param minRoe Minimum ROE percentage (default: 15)
   * @param maxPe Maximum P/E ratio (default: 20)
   * @param limit Maximum number of results (default: 20)
   * @returns Promise resolving to screened stocks
   */
  async findHighRoeStocks(
    minRoe: number = 15,
    maxPe: number = 20,
    limit: number = 20
  ): Promise<TcbsScreenedStock[]> {
    const criteria = [
      this.createCriterion(TcbsScreenerField.ROE, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, minRoe),
      this.createCriterion(TcbsScreenerField.PE, TcbsScreenerOperator.LESS_THAN_OR_EQUAL, maxPe),
      // Exclude stocks with very low liquidity
      this.createCriterion(TcbsScreenerField.AVERAGE_VOLUME, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 100000)
    ];

    const result = await this.screenStocks({
      exchange: `${TcbsExchange.HOSE},${TcbsExchange.HNX}`,
      criteria,
      limit,
      orderBy: TcbsScreenerField.ROE,
      orderDir: 'desc'
    });

    return result.data.hits;
  }

  /**
   * Find undervalued stocks based on P/B, P/E ratios
   *
   * @param maxPb Maximum P/B ratio (default: 1.5)
   * @param maxPe Maximum P/E ratio (default: 15)
   * @param limit Maximum number of results (default: 20)
   * @returns Promise resolving to screened stocks
   */
  async findUndervaluedStocks(
    maxPb: number = 1.5,
    maxPe: number = 15,
    limit: number = 20
  ): Promise<TcbsScreenedStock[]> {
    const criteria = [
      this.createCriterion(TcbsScreenerField.PB, TcbsScreenerOperator.LESS_THAN_OR_EQUAL, maxPb),
      this.createCriterion(TcbsScreenerField.PE, TcbsScreenerOperator.LESS_THAN_OR_EQUAL, maxPe),
      // Ensure some minimal profitability
      this.createCriterion(TcbsScreenerField.ROE, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 5),
      // Exclude stocks with very low liquidity
      this.createCriterion(TcbsScreenerField.AVERAGE_VOLUME, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 50000)
    ];

    const result = await this.screenStocks({
      criteria,
      limit,
      orderBy: TcbsScreenerField.PB,
      orderDir: 'asc'
    });

    return result.data.hits;
  }
}
```

## Advanced Screening Techniques

### Sector-specific Screening

Different sectors have different optimal financial metrics. The implementation can be extended to include sector-specific screening:

```typescript
// Add to the TcbsExplorer class

/**
 * Perform sector-specific stock screening based on tailored criteria
 *
 * @param sectorCode The sector code to screen within
 * @returns Promise resolving to screened stocks
 */
async screenBySector(sectorCode: string): Promise<TcbsScreenedStock[]> {
  // Get the sector name to determine screening approach
  const industries = await this.getIndustries(1);
  const sector = industries.data.find(s => s.industryCode === sectorCode);

  if (!sector) {
    throw new Error(`Invalid sector code: ${sectorCode}`);
  }

  let criteria: TcbsScreenerCriterion[] = [];

  // Financial sector (1000)
  if (sectorCode === '1000') {
    criteria = [
      this.createCriterion(TcbsScreenerField.ROE, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 12),
      this.createCriterion(TcbsScreenerField.NPM, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 20),
      this.createCriterion(TcbsScreenerField.PB, TcbsScreenerOperator.LESS_THAN_OR_EQUAL, 2.5),
    ];
  }
  // Real Estate (4000)
  else if (sectorCode === '4000') {
    criteria = [
      this.createCriterion(TcbsScreenerField.DEBT_TO_EQUITY, TcbsScreenerOperator.LESS_THAN_OR_EQUAL, 1.5),
      this.createCriterion(TcbsScreenerField.PB, TcbsScreenerOperator.LESS_THAN_OR_EQUAL, 2.0),
      this.createCriterion(TcbsScreenerField.MARKET_CAP, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 1000000000000),
    ];
  }
  // Technology (2000)
  else if (sectorCode === '2000') {
    criteria = [
      this.createCriterion(TcbsScreenerField.REVENUE_GROWTH, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 15),
      this.createCriterion(TcbsScreenerField.PE, TcbsScreenerOperator.LESS_THAN_OR_EQUAL, 25),
    ];
  }
  // Default criteria for other sectors
  else {
    criteria = [
      this.createCriterion(TcbsScreenerField.ROE, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 10),
      this.createCriterion(TcbsScreenerField.PE, TcbsScreenerOperator.LESS_THAN_OR_EQUAL, 20),
    ];
  }

  // Add common criteria
  criteria.push(
    this.createCriterion(TcbsScreenerField.AVERAGE_VOLUME, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 100000)
  );

  const result = await this.screenStocks({
    criteria,
    industryCode: sectorCode,
    limit: 20,
    orderBy: TcbsScreenerField.MARKET_CAP,
    orderDir: 'desc'
  });

  return result.data.hits;
}
```

### Technical Indicator Screening

In addition to financial screening, the TCBS screener also supports technical indicator-based screening:

```typescript
// Add to the TcbsExplorer class

/**
 * Screen stocks based on technical indicators
 *
 * @param params Technical screening parameters
 * @returns Promise resolving to screened stocks
 */
async screenByTechnicalIndicators(params: {
  rsiRange?: [number, number];
  macdCrossover?: boolean;
  bollingerBreakout?: 'upper' | 'lower';
  volumeIncrease?: number;
}): Promise<TcbsScreenedStock[]> {
  const criteria: TcbsScreenerCriterion[] = [];

  // RSI within specific range
  if (params.rsiRange) {
    criteria.push(
      this.createCriterion('rsi', TcbsScreenerOperator.BETWEEN, params.rsiRange)
    );
  }

  // MACD crossover (MACD line crosses signal line)
  if (params.macdCrossover) {
    criteria.push(
      this.createCriterion('macdCrossover', TcbsScreenerOperator.EQUAL, true)
    );
  }

  // Bollinger band breakout
  if (params.bollingerBreakout) {
    criteria.push(
      this.createCriterion(
        'bollingerBreakout',
        TcbsScreenerOperator.EQUAL,
        params.bollingerBreakout
      )
    );
  }

  // Volume increase compared to average
  if (params.volumeIncrease) {
    criteria.push(
      this.createCriterion(
        'volumeChangePercent',
        TcbsScreenerOperator.GREATER_THAN_OR_EQUAL,
        params.volumeIncrease
      )
    );
  }

  // Add some basic criteria to filter out illiquid stocks
  criteria.push(
    this.createCriterion(TcbsScreenerField.AVERAGE_VOLUME, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 100000),
    this.createCriterion(TcbsScreenerField.MARKET_CAP, TcbsScreenerOperator.GREATER_THAN_OR_EQUAL, 500000000000)
  );

  const result = await this.screenStocks({
    criteria,
    exchange: `${TcbsExchange.HOSE},${TcbsExchange.HNX}`,
    limit: 30,
    orderBy: 'volumeChangePercent',
    orderDir: 'desc'
  });

  return result.data.hits;
}
```

## Error Handling

The TCBS screener API may return various error responses that should be properly handled:

1. **Invalid Criteria**: When the provided criteria are invalid
2. **Invalid Operator**: When an operator is not compatible with a field
3. **Rate Limiting**: When too many requests are made in a short period
4. **Service Unavailable**: When the TCBS service is down

Error handling should include:

```typescript
try {
  const results = await tcbsExplorer.screenStocks({
    criteria: [
      // Criteria...
    ],
  });

  // Process results...
} catch (error) {
  if (error.message.includes('criteria')) {
    console.error('Invalid criteria format:', error.message);
  } else if (error.status === 429) {
    console.error('Rate limit exceeded. Please try again later.');
  } else if (error.status >= 500) {
    console.error('TCBS service is currently unavailable.');
  } else {
    console.error('Error screening stocks:', error.message);
  }
}
```

## Usage Examples

### Basic Stock Screening

```typescript
const tcbsExplorer = new TcbsExplorer();

const basicScreeningExample = async () => {
  try {
    // Create screening criteria
    const criteria = [
      tcbsExplorer.createCriterion(
        TcbsScreenerField.PE,
        TcbsScreenerOperator.BETWEEN,
        [5, 15]
      ),
      tcbsExplorer.createCriterion(
        TcbsScreenerField.MARKET_CAP,
        TcbsScreenerOperator.GREATER_THAN_OR_EQUAL,
        1000000000000
      ), // 1 trillion VND
      tcbsExplorer.createCriterion(
        TcbsScreenerField.ROE,
        TcbsScreenerOperator.GREATER_THAN_OR_EQUAL,
        15
      ),
      tcbsExplorer.createCriterion(
        TcbsScreenerField.DEBT_TO_EQUITY,
        TcbsScreenerOperator.LESS_THAN_OR_EQUAL,
        1
      ),
    ];

    // Screen stocks
    const results = await tcbsExplorer.screenStocks({
      exchange: TcbsExchange.HOSE,
      criteria,
      limit: 10,
      orderBy: TcbsScreenerField.MARKET_CAP,
      orderDir: 'desc',
    });

    console.log(
      `Found ${results.data.total} stocks matching criteria. Top 10:`
    );

    results.data.hits.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.symbol} - ${stock.companyName}`);
      console.log(
        `   P/E: ${stock.pe.toFixed(2)} | ROE: ${stock.roe.toFixed(2)}%`
      );
      console.log(
        `   Market Cap: ${(stock.marketCap / 1e12).toFixed(2)} trillion VND`
      );
      console.log(
        `   Debt/Equity: ${stock.financialInfo.debtToEquity.toFixed(2)}`
      );
      console.log(`   Industry: ${stock.industry}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error in stock screening:', error);
  }
};
```

### Finding High Dividend Stocks

```typescript
const tcbsExplorer = new TcbsExplorer();

const findHighDividendStocks = async () => {
  try {
    // Create screening criteria for high dividend stocks
    const criteria = [
      tcbsExplorer.createCriterion(
        'dividendYield',
        TcbsScreenerOperator.GREATER_THAN_OR_EQUAL,
        5
      ), // At least 5% dividend yield
      tcbsExplorer.createCriterion(
        'payoutRatio',
        TcbsScreenerOperator.LESS_THAN_OR_EQUAL,
        70
      ), // Sustainable payout ratio
      tcbsExplorer.createCriterion(
        TcbsScreenerField.AVERAGE_VOLUME,
        TcbsScreenerOperator.GREATER_THAN_OR_EQUAL,
        100000
      ), // Reasonable liquidity
      tcbsExplorer.createCriterion(
        TcbsScreenerField.MARKET_CAP,
        TcbsScreenerOperator.GREATER_THAN_OR_EQUAL,
        500000000000
      ), // At least 500 billion VND market cap
    ];

    // Screen stocks
    const results = await tcbsExplorer.screenStocks({
      criteria,
      limit: 15,
      orderBy: 'dividendYield',
      orderDir: 'desc',
    });

    console.log(`Found ${results.data.total} high dividend stocks. Top 15:`);

    results.data.hits.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.symbol} - ${stock.companyName}`);
      console.log(`   Dividend Yield: ${stock.dividendYield.toFixed(2)}%`);
      console.log(`   Payout Ratio: ${stock.payoutRatio.toFixed(2)}%`);
      console.log(`   P/E: ${stock.pe.toFixed(2)}`);
      console.log(
        `   Current Price: ${stock.technicalInfo.price.toLocaleString()} VND`
      );
      console.log('');
    });
  } catch (error) {
    console.error('Error finding high dividend stocks:', error);
  }
};
```

### Technical Analysis Based Screening

```typescript
const tcbsExplorer = new TcbsExplorer();

const findTechnicalSetups = async () => {
  try {
    // Find stocks with bullish technical setups
    const bullishStocks = await tcbsExplorer.screenByTechnicalIndicators({
      rsiRange: [30, 45], // Oversold but starting to recover
      macdCrossover: true, // MACD just crossed above signal line
      volumeIncrease: 50, // Volume increased by at least 50%
    });

    console.log(`Found ${bullishStocks.length} stocks with bullish setups:`);

    bullishStocks.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.symbol} - ${stock.companyName}`);
      console.log(
        `   Current Price: ${stock.technicalInfo.price.toLocaleString()} VND`
      );
      console.log(
        `   Change: ${stock.technicalInfo.percentChange.toFixed(2)}%`
      );
      console.log(`   RSI: ${stock.technicalInfo.rsi.toFixed(2)}`);
      console.log(`   Volume: ${stock.technicalInfo.volume.toLocaleString()}`);
      console.log('');
    });
  } catch (error) {
    console.error('Error finding technical setups:', error);
  }
};
```

## Implementation Considerations

1. **Caching**: Implement caching for frequently used screening criteria to improve performance.
2. **Rate Limiting**: Implement rate limiting to avoid exceeding TCBS API limits.
3. **Paging**: Provide helper methods to retrieve all results when there are more than the maximum limit.
4. **Preset Screens**: Create a library of common screening presets (value, growth, dividend, etc.).
5. **Error Handling**: Implement comprehensive error handling for all API calls.
6. **Validation**: Validate criteria before sending to avoid server-side errors.

## Related Documentation

- [TCBS Models](./models.md) - Data models used in these implementations
- [TCBS Constants](./const.md) - Constants and API endpoints
- [TCBS Explorer Overview](./index.md) - Overview of the TCBS explorer
- [TCBS Financial Data](./financial.md) - Financial data implementation
