# FMARKET Explorer Constants and Configuration

**Original Python Implementation**: [const.py](/vnstock/explorer/fmarket/const.py)


## Overview

This document details the constants, enums, configuration values, and mappings used in the FMARKET explorer. These constants serve as reference points for API endpoints, fund categorization, and value mappings throughout the explorer implementation.

## API Endpoints

```typescript
/**
 * Base endpoints for FMARKET API services
 */
export const FMARKET_API_ENDPOINTS = {
  /** Base URL for the FMARKET API */
  BASE: 'https://api.fmarket.vn/data',
  /** Endpoint for fund list */
  FUNDS: 'https://api.fmarket.vn/data/funds',
  /** Endpoint for fund details */
  FUND_DETAIL: (symbol: string) => `https://api.fmarket.vn/data/fund/${symbol}`,
  /** Endpoint for fund NAV history */
  FUND_NAV: (symbol: string) =>
    `https://api.fmarket.vn/data/fund/${symbol}/navs`,
  /** Endpoint for fund categories */
  CATEGORIES: 'https://api.fmarket.vn/data/categories',
  /** Endpoint for fund management companies */
  COMPANIES: 'https://api.fmarket.vn/data/companies',
};
```

## Fund Categories

```typescript
/**
 * Fund categories by investment strategy
 */
export enum FundCategory {
  /** Equity funds invest primarily in stocks */
  EQUITY = 'equity',
  /** Bond funds invest primarily in fixed income securities */
  BOND = 'bond',
  /** Balanced funds invest in a mix of equities and bonds */
  BALANCED = 'balanced',
  /** Money market funds invest in short-term, high-quality investments */
  MONEY_MARKET = 'money_market',
  /** ETFs (Exchange Traded Funds) track an index, sector, or commodity */
  ETF = 'etf',
  /** REIT (Real Estate Investment Trust) funds invest in real estate */
  REIT = 'reit',
  /** Fund of funds invest in other mutual funds */
  FUND_OF_FUNDS = 'fund_of_funds',
}

/**
 * Mapping of fund categories to their display names
 */
export const FUND_CATEGORY_NAMES: Record<FundCategory, string> = {
  [FundCategory.EQUITY]: 'Equity Fund',
  [FundCategory.BOND]: 'Bond Fund',
  [FundCategory.BALANCED]: 'Balanced Fund',
  [FundCategory.MONEY_MARKET]: 'Money Market Fund',
  [FundCategory.ETF]: 'Exchange Traded Fund',
  [FundCategory.REIT]: 'Real Estate Investment Trust',
  [FundCategory.FUND_OF_FUNDS]: 'Fund of Funds',
};
```

## Time Periods for Performance Metrics

```typescript
/**
 * Time periods for fund performance metrics
 */
export enum FundPerformancePeriod {
  /** One month performance */
  ONE_MONTH = '1M',
  /** Three month performance */
  THREE_MONTH = '3M',
  /** Six month performance */
  SIX_MONTH = '6M',
  /** Year to date performance */
  YEAR_TO_DATE = 'YTD',
  /** One year performance */
  ONE_YEAR = '1Y',
  /** Three year performance */
  THREE_YEAR = '3Y',
  /** Five year performance */
  FIVE_YEAR = '5Y',
  /** Ten year performance */
  TEN_YEAR = '10Y',
  /** Since inception performance */
  SINCE_INCEPTION = 'SI',
}
```

## Asset Types

```typescript
/**
 * Asset types for fund allocation
 */
export enum AssetType {
  /** Equity/stocks */
  EQUITY = 'equity',
  /** Fixed income/bonds */
  FIXED_INCOME = 'fixed_income',
  /** Cash and cash equivalents */
  CASH = 'cash',
  /** Real estate investments */
  REAL_ESTATE = 'real_estate',
  /** Alternative investments */
  ALTERNATIVE = 'alternative',
  /** Other asset types */
  OTHER = 'other',
}

/**
 * Mapping of asset types to their display names
 */
export const ASSET_TYPE_NAMES: Record<AssetType, string> = {
  [AssetType.EQUITY]: 'Equity',
  [AssetType.FIXED_INCOME]: 'Fixed Income',
  [AssetType.CASH]: 'Cash & Equivalents',
  [AssetType.REAL_ESTATE]: 'Real Estate',
  [AssetType.ALTERNATIVE]: 'Alternative Investments',
  [AssetType.OTHER]: 'Other Assets',
};
```

## Fee Types

```typescript
/**
 * Types of fees associated with funds
 */
export enum FeeType {
  /** Management fee - annual percentage charged by the fund manager */
  MANAGEMENT = 'management',
  /** Subscription fee - charged when buying fund units */
  SUBSCRIPTION = 'subscription',
  /** Redemption fee - charged when selling fund units */
  REDEMPTION = 'redemption',
  /** Performance fee - charged based on fund performance */
  PERFORMANCE = 'performance',
  /** Switching fee - charged when switching between funds */
  SWITCHING = 'switching',
}

/**
 * Mapping of fee types to their display names
 */
export const FEE_TYPE_NAMES: Record<FeeType, string> = {
  [FeeType.MANAGEMENT]: 'Management Fee',
  [FeeType.SUBSCRIPTION]: 'Subscription Fee',
  [FeeType.REDEMPTION]: 'Redemption Fee',
  [FeeType.PERFORMANCE]: 'Performance Fee',
  [FeeType.SWITCHING]: 'Switching Fee',
};
```

## Fund Status

```typescript
/**
 * Status of a fund
 */
