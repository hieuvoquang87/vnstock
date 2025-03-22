# Gold Price Module

**Original Python Implementation**: [gold_price.py](/vnstock/explorer/misc/gold_price.py)


## Overview

The Gold Price module is a component of the Misc Explorer in the vnstock TypeScript library that provides access to gold price data from various sources. This module allows users to retrieve real-time and historical gold prices from both Vietnamese and international markets, offering a comprehensive solution for applications that require gold price data for investment analysis, portfolio tracking, or market research.

## Purpose

The Gold Price module serves several key purposes:

1. Provide real-time gold price quotes from Vietnamese and international sources
2. Offer historical gold price data for trend analysis and reporting
3. Support different gold types, including SJC gold, DOJI gold, and international gold
4. Compare prices between different sources and gold types
5. Track price changes over time for investment performance analysis

## Data Sources

The module accesses gold price data from various authoritative sources:

| Source                       | Description                            | Features                             | Update Frequency     |
| ---------------------------- | -------------------------------------- | ------------------------------------ | -------------------- |
| Saigon Jewelry Company (SJC) | Vietnam's largest gold firm            | Local gold bars, jewelry gold        | Multiple times daily |
| DOJI                         | Major Vietnamese gold retailer         | Local gold bars, jewelry gold        | Multiple times daily |
| World Gold Council           | Global gold authority                  | International gold prices, analytics | Daily                |
| Kitco                        | International precious metals retailer | Spot gold, futures, historical data  | Real-time, intraday  |

## Constants and Enums

The module uses several constant definitions and enumerations:

```typescript
/**
 * Gold price data sources
 */
export enum GoldPriceSource {
  SJC = 'sjc',
  DOJI = 'doji',
  WORLD_GOLD_COUNCIL = 'wgc',
  KITCO = 'kitco',
}

/**
 * Gold types for Vietnamese market
 */
export enum GoldType {
  // SJC gold bars
  SJC_1L = 'sjc_1l', // SJC 1 lượng (1 tael, approx. 37.5g)
  SJC_5_CHI = 'sjc_5chi', // SJC 5 chỉ (5/10 tael)
  SJC_2_CHI = 'sjc_2chi', // SJC 2 chỉ (2/10 tael)
  SJC_1_CHI = 'sjc_1chi', // SJC 1 chỉ (1/10 tael)

  // DOJI gold
  DOJI_1L = 'doji_1l', // DOJI 1 lượng

  // International gold
  GOLD_SPOT = 'gold_spot', // International spot gold
  GOLD_FUTURES = 'gold_futures', // Gold futures
}

/**
 * Units of measurement for gold
 */
export enum GoldUnit {
  OUNCE = 'oz', // Troy ounce (international standard)
  TAEL = 'tael', // Vietnamese lượng (approx. 37.5g)
  GRAM = 'g', // Gram
  KILOGRAM = 'kg', // Kilogram
}

/**
 * API endpoints for different gold price sources
 */
export const GOLD_PRICE_ENDPOINTS = {
  SJC: 'https://sjc.com.vn/giavang/textContent.php',
  DOJI: 'https://doji.vn/api/get-price-board',
  WORLD_GOLD_COUNCIL: 'https://www.gold.org/data/gold-price',
  KITCO: 'https://www.kitco.com/charts/livegold.html',
};

/**
 * Default options for gold price requests
 */
export const DEFAULT_GOLD_PRICE_OPTIONS = {
  source: GoldPriceSource.SJC,
  goldType: GoldType.SJC_1L,
  currency: 'VND',
  unit: GoldUnit.TAEL,
};

/**
 * Conversion factors between gold units
 */
export const GOLD_UNIT_CONVERSION = {
  [GoldUnit.TAEL]: {
    [GoldUnit.OUNCE]: 0.825, // 1 tael ≈ 0.825 troy oz
    [GoldUnit.GRAM]: 37.5, // 1 tael ≈ 37.5 grams
  },
  [GoldUnit.OUNCE]: {
    [GoldUnit.TAEL]: 1.212, // 1 oz ≈ 1.212 tael
    [GoldUnit.GRAM]: 31.1035, // 1 oz ≈ 31.1035 grams
  },
  [GoldUnit.GRAM]: {
    [GoldUnit.TAEL]: 0.02667, // 1 g ≈ 0.02667 tael
    [GoldUnit.OUNCE]: 0.03215, // 1 g ≈ 0.03215 oz
  },
};
```

