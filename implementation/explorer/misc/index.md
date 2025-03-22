# Misc Explorer Overview

## Introduction

The Misc Explorer is a specialized module in the vnstock TypeScript library designed to provide access to various miscellaneous financial data not directly related to stock markets. This module focuses on alternative financial data sources such as currency exchange rates, precious metal prices, interest rates, and other economic indicators that complement the stock market data available through other explorers.

## Purpose

The Misc Explorer serves as a convenient gateway to access complementary financial data that may impact investment decisions but are not stock-specific. This includes:

1. Currency exchange rates between major world currencies and Vietnamese Dong (VND)
2. Gold prices in both international and Vietnamese markets
3. Interest rates and bond yields
4. Economic indicators relevant to Vietnamese markets

## Module Structure

The Misc Explorer is organized into focused submodules, each dealing with a specific type of financial data:

| Submodule          | Purpose           | Description                                                        |
| ------------------ | ----------------- | ------------------------------------------------------------------ |
| `exchange_rate.md` | Currency Exchange | Provides access to exchange rates between VND and other currencies |
| `gold_price.md`    | Gold Price Data   | Provides access to gold price data from various sources            |

## Key Features

The Misc Explorer offers several key features:

1. **Multi-source Data Access**: Retrieves data from various authoritative sources for each data type
2. **Historical Data**: Provides both current and historical data for trend analysis
3. **Standardized Formats**: Returns data in consistent formats regardless of source
4. **Type Safety**: Leverages TypeScript for robust type checking and autocomplete
5. **Error Handling**: Implements comprehensive error handling for API failures and data validation
6. **Caching**: Optionally caches responses to improve performance and reduce API load

## Implementation Details

### Class Structure

The Misc Explorer is implemented as a collection of specialized classes:

```typescript
// Main explorer class
export class MiscExplorer {
  private readonly options: MiscExplorerOptions;
  private readonly exchangeRateClient: ExchangeRateClient;
  private readonly goldPriceClient: GoldPriceClient;

  constructor(options?: Partial<MiscExplorerOptions>) {
    this.options = {
      timeout: 30000,
      retryOnFailure: true,
      maxRetries: 3,
      enableCaching: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      ...options,
    };

    this.exchangeRateClient = new ExchangeRateClient(this.options);
    this.goldPriceClient = new GoldPriceClient(this.options);
  }

  // Exchange rate methods
  getExchangeRate(options: ExchangeRateOptions): Promise<ExchangeRateData>;
  getHistoricalExchangeRates(
    options: HistoricalExchangeRateOptions
  ): Promise<HistoricalExchangeRateData>;

  // Gold price methods
  getGoldPrice(options?: GoldPriceOptions): Promise<GoldPriceData>;
  getHistoricalGoldPrices(
    options: HistoricalGoldPriceOptions
  ): Promise<HistoricalGoldPriceData>;
}
```

### Configuration Options

The Misc Explorer can be configured with the following options:

```typescript
export interface MiscExplorerOptions {
  // Request timeout in milliseconds
  timeout?: number;

  // Whether to retry failed requests
  retryOnFailure?: boolean;

  // Maximum number of retry attempts
  maxRetries?: number;

  // Whether to enable response caching
  enableCaching?: boolean;

  // How long to cache responses (in milliseconds)
  cacheDuration?: number;

  // Default data source for each data type
  defaultExchangeRateSource?: ExchangeRateSource;
  defaultGoldPriceSource?: GoldPriceSource;
}
```

## Data Sources

The Misc Explorer accesses data from various sources:

### Exchange Rate Sources

- State Bank of Vietnam (SBV) - Official exchange rates
- Vietcombank - Commercial bank exchange rates
- Open Exchange Rates API - International exchange rates
- VNDirect Exchange Rates - Financial institution rates

### Gold Price Sources

- Saigon Jewelry Company (SJC) - Vietnamese gold prices
- DOJI - Vietnamese gold prices
- World Gold Council - International gold prices
- Kitco - International gold prices

## Usage Examples

### Basic Exchange Rate Retrieval

