# Implementation Documentation for vnstock Python to TypeScript Conversion

This directory contains detailed documentation for implementing the `vnstock` Python package in TypeScript. Each file provides a comprehensive breakdown of a Python module, explaining its purpose, functionality, implementation details, and providing TypeScript code examples.

## Purpose of Implementation Documentation

The goal of this documentation is to serve as a detailed guide for converting the Python `vnstock` package to TypeScript. Rather than simply translating code line-by-line, these documents analyze the underlying functionality, data structures, and patterns of the Python code, then provide recommendations for implementing equivalent functionality in TypeScript, taking advantage of TypeScript's strengths and ecosystem.

Each implementation document:

- Explains the purpose and functionality of a specific Python module
- Breaks down classes, methods, and functions in detail
- Analyzes implementation details like data flow and API interactions
- Provides TypeScript code examples with equivalents for the Python functionality
- Lists dependencies and required utility functions
- Offers TypeScript-specific implementation notes and best practices

## Complete vnstock Package Structure

The original Python `vnstock` package has the following complete structure:

```
vnstock/
├── __init__.py                  # Package initialization
├── explorer/                    # Data source explorer modules
│   ├── __init__.py              # Explorer module initialization
│   ├── vci/                     # VCI data source (broker platform)
│   │   ├── __init__.py          # VCI module initialization
│   │   ├── analysis.py          # Technical analysis features
│   │   ├── company.py           # Company information
│   │   ├── const.py             # Constants and mappings
│   │   ├── financial.py         # Financial data and ratios
│   │   ├── listing.py           # Listings and symbol data
│   │   ├── models.py            # Data validation models
│   │   ├── quote.py             # Price and quote data
│   │   └── trading.py           # Trading data
│   ├── tcbs/                    # TCBS data source (broker platform)
│   │   ├── __init__.py          # TCBS module initialization
│   │   ├── analysis.py          # Technical analysis
│   │   ├── company.py           # Company information
│   │   ├── const.py             # Constants and mappings
│   │   ├── financial.py         # Financial data and ratios
│   │   ├── listing.py           # Listings and symbol data
│   │   ├── models.py            # Data validation models
│   │   ├── quote.py             # Price and quote data
│   │   ├── screener.py          # Stock screening functionality
│   │   └── trading.py           # Trading data
│   ├── fmarket/                 # FMARKET data source (mutual funds)
│   │   ├── __init__.py          # FMARKET module initialization
│   │   ├── const.py             # Constants and mappings
│   │   └── fund.py              # Fund data and functionality
│   ├── msn/                     # MSN data source (international markets)
│   │   ├── __init__.py          # MSN module initialization
│   │   ├── const.py             # Constants and mappings
│   │   ├── helper.py            # Helper functions
│   │   ├── listing.py           # Listings and symbol data
│   │   ├── models.py            # Data validation models
│   │   └── quote.py             # Price and quote data
│   └── misc/                    # Miscellaneous data sources
│       ├── __init__.py          # Misc module initialization
│       ├── exchange_rate.py     # Foreign exchange rates
│       └── gold_price.py        # Gold price data
├── core/                        # Core functionality
│   ├── __init__.py              # Core module initialization
│   ├── utils/                   # Utility functions
│   │   ├── __init__.py          # Utils module initialization
│   │   ├── client.py            # HTTP client utilities
│   │   ├── env.py               # Environment utilities
│   │   ├── ext.py               # Extension utilities
│   │   ├── help.py              # Help utilities
│   │   ├── launcher.py          # Application launcher
│   │   ├── logger.py            # Logging utilities
│   │   ├── market.py            # Market trading hours utilities
│   │   ├── parser.py            # Data parsing utilities
│   │   ├── transform.py         # Data transformation utilities
│   │   ├── upgrade.py           # Package upgrade utilities
│   │   ├── user_agent.py        # User agent management
│   │   └── validation.py        # Input validation
│   ├── config/                  # Configuration
│   │   ├── __init__.py          # Config module initialization
│   │   └── const.py             # Configuration constants
│   └── converter/               # Data converters
│       ├── __init__.py          # Converter module initialization
│       └── export.py            # Data export utilities
├── common/                      # Common functionality
│   ├── __init__.py              # Common module initialization
│   ├── cli.py                   # Command-line interface
│   ├── vnstock.py               # Core class for unified API
│   ├── data/                    # Data handling utilities
│   │   ├── __init__.py          # Data module initialization
│   │   └── data_explorer.py     # Data exploration utilities
│   └── plot/                    # Plotting utilities
│       ├── __init__.py          # Plot module initialization
│       └── chart_wrapper.py     # Chart plotting utilities
├── connector/                   # API connectors
│   └── dnse/                    # DNSE connector
│       ├── __init__.py          # DNSE module initialization
│       └── trade.py             # DNSE trading API integration
└── botbuilder/                  # Bot building functionality
    ├── __init__.py              # Botbuilder module initialization
    └── noti.py                  # Notification functionality
```