## Data Structures

The module uses the following data structures:

```typescript
/**
 * Options for retrieving gold prices
 */
export interface GoldPriceOptions {
  /** Source to retrieve prices from */
  source?: GoldPriceSource;

  /** Type of gold to retrieve prices for */
  goldType?: GoldType;

  /** Currency for the price */
  currency?: string;

  /** Unit of measurement */
  unit?: GoldUnit;
}

/**
 * Options for retrieving historical gold prices
 */
export interface HistoricalGoldPriceOptions {
  /** Source to retrieve prices from */
  source?: GoldPriceSource;

  /** Type of gold to retrieve prices for */
  goldType?: GoldType;

  /** Currency for the prices */
  currency?: string;

  /** Unit of measurement */
  unit?: GoldUnit;

  /** Start date for historical data */
  startDate: Date;

  /** End date for historical data */
  endDate: Date;

  /** Interval between data points (daily, weekly, monthly) */
  interval?: 'daily' | 'weekly' | 'monthly';
}

/**
 * Gold price data response
 */
export interface GoldPriceData {
  /** Type of gold */
  goldType: GoldType;

  /** Price (for international gold) */
  price?: number;

  /** Buy price (for Vietnamese gold) */
  buyPrice?: number;

  /** Sell price (for Vietnamese gold) */
  sellPrice?: number;

  /** Price change from previous day */
  change?: number;

  /** Percentage price change from previous day */
  changePercent?: number;

  /** Currency of the price */
  currency: string;

  /** Unit of measurement */
  unit: GoldUnit;

  /** Data source */
  source: GoldPriceSource;

  /** When the price was last updated */
  lastUpdated: Date;
}

/**
 * Historical gold price data response
 */
export interface HistoricalGoldPriceData {
  /** Type of gold */
  goldType: GoldType;

  /** Currency of the prices */
  currency: string;

  /** Unit of measurement */
  unit: GoldUnit;

  /** Data source */
  source: GoldPriceSource;

  /** Array of historical prices */
  prices: {
    /** Date of the price data */
    date: Date;

    /** Price (for international gold) */
    price?: number;

    /** Buy price (for Vietnamese gold) */
    buyPrice?: number;

    /** Sell price (for Vietnamese gold) */
    sellPrice?: number;
  }[];
}
```

## Implementation

The Gold Price module is implemented through several classes:

### Main Class: GoldPriceClient

