# Exchange Rate Module

**Original Python Implementation**: [exchange_rate.py](/vnstock/explorer/misc/exchange_rate.py)


## Overview

The Exchange Rate module is a component of the Misc Explorer in the vnstock TypeScript library that provides access to currency exchange rates, with a primary focus on Vietnamese Dong (VND) conversion rates. This module retrieves real-time and historical exchange rate data from multiple sources, offering a comprehensive solution for applications that require currency conversion capabilities.

## Purpose

The Exchange Rate module serves several key purposes:

1. Provide real-time exchange rates between VND and other currencies
2. Offer historical exchange rate data for trend analysis and reporting
3. Support conversion between any two currencies, with VND as an intermediate if needed
4. Access multiple authoritative sources for exchange rate data
5. Standardize exchange rate data regardless of source

## Data Sources

The module accesses exchange rate data from various authoritative sources:

| Source                      | Description                 | Features                            | Update Frequency     |
| --------------------------- | --------------------------- | ----------------------------------- | -------------------- |
| State Bank of Vietnam (SBV) | Official central bank rates | Reference rates, mid rates          | Daily (weekdays)     |
| Vietcombank                 | Commercial bank rates       | Buy/sell rates, cash/transfer rates | Multiple times daily |
| VNDirect                    | Financial institution rates | Buy/sell rates                      | Multiple times daily |
| Open Exchange Rates         | International currency API  | 170+ currencies, historical data    | Hourly               |

## Constants and Enums

The module uses several constant definitions and enumerations:

```typescript
/**
 * Exchange rate data sources
 */
export enum ExchangeRateSource {
  SBV = 'sbv',
  VIETCOMBANK = 'vietcombank',
  VNDIRECT = 'vndirect',
  OPEN_EXCHANGE_RATES = 'openexchangerates',
}

/**
 * Exchange rate types
 */
export enum ExchangeRateType {
  MID = 'mid', // Middle rate (average of buy/sell)
  BUY = 'buy', // Buy rate
  SELL = 'sell', // Sell rate
  TRANSFER = 'transfer', // Transfer rate (for non-cash)
  CASH = 'cash', // Cash rate
}

/**
 * Common currency codes
 */
export const CURRENCY_CODES = {
  VND: 'VND', // Vietnamese Dong
  USD: 'USD', // US Dollar
  EUR: 'EUR', // Euro
  GBP: 'GBP', // British Pound
  JPY: 'JPY', // Japanese Yen
  CNY: 'CNY', // Chinese Yuan
  AUD: 'AUD', // Australian Dollar
  CAD: 'CAD', // Canadian Dollar
  SGD: 'SGD', // Singapore Dollar
  THB: 'THB', // Thai Baht
  KRW: 'KRW', // Korean Won
  // Additional currencies...
};

/**
 * API endpoints for different exchange rate sources
 */
export const EXCHANGE_RATE_ENDPOINTS = {
  SBV: 'https://www.sbv.gov.vn/webcenter/portal/en/home/rm/er',
  VIETCOMBANK:
    'https://portal.vietcombank.com.vn/Usercontrols/TVPortal.TyGia/pXML.aspx',
  VNDIRECT:
    'https://dchart-api.vndirect.com.vn/dchart/forex?resolution=D&symbol=USDVND',
  OPEN_EXCHANGE_RATES: 'https://openexchangerates.org/api/latest.json',
};

/**
 * Default options for exchange rate requests
 */
export const DEFAULT_EXCHANGE_RATE_OPTIONS = {
  source: ExchangeRateSource.SBV,
  rateType: ExchangeRateType.MID,
  baseCurrency: CURRENCY_CODES.VND,
};
```

## Data Structures

The module uses the following data structures:

```typescript
/**
 * Options for retrieving exchange rates
 */
export interface ExchangeRateOptions {
  /** The currency to convert from */
  fromCurrency: string;

  /** The currency to convert to */
  toCurrency: string;

  /** The data source to use */
  source?: ExchangeRateSource;

  /** The type of rate to retrieve */
  rateType?: ExchangeRateType;
}

/**
 * Options for retrieving historical exchange rates
 */
export interface HistoricalExchangeRateOptions {
  /** The currency to convert from */
  fromCurrency: string;

  /** The currency to convert to */
  toCurrency: string;

  /** Start date for historical data */
  startDate: Date;

  /** End date for historical data */
  endDate: Date;

  /** The data source to use */
  source?: ExchangeRateSource;

  /** The type of rate to retrieve */
  rateType?: ExchangeRateType;
}

/**
 * Exchange rate data response
 */
export interface ExchangeRateData {
  /** The currency converted from */
  fromCurrency: string;

  /** The currency converted to */
  toCurrency: string;

  /** The exchange rate */
  rate: number;

  /** The data source */
  source: ExchangeRateSource;

  /** When the rate was last updated */
  lastUpdated: Date;

  /** Buy rate (if available) */
  bid?: number;

  /** Sell rate (if available) */
  ask?: number;
}

/**
 * Historical exchange rate data response
 */
export interface HistoricalExchangeRateData {
  /** The currency converted from */
  fromCurrency: string;

  /** The currency converted to */
  toCurrency: string;

  /** Array of historical rates */
  rates: {
    /** Date of the exchange rate */
    date: Date;

    /** The exchange rate */
    rate: number;

    /** Buy rate (if available) */
    bid?: number;

    /** Sell rate (if available) */
    ask?: number;
  }[];

  /** The data source */
  source: ExchangeRateSource;
}
```

## Implementation

The Exchange Rate module is implemented through several classes:

### Main Class: ExchangeRateClient