## Implementation Documentation Structure

Our implementation documentation mirrors this structure to facilitate easy navigation and reference:

```
implementation/
├── in-progress.md              # Progress tracker for documentation
├── README.md                   # This guide
├── explorer/                   # Data source explorer documentation
│   ├── index.md                # Explorer module documentation
│   ├── vci/                    # VCI data source docs
│   │   ├── index.md            # VCI module documentation
│   │   ├── analysis.md         # Technical analysis documentation
│   │   ├── company.md          # Company information documentation
│   │   ├── const.md            # Constants documentation
│   │   ├── financial.md        # Financial data documentation
│   │   ├── listing.md          # Listings documentation
│   │   ├── models.md           # Data models documentation
│   │   ├── quote.md            # Price and quote documentation
│   │   └── trading.md          # Trading data documentation
│   ├── tcbs/                   # TCBS data source docs
│   │   ├── index.md            # TCBS module documentation
│   │   ├── analysis.md         # Technical analysis documentation
│   │   ├── company.md          # Company information documentation
│   │   ├── const.md            # Constants documentation
│   │   ├── financial.md        # Financial data documentation
│   │   ├── listing.md          # Listings documentation
│   │   ├── models.md           # Data models documentation
│   │   ├── quote.md            # Price and quote documentation
│   │   ├── screener.md         # Stock screening documentation
│   │   └── trading.md          # Trading data documentation
│   ├── fmarket/                # FMARKET data source docs
│   │   ├── index.md            # FMARKET module documentation
│   │   ├── const.md            # Constants documentation
│   │   └── fund.md             # Fund data documentation
│   ├── msn/                    # MSN data source docs
│   │   ├── index.md            # MSN module documentation
│   │   ├── const.md            # Constants documentation
│   │   ├── helper.md           # Helper functions documentation
│   │   ├── listing.md          # Listings documentation
│   │   ├── models.md           # Data models documentation
│   │   └── quote.md            # Price and quote documentation
│   └── misc/                   # Miscellaneous data source docs
│       ├── index.md            # Misc module documentation
│       ├── exchange_rate.md    # Foreign exchange rates documentation
│       └── gold_price.md       # Gold price data documentation
├── core/                       # Core functionality docs
│   ├── index.md                # Core module documentation
│   ├── utils/                  # Utility function docs
│   │   ├── index.md            # Utils module documentation
│   │   ├── client.md           # HTTP client documentation
│   │   ├── env.md              # Environment utilities documentation
│   │   ├── ext.md              # Extension utilities documentation
│   │   ├── help.md             # Help utilities documentation
│   │   ├── launcher.md         # Application launcher documentation
│   │   ├── logger.md           # Logging utilities documentation
│   │   ├── market.md           # Market trading hours documentation
│   │   ├── parser.md           # Data parsing documentation
│   │   ├── transform.md        # Data transformation documentation
│   │   ├── upgrade.md          # Package upgrade documentation
│   │   ├── user_agent.md       # User agent management documentation
│   │   └── validation.md       # Input validation documentation
│   ├── config/                 # Configuration docs
│   │   ├── index.md            # Config module documentation
│   │   └── const.md            # Configuration constants documentation
│   └── converter/              # Converter docs
│       ├── index.md            # Converter module documentation
│       └── export.md           # Data export documentation
├── common/                     # Common functionality docs
│   ├── index.md                # Common module documentation
│   ├── cli.md                  # Command-line interface documentation
│   ├── vnstock.md              # Core class documentation
│   ├── data/                   # Data handling docs
│   │   ├── index.md            # Data module documentation
│   │   └── data_explorer.md    # Data exploration documentation
│   └── plot/                   # Plotting utilities docs
│       ├── index.md            # Plot module documentation
│       └── chart_wrapper.md    # Chart plotting documentation
├── connector/                  # Connector docs
│   └── dnse/                   # DNSE connector docs
│       ├── index.md            # DNSE module documentation
│       └── trade.md            # DNSE trading API documentation
└── botbuilder/                 # Bot building docs
    ├── index.md                # Botbuilder module documentation
    └── noti.md                 # Notification functionality documentation
```

