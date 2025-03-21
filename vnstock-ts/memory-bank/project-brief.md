# vnstock TypeScript Project Brief

## Project Overview

This project aims to convert the `vnstock` Python package to TypeScript. Instead of a line-by-line translation, we're implementing equivalent functionality that leverages TypeScript's strengths and ecosystem. The goal is to create a TypeScript package that provides the same financial data capabilities as the Python version, but with a more TypeScript-native approach.

## Original Python Package Structure

The Python `vnstock` package is organized into several modules:

- **explorer/** - Data source modules for different brokers and platforms (VCI, TCBS, MSN, etc.)
- **core/** - Core functionality including utilities, configuration, and converters
- **common/** - Common functionality including CLI, data handling, and plotting
- **connector/** - API connectors for trading platforms
- **botbuilder/** - Functionality for building notification bots

## Implementation Approach

Our implementation follows these key principles:

1. **Start with models and constants** - Implement data models and constants first
2. **Implement core utilities** - Build logging, HTTP clients, and data transformation utilities
3. **Implement data sources** - Convert data source modules one by one
4. **Connect components** - Connect everything with proper exports
5. **TypeScript-first approach** - Use TypeScript's type system and ecosystem

## TypeScript Implementation Guidelines

- Use TypeScript interfaces to define data structures
- Use classes for components with state and behavior
- Implement async/await for asynchronous operations
- Use modern TypeScript libraries for HTTP requests, data transformation, and date handling
- Implement proper error handling with try/catch
- Create a modular structure that allows tree-shaking

## Key Utility Functions

The following utility functions will be needed across the codebase:

- Logger creation and management
- Market trading hours checking
- Asset type determination
- HTTP request handling with proper headers
- Data transformation utilities
- Error handling

## Data Flow

The general data flow in both versions:

1. User creates an instance of a data class
2. The class validates inputs and prepares request parameters
3. The class sends requests to API endpoints
4. The response is transformed into a standardized format
5. Data is returned to the user

## Project File Structure

The TypeScript implementation will use the following structure:

```
vnstock-ts/
├── package.json              # Package configuration
├── tsconfig.json             # TypeScript configuration
├── README.md                 # Project documentation
├── src/
│   ├── index.ts              # Main entry point and exports
│   ├── explorer/             # Data source modules
│   │   ├── index.ts          # Explorer module exports
│   │   ├── vci/              # VCI data source
│   │   │   ├── index.ts      # VCI module exports
│   │   │   ├── analysis.ts   # Technical analysis
│   │   │   ├── company.ts    # Company information
│   │   │   ├── const.ts      # Constants
│   │   │   ├── financial.ts  # Financial data
│   │   │   ├── listing.ts    # Listings data
│   │   │   ├── models.ts     # Data models
│   │   │   ├── quote.ts      # Price quotes
│   │   │   └── trading.ts    # Trading data
│   │   ├── tcbs/             # TCBS data source
│   │   │   ├── index.ts
│   │   │   ├── analysis.ts
│   │   │   ├── company.ts
│   │   │   ├── const.ts
│   │   │   ├── financial.ts
│   │   │   ├── listing.ts
│   │   │   ├── models.ts
│   │   │   ├── quote.ts
│   │   │   ├── screener.ts
│   │   │   └── trading.ts
│   │   ├── fmarket/          # FMARKET data source
│   │   │   ├── index.ts
│   │   │   ├── const.ts
│   │   │   └── fund.ts
│   │   ├── msn/              # MSN data source
│   │   │   ├── index.ts
│   │   │   ├── const.ts
│   │   │   ├── helper.ts
│   │   │   ├── listing.ts
│   │   │   ├── models.ts
│   │   │   └── quote.ts
│   │   └── misc/             # Miscellaneous data sources
│   │       ├── index.ts
│   │       ├── exchange_rate.ts
│   │       └── gold_price.ts
│   ├── core/                 # Core functionality
│   │   ├── index.ts
│   │   ├── utils/            # Utility functions
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   ├── env.ts
│   │   │   ├── ext.ts
│   │   │   ├── help.ts
│   │   │   ├── launcher.ts
│   │   │   ├── logger.ts
│   │   │   ├── market.ts
│   │   │   ├── parser.ts
│   │   │   ├── transform.ts
│   │   │   ├── upgrade.ts
│   │   │   ├── user_agent.ts
│   │   │   └── validation.ts
│   │   ├── config/           # Configuration
│   │   │   ├── index.ts
│   │   │   └── const.ts
│   │   └── converter/        # Data converters
│   │       ├── index.ts
│   │       └── export.ts
│   ├── common/               # Common functionality
│   │   ├── index.ts
│   │   ├── cli.ts            # Command-line interface
│   │   ├── vnstock.ts        # Core class
│   │   ├── data/             # Data handling
│   │   │   ├── index.ts
│   │   │   └── data_explorer.ts
│   │   └── plot/             # Plotting utilities
│   │       ├── index.ts
│   │       └── chart_wrapper.ts
│   ├── connector/            # API connectors
│   │   └── dnse/             # DNSE connector
│   │       ├── index.ts
│   │       └── trade.ts
│   └── botbuilder/           # Bot building functionality
│       ├── index.ts
│       └── noti.ts
├── tests/                    # Test files
│   ├── explorer/
│   ├── core/
│   ├── common/
│   ├── connector/
│   └── botbuilder/
└── memory-bank/              # Project documentation and memory
    ├── project-brief.md      # This file
    └── implementation-notes.md
```

## Implementation Roadmap

1. **Phase 1: Setup**

   - Set up project structure and configuration
   - Configure TypeScript, linting, and testing
   - Set up documentation structure

2. **Phase 2: Core Implementation**

   - Implement core models and interfaces
   - Implement utility functions
   - Implement configuration and constants

3. **Phase 3: Data Sources**

   - Implement VCI data source
   - Implement TCBS data source
   - Implement other data sources

4. **Phase 4: Common Functionality**

   - Implement common modules
   - Implement plotting utilities
   - Implement CLI interface

5. **Phase 5: Advanced Features**

   - Implement connectors
   - Implement bot builder functionality

6. **Phase 6: Testing and Documentation**
   - Write comprehensive tests
   - Complete API documentation
   - Create usage examples

## Dependencies

The TypeScript implementation will likely require these dependencies:

- **axios** or **fetch** for HTTP requests
- **dayjs** for date handling
- **lodash** for data transformation
- **zod** for data validation
- **winston** or similar for logging
- **commander** for CLI functionality
- **chart.js** or similar for charting capabilities