```typescript
/**
 * Client for retrieving exchange rate data
 */
export class ExchangeRateClient {
  private readonly options: MiscExplorerOptions;
  private readonly httpClient: HttpClient;
  private readonly cache: Cache;

  /**
   * Create a new ExchangeRateClient
   * @param options - Configuration options
   */
  constructor(options?: Partial<MiscExplorerOptions>) {
    this.options = {
      timeout: 30000,
      retryOnFailure: true,
      maxRetries: 3,
      enableCaching: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      defaultExchangeRateSource: ExchangeRateSource.SBV,
      ...options,
    };

    this.httpClient = new HttpClient(this.options);
    this.cache = new Cache(this.options.cacheDuration);
  }

  /**
   * Get current exchange rate between two currencies
   * @param options - Exchange rate options
   * @returns Promise resolving to exchange rate data
   */
  async getExchangeRate(
    options: ExchangeRateOptions
  ): Promise<ExchangeRateData> {
    this.validateCurrencies(options.fromCurrency, options.toCurrency);

    const source =
      options.source ||
      this.options.defaultExchangeRateSource ||
      ExchangeRateSource.SBV;
    const rateType = options.rateType || ExchangeRateType.MID;

    // Check cache first if enabled
    if (this.options.enableCaching) {
      const cacheKey = this.getCacheKey('rate', options);
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData as ExchangeRateData;
      }
    }

    // Fetch from appropriate source
    let result: ExchangeRateData;

    switch (source) {
      case ExchangeRateSource.SBV:
        result = await this.getSbvExchangeRate(
          options.fromCurrency,
          options.toCurrency,
          rateType
        );
        break;
      case ExchangeRateSource.VIETCOMBANK:
        result = await this.getVietcombankExchangeRate(
          options.fromCurrency,
          options.toCurrency,
          rateType
        );
        break;
      case ExchangeRateSource.VNDIRECT:
        result = await this.getVndirectExchangeRate(
          options.fromCurrency,
          options.toCurrency,
          rateType
        );
        break;
      case ExchangeRateSource.OPEN_EXCHANGE_RATES:
        result = await this.getOpenExchangeRatesRate(
          options.fromCurrency,
          options.toCurrency,
          rateType
        );
        break;
      default:
        throw new Error(`Unsupported exchange rate source: ${source}`);
    }

    // Cache the result if caching is enabled
    if (this.options.enableCaching) {
      const cacheKey = this.getCacheKey('rate', options);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Get historical exchange rates between two currencies
   * @param options - Historical exchange rate options
   * @returns Promise resolving to historical exchange rate data
   */
  async getHistoricalExchangeRates(
    options: HistoricalExchangeRateOptions
  ): Promise<HistoricalExchangeRateData> {
    this.validateCurrencies(options.fromCurrency, options.toCurrency);
    this.validateDateRange(options.startDate, options.endDate);

    const source =
      options.source ||
      this.options.defaultExchangeRateSource ||
      ExchangeRateSource.SBV;
    const rateType = options.rateType || ExchangeRateType.MID;

    // Check cache first if enabled
    if (this.options.enableCaching) {
      const cacheKey = this.getCacheKey('historical', options);
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData as HistoricalExchangeRateData;
      }
    }

    // Fetch from appropriate source
    let result: HistoricalExchangeRateData;

    switch (source) {
      case ExchangeRateSource.SBV:
        result = await this.getSbvHistoricalRates(
          options.fromCurrency,
          options.toCurrency,
          options.startDate,
          options.endDate,
          rateType
        );
        break;
      case ExchangeRateSource.VIETCOMBANK:
        result = await this.getVietcombankHistoricalRates(
          options.fromCurrency,
          options.toCurrency,
          options.startDate,
          options.endDate,
          rateType
        );
        break;
      case ExchangeRateSource.VNDIRECT:
        result = await this.getVndirectHistoricalRates(
          options.fromCurrency,
          options.toCurrency,
          options.startDate,
          options.endDate,
          rateType
        );
        break;
      case ExchangeRateSource.OPEN_EXCHANGE_RATES:
        result = await this.getOpenExchangeRatesHistorical(
          options.fromCurrency,
          options.toCurrency,
          options.startDate,
          options.endDate,
          rateType
        );
        break;
      default:
        throw new Error(`Unsupported exchange rate source: ${source}`);
    }

    // Cache the result if caching is enabled
    if (this.options.enableCaching) {
      const cacheKey = this.getCacheKey('historical', options);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  // Private implementation methods for each source
  private async getSbvExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rateType: ExchangeRateType
  ): Promise<ExchangeRateData> {
    // Implementation details...
  }

  private async getVietcombankExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rateType: ExchangeRateType
  ): Promise<ExchangeRateData> {
    // Implementation details...
  }

  private async getVndirectExchangeRate(
    fromCurrency: string,
    toCurrency: string,
    rateType: ExchangeRateType
  ): Promise<ExchangeRateData> {
    // Implementation details...
  }

  private async getOpenExchangeRatesRate(
    fromCurrency: string,
    toCurrency: string,
    rateType: ExchangeRateType
  ): Promise<ExchangeRateData> {
    // Implementation details...
  }

  private async getSbvHistoricalRates(
    fromCurrency: string,
    toCurrency: string,
    startDate: Date,
    endDate: Date,
    rateType: ExchangeRateType
  ): Promise<HistoricalExchangeRateData> {
    // Implementation details...
  }

  private async getVietcombankHistoricalRates(
    fromCurrency: string,
    toCurrency: string,
    startDate: Date,
    endDate: Date,
    rateType: ExchangeRateType
  ): Promise<HistoricalExchangeRateData> {
    // Implementation details...
  }

  private async getVndirectHistoricalRates(
    fromCurrency: string,
    toCurrency: string,
    startDate: Date,
    endDate: Date,
    rateType: ExchangeRateType
  ): Promise<HistoricalExchangeRateData> {
    // Implementation details...
  }

  private async getOpenExchangeRatesHistorical(
    fromCurrency: string,
    toCurrency: string,
    startDate: Date,
    endDate: Date,
    rateType: ExchangeRateType
  ): Promise<HistoricalExchangeRateData> {
    // Implementation details...
  }

  // Helper methods
  private validateCurrencies(fromCurrency: string, toCurrency: string): void {
    if (!fromCurrency || typeof fromCurrency !== 'string') {
      throw new Error('From currency must be a valid currency code string');
    }

    if (!toCurrency || typeof toCurrency !== 'string') {
      throw new Error('To currency must be a valid currency code string');
    }

    if (fromCurrency === toCurrency) {
      throw new Error('From and to currencies must be different');
    }
  }

  private validateDateRange(startDate: Date, endDate: Date): void {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Start date must be a valid Date object');
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('End date must be a valid Date object');
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    const maxRange = 365 * 5; // 5 years
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > maxRange) {
      throw new Error(
        `Date range too large. Maximum range is ${maxRange} days`
      );
    }
  }

  private getCacheKey(type: 'rate' | 'historical', options: any): string {
    return `${type}_${options.source}_${options.fromCurrency}_${
      options.toCurrency
    }_${options.rateType}${
      type === 'historical'
        ? `_${options.startDate.toISOString()}_${options.endDate.toISOString()}`
        : ''
    }`;
  }
}
```

