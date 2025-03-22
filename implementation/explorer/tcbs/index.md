# TCBS Data Source Explorer

**Original Python Implementation**: [__init__.py](/vnstock/explorer/tcbs/__init__.py)


## Overview

The TCBS (Techcom Securities) data source explorer provides access to financial data from the TCBS platform, one of Vietnam's leading securities companies. This module interacts with TCBS APIs to retrieve various types of financial data, market information, and trading data.

## Purpose

The TCBS explorer is designed to:

- Fetch real-time and historical stock quotes
- Retrieve company profiles and financial information
- Access trading data including prices, volumes, and order book details
- Provide technical analysis indicators
- Enable stock screening functionality
- Access financial statements and ratios

## Key Features

- **Real-time Data**: Access to real-time stock quotes and market data
- **Financial Information**: Company profiles, financial statements, and ratios
- **Technical Analysis**: Tools for technical analysis and stock screening
- **Historical Data**: Historical OHLC (Open, High, Low, Close) price data
- **Industry Classification**: Industry and sector classification data
- **Ownership Information**: Major shareholders and ownership structure

## Module Components

The TCBS data source explorer consists of the following components:

| File           | Purpose                                       |
| -------------- | --------------------------------------------- |
| `company.md`   | Company profile and business information      |
| `const.md`     | Constants, mappings, and configuration values |
| `financial.md` | Financial statements and ratios               |
| `listing.md`   | Stock listings and ticker information         |
| `models.md`    | Data validation models                        |
| `quote.md`     | Price quotes and historical data              |
| `screener.md`  | Stock screening functionality                 |
| `trading.md`   | Trading data including order book             |

## API Endpoints

The TCBS explorer interacts with multiple TCBS API endpoints to retrieve data:

- Stock Information: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock/...`
- Company Data: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company/...`
- Market Data: `https://apipubaws.tcbs.com.vn/market/...`
- Technical Analysis: `https://apipubaws.tcbs.com.vn/technical-analysis/...`

## Authentication

The TCBS APIs used in this explorer are public-facing and generally do not require authentication tokens. However, some endpoints may require specific headers or have rate limiting.

## Implementation Notes

When implementing the TCBS explorer in TypeScript:

1. Create a `TcbsExplorer` class that extends the `BaseExplorer` class
2. Implement API methods corresponding to each data type
3. Define TypeScript interfaces for API responses
4. Provide data transformation to standardize response formats
5. Handle error cases and API limitations

## Key Differences from Other Data Sources

The TCBS data source has several unique features compared to other sources:

- Advanced stock screening capabilities
- Detailed industry classification system
- Richer technical analysis indicators
- More comprehensive financial ratio data

## Usage Examples

```typescript
// Example of using the TcbsExplorer in TypeScript
import { TcbsExplorer } from '../explorer/tcbs';

const explorer = new TcbsExplorer();

// Get stock quote
const quote = await explorer.getQuote('VNM');

// Get company profile
const profile = await explorer.getCompanyProfile('VNM');

// Get financial ratios
const ratios = await explorer.getFinancialRatios('VNM', 'quarterly');

// Get industry list
const industries = await explorer.getIndustries();
```

## Relationship to Other Modules

The TCBS explorer can be used:

1. Directly by accessing its methods
2. Through the unified `Quote`, `Company`, and `Finance` modules
3. As a data source for analysis and visualization tools

## Related Documentation

- [TCBS API Overview](https://www.tcbs.com.vn/en/developer) (if available)
- [Models Documentation](./models.md)
- [Stock Quote Implementation](./quote.md)
- [Financial Data Implementation](./financial.md)
