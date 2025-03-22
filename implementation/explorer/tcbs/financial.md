# TCBS Financial Data Implementation

**Original Python Implementation**: [financial.py](/vnstock/explorer/tcbs/financial.py)


## Overview

This document details the implementation of financial data functionality in the TCBS explorer. This includes financial statements (income statement, balance sheet, cash flow), financial ratios, and dividend data for listed companies on the Vietnam stock market.

## Financial Statements API

### Endpoint Information

The TCBS financial statements API provides detailed financial statements data for listed companies.

- **Base URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company`
- **Financial Statement Endpoint**: `/financial-statement/{symbol}`
- **Method**: GET
- **Required Parameters**:
  - `type`: Type of financial statement (`incomestatement`, `balancesheet`, `cashflow`)
  - `period`: Reporting period (`quarterly`, `yearly`)
  - `limit`: Number of periods to retrieve (e.g., 10)
- **Optional Parameters**:
  - `offset`: Number of periods to skip (for pagination)
  - `reportType`: Type of report (`CONSOLIDATED`, `SEPARATE`) - defaults to `CONSOLIDATED`
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns financial statement data with the following structure:

```json
{
  "data": {
    "items": [
      {
        "name": "Revenue",
        "code": "revenue",
        "values": [
          60000000000000, 59000000000000, 57500000000000, 56800000000000
        ],
        "growthQoQ": [null, -1.67, -2.54, -1.22],
        "growthYoY": [5.63, 3.86, 2.15, 1.97]
      },
      {
        "name": "Gross Profit",
        "code": "grossProfit",
        "values": [
          21000000000000, 20500000000000, 20100000000000, 19800000000000
        ],
        "growthQoQ": [null, -2.38, -1.95, -1.49],
        "growthYoY": [6.06, 4.59, 3.08, 2.59]
      }
      // Additional items...
    ],
    "periods": ["2023-03-31", "2022-12-31", "2022-09-30", "2022-06-30"],
    "type": "incomestatement",
    "period": "quarterly"
  },
  "status": "success",
  "message": null
}
```

### Implementation

The financial statements functionality can be implemented with the following TypeScript code:

```typescript
import {
  TcbsResponse,
  TcbsFinancialStatementResponse,
  TcbsFinancialStatementType,
  TcbsFinancialPeriod,
  TcbsReportType,
} from './models';
import { TCBS_ENDPOINTS } from './const';
import { BaseExplorer } from '../base';

export class TcbsExplorer extends BaseExplorer {
  // Constructor and other methods...

  /**
   * Get financial statement data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param type Type of financial statement
   * @param period Reporting period (quarterly or yearly)
   * @param limit Number of periods to retrieve
   * @param offset Number of periods to skip
   * @param reportType Type of report (consolidated or separate)
   * @returns Promise resolving to financial statement data
   */
  async getFinancialStatement(
    symbol: string,
    type: TcbsFinancialStatementType,
    period: TcbsFinancialPeriod,
    limit: number = 10,
    offset: number = 0,
    reportType: TcbsReportType = TcbsReportType.CONSOLIDATED
  ): Promise<TcbsFinancialStatementResponse> {
    this.validateSymbol(symbol);

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const url = `${TCBS_ENDPOINTS.FINANCIAL_STATEMENT(
      symbol
    )}?type=${type}&period=${period}&limit=${limit}&offset=${offset}&reportType=${reportType}`;

    const response = await this.sendRequest<TcbsFinancialStatementResponse>(
      url,
      'GET'
    );

    return response;
  }

  /**
   * Get income statement data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param period Reporting period (quarterly or yearly)
   * @param limit Number of periods to retrieve
   * @returns Promise resolving to income statement data
   */
  async getIncomeStatement(
    symbol: string,
    period: TcbsFinancialPeriod,
    limit: number = 10
  ): Promise<TcbsFinancialStatementResponse> {
    return this.getFinancialStatement(
      symbol,
      TcbsFinancialStatementType.INCOME_STATEMENT,
      period,
      limit
    );
  }

  /**
   * Get balance sheet data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param period Reporting period (quarterly or yearly)
   * @param limit Number of periods to retrieve
   * @returns Promise resolving to balance sheet data
   */
  async getBalanceSheet(
    symbol: string,
    period: TcbsFinancialPeriod,
    limit: number = 10
  ): Promise<TcbsFinancialStatementResponse> {
    return this.getFinancialStatement(
      symbol,
      TcbsFinancialStatementType.BALANCE_SHEET,
      period,
      limit
    );
  }

