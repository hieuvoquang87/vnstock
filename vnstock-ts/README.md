# vnstock-ts

A TypeScript library for fetching and analyzing stock data from the Vietnamese stock market.

## Overview

`vnstock-ts` is a TypeScript implementation of the popular `vnstock` Python package, designed to provide financial data access, analysis, and visualization capabilities for the Vietnamese stock market. It offers a modern TypeScript interface while maintaining feature parity with the original Python library.

## Features

- **Multiple Data Sources**: Access data from various Vietnamese brokers and financial platforms
- **Financial Data**: Fetch stock prices, company information, financial statements, and more
- **Technical Analysis**: Calculate technical indicators and perform stock analysis
- **Data Visualization**: Create interactive charts for stock data and financial metrics
- **TypeScript-First**: Fully typed API with comprehensive interfaces and documentation
- **Modular Design**: Import only what you need to keep your bundle size small

## Installation

```bash
npm install vnstock-ts
```

## Quick Start

```typescript
import { VNStock } from 'vnstock-ts';

// Create an instance
const vnstock = new VNStock();

// Get stock price data
async function getStockData() {
  try {
    const data = await vnstock.ticker.getPriceData(
      'VNM',
      '2023-01-01',
      '2023-12-31'
    );
    console.log(data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

getStockData();
```

## Data Sources

The library supports multiple data sources from Vietnamese brokers and platforms:

- VCI (VietCapital Securities)
- TCBS (Techcom Securities)
- MSN (Microsoft Network)
- FMARKET (Fund Market)
- Other misc sources

## API Documentation

### Stock Data

```typescript
// Get historical price data
const priceData = await vnstock.ticker.getPriceData(symbol, startDate, endDate);

// Get real-time quote
const quote = await vnstock.ticker.getQuote(symbol);

// Get company information
const companyInfo = await vnstock.company.getInfo(symbol);

// Get financial statements
const financials = await vnstock.company.getFinancials(symbol, 'quarterly');
```

### Technical Analysis

```typescript
// Calculate technical indicators
const sma = await vnstock.analysis.sma(symbol, 14);
const rsi = await vnstock.analysis.rsi(symbol, 14);

// Get stock recommendations
const recommendations = await vnstock.analysis.getRecommendations(symbol);
```

### Data Visualization

```typescript
// Create price chart
const chart = await vnstock.chart.createPriceChart(symbol, startDate, endDate);

// Create technical indicator chart
const indicatorChart = await vnstock.chart.createIndicatorChart(symbol, 'rsi');

// Create financial chart
const financialChart = await vnstock.chart.createFinancialChart(
  symbol,
  'revenue'
);
```

## Development

### Project Structure

The project follows a modular structure:

```
vnstock-ts/
├── src/                       # Source code
│   ├── index.ts               # Main entry point
│   ├── explorer/              # Data source modules
│   ├── core/                  # Core functionality
│   ├── common/                # Common functionality
│   ├── connector/             # API connectors
│   └── botbuilder/            # Bot building functionality
└── tests/                     # Test files
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/yourusername/vnstock-ts.git
cd vnstock-ts

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- This library is a TypeScript implementation of the [vnstock](https://github.com/thinh-vu/vnstock) Python package
- Thanks to all the contributors of the original Python project