```typescript
/**
 * Client for retrieving gold price data
 */
export class GoldPriceClient {
  private readonly options: MiscExplorerOptions;
  private readonly httpClient: HttpClient;
  private readonly cache: Cache;

  /**
   * Create a new GoldPriceClient
   * @param options - Configuration options
   */
  constructor(options?: Partial<MiscExplorerOptions>) {
    this.options = {
      timeout: 30000,
      retryOnFailure: true,
      maxRetries: 3,
      enableCaching: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      defaultGoldPriceSource: GoldPriceSource.SJC,
      ...options,
    };

    this.httpClient = new HttpClient(this.options);
    this.cache = new Cache(this.options.cacheDuration);
  }

  /**
   * Get current gold price
   * @param options - Gold price options
   * @returns Promise resolving to gold price data
   */
  async getGoldPrice(
    options?: Partial<GoldPriceOptions>
  ): Promise<GoldPriceData> {
    const opts: GoldPriceOptions = {
      source:
        options?.source ||
        this.options.defaultGoldPriceSource ||
        GoldPriceSource.SJC,
      goldType: options?.goldType || GoldType.SJC_1L,
      currency: options?.currency || 'VND',
      unit:
        options?.unit ||
        (options?.source === GoldPriceSource.WORLD_GOLD_COUNCIL ||
        options?.source === GoldPriceSource.KITCO
          ? GoldUnit.OUNCE
          : GoldUnit.TAEL),
    };

    // Check cache first if enabled
    if (this.options.enableCaching) {
      const cacheKey = this.getCacheKey('price', opts);
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData as GoldPriceData;
      }
    }

    // Fetch from appropriate source
    let result: GoldPriceData;

    switch (opts.source) {
      case GoldPriceSource.SJC:
        result = await this.getSjcGoldPrice(
          opts.goldType,
          opts.currency,
          opts.unit
        );
        break;
      case GoldPriceSource.DOJI:
        result = await this.getDojiGoldPrice(
          opts.goldType,
          opts.currency,
          opts.unit
        );
        break;
      case GoldPriceSource.WORLD_GOLD_COUNCIL:
        result = await this.getWgcGoldPrice(
          opts.goldType,
          opts.currency,
          opts.unit
        );
        break;
      case GoldPriceSource.KITCO:
        result = await this.getKitcoGoldPrice(
          opts.goldType,
          opts.currency,
          opts.unit
        );
        break;
      default:
        throw new Error(`Unsupported gold price source: ${opts.source}`);
    }

    // Cache the result if caching is enabled
    if (this.options.enableCaching) {
      const cacheKey = this.getCacheKey('price', opts);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  /**
   * Get historical gold prices
   * @param options - Historical gold price options
   * @returns Promise resolving to historical gold price data
   */
  async getHistoricalGoldPrices(
    options: HistoricalGoldPriceOptions
  ): Promise<HistoricalGoldPriceData> {
    this.validateDateRange(options.startDate, options.endDate);

    const source =
      options.source ||
      this.options.defaultGoldPriceSource ||
      GoldPriceSource.SJC;
    const goldType = options.goldType || GoldType.SJC_1L;
    const currency = options.currency || 'VND';
    const unit =
      options.unit ||
      (source === GoldPriceSource.WORLD_GOLD_COUNCIL ||
      source === GoldPriceSource.KITCO
        ? GoldUnit.OUNCE
        : GoldUnit.TAEL);
    const interval = options.interval || 'daily';

    // Check cache first if enabled
    if (this.options.enableCaching) {
      const cacheKey = this.getCacheKey('historical', options);
      const cachedData = this.cache.get(cacheKey);
      if (cachedData) {
        return cachedData as HistoricalGoldPriceData;
      }
    }

    // Fetch from appropriate source
    let result: HistoricalGoldPriceData;

    switch (source) {
      case GoldPriceSource.SJC:
        result = await this.getSjcHistoricalPrices(
          goldType,
          currency,
          unit,
          options.startDate,
          options.endDate,
          interval
        );
        break;
      case GoldPriceSource.DOJI:
        result = await this.getDojiHistoricalPrices(
          goldType,
          currency,
          unit,
          options.startDate,
          options.endDate,
          interval
        );
        break;
      case GoldPriceSource.WORLD_GOLD_COUNCIL:
        result = await this.getWgcHistoricalPrices(
          goldType,
          currency,
          unit,
          options.startDate,
          options.endDate,
          interval
        );
        break;
      case GoldPriceSource.KITCO:
        result = await this.getKitcoHistoricalPrices(
          goldType,
          currency,
          unit,
          options.startDate,
          options.endDate,
          interval
        );
        break;
      default:
        throw new Error(`Unsupported gold price source: ${source}`);
    }

    // Cache the result if caching is enabled
    if (this.options.enableCaching) {
      const cacheKey = this.getCacheKey('historical', options);
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  // Private implementation methods for each source
  private async getSjcGoldPrice(
    goldType: GoldType,
    currency: string,
    unit: GoldUnit
  ): Promise<GoldPriceData> {
    // Implementation details...
  }

  private async getDojiGoldPrice(
    goldType: GoldType,
    currency: string,
    unit: GoldUnit
  ): Promise<GoldPriceData> {
    // Implementation details...
  }

  private async getWgcGoldPrice(
    goldType: GoldType,
    currency: string,
    unit: GoldUnit
  ): Promise<GoldPriceData> {
    // Implementation details...
  }

  private async getKitcoGoldPrice(
    goldType: GoldType,
    currency: string,
    unit: GoldUnit
  ): Promise<GoldPriceData> {
    // Implementation details...
  }

  private async getSjcHistoricalPrices(
    goldType: GoldType,
    currency: string,
    unit: GoldUnit,
    startDate: Date,
    endDate: Date,
    interval: string
  ): Promise<HistoricalGoldPriceData> {
    // Implementation details...
  }

  private async getDojiHistoricalPrices(
    goldType: GoldType,
    currency: string,
    unit: GoldUnit,
    startDate: Date,
    endDate: Date,
    interval: string
  ): Promise<HistoricalGoldPriceData> {
    // Implementation details...
  }

  private async getWgcHistoricalPrices(
    goldType: GoldType,
    currency: string,
    unit: GoldUnit,
    startDate: Date,
    endDate: Date,
    interval: string
  ): Promise<HistoricalGoldPriceData> {
    // Implementation details...
  }

  private async getKitcoHistoricalPrices(
    goldType: GoldType,
    currency: string,
    unit: GoldUnit,
    startDate: Date,
    endDate: Date,
    interval: string
  ): Promise<HistoricalGoldPriceData> {
    // Implementation details...
  }

  // Helper methods
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

    const maxRange = 365 * 10; // 10 years
    const daysDiff = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff > maxRange) {
      throw new Error(
        `Date range too large. Maximum range is ${maxRange} days`
      );
    }
  }

  private getCacheKey(type: 'price' | 'historical', options: any): string {
    return `gold_${type}_${options.source}_${options.goldType}_${
      options.currency
    }_${options.unit}${
      type === 'historical'
        ? `_${options.startDate.toISOString()}_${options.endDate.toISOString()}_${
            options.interval
          }`
        : ''
    }`;
  }

  /**
   * Convert gold price between different units
   * @param price - Original price
   * @param fromUnit - Original unit
   * @param toUnit - Target unit
   * @returns Converted price
   */
  private convertGoldUnit(
    price: number,
    fromUnit: GoldUnit,
    toUnit: GoldUnit
  ): number {
    if (fromUnit === toUnit) {
      return price;
    }

    const conversionFactor = GOLD_UNIT_CONVERSION[fromUnit]?.[toUnit];
    if (!conversionFactor) {
      throw new Error(`Unsupported unit conversion: ${fromUnit} to ${toUnit}`);
    }

    return price * conversionFactor;
  }
}
```