  /**
   * Get cash flow statement data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param period Reporting period (quarterly or yearly)
   * @param limit Number of periods to retrieve
   * @returns Promise resolving to cash flow statement data
   */
  async getCashFlowStatement(
    symbol: string,
    period: TcbsFinancialPeriod,
    limit: number = 10
  ): Promise<TcbsFinancialStatementResponse> {
    return this.getFinancialStatement(
      symbol,
      TcbsFinancialStatementType.CASH_FLOW,
      period,
      limit
    );
  }
}
```

## Financial Ratios API

### Endpoint Information

The TCBS financial ratios API provides key financial metrics and ratios for company analysis.

- **Base URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company`
- **Financial Ratios Endpoint**: `/financial-ratios/{symbol}`
- **Method**: GET
- **Required Parameters**:
  - `period`: Reporting period (`quarterly`, `yearly`)
  - `limit`: Number of periods to retrieve (e.g., 10)
- **Optional Parameters**:
  - `offset`: Number of periods to skip (for pagination)
  - `reportType`: Type of report (`CONSOLIDATED`, `SEPARATE`) - defaults to `CONSOLIDATED`
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns financial ratio data with the following structure:

```json
{
  "data": [
    {
      "period": "2023-03-31",
      "pe": 15.2,
      "pb": 5.4,
      "ps": 2.8,
      "eps": 5300,
      "bvps": 14900,
      "roe": 30.5,
      "roa": 22.7,
      "npm": 18.3,
      "opm": 22.5,
      "debtToEquity": 0.21,
      "currentRatio": 2.3,
      "quickRatio": 1.8,
      "assetTurnover": 1.2,
      "inventoryTurnover": 8.5,
      "dividendYield": 3.7,
      "payoutRatio": 56.2
    },
    {
      "period": "2022-12-31",
      "pe": 14.8,
      "pb": 5.2,
      "ps": 2.7,
      "eps": 5160,
      "bvps": 14700,
      "roe": 30.1,
      "roa": 22.3,
      "npm": 18.1,
      "opm": 22.2,
      "debtToEquity": 0.22,
      "currentRatio": 2.2,
      "quickRatio": 1.7,
      "assetTurnover": 1.2,
      "inventoryTurnover": 8.3,
      "dividendYield": 3.8,
      "payoutRatio": 56.4
    }
    // Additional periods...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The financial ratios functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Get financial ratios
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @param period Reporting period (quarterly or yearly)
 * @param limit Number of periods to retrieve
 * @param offset Number of periods to skip
 * @param reportType Type of report (consolidated or separate)
 * @returns Promise resolving to financial ratios data
 */
async getFinancialRatios(
  symbol: string,
  period: TcbsFinancialPeriod,
  limit: number = 10,
  offset: number = 0,
  reportType: TcbsReportType = TcbsReportType.CONSOLIDATED
): Promise<TcbsResponse<TcbsFinancialRatio[]>> {
  this.validateSymbol(symbol);

  if (limit < 1 || limit > 100) {
    throw new Error('Limit must be between 1 and 100');
  }

  const url = `${TCBS_ENDPOINTS.FINANCIAL_RATIO(symbol)}?period=${period}&limit=${limit}&offset=${offset}&reportType=${reportType}`;

  const response = await this.sendRequest<TcbsResponse<TcbsFinancialRatio[]>>(
    url,
    'GET'
  );

  return response;
}
```

## Dividend History API

### Endpoint Information

The TCBS dividend history API provides information about past dividend payments.