## Usage Examples

### Basic Currency Conversion

```typescript
import { MiscExplorer, ExchangeRateSource, ExchangeRateType } from 'vnstock';

async function getUsdToVndRate() {
  const misc = new MiscExplorer();

  // Get USD to VND exchange rate from State Bank of Vietnam
  const rate = await misc.getExchangeRate({
    fromCurrency: 'USD',
    toCurrency: 'VND',
    source: ExchangeRateSource.SBV,
    rateType: ExchangeRateType.MID,
  });

  console.log(`USD to VND exchange rate: ${rate.rate.toLocaleString()} VND`);
  console.log(`Last updated: ${rate.lastUpdated.toLocaleString()}`);

  // Convert an amount
  const amountUsd = 100;
  const amountVnd = amountUsd * rate.rate;

  console.log(`${amountUsd} USD = ${amountVnd.toLocaleString()} VND`);
}

getUsdToVndRate().catch(console.error);
```

### Comparing Rates from Different Sources

```typescript
import { MiscExplorer, ExchangeRateSource, ExchangeRateType } from 'vnstock';

async function compareExchangeRates() {
  const misc = new MiscExplorer();
  const fromCurrency = 'USD';
  const toCurrency = 'VND';

  // Get rates from all available sources
  const sources = [
    ExchangeRateSource.SBV,
    ExchangeRateSource.VIETCOMBANK,
    ExchangeRateSource.VNDIRECT,
    ExchangeRateSource.OPEN_EXCHANGE_RATES,
  ];

  const ratePromises = sources.map((source) =>
    misc
      .getExchangeRate({
        fromCurrency,
        toCurrency,
        source,
        rateType: ExchangeRateType.MID,
      })
      .catch((err) => {
        console.error(`Error fetching from ${source}:`, err.message);
        return null;
      })
  );

  const rates = await Promise.all(ratePromises);

  // Display comparison table
  console.log(`${fromCurrency} to ${toCurrency} Exchange Rate Comparison:`);
  console.log('----------------------------------------');
  console.log('Source\t\tRate\t\tLast Updated');
  console.log('----------------------------------------');

  rates.filter(Boolean).forEach((rate) => {
    console.log(
      `${
        rate.source
      }\t\t${rate.rate.toLocaleString()}\t\t${rate.lastUpdated.toLocaleString()}`
    );
  });

  // Find the highest and lowest rates
  const validRates = rates.filter(Boolean);
  if (validRates.length > 0) {
    const highestRate = validRates.reduce((prev, current) =>
      prev.rate > current.rate ? prev : current
    );

    const lowestRate = validRates.reduce((prev, current) =>
      prev.rate < current.rate ? prev : current
    );

    const difference = highestRate.rate - lowestRate.rate;
    const percentageDiff = (difference / lowestRate.rate) * 100;

    console.log('----------------------------------------');
    console.log(
      `Highest: ${highestRate.source} (${highestRate.rate.toLocaleString()})`
    );
    console.log(
      `Lowest: ${lowestRate.source} (${lowestRate.rate.toLocaleString()})`
    );
    console.log(
      `Difference: ${difference.toLocaleString()} (${percentageDiff.toFixed(
        2
      )}%)`
    );
  }
}

compareExchangeRates().catch(console.error);
```

### Getting Historical Exchange Rate Data