## Usage Examples

### Basic Gold Price Retrieval

```typescript
import { MiscExplorer, GoldPriceSource, GoldType, GoldUnit } from 'vnstock';

async function getGoldPrices() {
  const misc = new MiscExplorer();

  // Get SJC gold price in VND per tael
  const sjcGold = await misc.getGoldPrice({
    source: GoldPriceSource.SJC,
    goldType: GoldType.SJC_1L,
    currency: 'VND',
    unit: GoldUnit.TAEL,
  });

  console.log('SJC Gold Price:');
  console.log(`Buy: ${sjcGold.buyPrice.toLocaleString()} VND/tael`);
  console.log(`Sell: ${sjcGold.sellPrice.toLocaleString()} VND/tael`);
  console.log(
    `Spread: ${(sjcGold.sellPrice - sjcGold.buyPrice).toLocaleString()} VND`
  );
  console.log(`Last updated: ${sjcGold.lastUpdated.toLocaleString()}`);

  // Get international gold price in USD per ounce
  const intlGold = await misc.getGoldPrice({
    source: GoldPriceSource.WORLD_GOLD_COUNCIL,
    goldType: GoldType.GOLD_SPOT,
    currency: 'USD',
    unit: GoldUnit.OUNCE,
  });

  console.log('\nInternational Gold Price:');
  console.log(`Price: $${intlGold.price.toFixed(2)}/oz`);
  console.log(
    `Change: $${intlGold.change.toFixed(2)} (${intlGold.changePercent.toFixed(
      2
    )}%)`
  );
  console.log(`Last updated: ${intlGold.lastUpdated.toLocaleString()}`);
}

getGoldPrices().catch(console.error);
```

### Comparing Gold Prices from Different Sources

