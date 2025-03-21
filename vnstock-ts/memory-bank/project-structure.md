# vnstock TypeScript Project Structure

## Directory Structure

```
vnstock-ts/
├── dist/                      # Compiled output (generated)
├── node_modules/              # Dependencies (generated)
├── src/                       # Source code
│   ├── index.ts               # Main entry point and exports
│   ├── types/                 # Common type definitions
│   │   ├── index.ts           # Type exports
│   │   ├── api.ts             # API-related types
│   │   ├── models.ts          # Data model types
│   │   └── config.ts          # Configuration types
│   ├── explorer/              # Data source modules
│   │   ├── index.ts           # Explorer module exports
│   │   ├── base.ts            # Base explorer class
│   │   ├── vci/               # VCI data source
│   │   │   ├── index.ts       # VCI module exports
│   │   │   ├── analysis.ts    # Technical analysis
│   │   │   ├── company.ts     # Company information
│   │   │   ├── const.ts       # Constants
│   │   │   ├── financial.ts   # Financial data
│   │   │   ├── listing.ts     # Listings data
│   │   │   ├── models.ts      # Data models
│   │   │   ├── quote.ts       # Price quotes
│   │   │   └── trading.ts     # Trading data
│   │   ├── tcbs/              # TCBS data source
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
│   │   ├── fmarket/           # FMARKET data source
│   │   │   ├── index.ts
│   │   │   ├── const.ts
│   │   │   └── fund.ts
│   │   ├── msn/               # MSN data source
│   │   │   ├── index.ts
│   │   │   ├── const.ts
│   │   │   ├── helper.ts
│   │   │   ├── listing.ts
│   │   │   ├── models.ts
│   │   │   └── quote.ts
│   │   └── misc/              # Miscellaneous data sources
│   │       ├── index.ts
│   │       ├── exchange-rate.ts
│   │       └── gold-price.ts
│   ├── core/                  # Core functionality
│   │   ├── index.ts
│   │   ├── utils/             # Utility functions
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
│   │   │   ├── user-agent.ts
│   │   │   └── validation.ts
│   │   ├── config/            # Configuration
│   │   │   ├── index.ts
│   │   │   └── const.ts
│   │   └── converter/         # Data converters
│   │       ├── index.ts
│   │       └── export.ts
│   ├── common/                # Common functionality
│   │   ├── index.ts
│   │   ├── cli.ts             # Command-line interface
│   │   ├── vnstock.ts         # Core class
│   │   ├── data/              # Data handling
│   │   │   ├── index.ts
│   │   │   └── data-explorer.ts
│   │   └── plot/              # Plotting utilities
│   │       ├── index.ts
│   │       └── chart-wrapper.ts
│   ├── connector/             # API connectors
│   │   └── dnse/              # DNSE connector
│   │       ├── index.ts
│   │       └── trade.ts
│   └── botbuilder/            # Bot building functionality
│       ├── index.ts
│       └── noti.ts
├── tests/                     # Test files
│   ├── explorer/
│   ├── core/
│   ├── common/
│   ├── connector/
│   └── botbuilder/
├── examples/                  # Example usage scripts
│   ├── basic-usage.ts
│   ├── stock-data.ts
│   ├── technical-analysis.ts
│   └── visualization.ts
├── docs/                      # Documentation
│   ├── api/                   # API documentation
│   └── examples/              # Example documentation
├── memory-bank/               # Project documentation and memory
│   ├── project-brief.md       # Project overview
│   ├── implementation-notes.md # Implementation guidelines
│   ├── implementation-progress.md # Progress tracking
│   └── project-structure.md   # This file
├── .gitignore                 # Git ignore file
├── package.json               # NPM package config
├── package-lock.json          # NPM lock file
├── tsconfig.json              # TypeScript configuration
├── jest.config.js             # Jest test configuration
├── .eslintrc.js               # ESLint configuration
└── README.md                  # Project README
```

## Key File Descriptions

### Core Files

- **index.ts**: Main entry point and exports for the package
- **types/**: TypeScript type definitions used throughout the codebase
- **core/utils/client.ts**: HTTP client implementation for API requests
- **core/utils/logger.ts**: Logging implementation
- **core/config/const.ts**: Configuration constants

### API Data Sources

- **explorer/base.ts**: Base class for all data source implementations
- **explorer/{source}/index.ts**: Entry points for each data source
- **explorer/{source}/models.ts**: Data models for API responses
- **explorer/{source}/const.ts**: Constants specific to data sources

### Common Functionality

- **common/vnstock.ts**: Main class providing unified API access
- **common/cli.ts**: Command-line interface implementation
- **common/data/data-explorer.ts**: Data exploration utilities
- **common/plot/chart-wrapper.ts**: Chart rendering utilities

### Additional Components

- **connector/**: Trading API integrations
- **botbuilder/**: Notification and bot building utilities

## Module Dependencies

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│ Entry Point │────>│ Core Modules │<────│ Common API   │
└─────────────┘     └──────────────┘     └──────────────┘
                           ▲                    ▲
                           │                    │
                           ▼                    │
┌─────────────┐     ┌──────────────┐           │
│  Utilities  │<───>│ Data Sources │<──────────┘
└─────────────┘     └──────────────┘
                           ▲
                           │
                           ▼
                    ┌──────────────┐
                    │  Connectors  │
                    └──────────────┘
```

## Build Outputs

The compiled output will generate:

1. **CommonJS modules** for Node.js compatibility
2. **ES modules** for modern JavaScript bundlers
3. **TypeScript declaration files** for type safety
4. **Source maps** for debugging

## Import Examples

```typescript
// Importing the entire library
import * as vnstock from 'vnstock-ts';

// Importing specific data sources
import { VCI } from 'vnstock-ts/explorer';

// Importing specific functionality
import { Quote } from 'vnstock-ts/explorer/vci';

// Importing utilities
import { createLogger } from 'vnstock-ts/core/utils';
```

## Implementation Recommendations

- Implement each module as a standalone unit with clear dependencies
- Use barrel files (index.ts) for clean exports
- Follow consistent naming conventions:
  - camelCase for variables and functions
  - PascalCase for classes and interfaces
  - kebab-case for filenames
- Include comprehensive JSDoc comments for all public APIs
