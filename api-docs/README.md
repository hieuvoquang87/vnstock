# TCBS API Client

A TypeScript client for interacting with TCBS (Techcombank Securities) APIs. This client provides functions to fetch various types of data including company information, financial reports, market data, and stock screening.

## Features

- Company Information APIs

  - Company Overview
  - Company Profile
  - Shareholders Information
  - Insider Deals
  - Subsidiaries
  - Company Officers
  - Company Events
  - Company News
  - Dividends

- Financial Reports APIs

  - Balance Sheet
  - Income Statement
  - Cash Flow
  - Financial Ratios

- Market Data APIs

  - Historical Price Data
  - Intraday Trading Data
  - Price Board

- Stock Screener API
  - Stock Screening with custom filters

## Installation

1. Navigate to the api-docs directory:

```bash
cd api-docs
```

2. Install dependencies:

```bash
npm install
```

## Usage

1. Import the functions you need:

```typescript
import { getCompanyOverview, getBalanceSheet } from './tcbs-apis';
```

2. Call the functions with appropriate parameters:

```typescript
// Get company overview
const overview = await getCompanyOverview('VNM');

// Get balance sheet
const balanceSheet = await getBalanceSheet('VNM');
```

3. Run the example script to test all APIs:

```bash
npm start
```

## Response Data

All API responses are automatically saved to JSON files in the `samples/tcbs` directory. The files are named according to the API endpoint:

- `company_overview.json`
- `company_profile.json`
- `shareholders_info.json`
- `insider_deals.json`
- `subsidiaries.json`
- `company_officers.json`
- `company_events.json`
- `company_news.json`
- `dividends.json`
- `balance_sheet.json`
- `income_statement.json`
- `cash_flow.json`
- `financial_ratios.json`
- `historical_price_data.json`
- `intraday_trading_data.json`
- `price_board.json`
- `stock_screening.json`

## Error Handling

All functions include basic error handling and will throw an error if the API request fails. You can catch these errors using try-catch blocks:

```typescript
try {
  const data = await getCompanyOverview('VNM');
  console.log(data);
} catch (error) {
  console.error('Error fetching company overview:', error);
}
```

## Notes

1. The API requires appropriate headers including user-agent information
2. Rate limiting may apply to these endpoints
3. Some endpoints may only be available during market hours
4. The `symbol` parameter should be in uppercase format
5. Timestamps should be in Unix timestamp format (seconds since epoch)
6. Intraday data is only available during market hours
7. The API supports both Vietnamese and English responses
8. Financial ratios are company-type specific
9. Some endpoints may require authentication
10. Response data may be paginated for large datasets
11. Stock screener filters can be combined for complex queries
12. Historical data requests with long date ranges are automatically split into chunks
