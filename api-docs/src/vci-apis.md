# VCI APIs Documentation

This document provides documentation for the APIs used to interact with VCI (Vietcap Securities) data services.

## Base URLs

```
Main API: https://mt.vietcap.com.vn/api/
Trading API: https://trading.vietcap.com.vn/api/
GraphQL API: https://api.vietcap.com.vn/data-mt/graphql
AI API: https://ai.vietcap.com.vn/api/
```

## Endpoints

### 1. Company Information

#### 1.1 Company Overview

- **URL**: `https://api.vietcap.com.vn/data-mt/graphql`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Query**:
  ```graphql
  query Query($ticker: String!, $lang: String!) {
    CompanyListingInfo(ticker: $ticker) {
      id
      issueShare
      en_History
      history
      en_CompanyProfile
      companyProfile
      icbName3
      enIcbName3
      icbName2
      enIcbName2
      icbName4
      enIcbName4
      financialRatio {
        id
        ticker
        issueShare
        charterCapital
        __typename
      }
      __typename
    }
  }
  ```
- **Variables**:
  ```json
  {
    "ticker": "VNM",
    "lang": "vi" // vi for Vietnamese, en for English
  }
  ```

#### 1.2 Shareholders Information

- **URL**: `https://api.vietcap.com.vn/data-mt/graphql`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Query**:
  ```graphql
  query Query($ticker: String!, $lang: String!) {
    OrganizationShareHolders(ticker: $ticker) {
      id
      ticker
      ownerFullName
      en_OwnerFullName
      quantity
      percentage
      updateDate
      __typename
    }
  }
  ```

#### 1.3 Company Officers

- **URL**: `https://api.vietcap.com.vn/data-mt/graphql`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Query**:
  ```graphql
  query Query($ticker: String!, $lang: String!) {
    OrganizationManagers(ticker: $ticker) {
      id
      ticker
      fullName
      positionName
      positionShortName
      en_PositionName
      en_PositionShortName
      updateDate
      percentage
      quantity
      __typename
    }
  }
  ```

#### 1.4 Subsidiaries and Affiliates

- **URL**: `https://api.vietcap.com.vn/data-mt/graphql`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Query**:
  ```graphql
  query Query($ticker: String!, $lang: String!) {
    Subsidiary(ticker: $ticker) {
      id
      organCode
      subOrganCode
      percentage
      subOrListingInfo {
        enOrganName
        organName
        __typename
      }
      __typename
    }
    Affiliate(ticker: $ticker) {
      id
      organCode
      subOrganCode
      percentage
      subOrListingInfo {
        enOrganName
        organName
        __typename
      }
      __typename
    }
  }
  ```

### 2. Financial Reports

#### 2.1 Financial Ratios

- **URL**: `https://api.vietcap.com.vn/data-mt/graphql`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Query**:
  ```graphql
  query Query($ticker: String!, $period: String!) {
    CompanyFinancialRatio(ticker: $ticker, period: $period) {
      ratio {
        ticker
        yearReport
        lengthReport
        updateDate
        // ... financial metrics
      }
      period
      __typename
    }
  }
  ```
- **Variables**:
  ```json
  {
    "ticker": "VNM",
    "period": "Q" // Q for quarterly, Y for yearly
  }
  ```

### 3. Market Listing

#### 3.1 All Symbols

- **URL**: `https://ai.vietcap.com.vn/api/get_all_tickers`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json

#### 3.2 Symbols by Industry

- **URL**: `https://api.vietcap.com.vn/data-mt/graphql`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Query**:
  ```graphql
  query Query {
    CompaniesListingInfo {
      ticker
      organName
      enOrganName
      icbName3
      enIcbName3
      icbName2
      enIcbName2
      icbName4
      enIcbName4
      comTypeCode
      icbCode1
      icbCode2
      icbCode3
      icbCode4
      __typename
    }
  }
  ```

#### 3.3 Symbols by Exchange

- **URL**: `https://mt.vietcap.com.vn/api/price/symbols/getAll`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json

#### 3.4 Symbols by Group

- **URL**: `https://mt.vietcap.com.vn/api/price/symbols/getByGroup`
- **Method**: GET
- **Headers**:
  - Content-Type: application/json
- **Parameters**:
  - `group`: Group code (VN30, HNX30, etc.)

### 4. Trading Data

#### 4.1 Price Board

- **URL**: `https://trading.vietcap.com.vn/api/price/symbols/getList`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Request Body**:
  ```json
  {
    "symbols": ["VNM", "FPT", "VIC"]
  }
  ```

#### 4.2 Historical Price Data

- **URL**: `https://trading.vietcap.com.vn/api/chart/OHLCChart/gap`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Request Body**:
  ```json
  {
    "timeFrame": "ONE_DAY", // ONE_MINUTE, ONE_HOUR, ONE_DAY
    "symbols": ["VNM"],
    "from": 1709251200, // Unix timestamp
    "to": 1709337600 // Unix timestamp
  }
  ```

#### 4.3 Intraday Trading Data

- **URL**: `https://trading.vietcap.com.vn/api/market-watch/LEData/getAll`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Request Body**:
  ```json
  {
    "symbol": "VNM",
    "limit": 100,
    "truncTime": "2024-03-01 09:00:00" // Optional, for pagination
  }
  ```

#### 4.4 Price Depth Data

- **URL**: `https://trading.vietcap.com.vn/api/market-watch/AccumulatedPriceStepVol/getSymbolData`
- **Method**: POST
- **Headers**:
  - Content-Type: application/json
- **Request Body**:
  ```json
  {
    "symbol": "VNM"
  }
  ```

## Parameters

### Time Intervals

- `1m`: One minute
- `5m`: Five minutes
- `15m`: Fifteen minutes
- `30m`: Thirty minutes
- `1H`: One hour
- `1D`: One day
- `1W`: One week
- `1M`: One month

### Report Periods

- `Q`: Quarterly
- `Y`: Yearly

### Index Mappings

- `VNINDEX`: VNINDEX
- `HNXINDEX`: HNXIndex
- `UPCOMINDEX`: HNXUpcomIndex

### Group Codes

- `HOSE`: Ho Chi Minh Stock Exchange
- `VN30`: VN30 Index
- `VNMidCap`: VNMidCap Index
- `VNSmallCap`: VNSmallCap Index
- `VNAllShare`: VNAllShare Index
- `VN100`: VN100 Index
- `ETF`: Exchange Traded Funds
- `HNX`: Hanoi Stock Exchange
- `HNX30`: HNX30 Index
- `HNXCon`: HNX Construction
- `HNXFin`: HNX Finance
- `HNXLCap`: HNX Large Cap
- `HNXMSCap`: HNX Mid & Small Cap
- `HNXMan`: HNX Manufacturing
- `UPCOM`: UPCOM Market
- `FU_INDEX`: Futures Indices
- `CW`: Covered Warrants
- `BOND`: Bonds
- `FU_BOND`: Government Bonds

## Notes

1. All requests require appropriate headers including user-agent information
2. Rate limiting may apply to these endpoints
3. Some endpoints may only be available during market hours
4. The `symbol` parameter should be in uppercase format
5. Timestamps should be in Unix timestamp format (seconds since epoch)
6. Intraday and price depth data are only available during market hours
7. The GraphQL API supports both Vietnamese and English responses (use `lang` parameter)
8. Financial ratios are company-type specific (Bank, Insurance, Securities, etc.)
9. Some endpoints may require authentication
10. Response data may be paginated for large datasets