```typescript
import { MiscExplorer, GoldPriceSource, GoldType, GoldUnit } from 'vnstock';

async function compareGoldPrices() {
  const misc = new MiscExplorer();

  // Get gold prices from different sources
  const sources = [
    { source: GoldPriceSource.SJC, goldType: GoldType.SJC_1L },
    { source: GoldPriceSource.DOJI, goldType: GoldType.DOJI_1L },
  ];

  const pricePromises = sources.map((src) =>
    misc
      .getGoldPrice({
        source: src.source,
        goldType: src.goldType,
        currency: 'VND',
        unit: GoldUnit.TAEL,
      })
      .catch((err) => {
        console.error(`Error fetching from ${src.source}:`, err.message);
        return null;
      })
  );

  const prices = await Promise.all(pricePromises);

  // Display comparison table
  console.log('Vietnamese Gold Price Comparison (VND/tael):');
  console.log('--------------------------------------------');
  console.log('Source\t\tBuy Price\t\tSell Price\t\tSpread');
  console.log('--------------------------------------------');

  prices.filter(Boolean).forEach((price) => {
    console.log(
      `${
        price.source
      }\t\t${price.buyPrice.toLocaleString()}\t\t${price.sellPrice.toLocaleString()}\t\t${(
        price.sellPrice - price.buyPrice
      ).toLocaleString()}`
    );
  });

  // Compare with international gold price
  console.log('\nComparing with International Gold Price:');

  // Get international gold price
  const intlGold = await misc.getGoldPrice({
    source: GoldPriceSource.WORLD_GOLD_COUNCIL,
    currency: 'USD',
    unit: GoldUnit.OUNCE,
  });

  // Get USD to VND exchange rate (simplified example - would use ExchangeRate module)
  const usdToVnd = 23500; // Example exchange rate

  // Convert international gold price to VND/tael
  const intlPriceUsd = intlGold.price;
  const intlPriceVnd = intlPriceUsd * usdToVnd;
  const intlPriceVndPerTael = intlPriceVnd * 0.825; // Convert oz to tael (1 tael ≈ 0.825 troy oz)

  console.log(`International gold price: $${intlPriceUsd.toFixed(2)}/oz`);
  console.log(
    `International gold in VND: ${intlPriceVnd.toLocaleString()} VND/oz`
  );
  console.log(
    `International gold in VND/tael: ${intlPriceVndPerTael.toLocaleString()} VND/tael`
  );

  // Calculate premium of domestic prices over international price
  prices.filter(Boolean).forEach((price) => {
    const sellPremium =
      ((price.sellPrice - intlPriceVndPerTael) / intlPriceVndPerTael) * 100;
    const buyPremium =
      ((price.buyPrice - intlPriceVndPerTael) / intlPriceVndPerTael) * 100;

    console.log(`\n${price.source} premium over international price:`);
    console.log(`Buy premium: ${buyPremium.toFixed(2)}%`);
    console.log(`Sell premium: ${sellPremium.toFixed(2)}%`);
  });
}

compareGoldPrices().catch(console.error);
```

### Getting Historical Gold Price Data

```typescript
import { MiscExplorer, GoldPriceSource, GoldType, GoldUnit } from 'vnstock';

async function getHistoricalGoldPrices() {
  const misc = new MiscExplorer();

  // Get SJC gold prices for the past 30 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  const historicalPrices = await misc.getHistoricalGoldPrices({
    source: GoldPriceSource.SJC,
    goldType: GoldType.SJC_1L,
    currency: 'VND',
    unit: GoldUnit.TAEL,
    startDate,
    endDate,
    interval: 'daily',
  });

  console.log(
    `Retrieved ${historicalPrices.prices.length} days of gold price data`
  );
  console.log(
    `From: ${startDate.toLocaleDateString()} To: ${endDate.toLocaleDateString()}`
  );

  // Calculate statistics for sell prices
  const sellPrices = historicalPrices.prices.map((p) => p.sellPrice);
  const averageSell =
    sellPrices.reduce((sum, price) => sum + price, 0) / sellPrices.length;
  const maxSell = Math.max(...sellPrices);
  const minSell = Math.min(...sellPrices);
  const volatilitySell = maxSell - minSell;

  // Calculate statistics for buy prices
  const buyPrices = historicalPrices.prices.map((p) => p.buyPrice);
  const averageBuy =
    buyPrices.reduce((sum, price) => sum + price, 0) / buyPrices.length;
  const maxBuy = Math.max(...buyPrices);
  const minBuy = Math.min(...buyPrices);
  const volatilityBuy = maxBuy - minBuy;

  console.log('\nStatistics (Sell Price):');
  console.log(`Average: ${averageSell.toLocaleString()} VND/tael`);
  console.log(`Maximum: ${maxSell.toLocaleString()} VND/tael`);
  console.log(`Minimum: ${minSell.toLocaleString()} VND/tael`);
  console.log(`Volatility: ${volatilitySell.toLocaleString()} VND`);
  console.log(
    `Volatility %: ${((volatilitySell / minSell) * 100).toFixed(2)}%`
  );

  console.log('\nStatistics (Buy Price):');
  console.log(`Average: ${averageBuy.toLocaleString()} VND/tael`);
  console.log(`Maximum: ${maxBuy.toLocaleString()} VND/tael`);
  console.log(`Minimum: ${minBuy.toLocaleString()} VND/tael`);
  console.log(`Volatility: ${volatilityBuy.toLocaleString()} VND`);
  console.log(`Volatility %: ${((volatilityBuy / minBuy) * 100).toFixed(2)}%`);

  // Display the most recent 5 days
  console.log('\nMost recent prices:');
  historicalPrices.prices
    .slice(-5)
    .reverse()
    .forEach((price) => {
      console.log(
        `${price.date.toLocaleDateString()}: Buy: ${price.buyPrice.toLocaleString()} VND/tael, Sell: ${price.sellPrice.toLocaleString()} VND/tael`
      );
    });
}

getHistoricalGoldPrices().catch(console.error);
```