export enum FundStatus {
  /** Fund is active and accepting investments */
  ACTIVE = 'active',
  /** Fund is closed for new investments */
  CLOSED = 'closed',
  /** Fund is in the process of liquidating */
  LIQUIDATING = 'liquidating',
  /** Fund is suspended from trading */
  SUSPENDED = 'suspended',
}

/**
 * Mapping of fund status to their display names
 */
export const FUND_STATUS_NAMES: Record<FundStatus, string> = {
  [FundStatus.ACTIVE]: 'Active',
  [FundStatus.CLOSED]: 'Closed',
  [FundStatus.LIQUIDATING]: 'Liquidating',
  [FundStatus.SUSPENDED]: 'Suspended',
};
```

## Risk Ratings

```typescript
/**
 * Risk rating levels for funds
 */
export enum RiskRating {
  /** Very low risk */
  VERY_LOW = 1,
  /** Low risk */
  LOW = 2,
  /** Medium/moderate risk */
  MEDIUM = 3,
  /** High risk */
  HIGH = 4,
  /** Very high risk */
  VERY_HIGH = 5,
}

/**
 * Mapping of risk ratings to their display names
 */
export const RISK_RATING_NAMES: Record<RiskRating, string> = {
  [RiskRating.VERY_LOW]: 'Very Low Risk',
  [RiskRating.LOW]: 'Low Risk',
  [RiskRating.MEDIUM]: 'Medium Risk',
  [RiskRating.HIGH]: 'High Risk',
  [RiskRating.VERY_HIGH]: 'Very High Risk',
};
```

## Major Management Companies

```typescript
/**
 * Major fund management companies in Vietnam
 */
export enum ManagementCompany {
  /** VinaCapital */
  VINACAPITAL = 'vinacapital',
  /** Dragon Capital */
  DRAGON_CAPITAL = 'dragon_capital',
  /** SSI Asset Management */
  SSI_AM = 'ssi_am',
  /** VietFund Management */
  VIETFUND = 'vietfund',
  /** VCBF (Vietcombank Fund Management) */
  VCBF = 'vcbf',
  /** Eastspring Investments */
  EASTSPRING = 'eastspring',
  /** Manulife Investment Management */
  MANULIFE = 'manulife',
}

/**
 * Mapping of management companies to their full names
 */
export const MANAGEMENT_COMPANY_NAMES: Record<ManagementCompany, string> = {
  [ManagementCompany.VINACAPITAL]: 'VinaCapital',
  [ManagementCompany.DRAGON_CAPITAL]: 'Dragon Capital',
  [ManagementCompany.SSI_AM]: 'SSI Asset Management',
  [ManagementCompany.VIETFUND]: 'VietFund Management',
  [ManagementCompany.VCBF]: 'Vietcombank Fund Management',
  [ManagementCompany.EASTSPRING]: 'Eastspring Investments',
  [ManagementCompany.MANULIFE]: 'Manulife Investment Management',
};
```

## Error Codes

```typescript
/**
 * FMARKET API error codes and messages
 */
export const FMARKET_ERROR_CODES: Record<string, string> = {
  FUND_NOT_FOUND: 'The requested fund was not found',
  INVALID_DATE_RANGE: 'The provided date range is invalid',
  RATE_LIMIT_EXCEEDED: 'API rate limit has been exceeded',
  INVALID_PARAMETER: 'One or more parameters are invalid',
  SERVER_ERROR: 'FMARKET server encountered an error',
  SERVICE_UNAVAILABLE: 'FMARKET service is currently unavailable',
};
```

## Utility Constants

```typescript
/**
 * Default request timeout in milliseconds
 */
export const FMARKET_DEFAULT_TIMEOUT = 30000;

/**
 * Date format for API requests (following moment.js format)
 */
export const FMARKET_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Default number of days for NAV history
 */
export const FMARKET_DEFAULT_HISTORY_DAYS = 365;

/**
 * Default currency for funds
 */
export const FMARKET_DEFAULT_CURRENCY = 'VND';
```

## Implementation Notes

When implementing these constants in TypeScript:

1. Create a dedicated `const.ts` file in the FMARKET explorer directory
2. Export all constants and enums for use in other modules
3. Use TypeScript's enum feature for fixed value sets
4. Use string literal types where appropriate for type safety
5. Document constants with JSDoc comments for better IDE integration

## Usage Example

```typescript
import {
  FMARKET_API_ENDPOINTS,
  FundCategory,
  FundPerformancePeriod,
  AssetType,
} from './const';

// Get all equity funds
const getFundsByCategory = async (category: FundCategory) => {
  const url = `${FMARKET_API_ENDPOINTS.FUNDS}?category=${category}`;
  // Make API call...
};

// Get fund performance over different time periods
const getFundPerformance = async (
  symbol: string,
  period: FundPerformancePeriod
) => {
  const url = `${FMARKET_API_ENDPOINTS.FUND_DETAIL(
    symbol
  )}/performance?period=${period}`;
  // Make API call...
};

// Get fund asset allocation
const getFundAssetAllocation = async (symbol: string) => {
  const url = `${FMARKET_API_ENDPOINTS.FUND_DETAIL(symbol)}/allocation`;
  // Make API call...
  // Process and categorize by AssetType
};
```

## Related Documentation

- [FMARKET Explorer Overview](./index.md)
- [Fund Data Implementation](./fund.md)
