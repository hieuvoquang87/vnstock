# VCI Constants Implementation

**Original Python Implementation**: [const.py](/vnstock/explorer/vci/const.py)


## Overview

The `const.py` file defines constants, mappings, and configuration values used throughout the VCI data source modules. These constants include API URLs, data type mappings, column mappings, and various other configuration values needed for data fetching and processing.

## Constants

### API URLs

- `_BASE_URL`: Base URL for the VCI API (e.g., "https://api.vci.com")
- `_TRADING_URL`: Base URL for the VCI trading API
- `_CHART_URL`: URL endpoint for chart data
- `_GRAPHQL_URL`: URL for GraphQL API endpoint
- `_INTRADAY_URL`: URL path for intraday data

### Time Intervals

- `_INTERVAL_MAP`: Maps string interval representations to numeric values
  ```
  {
    "1m": 1,
    "5m": 5,
    "15m": 15,
    "30m": 30,
    "1H": 60,
    "1D": 1440,
    "1W": 10080,
    "1M": 43200
  }
  ```

### Data Mappings

- `_OHLC_MAP`: Maps API response fields to standard OHLCV column names

  ```
  {
    "open": "open",
    "high": "high",
    "low": "low",
    "close": "close",
    "volume": "volume",
    "time": "time"
  }
  ```

- `_OHLC_DTYPE`: Data types for OHLCV columns

  ```
  {
    "open": "float64",
    "high": "float64",
    "low": "float64",
    "close": "float64",
    "volume": "float64",
    "time": "datetime64[ns]"
  }
  ```

- `_RESAMPLE_MAP`: Maps time intervals to pandas resample rule strings

  ```
  {
    "1m": "1min",
    "5m": "5min",
    "15m": "15min",
    "30m": "30min",
    "1H": "1H",
    "1D": "1D",
    "1W": "1W",
    "1M": "1M"
  }
  ```

- `_INTRADAY_MAP`: Maps API intraday data fields to standard column names

  ```
  {
    "p": "price",
    "v": "volume",
    "s": "side",
    "t": "time",
    "c": "position"
  }
  ```

- `_INTRADAY_DTYPE`: Data types for intraday data columns

  ```
  {
    "price": "float64",
    "volume": "float64",
    "side": "string",
    "time": "datetime64[ns]",
    "position": "string"
  }
  ```

- `_PRICE_INFO_MAP`: Maps price info fields from API to standard field names

  ```
  {
    "last_price": "price",
    "price_change": "change",
    "percent_price_change": "change_percent",
    "total_match_qtty": "volume",
    "total_match_value": "value"
  }
  ```

- `_PRICE_DEPTH_MAP`: Maps price depth fields from API to standard field names
  ```
  {
    "p": "price",
    "v": "volume",
    "r": "ratio"
  }
  ```

### Index Mappings

- `_INDEX_MAPPING`: Maps index names to their API equivalents
  ```
  {
    "VNINDEX": "VNINDEX",
    "VN30INDEX": "VN30",
    "HNXINDEX": "HNX",
    "HNX30INDEX": "HNX30",
    "UPCOMINDEX": "UPCOM"
  }
  ```

### Group Codes

- `_GROUP_CODE`: List of valid stock group codes
  ```
  ["VN30", "VNMID", "VNSML", "VN100", "VNALL", "VNX50", "VNDIAMOND", "VNFINLEAD", "VNFINSELECT", "VNCOND", "HNX30", "HNXINDEX", "UPCOM", "CW"]
  ```

### Financial Mappings

- `YEARLY_FINANCIAL_MAP`: Maps standard financial indicator names to API field names for yearly data
- `QUARTER_FINANCIAL_MAP`: Maps standard financial indicator names to API field names for quarterly data
- `FINANCIAL_INDICATOR_MAP`: Maps categories of financial indicators to API field names

## Implementation Details

When implementing in another language, ensure that:

1. All string constants are defined exactly as in the Python version
2. Object mappings (dictionaries) maintain the same key-value relationships
3. Data type mappings are adapted to the target language's type system

### TypeScript Implementation Example

```typescript
// API URLs
export const _BASE_URL = 'https://api.vci.com';
export const _TRADING_URL = 'https://trading.vci.com';
export const _CHART_URL = '/api/chart/history';
export const _GRAPHQL_URL = 'https://graphql.vci.com/query';
export const _INTRADAY_URL = '/trade';

// Time intervals
export const _INTERVAL_MAP: Record<string, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '1H': 60,
  '1D': 1440,
  '1W': 10080,
  '1M': 43200,
};

// OHLC mappings
export const _OHLC_MAP: Record<string, string> = {
  open: 'open',
  high: 'high',
  low: 'low',
  close: 'close',
  volume: 'volume',
  time: 'time',
};

export const _OHLC_DTYPE: Record<string, string> = {
  open: 'float64',
  high: 'float64',
  low: 'float64',
  close: 'float64',
  volume: 'float64',
  time: 'datetime64[ns]',
};

export const _RESAMPLE_MAP: Record<string, string> = {
  '1m': '1min',
  '5m': '5min',
  '15m': '15min',
  '30m': '30min',
  '1H': '1H',
  '1D': '1D',
  '1W': '1W',
  '1M': '1M',
};

// Intraday mappings
export const _INTRADAY_MAP: Record<string, string> = {
  p: 'price',
  v: 'volume',
  s: 'side',
  t: 'time',
  c: 'position',
};

export const _INTRADAY_DTYPE: Record<string, string> = {
  price: 'float64',
  volume: 'float64',
  side: 'string',
  time: 'datetime64[ns]',
  position: 'string',
};

// Price info mappings
export const _PRICE_INFO_MAP: Record<string, string> = {
  last_price: 'price',
  price_change: 'change',
  percent_price_change: 'change_percent',
  total_match_qtty: 'volume',
  total_match_value: 'value',
};

export const _PRICE_DEPTH_MAP: Record<string, string> = {
  p: 'price',
  v: 'volume',
  r: 'ratio',
};

// Index mappings
export const _INDEX_MAPPING: Record<string, string> = {
  VNINDEX: 'VNINDEX',
  VN30INDEX: 'VN30',
  HNXINDEX: 'HNX',
  HNX30INDEX: 'HNX30',
  UPCOMINDEX: 'UPCOM',
};

// Group codes
export const _GROUP_CODE: string[] = [
  'VN30',
  'VNMID',
  'VNSML',
  'VN100',
  'VNALL',
  'VNX50',
  'VNDIAMOND',
  'VNFINLEAD',
  'VNFINSELECT',
  'VNCOND',
  'HNX30',
  'HNXINDEX',
  'UPCOM',
  'CW',
];

// Financial mappings
export const YEARLY_FINANCIAL_MAP: Record<string, string> = {
  // ... same mappings as in Python
};

export const QUARTER_FINANCIAL_MAP: Record<string, string> = {
  // ... same mappings as in Python
};

export const FINANCIAL_INDICATOR_MAP: Record<string, Record<string, string>> = {
  // ... same mappings as in Python
};
```

## Notes

- When adapting to another language, ensure constant names remain the same for compatibility
- For languages with stricter typing than Python, define appropriate interfaces or type aliases
- Consider using enums for constants that represent a fixed set of options (like intervals)
- Maintain consistent naming conventions for constants (e.g., `_CAPITAL_SNAKE_CASE`)