### Converting Between Units

```typescript
import { MiscExplorer, GoldPriceSource, GoldUnit } from 'vnstock';

async function convertGoldUnits() {
  const misc = new MiscExplorer();

  // Get international gold price in USD per ounce
  const goldPriceOz = await misc.getGoldPrice({
    source: GoldPriceSource.WORLD_GOLD_COUNCIL,
    currency: 'USD',
    unit: GoldUnit.OUNCE,
  });

  console.log(`Current gold price: $${goldPriceOz.price.toFixed(2)}/oz`);

  // Convert to different units
  const pricePerGram = goldPriceOz.price / 31.1035; // 1 troy oz = 31.1035 grams
  const pricePerKg = pricePerGram * 1000;
  const pricePerTael = goldPriceOz.price * 1.212; // 1 tael ≈ 1.212 troy oz

  console.log('\nGold price in different units:');
  console.log(`Per gram: $${pricePerGram.toFixed(2)}/g`);
  console.log(`Per kilogram: $${pricePerKg.toFixed(2)}/kg`);
  console.log(`Per tael: $${pricePerTael.toFixed(2)}/tael`);

  // Convert to different currencies (simplified example - would use ExchangeRate module)
  const exchangeRates = {
    EUR: 0.85, // 1 USD = 0.85 EUR
    GBP: 0.75, // 1 USD = 0.75 GBP
    JPY: 110, // 1 USD = 110 JPY
    VND: 23500, // 1 USD = 23500 VND
  };

  console.log('\nGold price in different currencies (per ounce):');

  Object.entries(exchangeRates).forEach(([currency, rate]) => {
    const price = goldPriceOz.price * rate;
    console.log(`${currency}: ${price.toLocaleString()} ${currency}/oz`);
  });
}

convertGoldUnits().catch(console.error);
```

## Advanced Example: Gold Price Trend Analysis

