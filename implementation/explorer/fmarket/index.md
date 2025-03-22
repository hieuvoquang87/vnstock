# FMARKET Data Source Explorer

**Original Python Implementation**: [__init__.py](/vnstock/explorer/fmarket/__init__.py)


## Overview

The FMARKET data source explorer provides access to mutual fund data in Vietnam's financial market. This module interacts with the FMARKET APIs to retrieve information about various mutual funds, their NAV (Net Asset Value) history, performance metrics, and related investment information.

## Purpose

The FMARKET explorer is designed to:

- Retrieve information about mutual funds in Vietnam
- Track NAV (Net Asset Value) data for funds
- Analyze fund performance metrics
- Compare funds across different categories and strategies
- Monitor fund subscription and redemption history
- Provide insights into fund portfolio compositions

## Key Features

- **Fund Information**: Access to fund details including management companies, inception dates, and investment strategies
- **NAV History**: Historical Net Asset Value data and price changes
- **Performance Metrics**: Returns over various periods (1M, 3M, 6M, 1Y, 3Y, 5Y, YTD)
- **Portfolio Composition**: Asset allocation and top holdings
- **Fee Structure**: Information about management fees, subscription fees, and redemption fees
- **Subscription/Redemption History**: Historical data on fund flows

## Module Components

The FMARKET data source explorer consists of the following components:

| File       | Purpose                                           |
| ---------- | ------------------------------------------------- |
| `const.md` | Constants, mappings, and configuration values     |
| `fund.md`  | Mutual fund data retrieval and analysis functions |

## API Endpoints

The FMARKET explorer interacts with the FMARKET API endpoints to retrieve data:

- Fund List: `https://api.fmarket.vn/data/funds`
- Fund Detail: `https://api.fmarket.vn/data/fund/{symbol}`
- NAV History: `https://api.fmarket.vn/data/fund/{symbol}/navs`
- Fund Category: `https://api.fmarket.vn/data/categories`

## Authentication

The FMARKET APIs used in this explorer are public-facing and do not require authentication tokens. However, some endpoints may have rate limiting in place.

## Implementation Notes

When implementing the FMARKET explorer in TypeScript:

1. Create a `FmarketExplorer` class that extends the `BaseExplorer` class
2. Implement API methods for retrieving fund data
3. Define TypeScript interfaces for API responses
4. Provide data transformation to standardize response formats
5. Handle error cases and API limitations

## Key Differences from Other Explorers

The FMARKET data source has several unique characteristics compared to other data sources:

- Focuses exclusively on mutual funds rather than stocks
- Includes NAV (Net Asset Value) instead of market prices
- Provides fund-specific metrics like asset allocation
- Offers information about fund management companies

## Usage Examples

```typescript
// Example of using the FmarketExplorer in TypeScript
import { FmarketExplorer } from '../explorer/fmarket';

const explorer = new FmarketExplorer();

// Get list of all funds
const funds = await explorer.getFundList();

// Get details for a specific fund
const fundDetail = await explorer.getFundDetail('VESAF');

// Get NAV history for a fund
const navHistory = await explorer.getFundNavHistory('VESAF');

// Get funds by category
const equityFunds = await explorer.getFundsByCategory('equity');
```

## Relationship to Other Modules

The FMARKET explorer can be used:

1. Directly by accessing its methods
2. Through the unified `Fund` modules in the finance_data directory
3. As a data source for fund analysis and comparison

## Fund Data Structure

Each fund record typically includes the following information:

- **Symbol**: The unique identifier for the fund (e.g., "VESAF")
- **Name**: The full name of the fund
- **Management Company**: The company managing the fund
- **Fund Type**: The category or strategy of the fund (e.g., equity, bond, balanced)
- **Inception Date**: When the fund was established
- **NAV**: The current Net Asset Value per unit
- **AUM**: Assets Under Management
- **Currency**: The currency in which the fund is denominated
- **Performance**: Historical returns over different time periods
- **Fees**: Management, subscription, and redemption fees

## Implementation Considerations

1. **Data Update Frequency**: Fund NAV data is typically updated daily or weekly
2. **Caching**: Implement caching for fund list and details that don't change frequently
3. **Rate Limiting**: Implement rate limiting to avoid exceeding API limits
4. **Error Handling**: Comprehensive error handling for API failures
5. **Data Validation**: Validate fund symbols and date ranges before sending requests

## Related Documentation

- [Fund Data Implementation](./fund.md)
- [Constants and Configurations](./const.md)