## How to Use This Documentation

These documentation files are designed to help you implement the `vnstock` functionality in TypeScript (or any other language). Each file contains:

1. **Overview**: A description of the module's purpose and functionality
2. **Classes/Functions**: Detailed breakdown of the classes and functions in the module
3. **Implementation Details**: Information about how the module works internally
4. **TypeScript Examples**: Sample TypeScript code implementing the functionality
5. **Dependencies**: Information about required dependencies and external libraries
6. **Notes**: Additional information and implementation tips

To track progress and see which files have been documented, refer to the `in-progress.md` file, which lists all modules that need documentation and their current status.

## Implementation Workflow

When implementing a feature from the Python code to TypeScript:

1. **Start with Models**: Implement the data models first, as they're used throughout the codebase
2. **Implement Constants**: Constants and configuration values should be implemented next
3. **Implement Core Utilities**: Core utilities (logging, HTTP client, data transformation) come next
4. **Implement Data Sources**: Implement the data source modules one-by-one, starting with VCI
5. **Connect Components**: Finally, connect the components together with proper exports

## TypeScript Implementation Tips

- Use TypeScript interfaces to define the structure of data objects
- Consider using Classes for more complex components that have state and behavior
- Use async/await for asynchronous operations, similar to Python's async functions
- For data transformation, consider using libraries like lodash or similar utilities
- For date handling, dayjs is a good equivalent to Python's datetime functionality
- For HTTP requests, use axios or the fetch API instead of Python's requests library
- Implement proper error handling with try/catch blocks
- Consider implementing a modular structure to allow tree-shaking in consuming applications

## Required Utility Functions

Several utility functions are used throughout the codebase:

- `getLogger`: Creates a logger instance for module-specific logging
- `tradingHours`: Checks if the market is open and returns session information
- `getAssetType`: Determines the asset type from a symbol (e.g., stock, index)
- `getHeaders`: Generates HTTP headers for API requests with proper user agents
- `sendRequest`: Makes HTTP requests to APIs with error handling
- `camelToSnake`: Converts camelCase strings to snake_case
- Various data transformation utilities: Functions to transform API responses

## Data Flow

The general data flow in the library is:

1. User creates an instance of a data class (e.g., `Quote`, `Company`)
2. The class validates inputs and prepares request parameters
3. The class sends requests to the appropriate API endpoints
4. The response is transformed into a standardized format
5. The data is returned to the user

## Example Implementation Workflow

Let's say you want to implement the `Quote` class from the VCI explorer:

1. Start by implementing the `models.ts` file to define the `TickerModel`
2. Implement the `const.ts` file with necessary constants and mappings
3. Implement required utilities: logging, market, parser, HTTP client
4. Implement the `Quote` class based on the implementation document
5. Create tests to verify the implementation works correctly

## Progress Tracking

For tracking which modules have been documented and which still need to be completed, refer to the `in-progress.md` file which serves as a checklist for the implementation documentation.
