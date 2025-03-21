# vnstock-ts

A TypeScript version of the vnstock package for Vietnamese stock market data analysis.

## Installation

```bash
npm install vnstock-ts
```

## Features

vnstock-ts provides a comprehensive set of tools for Vietnamese stock market analysis:

- Historical price data for stocks, indices, futures, and more
- Real-time price quotes
- Company information and financials
- Market listings and categorization
- Stock screening capabilities
- International market data (forex, crypto, world indices)
- Mutual fund data
- Exchange rates and gold prices

## Basic Usage

Here are some examples of how to use vnstock-ts:

```typescript
// Import the package
import { Vnstock, Quote, Company } from 'vnstock-ts';

// Using the main interface
const stock = new Vnstock().stock('ACB', 'VCI');

// Get historical data
const getHistoricalData = async () => {
  const data = await stock.quote.history('2024-01-01', '2024-03-19', '1D');
  console.log(data);
};

// Get company overview
const getCompanyOverview = async () => {
  const data = await stock.company.overview();
  console.log(data);
};

// Get financial ratios
const getFinancialRatios = async () => {
  const data = await stock.finance.ratio('year', 'vi', true);
  console.log(data);
};

// Using specific components directly
const quote = new Quote('ACB', 'VCI');
const getHistory = async () => {
  const data = await quote.history('2024-01-01', '2024-03-19', '1D');
  console.log(data);
};

// Get company information
const company = new Company('ACB', 'VCI');
const getOverview = async () => {
  const data = await company.overview();
  console.log(data);
};
```

## Available Data Sources

The package supports the following data sources:

- VCI (Vietstock)
- TCBS (Techcombank Securities)
- MSN (For international data)
- FMARKET (For mutual fund data)

## Documentation

For comprehensive documentation on all available functions and their parameters, please refer to the [usage documentation](https://github.com/your-username/vnstock-ts/blob/main/docs/usage_doc.md).

## License

This package is released under a custom license. Please check the LICENSE file for more details.

## Acknowledgements

This package is a TypeScript port of the original [vnstock](https://github.com/thinh-vu/vnstock) package by Thinh Vu.