```typescript
import { MiscExplorer, ExchangeRateSource } from 'vnstock';

async function getExchangeRate() {
  const misc = new MiscExplorer();

  // Get USD to VND exchange rate from State Bank of Vietnam
  const usdRate = await misc.getExchangeRate({
    source: ExchangeRateSource.SBV,
    fromCurrency: 'USD',
    toCurrency: 'VND',
  });

  console.log(`USD to VND: ${usdRate.rate.toLocaleString()} VND`);
  console.log(`Last updated: ${usdRate.lastUpdated.toLocaleString()}`);

  // Get multiple currencies against VND
  const currencies = ['USD', 'EUR', 'JPY', 'KRW'];

  for (const currency of currencies) {
    const rate = await misc.getExchangeRate({
      source: ExchangeRateSource.VIETCOMBANK,
      fromCurrency: currency,
      toCurrency: 'VND',
    });

    console.log(`${currency} to VND: ${rate.rate.toLocaleString()} VND`);
  }
}

getExchangeRate().catch(console.error);
```

### Retrieving Gold Prices

```typescript
import { MiscExplorer, GoldPriceSource, GoldType } from 'vnstock';

async function getGoldPrices() {
  const misc = new MiscExplorer();

  // Get SJC gold prices
  const sjcGold = await misc.getGoldPrice({
    source: GoldPriceSource.SJC,
    goldType: GoldType.SJC_1L,
  });

  console.log('SJC Gold Prices:');
  console.log(`Buy: ${sjcGold.buyPrice.toLocaleString()} VND/tael`);
  console.log(`Sell: ${sjcGold.sellPrice.toLocaleString()} VND/tael`);
  console.log(`Last updated: ${sjcGold.lastUpdated.toLocaleString()}`);

  // Get international gold price in USD/oz
  const intlGold = await misc.getGoldPrice({
    source: GoldPriceSource.WORLD_GOLD_COUNCIL,
    currency: 'USD',
  });

  console.log('\nInternational Gold Price:');
  console.log(`Price: ${intlGold.price.toFixed(2)} USD/oz`);
  console.log(
    `Change: ${intlGold.change.toFixed(
      2
    )} USD (${intlGold.changePercent.toFixed(2)}%)`
  );
}

getGoldPrices().catch(console.error);
```

### Historical Data Retrieval

```typescript
import { MiscExplorer, ExchangeRateSource } from 'vnstock';

async function getHistoricalData() {
  const misc = new MiscExplorer();

  // Get USD to VND exchange rate for the past 30 days
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const historicalRates = await misc.getHistoricalExchangeRates({
    source: ExchangeRateSource.SBV,
    fromCurrency: 'USD',
    toCurrency: 'VND',
    startDate,
    endDate: new Date(),
  });

  console.log(
    `Retrieved ${historicalRates.rates.length} days of exchange rate data`
  );

  // Calculate average rate
  const sum = historicalRates.rates.reduce((acc, data) => acc + data.rate, 0);
  const avgRate = sum / historicalRates.rates.length;

  console.log(
    `Average USD/VND rate over past 30 days: ${avgRate.toLocaleString()}`
  );

  // Find highest and lowest rates
  const highest = Math.max(...historicalRates.rates.map((data) => data.rate));
  const lowest = Math.min(...historicalRates.rates.map((data) => data.rate));

  console.log(`Highest rate: ${highest.toLocaleString()} VND`);
  console.log(`Lowest rate: ${lowest.toLocaleString()} VND`);
  console.log(`Range: ${(highest - lowest).toLocaleString()} VND`);
}

getHistoricalData().catch(console.error);
```

## Advanced Example: Currency Impact on Investment

