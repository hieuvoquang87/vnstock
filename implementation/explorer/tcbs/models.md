# TCBS Explorer Data Models

**Original Python Implementation**: [models.py](/vnstock/explorer/tcbs/models.py)


## Overview

This document details the data models used in the TCBS explorer, defining TypeScript interfaces for the various API responses and data structures. These models ensure proper typing and validation of data retrieved from TCBS APIs.

## Stock Data Models

### Stock Quote Model

```typescript
/**
 * Represents a stock quote from TCBS API
 */
export interface TcbsStockQuote {
  /** Stock symbol */
  symbol: string;
  /** Current price */
  price: number;
  /** Price change */
  priceChange: number;
  /** Percentage change */
  pctChange: number;
  /** Trading volume */
  volume: number;
  /** Total trading value */
  value: number;
  /** Highest price of the day */
  high: number;
  /** Lowest price of the day */
  low: number;
  /** Opening price */
  open: number;
  /** Previous close price */
  prevClose: number;
  /** Market capitalization */
  marketCap: number;
  /** Last updated timestamp */
  timestamp: string;
}

/**
 * Standardized stock quote response
 */
export interface TcbsQuoteResponse {
  data: TcbsStockQuote;
  status: string;
  message: string | null;
}
```

### Historical Price Model

```typescript
/**
 * Historical price data point
 */
export interface TcbsHistoricalPrice {
  /** Trading date in YYYY-MM-DD format */
  date: string;
  /** Opening price */
  open: number;
  /** Highest price of the session */
  high: number;
  /** Lowest price of the session */
  low: number;
  /** Closing price */
  close: number;
  /** Trading volume */
  volume: number;
  /** Adjusted close price for dividends */
  adjClose?: number;
}

/**
 * Historical price data response
 */
export interface TcbsHistoricalResponse {
  data: TcbsHistoricalPrice[];
  status: string;
  message: string | null;
}
```

## Company Data Models

### Company Profile Model

```typescript
/**
 * Company profile information
 */
export interface TcbsCompanyProfile {
  /** Stock symbol */
  symbol: string;
  /** Company's full name */
  companyName: string;
  /** Short description */
  description: string;
  /** Industry name */
  industry: string;
  /** Sector name */
  sector: string;
  /** Foundation year */
  foundationYear: number;
  /** Number of employees */
  employees: number;
  /** Company website */
  website: string;
  /** Company address */
  address: string;
  /** Market capitalization */
  marketCap: number;
  /** Market capitalization ranking */
  marketCapRank: number;
  /** Free-float percentage */
  freeFloat: number;
  /** State ownership percentage */
  stateOwnership: number;
  /** Foreign ownership percentage */
  foreignOwnership: number;
  /** Maximum foreign ownership allowed percentage */
  foreignOwnershipLimit: number;
  /** Outstanding shares */
  outstandingShares: number;
  /** Financial highlights */
  financialHighlights?: {
    revenue?: number;
    profit?: number;
    eps?: number;
    pe?: number;
    pb?: number;
    roe?: number;
  };
}

/**
 * Company profile response
 */
export interface TcbsCompanyProfileResponse {
  data: TcbsCompanyProfile;
  status: string;
  message: string | null;
}
```

### Ownership Model

```typescript
/**
 * Major shareholder information
 */
export interface TcbsMajorShareholder {
  /** Shareholder name */
  name: string;
  /** Ownership percentage */
  ownershipPct: number;
  /** Number of shares */
  shares: number;
  /** Shareholder type (organization/individual) */
  type: string;
  /** Last reported date */
  reportDate: string;
}

/**
 * Ownership structure response
 */
export interface TcbsOwnershipResponse {
  data: {
    majorShareholders: TcbsMajorShareholder[];
    ownershipSummary: {
      stateOwnership: number;
      foreignOwnership: number;
      otherInstitutions: number;
      individuals: number;
    };
  };
  status: string;
  message: string | null;
}
```

## Financial Data Models

### Financial Statement Model

```typescript
/**
 * Financial statement item
 */
export interface TcbsFinancialItem {
  /** Item name */
  name: string;
  /** Item code */
  code: string;
  /** Value for this period */
  value: number;
  /** Growth rate compared to previous period */
  growthQoQ?: number;
  /** Growth rate compared to same period last year */
  growthYoY?: number;
}

/**
 * Financial statement types
 */
export enum TcbsFinancialStatementType {
  INCOME_STATEMENT = 'incomestatement',
  BALANCE_SHEET = 'balancesheet',
  CASH_FLOW = 'cashflow',
}

/**
 * Financial statement period
 */
export enum TcbsFinancialPeriod {
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

/**
 * Financial statement response
 */
export interface TcbsFinancialStatementResponse {
  data: {
    /** Financial items */
    items: TcbsFinancialItem[];
    /** Reporting periods */
    periods: string[];
    /** Type of financial statement */
    type: TcbsFinancialStatementType;
    /** Reporting period frequency */
    period: TcbsFinancialPeriod;
  };
  status: string;
  message: string | null;
}
```