```typescript
import { MiscExplorer, ExchangeRateSource } from 'vnstock';

async function getHistoricalRates() {
  const misc = new MiscExplorer();

  // Get USD to VND exchange rates for the past 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const historicalRates = await misc.getHistoricalExchangeRates({
    fromCurrency: 'USD',
    toCurrency: 'VND',
    source: ExchangeRateSource.SBV,
    startDate,
    endDate,
  });

  console.log(
    `Retrieved ${historicalRates.rates.length} days of exchange rate data`
  );
  console.log(
    `From: ${startDate.toLocaleDateString()} To: ${endDate.toLocaleDateString()}`
  );

  // Calculate statistics
  const rates = historicalRates.rates.map((r) => r.rate);
  const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
  const max = Math.max(...rates);
  const min = Math.min(...rates);
  const volatility = max - min;

  console.log('\nStatistics:');
  console.log(`Average: ${average.toLocaleString()} VND`);
  console.log(`Maximum: ${max.toLocaleString()} VND`);
  console.log(`Minimum: ${min.toLocaleString()} VND`);
  console.log(`Volatility: ${volatility.toLocaleString()} VND`);
  console.log(`Volatility %: ${((volatility / min) * 100).toFixed(2)}%`);

  // Display the most recent 5 days
  console.log('\nMost recent rates:');
  historicalRates.rates
    .slice(-5)
    .reverse()
    .forEach((rate) => {
      console.log(
        `${rate.date.toLocaleDateString()}: ${rate.rate.toLocaleString()} VND`
      );
    });
}

getHistoricalRates().catch(console.error);
```

### Multi-currency Conversion

```typescript
import { MiscExplorer, ExchangeRateSource } from 'vnstock';

async function multiCurrencyConverter() {
  const misc = new MiscExplorer({
    enableCaching: true, // Enable caching for better performance
  });

  // Define base amount and currency
  const baseAmount = 1000;
  const baseCurrency = 'USD';

  // Define target currencies
  const targetCurrencies = ['VND', 'EUR', 'GBP', 'JPY', 'CNY', 'SGD', 'AUD'];

  // Get all exchange rates in parallel
  const ratePromises = targetCurrencies.map((currency) =>
    misc.getExchangeRate({
      fromCurrency: baseCurrency,
      toCurrency: currency,
      source: ExchangeRateSource.OPEN_EXCHANGE_RATES,
    })
  );

  const rates = await Promise.all(ratePromises);

  // Display results
  console.log(`Multi-currency conversion for ${baseAmount} ${baseCurrency}:`);
  console.log('----------------------------------------');

  rates.forEach((rate) => {
    const convertedAmount = baseAmount * rate.rate;
    console.log(
      `${baseCurrency} to ${
        rate.toCurrency
      }: ${convertedAmount.toLocaleString()} ${rate.toCurrency}`
    );
  });
}

multiCurrencyConverter().catch(console.error);
```

## Advanced Example: Exchange Rate Trend Analysis