- **Base URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company`
- **Dividend History Endpoint**: `/dividend-history/{symbol}`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns dividend history data with the following structure:

```json
{
  "data": [
    {
      "year": 2023,
      "cashDividend": 4500,
      "cashDividendPercent": 45.0,
      "stockDividend": 0,
      "stockDividendPercent": 0.0,
      "totalDividendPercent": 45.0,
      "exRightDate": "2023-06-15",
      "recordDate": "2023-06-16",
      "paymentDate": "2023-06-30"
    },
    {
      "year": 2022,
      "cashDividend": 4300,
      "cashDividendPercent": 43.0,
      "stockDividend": 1000,
      "stockDividendPercent": 10.0,
      "totalDividendPercent": 53.0,
      "exRightDate": "2022-06-10",
      "recordDate": "2022-06-11",
      "paymentDate": "2022-06-25"
    }
    // Additional years...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The dividend history functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Dividend history data
 */
interface TcbsDividend {
  year: number;
  cashDividend: number;
  cashDividendPercent: number;
  stockDividend: number;
  stockDividendPercent: number;
  totalDividendPercent: number;
  exRightDate: string;
  recordDate: string;
  paymentDate: string;
}

/**
 * Get dividend history
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @returns Promise resolving to dividend history data
 */
async getDividendHistory(symbol: string): Promise<TcbsResponse<TcbsDividend[]>> {
  this.validateSymbol(symbol);

  const url = `${this.baseUrl}/tcanalysis/v1/company/dividend-history/${symbol}`;

  const response = await this.sendRequest<TcbsResponse<TcbsDividend[]>>(
    url,
    'GET'
  );

  return response;
}
```

## Financial Analysis Utilities

In addition to the basic API calls, it's useful to implement some analysis utilities for financial data:

```typescript
// Add to the TcbsExplorer class

/**
 * Calculate growth rates between periods
 *
 * @param values Array of values
 * @returns Array of growth rates (percentage)
 */
private calculateGrowthRates(values: number[]): number[] {
  if (values.length < 2) {
    return [];
  }

  return values.slice(0, -1).map((value, index) => {
    const previousValue = values[index + 1];
    if (previousValue === 0) return 0;
    return ((value - previousValue) / Math.abs(previousValue)) * 100;
  });
}

/**
 * Extract specific financial items from a financial statement
 *
 * @param statement Financial statement response
 * @param itemCodes Array of item codes to extract
 * @returns Object with item codes as keys and values arrays as values
 */
extractFinancialItems(
  statement: TcbsFinancialStatementResponse,
  itemCodes: string[]
): Record<string, number[]> {
  const result: Record<string, number[]> = {};

  itemCodes.forEach(code => {
    const item = statement.data.items.find(item => item.code === code);
    if (item) {
      result[code] = item.values;
    } else {
      result[code] = Array(statement.data.periods.length).fill(0);
    }
  });

  return result;
}

/**
 * Compare financial metrics between two companies
 *
 * @param symbol1 First company symbol
 * @param symbol2 Second company symbol
 * @param metrics Array of financial metrics to compare
 * @returns Promise resolving to comparison results
 */
async compareFinancialMetrics(
  symbol1: string,
  symbol2: string,
  metrics: string[] = ['pe', 'pb', 'roe', 'roa', 'npm']
): Promise<Record<string, { symbol1: number, symbol2: number }>> {
  const [ratios1, ratios2] = await Promise.all([
    this.getFinancialRatios(symbol1, TcbsFinancialPeriod.QUARTERLY, 1),
    this.getFinancialRatios(symbol2, TcbsFinancialPeriod.QUARTERLY, 1)
  ]);

  const result: Record<string, { symbol1: number, symbol2: number }> = {};

  metrics.forEach(metric => {
    const value1 = ratios1.data[0]?.[metric as keyof TcbsFinancialRatio] as number;
    const value2 = ratios2.data[0]?.[metric as keyof TcbsFinancialRatio] as number;

    result[metric] = {
      symbol1: value1 || 0,
      symbol2: value2 || 0
    };
  });

  return result;
}
```

## Error Handling

The TCBS financial data APIs may return various error responses that should be properly handled:

1. **Invalid Symbol**: When the provided symbol doesn't exist
2. **Invalid Parameters**: When parameters like period or type are invalid
3. **Rate Limiting**: When too many requests are made in a short period
4. **Service Unavailable**: When the TCBS service is down

Error handling should be implemented using the same approach outlined in the quote module documentation.

## Usage Examples

### Getting Income Statement

```typescript
const tcbsExplorer = new TcbsExplorer();

const getIncomeStatementExample = async () => {
  try {
    const incomeStatement = await tcbsExplorer.getIncomeStatement(
      'VNM',
      TcbsFinancialPeriod.QUARTERLY,
      4
    );

    // Print periods
    console.log('Periods:', incomeStatement.data.periods.join(', '));

    // Find revenue item
    const revenueItem = incomeStatement.data.items.find(
      (item) => item.code === 'revenue'
    );
    if (revenueItem) {
      console.log('\nRevenue (Billion VND):');
      revenueItem.values.forEach((value, index) => {
        const period = incomeStatement.data.periods[index];
        console.log(`${period}: ${value / 1e9}`);
      });

      // Print growth rates
      console.log('\nYoY Growth:');
      revenueItem.growthYoY?.forEach((growth, index) => {
        if (growth !== null) {
          const period = incomeStatement.data.periods[index];
          console.log(`${period}: ${growth.toFixed(2)}%`);
        }
      });
    }
  } catch (error) {
    console.error('Error fetching income statement:', error);
  }
};
```

### Getting Financial Ratios

```typescript
const tcbsExplorer = new TcbsExplorer();

const getFinancialRatiosExample = async () => {
  try {
    const ratios = await tcbsExplorer.getFinancialRatios(
      'VNM',
      TcbsFinancialPeriod.YEARLY,
      5
    );

    console.log('Financial Ratios for VNM:');

    // Create a table of key ratios
    const keyRatios = ['pe', 'pb', 'roe', 'roa', 'npm'];

    // Print header row with periods
    console.log('Ratio | ' + ratios.data.map((r) => r.period).join(' | '));

    // Print each ratio
    keyRatios.forEach((ratio) => {
      const values = ratios.data.map((r) => {
        const value = r[ratio as keyof TcbsFinancialRatio] as number;
        return value !== undefined ? value.toFixed(2) : 'N/A';
      });

      console.log(`${ratio.toUpperCase()} | ${values.join(' | ')}`);
    });
  } catch (error) {
    console.error('Error fetching financial ratios:', error);
  }
};
```

### Getting Dividend History

```typescript
const tcbsExplorer = new TcbsExplorer();

const getDividendHistoryExample = async () => {
  try {
    const dividends = await tcbsExplorer.getDividendHistory('VNM');

    console.log('Dividend History for VNM:');

    dividends.data.forEach((dividend) => {
      console.log(`\nYear: ${dividend.year}`);
      console.log(
        `Cash Dividend: ${dividend.cashDividend} VND (${dividend.cashDividendPercent}%)`
      );

      if (dividend.stockDividendPercent > 0) {
        console.log(`Stock Dividend: ${dividend.stockDividendPercent}%`);
      }

      console.log(`Total Dividend: ${dividend.totalDividendPercent}%`);
      console.log(`Ex-Right Date: ${dividend.exRightDate}`);
      console.log(`Payment Date: ${dividend.paymentDate}`);
    });

    // Calculate average dividend yield
    const averageDividendYield =
      dividends.data.reduce(
        (sum, dividend) => sum + dividend.cashDividendPercent,
        0
      ) / dividends.data.length;

    console.log(
      `\nAverage Cash Dividend Yield: ${averageDividendYield.toFixed(2)}%`
    );
  } catch (error) {
    console.error('Error fetching dividend history:', error);
  }
};
```

### Comparing Financial Metrics Between Companies

```typescript
const tcbsExplorer = new TcbsExplorer();

const compareCompaniesExample = async () => {
  try {
    // Compare VNM and MSN
    const comparison = await tcbsExplorer.compareFinancialMetrics('VNM', 'MSN');

    console.log('Financial Metrics Comparison:');
    console.log('Metric | VNM | MSN | Difference');

    Object.entries(comparison).forEach(([metric, values]) => {
      const difference = values.symbol1 - values.symbol2;
      console.log(
        `${metric.toUpperCase()} | ${values.symbol1.toFixed(
          2
        )} | ${values.symbol2.toFixed(2)} | ${difference.toFixed(2)}`
      );
    });

    // Determine which company has better metrics
    let vnmBetter = 0;
    let msnBetter = 0;

    Object.entries(comparison).forEach(([metric, values]) => {
      if (metric === 'pe' || metric === 'pb') {
        // Lower is better for these metrics
        if (values.symbol1 < values.symbol2) vnmBetter++;
        else if (values.symbol2 < values.symbol1) msnBetter++;
      } else {
        // Higher is better for these metrics
        if (values.symbol1 > values.symbol2) vnmBetter++;
        else if (values.symbol2 > values.symbol1) msnBetter++;
      }
    });

    console.log(
      `\nVNM has better metrics in ${vnmBetter}/${
        Object.keys(comparison).length
      } categories`
    );
    console.log(
      `MSN has better metrics in ${msnBetter}/${
        Object.keys(comparison).length
      } categories`
    );
  } catch (error) {
    console.error('Error comparing companies:', error);
  }
};
```

## Implementation Considerations

1. **Caching**: Consider implementing a caching mechanism for financial data, especially historical data that rarely changes.
2. **Rate Limiting**: Implement rate limiting to avoid exceeding TCBS API limits.
3. **Data Transformation**: Provide methods to transform the financial values to more readable formats (e.g., billions or trillions).
4. **Industry Benchmarking**: Consider implementing methods to compare a company's financial metrics with industry averages.
5. **Error Handling**: Implement comprehensive error handling for all API calls.
6. **Calculation Utilities**: Provide utility functions for common financial calculations (e.g., CAGR, average growth rates).

## Related Documentation

- [TCBS Models](./models.md) - Data models used in these implementations
- [TCBS Constants](./const.md) - Constants and API endpoints
- [TCBS Explorer Overview](./index.md) - Overview of the TCBS explorer
- [TCBS Company Data](./company.md) - Company profile and industry data