### Financial Ratio Model

```typescript
/**
 * Financial ratio data
 */
export interface TcbsFinancialRatio {
  /** Period (e.g., Q1 2023) */
  period: string;
  /** Price to Earnings ratio */
  pe: number;
  /** Price to Book ratio */
  pb: number;
  /** Price to Sales ratio */
  ps: number;
  /** Earnings per Share */
  eps: number;
  /** Book Value per Share */
  bvps: number;
  /** Return on Equity */
  roe: number;
  /** Return on Assets */
  roa: number;
  /** Net Profit Margin */
  npm: number;
  /** Operating Profit Margin */
  opm: number;
  /** Debt to Equity ratio */
  debtToEquity: number;
  /** Current Ratio */
  currentRatio: number;
  /** Quick Ratio */
  quickRatio: number;
  /** Asset Turnover */
  assetTurnover: number;
  /** Inventory Turnover */
  inventoryTurnover: number;
  /** Dividend Yield */
  dividendYield?: number;
  /** Dividend Payout Ratio */
  payoutRatio?: number;
}

/**
 * Financial ratio response
 */
export interface TcbsFinancialRatioResponse {
  data: TcbsFinancialRatio[];
  status: string;
  message: string | null;
}
```

## Listing Data Models

```typescript
/**
 * Stock listing information
 */
export interface TcbsStockListing {
  /** Stock symbol */
  symbol: string;
  /** Company name */
  companyName: string;
  /** Exchange name */
  exchange: string;
  /** Industry name */
  industry: string;
  /** Sector name */
  sector: string;
  /** Market capitalization */
  marketCap: number;
}

/**
 * Stock listing response
 */
export interface TcbsStockListingResponse {
  data: TcbsStockListing[];
  status: string;
  message: string | null;
}
```

## Screener Models

```typescript
/**
 * Screening criteria
 */
export interface TcbsScreenerCriteria {
  /** Field name */
  field: string;
  /** Operator (>, <, =, etc.) */
  operator: string;
  /** Value to compare against */
  value: number | string;
}

/**
 * Screener result item
 */
export interface TcbsScreenerResult {
  /** Stock symbol */
  symbol: string;
  /** Company name */
  companyName: string;
  /** Field values that match criteria */
  values: Record<string, number | string>;
}

/**
 * Screener response
 */
export interface TcbsScreenerResponse {
  data: {
    /** Matching stocks */
    results: TcbsScreenerResult[];
    /** Total results count */
    total: number;
    /** Applied criteria */
    criteria: TcbsScreenerCriteria[];
  };
  status: string;
  message: string | null;
}
```

## Technical Analysis Models

```typescript
/**
 * Technical indicator data
 */
export interface TcbsTechnicalIndicator {
  /** Indicator name */
  name: string;
  /** Indicator values */
  values: number[];
  /** Corresponding dates */
  dates: string[];
}

/**
 * Technical analysis response
 */
export interface TcbsTechnicalAnalysisResponse {
  data: {
    /** Technical indicators */
    indicators: TcbsTechnicalIndicator[];
    /** Price data */
    prices: TcbsHistoricalPrice[];
  };
  status: string;
  message: string | null;
}
```

## Common Response Structure

All TCBS API responses follow a common pattern:

```typescript
/**
 * Generic TCBS API response
 */
export interface TcbsResponse<T> {
  /** Response data */
  data: T;
  /** Response status */
  status: string;
  /** Error message if any */
  message: string | null;
}
```

## Implementation Notes

When implementing these models in TypeScript:

1. Define the interfaces in a dedicated `models.ts` file
2. Export all interfaces for use in other modules
3. Consider using more specific types for fields where appropriate
4. Use enums for fixed value sets (like statement types)
5. Consider adding Zod schema validation for runtime type checking

## Usage Example

```typescript
import { TcbsResponse, TcbsStockQuote } from './models';

// Example of using the models to type API responses
async function getStockQuote(
  symbol: string
): Promise<TcbsResponse<TcbsStockQuote>> {
  const response = await fetch(`https://api-endpoint/quote/${symbol}`);
  return response.json();
}
```
