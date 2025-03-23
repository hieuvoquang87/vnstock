# TCBS APIs Documentation

This document provides documentation for the APIs used to interact with TCBS (Techcombank Securities) data services.

## Base URLs

```
Main API: https://apipubaws.tcbs.com.vn/
```

## API Summary

The TCBS API is organized into 5 main categories with a total of 15 endpoints:

1. **Company Information** (9 endpoints)

   - Company Overview
   - Company Profile
   - Shareholders Information
   - Insider Deals
   - Subsidiaries
   - Company Officers
   - Company Events
   - Company News
   - Dividends

2. **Financial Reports** (4 endpoints)

   - Balance Sheet
   - Income Statement
   - Cash Flow
   - Financial Ratios

3. **Market Data** (3 endpoints)

   - Historical Price Data
   - Intraday Trading Data
   - Price Board

4. **Stock Screener** (1 endpoint)

   - Stock Screening

5. **Trading Data** (2 endpoints)
   - Price Board (Real-time)
   - Intraday Trading History

Each category serves a specific purpose:

- Company Information: Provides detailed information about companies, their structure, and corporate events
- Financial Reports: Offers access to financial statements and performance metrics
- Market Data: Delivers real-time and historical market data
- Stock Screener: Enables filtering and screening of stocks based on various criteria
- Trading Data: Provides real-time trading information and intraday trading history

## Implementation

- Implementation file: [TCBS Client](./tcbsClient.ts)

## Endpoints

### 1. Company Information

#### 1.1 Company Overview

- **URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/{symbol}/overview`
- **Example**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/VNM/overview`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
- **Response Fields**:
  - `ticker`: Stock symbol
  - `exchange`: Exchange name
  - `industry`: Industry name
  - `companyType`: Company type
  - `noShareholders`: Number of shareholders
  - `foreignPercent`: Foreign ownership percentage
  - `outstandingShare`: Outstanding shares
  - `issueShare`: Issued shares
  - `establishedYear`: Year established
  - `noEmployees`: Number of employees
  - `stockRating`: Stock rating
  - `deltaInWeek`: Price change in week
  - `deltaInMonth`: Price change in month
  - `deltaInYear`: Price change in year
  - `shortName`: Company short name
  - `website`: Company website
  - `industryID`: Industry ID
  - `industryIDv2`: Industry ID v2

#### 1.2 Company Profile

- **URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company/{symbol}/overview`
- **Example**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company/VNM/overview`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")

#### 1.3 Shareholders Information

- **URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company/{symbol}/large-share-holders`
- **Example**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company/VNM/large-share-holders`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")

#### 1.4 Insider Deals

- **URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company/{symbol}/insider-dealing`
- **Example**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company/VNM/insider-dealing?page=0&size=20`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 20)

#### 1.5 Subsidiaries

- **URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/company/{symbol}/subsidiaries`
- **Example**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/company/VNM/subsidiaries?page=0&size=100`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 100)

#### 1.6 Company Officers

- **URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/company/{symbol}/officers`
- **Example**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/company/VNM/officers?page=0&size=20`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 20)

#### 1.7 Company Events

- **URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/{symbol}/events-news`
- **Example**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/VNM/events-news?page=0&size=15`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 15)

#### 1.8 Company News

- **URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/{symbol}/activity-news`
- **Example**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/ticker/VNM/activity-news?page=0&size=15`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 15)

#### 1.9 Dividends

- **URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/company/{symbol}/dividends`
- **Example**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/company/VNM/dividends?page=0&size=15`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 15)

### 2. Financial Reports

#### 2.1 Balance Sheet

- **URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/finance/{symbol}/balance-sheet`
- **Example**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/finance/VNM/balance-sheet?yearly=true&isAll=true`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `yearly`: Report period ("true" for yearly, "false" for quarterly)
  - `isAll`: Get all data ("true" or "false")

#### 2.2 Income Statement

