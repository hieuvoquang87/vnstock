# Core Modules

This document describes the core modules of the vnstock-ts library and their implementation status.

## Core Utilities ✅

These are the fundamental utility modules that the rest of the system depends on.

- **Logger** ✅ - Logging utility
- **HTTP Client** ✅ - Client for making API requests
- **Error Handling** ✅ - Custom error classes and error handling utilities
- **Configuration Management** ✅ - Configuration options and management
- **Data Transformation** ✅ - Utilities for transforming data between formats
- **Market Utilities** ✅ - Utilities for market time and session detection

## Data Source Explorers

These are the modules that interact with external data sources.

- **Base Explorer** ✅ - Base class for all data source explorers
- **VCI Explorer** ✅ - For accessing the Vietstock data API
- **TCBS Explorer** ✅ - For accessing the TCBS data API
- **SSI Explorer** ✅ - For accessing the SSI data API
- **VND Explorer** ❌ - For accessing the VNDirect data API

## Data Modules

These are higher-level modules that provide business logic and data processing.

### Listing Module ✅

The listing module provides access to stock listings and ticker information from various sources:

- Get all available symbols/tickers
- Get ticker information for a specific stock
- Filter listings by exchange, industry, etc.
- Get industry and sector classifications
- **Multi-data source support** ✅ - Dynamically switch between VCI, TCBS, and SSI data sources

### Quote Module ✅

The quote module provides access to real-time and historical price data:

- Get real-time quotes for a single stock or multiple stocks
- Get historical OHLC data with customizable timeframes
- Get intraday trading data
- Get market indices
- Get top gaining/losing stocks
- **Multi-data source support** ✅ - Dynamically switch between VCI, TCBS, and SSI data sources

### Company Module ✅

The company module provides access to company information:

- Get company profiles with business description
- Get ownership data and major shareholders
- Get insider trading activities
- Get company news and events

### Finance Module ✅

The finance module provides access to financial statements and ratios:

- Get income statements (quarterly/yearly)
- Get balance sheets (quarterly/yearly)
- Get cash flow statements (quarterly/yearly)
- Get financial ratios and metrics
- Support for both VCI and TCBS data sources
- Customizable period ranges

### Technical Module ❌

The technical module will provide access to technical indicators and analysis:

- Calculate common technical indicators (RSI, MACD, etc.)
- Generate signals based on indicator crossovers
- Detect chart patterns
- Backtest simple strategies

### Screener Module ❌

The screener module will provide stock screening capabilities:

- Screen stocks based on fundamental criteria
- Screen stocks based on technical criteria
- Filter by various metrics and indicators
- Sort and rank stocks based on criteria

### News Module ❌

The news module will provide access to market news and events:

- Get latest news for specific stocks
- Get market news and analysis
- Get corporate events and announcements
- Get analyst recommendations

## Current Implementation Status

| Module             | Status | Datasources    | Description                                          |
| ------------------ | ------ | -------------- | ---------------------------------------------------- |
| Core Utilities     | ✅     | -              | All core utilities are implemented                   |
| Types & Interfaces | ✅     | -              | All type definitions and interfaces are defined      |
| Configuration      | ✅     | -              | Configuration system with defaults and customization |
| Base Explorer      | ✅     | -              | Abstract base class for data source explorers        |
| VCI Explorer       | ✅     | -              | Implementation for Vietstock API                     |
| TCBS Explorer      | ✅     | -              | Implementation for TCBS API                          |
| SSI Explorer       | ✅     | -              | Implementation for SSI API                           |
| Listing Module     | ✅     | VCI, TCBS, SSI | Provides stock listings and ticker information       |
| Quote Module       | ✅     | VCI, TCBS, SSI | Provides real-time and historical price data         |
| Company Module     | ✅     | VCI, TCBS, SSI | Provides company information and ownership data      |
| Finance Module     | ✅     | VCI, TCBS, SSI | Provides financial statements and ratios             |
| Technical Module   | ❌     | -              | Will provide technical indicators and analysis       |
| Screener Module    | ❌     | -              | Will provide stock screening capabilities            |
| News Module        | ❌     | -              | Will provide market news and events                  |

## Multi-data Source Support Status

| Module         | Multi-source Support | Dynamic Switching | Default Source |
| -------------- | -------------------- | ----------------- | -------------- |
| Listing Module | ✅                   | ✅                | VCI            |
| Quote Module   | ✅                   | ✅                | VCI            |
| Company Module | ❌                   | ❌                | VCI            |
| Finance Module | ❌                   | ❌                | VCI            |

## Implementation Order

1. ✅ Listing Module
2. ✅ Quote Module
3. ✅ Company Module
4. ✅ Finance Module
5. ✅ SSI Explorer
6. ❌ Company Module (multi-source)
7. ❌ Finance Module (multi-source)
8. ❌ VND Explorer
9. ❌ Technical Module
10. ❌ Screener Module
11. ❌ News Module

## Enhancement Roadmap

1. Add multi-data source support to Company Module
2. Add multi-data source support to Finance Module
3. Implement VND data source explorer
4. Add technical analysis capabilities
5. Develop comprehensive testing suite
6. Enhance error handling and recovery mechanisms
7. Optimize API calls with caching
8. Implement rate limiting prevention