```typescript
import { MiscExplorer, ExchangeRateSource, GoldPriceSource } from 'vnstock';

async function analyzeInvestment() {
  const misc = new MiscExplorer({
    enableCaching: true,
    cacheDuration: 60 * 60 * 1000, // 1 hour
  });

  // Get initial investment data
  const investmentUsd = 10000; // USD
  const startDate = new Date('2023-01-01');
  const endDate = new Date();

  // Get historical exchange rate data
  const exchangeRates = await misc.getHistoricalExchangeRates({
    source: ExchangeRateSource.SBV,
    fromCurrency: 'USD',
    toCurrency: 'VND',
    startDate,
    endDate,
  });

  // Get historical gold price data
  const goldPrices = await misc.getHistoricalGoldPrices({
    source: GoldPriceSource.WORLD_GOLD_COUNCIL,
    startDate,
    endDate,
    currency: 'USD',
  });

  // Calculate investment outcomes

  // 1. Initial exchange rate and gold price
  const initialExchangeRate = exchangeRates.rates[0].rate;
  const initialGoldPrice = goldPrices.prices[0].price;

  // 2. Final exchange rate and gold price
  const finalExchangeRate =
    exchangeRates.rates[exchangeRates.rates.length - 1].rate;
  const finalGoldPrice = goldPrices.prices[goldPrices.prices.length - 1].price;

  // 3. Calculate investment results

  // USD to VND investment
  const vndInvestment = investmentUsd * initialExchangeRate;
  const vndFinalValue =
    vndInvestment * (finalExchangeRate / initialExchangeRate);
  const vndFinalInUsd = vndFinalValue / finalExchangeRate;
  const vndReturn = ((vndFinalInUsd - investmentUsd) / investmentUsd) * 100;

  // Gold investment
  const goldOunces = investmentUsd / initialGoldPrice;
  const goldFinalValue = goldOunces * finalGoldPrice;
  const goldReturn = ((goldFinalValue - investmentUsd) / investmentUsd) * 100;

  // Output results
  console.log(
    `Investment period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`
  );
  console.log(`Initial investment: $${investmentUsd.toLocaleString()}`);

  console.log('\nUSD to VND Currency Investment:');
  console.log(
    `Initial exchange rate: ${initialExchangeRate.toLocaleString()} VND/USD`
  );
  console.log(
    `Final exchange rate: ${finalExchangeRate.toLocaleString()} VND/USD`
  );
  console.log(`Final value in USD: $${vndFinalInUsd.toLocaleString()}`);
  console.log(`Return: ${vndReturn.toFixed(2)}%`);

  console.log('\nGold Investment:');
  console.log(`Initial gold price: $${initialGoldPrice.toFixed(2)}/oz`);
  console.log(`Final gold price: $${finalGoldPrice.toFixed(2)}/oz`);
  console.log(`Gold purchased: ${goldOunces.toFixed(2)} oz`);
  console.log(`Final value in USD: $${goldFinalValue.toLocaleString()}`);
  console.log(`Return: ${goldReturn.toFixed(2)}%`);

  // Compare investments
  console.log('\nInvestment Comparison:');
  if (goldReturn > vndReturn) {
    console.log(
      `Gold outperformed currency by ${(goldReturn - vndReturn).toFixed(2)}%`
    );
  } else {
    console.log(
      `Currency outperformed gold by ${(vndReturn - goldReturn).toFixed(2)}%`
    );
  }
}

analyzeInvestment().catch(console.error);
```

## API Response Structure

The Misc Explorer returns standardized data structures for all requests:

### Exchange Rate Data

```typescript
interface ExchangeRateData {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: ExchangeRateSource;
  lastUpdated: Date;
  bid?: number; // Buy rate (if available)
  ask?: number; // Sell rate (if available)
}

interface HistoricalExchangeRateData {
  fromCurrency: string;
  toCurrency: string;
  rates: {
    date: Date;
    rate: number;
    bid?: number;
    ask?: number;
  }[];
  source: ExchangeRateSource;
}
```

### Gold Price Data

```typescript
interface GoldPriceData {
  goldType: GoldType;
  price?: number; // Used for international gold
  buyPrice?: number; // Used for Vietnamese gold
  sellPrice?: number; // Used for Vietnamese gold
  change?: number;
  changePercent?: number;
  currency: string;
  unit: GoldUnit;
  source: GoldPriceSource;
  lastUpdated: Date;
}

interface HistoricalGoldPriceData {
  goldType: GoldType;
  currency: string;
  unit: GoldUnit;
  source: GoldPriceSource;
  prices: {
    date: Date;
    price?: number;
    buyPrice?: number;
    sellPrice?: number;
  }[];
}
```

## Implementation Considerations

When using the Misc Explorer:

1. **Error Handling**: Implement comprehensive error handling for API failures and data validation.
2. **Rate Limits**: Many external APIs have rate limits; use caching to avoid hitting those limits.
3. **Data Validation**: Always validate returned data, as source APIs may change formats or availability.
4. **Timeouts**: Configure appropriate timeouts for different data sources.
5. **Caching Strategy**: Implement a smart caching strategy based on data update frequency.
6. **Multiple Sources**: For critical data, implement fallback to alternate sources when primary sources fail.
7. **Date Handling**: Pay attention to timezone differences when working with historical data.

## Related Documentation

- [Exchange Rate Module](./exchange_rate.md)
- [Gold Price Module](./gold_price.md)