```typescript
import { MiscExplorer, ExchangeRateSource } from 'vnstock';
import { writeFileSync } from 'fs';

async function analyzeExchangeRateTrend() {
  const misc = new MiscExplorer();

  // Get USD to VND exchange rates for the past year
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const historicalRates = await misc.getHistoricalExchangeRates({
    fromCurrency: 'USD',
    toCurrency: 'VND',
    source: ExchangeRateSource.SBV,
    startDate,
    endDate,
  });

  // Group rates by month
  const monthlyData = {};

  historicalRates.rates.forEach((rateData) => {
    const date = rateData.date;
    const month = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;

    if (!monthlyData[month]) {
      monthlyData[month] = [];
    }

    monthlyData[month].push(rateData.rate);
  });

  // Calculate monthly statistics
  const monthlyStats = Object.keys(monthlyData).map((month) => {
    const rates = monthlyData[month];
    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const max = Math.max(...rates);
    const min = Math.min(...rates);
    const volatility = max - min;
    const volatilityPercent = (volatility / min) * 100;

    return {
      month,
      average,
      max,
      min,
      volatility,
      volatilityPercent,
      dataPoints: rates.length,
    };
  });

  // Display monthly statistics
  console.log('Monthly USD to VND Exchange Rate Analysis:');
  console.log('------------------------------------------');

  monthlyStats.forEach((stats) => {
    console.log(`Month: ${stats.month}`);
    console.log(`  Average: ${stats.average.toLocaleString()} VND`);
    console.log(
      `  Range: ${stats.min.toLocaleString()} - ${stats.max.toLocaleString()} VND`
    );
    console.log(
      `  Volatility: ${stats.volatility.toLocaleString()} VND (${stats.volatilityPercent.toFixed(
        2
      )}%)`
    );
    console.log(`  Data points: ${stats.dataPoints}`);
    console.log('------------------------------------------');
  });

  // Analyze trend
  const firstMonth = monthlyStats[0];
  const lastMonth = monthlyStats[monthlyStats.length - 1];
  const overallChange = lastMonth.average - firstMonth.average;
  const overallChangePercent = (overallChange / firstMonth.average) * 100;

  console.log('Overall Trend Analysis:');
  console.log(`  Period: ${firstMonth.month} to ${lastMonth.month}`);
  console.log(`  Starting Average: ${firstMonth.average.toLocaleString()} VND`);
  console.log(`  Ending Average: ${lastMonth.average.toLocaleString()} VND`);
  console.log(
    `  Change: ${overallChange.toLocaleString()} VND (${overallChangePercent.toFixed(
      2
    )}%)`
  );

  if (overallChange > 0) {
    console.log('  Trend: UPWARD (VND depreciation relative to USD)');
  } else if (overallChange < 0) {
    console.log('  Trend: DOWNWARD (VND appreciation relative to USD)');
  } else {
    console.log('  Trend: STABLE');
  }

  // Generate CSV data for further analysis
  const csvData = [
    'date,rate',
    ...historicalRates.rates.map(
      (data) => `${data.date.toISOString().split('T')[0]},${data.rate}`
    ),
  ].join('\n');

  try {
    writeFileSync('usd_vnd_exchange_rates.csv', csvData);
    console.log('\nExchange rate data exported to usd_vnd_exchange_rates.csv');
  } catch (error) {
    console.error('Error writing CSV file:', error.message);
  }
}

analyzeExchangeRateTrend().catch(console.error);
```

## Implementation Considerations

### Handling API Limitations

Different exchange rate sources have different limitations:

1. **SBV**: Only provides daily rates on weekdays; historical data may be limited
2. **Vietcombank**: May have rate limits on API requests
3. **Open Exchange Rates**: Requires API key, has tiered access with request limits
4. **VNDirect**: Limited to a few currency pairs, focused on USD/VND

Implement appropriate error handling and fallback mechanisms to handle these limitations.

### Caching Strategy

Exchange rates don't change by the second. Implement appropriate caching:

1. Recent exchange rates: Cache for 15-30 minutes
2. Historical exchange rates: Cache for several hours or a day
3. Implement cache invalidation when markets close/open

### Cross-currency Conversion

When converting between two non-VND currencies, you may need to use VND as an intermediate:

```typescript
async function convertCrossRate(fromCurrency, toCurrency, amount) {
  // Get rates for both currencies against VND
  const [fromRate, toRate] = await Promise.all([
    getExchangeRate(fromCurrency, 'VND'),
    getExchangeRate(toCurrency, 'VND'),
  ]);

  // Calculate cross rate
  const crossRate = fromRate / toRate;

  // Convert amount
  return amount * crossRate;
}
```

### Error Handling

Implement thorough error handling:

1. **Network Errors**: Handle failed connections gracefully
2. **API Changes**: Validate response formats and handle unexpected changes
3. **Rate Limits**: Implement backoff and retry mechanisms
4. **Data Validation**: Ensure exchange rates are in expected ranges

### Performance Optimization

For applications requiring multiple currency conversions:

1. Fetch all required exchange rates in one batch where possible
2. Cache exchange rates for reuse within the same session
3. For historical data, fetch at a reduced frequency (e.g., weekly instead of daily) for longer time periods

## Related Documentation

- [Misc Explorer Overview](./index.md)
- [Gold Price Module](./gold_price.md)