```typescript
import { MiscExplorer, GoldPriceSource, GoldType, GoldUnit } from 'vnstock';
import { writeFileSync } from 'fs';

async function analyzeGoldPriceTrend() {
  const misc = new MiscExplorer({
    enableCaching: true,
    cacheDuration: 60 * 60 * 1000, // 1 hour
  });

  // Get international gold prices for the past year
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);

  const historicalPrices = await misc.getHistoricalGoldPrices({
    source: GoldPriceSource.WORLD_GOLD_COUNCIL,
    goldType: GoldType.GOLD_SPOT,
    currency: 'USD',
    unit: GoldUnit.OUNCE,
    startDate,
    endDate,
    interval: 'daily',
  });

  // Group prices by month
  const monthlyData = {};

  historicalPrices.prices.forEach((priceData) => {
    const date = priceData.date;
    const month = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}`;

    if (!monthlyData[month]) {
      monthlyData[month] = [];
    }

    monthlyData[month].push(priceData.price);
  });

  // Calculate monthly statistics
  const monthlyStats = Object.keys(monthlyData).map((month) => {
    const prices = monthlyData[month];
    const average =
      prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const max = Math.max(...prices);
    const min = Math.min(...prices);
    const volatility = max - min;
    const volatilityPercent = (volatility / min) * 100;

    return {
      month,
      average,
      max,
      min,
      volatility,
      volatilityPercent,
      dataPoints: prices.length,
    };
  });

  // Display monthly statistics
  console.log('Monthly Gold Price Analysis:');
  console.log('---------------------------');

  monthlyStats.forEach((stats) => {
    console.log(`Month: ${stats.month}`);
    console.log(`  Average: $${stats.average.toFixed(2)}/oz`);
    console.log(
      `  Range: $${stats.min.toFixed(2)} - $${stats.max.toFixed(2)}/oz`
    );
    console.log(
      `  Volatility: $${stats.volatility.toFixed(
        2
      )}/oz (${stats.volatilityPercent.toFixed(2)}%)`
    );
    console.log(`  Data points: ${stats.dataPoints}`);
    console.log('---------------------------');
  });

  // Analyze trend
  const firstMonth = monthlyStats[0];
  const lastMonth = monthlyStats[monthlyStats.length - 1];
  const overallChange = lastMonth.average - firstMonth.average;
  const overallChangePercent = (overallChange / firstMonth.average) * 100;

  console.log('Overall Trend Analysis:');
  console.log(`  Period: ${firstMonth.month} to ${lastMonth.month}`);
  console.log(`  Starting Average: $${firstMonth.average.toFixed(2)}/oz`);
  console.log(`  Ending Average: $${lastMonth.average.toFixed(2)}/oz`);
  console.log(
    `  Change: $${overallChange.toFixed(2)}/oz (${overallChangePercent.toFixed(
      2
    )}%)`
  );

  if (overallChange > 0) {
    console.log('  Trend: UPWARD (Gold price appreciation)');
  } else if (overallChange < 0) {
    console.log('  Trend: DOWNWARD (Gold price depreciation)');
  } else {
    console.log('  Trend: STABLE');
  }

  // Calculate correlation with VND/USD exchange rate (simplified example)
  // In a real implementation, you would use the ExchangeRate module to get historical exchange rates

  // Generate CSV data for further analysis
  const csvData = [
    'date,price',
    ...historicalPrices.prices.map(
      (data) => `${data.date.toISOString().split('T')[0]},${data.price}`
    ),
  ].join('\n');

  try {
    writeFileSync('gold_prices_usd.csv', csvData);
    console.log('\nGold price data exported to gold_prices_usd.csv');
  } catch (error) {
    console.error('Error writing CSV file:', error.message);
  }
}

analyzeGoldPriceTrend().catch(console.error);
```

## Implementation Considerations

### Handling API Limitations

Different gold price sources have different limitations:

1. **SJC and DOJI**: May have rate limits or may not provide historical data in a readily accessible format
2. **World Gold Council**: May require registration or have limited free access
3. **Kitco**: May have restrictions on data usage for commercial purposes

Implement appropriate error handling and fallback mechanisms to handle these limitations.

### Caching Strategy

Gold prices don't change by the second. Implement appropriate caching:

1. Current gold prices: Cache for 5-15 minutes
2. Historical gold prices: Cache for several hours or a day
3. Implement cache invalidation during market hours

### Unit Conversion

When working with gold prices from different sources, unit conversion is essential:

1. International markets typically quote gold in troy ounces (oz)
2. Vietnamese markets typically quote gold in taels (lượng)
3. Some markets may quote gold in grams or kilograms

The module includes conversion functions to handle these differences.

### Error Handling

Implement thorough error handling:

1. **Network Errors**: Handle failed connections gracefully
2. **API Changes**: Validate response formats and handle unexpected changes
3. **Rate Limits**: Implement backoff and retry mechanisms
4. **Data Validation**: Ensure gold prices are in expected ranges

### Performance Optimization

For applications requiring gold price data:

1. Use caching to reduce API calls
2. For historical data with long time periods, consider using weekly or monthly intervals
3. Implement local storage for frequently used historical data
4. Use memoization for unit conversion calculations

## Related Documentation

- [Misc Explorer Overview](./index.md)
- [Exchange Rate Module](./exchange_rate.md)