- **URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/finance/{symbol}/income-statement`
- **Example**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/finance/VNM/income-statement?yearly=true&isAll=true`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `yearly`: Report period ("true" for yearly, "false" for quarterly)
  - `isAll`: Get all data ("true" or "false")

#### 2.3 Cash Flow

- **URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/finance/{symbol}/cash-flow`
- **Example**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/finance/VNM/cash-flow?yearly=true&isAll=true`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `yearly`: Report period ("true" for yearly, "false" for quarterly)
  - `isAll`: Get all data ("true" or "false")

#### 2.4 Financial Ratios

- **URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/finance/{symbol}/financialratio`
- **Example**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/finance/VNM/financialratio?yearly=true&isAll=true`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol (e.g., "VNM")
  - `yearly`: Report period ("true" for yearly, "false" for quarterly)
  - `isAll`: Get all data ("true" or "false")

### 3. Market Data

#### 3.1 Historical Price Data

- **URL**: `https://apipubaws.tcbs.com.vn/stock/v2/stock/bars-long-term`
- **Example**: `https://apipubaws.tcbs.com.vn/stock/v2/stock/bars-long-term?resolution=D&ticker=VNM&type=stock&to=1709251200&countBack=365`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `resolution`: Time interval (1, 5, 15, 30, 60, D, W, M)
  - `ticker`: Stock symbol
  - `type`: Asset type (stock, index, derivative)
  - `to`: End timestamp (Unix timestamp)
  - `countBack`: Number of data points to return

#### 3.2 Intraday Trading Data

- **URL**: `https://apipubaws.tcbs.com.vn/stock/v1/intraday/{symbol}/his/paging`
- **Example**: `https://apipubaws.tcbs.com.vn/stock/v1/intraday/VNM/his/paging?page=0&size=100`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `symbol`: Stock symbol
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 100)

#### 3.3 Price Board

- **URL**: `https://apipubaws.tcbs.com.vn/stock/v1/stock/second-tc-price`
- **Example**: `https://apipubaws.tcbs.com.vn/stock/v1/stock/second-tc-price?tickers=VNM,FPT,HPG`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `tickers`: Comma-separated list of stock symbols

### 4. Stock Screener

#### 4.1 Stock Screening

- **URL**: `https://apipubaws.tcbs.com.vn/ligo/v1/watchlist/preview`
- **Example**: `https://apipubaws.tcbs.com.vn/ligo/v1/watchlist/preview`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Request Body**:
  ```json
  {
    "tcbsID": "optional_screener_id",
    "filters": [
      {
        "key": "filter_name",
        "operator": ">=",
        "value": "filter_value"
      }
    ],
    "size": 50
  }
  ```
- **Parameters**:
  - `tcbsID`: Optional screener ID
  - `filters`: Array of filter objects with key, operator, and value
  - `size`: Number of results to return

## Parameters

### Time Intervals

- `1`: One minute
- `5`: Five minutes
- `15`: Fifteen minutes
- `30`: Thirty minutes
- `60`: One hour
- `D`: One day
- `W`: One week
- `M`: One month

### Report Periods

- `yearly=true`: Yearly reports
- `yearly=false`: Quarterly reports

### Asset Types

- `stock`: Common stocks
- `index`: Market indices
- `derivative`: Derivatives (futures, options)

### Filter Operators

- `=`: Equal to
- `>=`: Greater than or equal to
- `<=`: Less than or equal to
- `>`: Greater than
- `<`: Less than
- `!=`: Not equal to

## Notes

1. All requests require appropriate headers including user-agent information
2. Rate limiting may apply to these endpoints
3. Some endpoints may only be available during market hours
4. The `symbol` parameter should be in uppercase format
5. Timestamps should be in Unix timestamp format (seconds since epoch)
6. Intraday data is only available during market hours
7. The API supports both Vietnamese and English responses (use `lang` parameter)
8. Financial ratios are company-type specific
9. Response data may be paginated for large datasets
10. Stock screener filters can be combined for complex queries
11. Historical data requests with long date ranges are automatically split into chunks
