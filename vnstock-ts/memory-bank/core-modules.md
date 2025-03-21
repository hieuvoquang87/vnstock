# Core Modules

This document details the core modules of the vnstock-ts library that need to be implemented first.

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
- **TCBS Explorer** ❌ - For accessing the TCBS data API
- **SSI Explorer** ❌ - For accessing the SSI data API
- **VND Explorer** ❌ - For accessing the VNDirect data API

## Data Modules

These are higher-level modules that provide business logic and data processing.

- **Quote Module** ✅ - For stock price data
  - Real-time quotes
  - Historical data
  - Intraday data
- **Listing Module** ✅ - For stock listings and ticker data
  - Get all stocks
  - Filter by exchange
  - Filter by industry
- **Company Module** ✅ - For company information
  - Company profiles
  - Company ownership
  - Multi-symbol requests
- **Financial Module** ❌ - For financial data
  - Financial statements
  - Financial ratios
  - Dividend history

## Current Implementation Status

| Module             | Status | Description                                            |
| ------------------ | ------ | ------------------------------------------------------ |
| Core Utilities     | ✅     | All core utilities are implemented                     |
| Types & Interfaces | ✅     | All type definitions and interfaces are defined        |
| Configuration      | ✅     | Configuration system with defaults and customization   |
| Base Explorer      | ✅     | Abstract base class for data source explorers          |
| VCI Explorer       | ✅     | Implementation for Vietstock API                       |
| Quote Module       | ✅     | Real-time quotes, historical data, and intraday data   |
| Listing Module     | ✅     | Stock listings with filtering by exchange and industry |
| Company Module     | ✅     | Company profiles and ownership information             |

## Implementation Order

1. ✅ Core Utilities - All basic utilities required by other modules
2. ✅ Types & Interfaces - Type definitions and interfaces
3. ✅ Configuration - Configuration system and constants
4. ✅ Base Explorer - Common functionality for data source explorers
5. ✅ VCI Explorer - First data source implementation
6. ✅ Quote Module - Initial implementation of stock price data
7. ✅ Listing Module - Initial implementation of stock listings
8. ✅ Company Module - Implementation of company information
9. ❌ Financial Module - Implementation of financial data
10. ❌ TCBS Explorer - Second data source implementation
11. ❌ SSI Explorer - Third data source implementation
