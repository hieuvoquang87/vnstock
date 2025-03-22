# MSN Explorer Listing Functionality

**Original Python Implementation**: [listing.py](/vnstock/explorer/msn/listing.py)


## Overview

This document details the listing functionality in the MSN explorer module of the vnstock TypeScript library. The listing functions provide capabilities to search and list securities, market indices, and sectors from MSN Money, with a focus on international market data.

## Purpose

The MSN Explorer listing functionality enables users to:

1. Search for securities by name or symbol across global markets
2. Retrieve lists of major indices for different regions
3. Get lists of securities by market, sector, or industry
4. Discover trending or most active securities
5. Access lists of specific security types (stocks, ETFs, mutual funds, etc.)

## API Endpoints

The listing functionality utilizes the following MSN API endpoints:

| Endpoint                | Purpose             | Description                                                  |
| ----------------------- | ------------------- | ------------------------------------------------------------ |
| `/api/search`           | Security search     | Searches for securities by name or symbol across all markets |
| `/api/markets/summary`  | Market summary      | Gets summary data for major indices in a specified region    |
| `/api/markets/sectors`  | Sector performance  | Gets performance data for market sectors                     |
| `/api/markets/trending` | Trending securities | Gets list of trending or most active securities              |
| `/api/markets/screener` | Screener results    | Gets securities matching specified criteria                  |

## Data Structures

The listing functionality uses the following data structures:

```typescript
/**
 * Represents a security search result
 */
interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  assetType: string;
  region: string;
  currency: string;
}

/**
 * Represents a market index summary
 */
interface MarketIndex {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
  volume: number;
  previousClose: number;
}

/**
 * Represents a market sector performance summary
 */
interface SectorPerformance {
  name: string;
  changePercent: number;
  lastUpdated: Date;
}

/**
 * Represents parameters for security search
 */
interface SearchParams {
  query: string;
  limit?: number;
  assetType?: string;
  region?: string;
}

/**
 * Represents parameters for market summary request
 */
interface MarketSummaryParams {
  region?: string;
}

/**
 * Represents parameters for trending securities request
 */
interface TrendingSecuritiesParams {
  region?: string;
  assetType?: string;
  limit?: number;
}

/**
 * Represents parameters for screener results
 */
interface ScreenerParams {
  marketCap?: [number, number];
  priceChange?: [number, number];
  region?: string;
  sector?: string;
  industry?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
}
```

## Implementation

The MSN listing functionality is implemented through the `MsnExplorer` class, which provides methods for retrieving lists of securities and market data:

```typescript
/**
 * MSN Explorer implementation for listing functionality
 */
export class MsnExplorer {
  private readonly httpClient: HttpClient;
  private readonly baseUrl: string;
  private readonly options: MsnExplorerOptions;

  /**
   * Constructor for MsnExplorer
   * @param options - Configuration options
   */
  constructor(options?: MsnExplorerOptions) {
    this.options = {
      timeout: 30000,
      retryOnFailure: true,
      maxRetries: 3,
      locale: 'en-US',
      enableCaching: true,
      cacheDuration: 5 * 60 * 1000, // 5 minutes
      ...options,
    };

    this.baseUrl = MSN_API_ENDPOINTS.BASE_URL;
    this.httpClient = new HttpClient(this.options);
  }

  /**
   * Search for securities by name or symbol
   * @param query - Search query text (name or symbol)
   * @param options - Search options
   * @returns Promise resolving to array of search results
   */
  async search(
    query: string,
    options?: Partial<SearchParams>
  ): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) {
      throw new ValidationError({
        param: 'query',
        constraint: 'required',
        value: query,
      });
    }

    const params = {
      q: query,
      limit: options?.limit || 10,
      assetType: options?.assetType,
      region: options?.region,
    };

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.SEARCH}`,
        { params }
      );

      return this.transformSearchResults(response.data);
    } catch (error) {
      throw createMsnApiError('SEARCH_ERROR', error);
    }
  }

  /**
   * Get market summary for a specified region
   * @param options - Market summary request options
   * @returns Promise resolving to market summary data
   */
  async getMarketSummary(
    options?: MarketSummaryParams
  ): Promise<MarketSummary> {
    const region = options?.region || 'global';

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.MARKET_SUMMARY}`,
        { params: { region } }
      );

      return this.transformMarketSummary(response.data);
    } catch (error) {
      throw createMsnApiError('MARKET_SUMMARY_ERROR', error);
    }
  }

  /**
   * Get sector performance data
   * @param options - Optional parameters
   * @returns Promise resolving to array of sector performance data
   */
  async getSectorPerformance(options?: {
    region?: string;
  }): Promise<SectorPerformance[]> {
    const region = options?.region || 'global';

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.SECTORS}`,
        { params: { region } }
      );

      return this.transformSectorPerformance(response.data);
    } catch (error) {
      throw createMsnApiError('SECTOR_PERFORMANCE_ERROR', error);
    }
  }

  /**
   * Get trending securities
   * @param options - Trending securities request options
   * @returns Promise resolving to array of trending securities
   */
  async getTrendingSecurities(
    options?: TrendingSecuritiesParams
  ): Promise<QuoteData[]> {
    const params = {
      region: options?.region || 'global',
      assetType: options?.assetType,
      limit: options?.limit || 10,
    };

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.TRENDING}`,
        { params }
      );

      return this.transformTrendingSecurities(response.data);
    } catch (error) {
      throw createMsnApiError('TRENDING_SECURITIES_ERROR', error);
    }
  }

  /**
   * Get securities matching specified criteria using the screener
   * @param params - Screener parameters
   * @returns Promise resolving to array of securities matching criteria
   */
  async screenSecurities(params: ScreenerParams): Promise<QuoteData[]> {
    const queryParams = this.buildScreenerParams(params);

    try {
      const response = await this.httpClient.get(
        `${this.baseUrl}${MSN_API_ENDPOINTS.SCREENER}`,
        { params: queryParams }
      );

      return this.transformScreenerResults(response.data);
    } catch (error) {
      throw createMsnApiError('SCREENER_ERROR', error);
    }
  }

  /**
   * Transform raw search API response to standardized search results
   * @param rawData - Raw API response
   * @returns Transformed search results
   */
  private transformSearchResults(rawData: any): SearchResult[] {
    if (!rawData?.results || !Array.isArray(rawData.results)) {
      return [];
    }

    return rawData.results.map((item: any) => ({
      symbol: item.ticker || '',
      name: item.name || '',
      exchange: item.exchange || '',
      assetType: item.assetType || '',
      region: item.region || '',
      currency: item.currency || '',
    }));
  }

  /**
   * Transform raw market summary API response
   * @param rawData - Raw API response
   * @returns Transformed market summary
   */
  private transformMarketSummary(rawData: any): MarketSummary {
    if (!rawData || typeof rawData !== 'object') {
      return {
        indices: [],
        region: '',
        marketStatus: 'unknown',
        timestamp: new Date(),
      };
    }

    const indices = (rawData.indices || []).map((item: any) => ({
      symbol: item.ticker || '',
      name: item.name || '',
      value: parseFloat(item.value) || 0,
      change: parseFloat(item.change) || 0,
      changePercent: parseFloat(item.changePercent) || 0,
      volume: parseInt(item.volume, 10) || 0,
      previousClose: parseFloat(item.previousClose) || 0,
    }));

    return {
      indices,
      region: rawData.region || '',
      marketStatus: rawData.marketStatus || 'unknown',
      timestamp: new Date(rawData.timestamp || Date.now()),
      advancers: parseInt(rawData.advancers, 10) || undefined,
      decliners: parseInt(rawData.decliners, 10) || undefined,
      unchanged: parseInt(rawData.unchanged, 10) || undefined,
      advanceDeclineRatio: parseFloat(rawData.advanceDeclineRatio) || undefined,
    };
  }

  /**
   * Transform sector performance data
   * @param rawData - Raw API response
   * @returns Transformed sector performance data
   */
  private transformSectorPerformance(rawData: any): SectorPerformance[] {
    if (!rawData?.sectors || !Array.isArray(rawData.sectors)) {
      return [];
    }

    return rawData.sectors.map((item: any) => ({
      name: item.name || '',
      changePercent: parseFloat(item.changePercent) || 0,
      lastUpdated: new Date(item.timestamp || Date.now()),
    }));
  }

  /**
   * Transform trending securities data
   * @param rawData - Raw API response
   * @returns Transformed trending securities data
   */
  private transformTrendingSecurities(rawData: any): QuoteData[] {
    if (!rawData?.securities || !Array.isArray(rawData.securities)) {
      return [];
    }

    return rawData.securities.map((item: any) => this.transformQuoteData(item));
  }

  /**
   * Transform screener results
   * @param rawData - Raw API response
   * @returns Transformed screener results
   */
  private transformScreenerResults(rawData: any): QuoteData[] {
    if (!rawData?.securities || !Array.isArray(rawData.securities)) {
      return [];
    }

    return rawData.securities.map((item: any) => this.transformQuoteData(item));
  }

  /**
   * Build parameters for screener API
   * @param params - Screener parameters
   * @returns Query parameters for API request
   */
  private buildScreenerParams(params: ScreenerParams): Record<string, string> {
    const result: Record<string, string> = {};

    if (params.marketCap) {
      result.marketCapMin = params.marketCap[0].toString();
      result.marketCapMax = params.marketCap[1].toString();
    }

    if (params.priceChange) {
      result.priceChangeMin = params.priceChange[0].toString();
      result.priceChangeMax = params.priceChange[1].toString();
    }

    if (params.region) {
      result.region = params.region;
    }

    if (params.sector) {
      result.sector = params.sector;
    }

    if (params.industry) {
      result.industry = params.industry;
    }

    if (params.sortBy) {
      result.sortBy = params.sortBy;
    }

    if (params.sortDirection) {
      result.sortDirection = params.sortDirection;
    }

    if (params.limit) {
      result.limit = params.limit.toString();
    }

    return result;
  }

  /**
   * Transform quote data (simplified version)
   * @param item - Raw quote data
   * @returns Transformed quote data
   */
  private transformQuoteData(item: any): QuoteData {
    // Implementation details in quote.md
    // This is a simplified version for this document
    return {
      symbol: item.ticker || '',
      name: item.name || '',
      exchange: item.exchange || '',
      price: parseFloat(item.price) || 0,
      change: parseFloat(item.change) || 0,
      changePercent: parseFloat(item.changePercent) || 0,
      volume: parseInt(item.volume, 10) || 0,
      previousClose: parseFloat(item.previousClose) || 0,
      open: parseFloat(item.open) || 0,
      dayHigh: parseFloat(item.dayHigh) || 0,
      dayLow: parseFloat(item.dayLow) || 0,
      marketCap: parseFloat(item.marketCap) || 0,
      peRatio: parseFloat(item.peRatio) || 0,
      dividend: parseFloat(item.dividend) || 0,
      dividendYield: parseFloat(item.dividendYield) || 0,
      currency: item.currency || 'USD',
      assetType: item.assetType || '',
      lastUpdated: new Date(item.time || Date.now()),
    };
  }
}
```

## Usage Examples

### Basic Example: Searching for Securities

```typescript
import { MsnExplorer } from 'vnstock';

async function searchSecurities() {
  const msn = new MsnExplorer();

  // Search for Apple stock
  const results = await msn.search('AAPL');
  console.log('Search results:', results);

  // Search with more options
  const internationalResults = await msn.search('Toyota', {
    limit: 5,
    region: 'Asia',
    assetType: 'Stock',
  });
  console.log('International search results:', internationalResults);
}

searchSecurities().catch(console.error);
```

### Getting Market Summary

```typescript
import { MsnExplorer } from 'vnstock';

async function getMarketOverview() {
  const msn = new MsnExplorer();

  // Get global market summary
  const globalMarkets = await msn.getMarketSummary();
  console.log('Global market summary:', globalMarkets);

  // Get US market summary
  const usMarkets = await msn.getMarketSummary({ region: 'US' });
  console.log('US market indices:', usMarkets.indices);
  console.log('Market status:', usMarkets.marketStatus);
  console.log(
    'Advancers vs Decliners:',
    usMarkets.advancers,
    usMarkets.decliners
  );
}

getMarketOverview().catch(console.error);
```

### Getting Sector Performance

```typescript
import { MsnExplorer } from 'vnstock';

async function getSectors() {
  const msn = new MsnExplorer();

  // Get sector performance for US market
  const sectors = await msn.getSectorPerformance({ region: 'US' });

  // Print sectors sorted by performance
  const sortedSectors = [...sectors].sort(
    (a, b) => b.changePercent - a.changePercent
  );

  console.log('Sectors by performance:');
  sortedSectors.forEach((sector) => {
    console.log(`${sector.name}: ${sector.changePercent.toFixed(2)}%`);
  });
}

getSectors().catch(console.error);
```

### Getting Trending Securities

```typescript
import { MsnExplorer } from 'vnstock';

async function getTrendingStocks() {
  const msn = new MsnExplorer();

  // Get top 5 trending stocks in US market
  const trendingStocks = await msn.getTrendingSecurities({
    region: 'US',
    assetType: 'Stock',
    limit: 5,
  });

  console.log('Trending stocks:');
  trendingStocks.forEach((stock) => {
    console.log(
      `${stock.symbol} (${stock.name}): ${stock.price} ${
        stock.currency
      } (${stock.changePercent.toFixed(2)}%)`
    );
  });
}

getTrendingStocks().catch(console.error);
```

### Using the Screener

```typescript
import { MsnExplorer } from 'vnstock';

async function screenStocks() {
  const msn = new MsnExplorer();

  // Screen for large cap US stocks with positive price change
  const largeCapGainers = await msn.screenSecurities({
    region: 'US',
    marketCap: [10000000000, Infinity], // $10B+
    priceChange: [0.5, Infinity], // +0.5% or more
    sector: 'Technology',
    sortBy: 'marketCap',
    sortDirection: 'desc',
    limit: 10,
  });

  console.log('Large cap tech gainers:');
  largeCapGainers.forEach((stock) => {
    console.log(
      `${stock.symbol}: $${stock.price} (${stock.changePercent.toFixed(
        2
      )}%), Market Cap: $${(stock.marketCap / 1000000000).toFixed(2)}B`
    );
  });
}

screenStocks().catch(console.error);
```

## Advanced Example: Building a Market Dashboard

```typescript
import { MsnExplorer } from 'vnstock';

async function buildMarketDashboard() {
  const msn = new MsnExplorer({
    timeout: 60000,
    enableCaching: true,
    cacheDuration: 5 * 60 * 1000, // 5 minutes cache
  });

  // Get all data in parallel
  const [
    usSummary,
    europeSummary,
    asiaSummary,
    sectors,
    topGainers,
    topLosers,
  ] = await Promise.all([
    msn.getMarketSummary({ region: 'US' }),
    msn.getMarketSummary({ region: 'Europe' }),
    msn.getMarketSummary({ region: 'Asia' }),
    msn.getSectorPerformance({ region: 'US' }),
    msn.screenSecurities({
      region: 'US',
      priceChange: [1.0, Infinity],
      sortBy: 'changePercent',
      sortDirection: 'desc',
      limit: 5,
    }),
    msn.screenSecurities({
      region: 'US',
      priceChange: [-Infinity, -1.0],
      sortBy: 'changePercent',
      sortDirection: 'asc',
      limit: 5,
    }),
  ]);

  // Dashboard data object
  const dashboard = {
    timestamp: new Date(),
    marketIndices: {
      us: usSummary.indices,
      europe: europeSummary.indices,
      asia: asiaSummary.indices,
    },
    sectorPerformance: sectors,
    topGainers,
    topLosers,
    marketStatus: {
      us: usSummary.marketStatus,
      europe: europeSummary.marketStatus,
      asia: asiaSummary.marketStatus,
    },
  };

  console.log('Market Dashboard Data:', JSON.stringify(dashboard, null, 2));
  return dashboard;
}

buildMarketDashboard().catch(console.error);
```

## Implementation Considerations

### Error Handling

Implement robust error handling for all listing functions:

```typescript
try {
  const results = await msn.search('AAPL');
  // Process results
} catch (error) {
  if (error.code === 'SEARCH_ERROR') {
    console.error('Search failed:', error.message);
  } else if (error.code === 'VALIDATION_ERROR') {
    console.error('Invalid parameters:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

### Rate Limiting

Be mindful of MSN API rate limits:

1. Implement exponential backoff for retries
2. Add delays between consecutive requests
3. Use caching to reduce API calls

### Caching

Implement caching for listing requests, especially for market summary and sector data:

```typescript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedMarketSummary(region) {
  const cacheKey = `marketSummary_${region}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const msn = new MsnExplorer();
  const data = await msn.getMarketSummary({ region });

  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });

  return data;
}
```

### Pagination Handling

For large result sets, handle pagination properly:

```typescript
async function searchWithPagination(query, options = {}) {
  const msn = new MsnExplorer();
  let allResults = [];
  let page = 1;
  const pageSize = options.limit || 10;
  let hasMoreResults = true;

  while (hasMoreResults) {
    const results = await msn.search(query, {
      ...options,
      page,
      limit: pageSize,
    });

    allResults = [...allResults, ...results];

    if (results.length < pageSize) {
      hasMoreResults = false;
    } else {
      page++;
    }
  }

  return allResults;
}
```

### Data Normalization

Ensure consistent data formats across different endpoints:

1. Use helper functions to normalize data
2. Handle missing or null values gracefully
3. Convert string numbers to actual number types
4. Format dates consistently

### Performance Optimization

Optimize performance for listing large amounts of data:

1. Use parallel requests with `Promise.all()`
2. Implement lazy loading for UI applications
3. Minimize data transformations for large datasets
4. Consider streaming responses for very large datasets

## Related Documentation

- [MSN Explorer Overview](./index.md)
- [MSN Constants and Configuration](./const.md)
- [MSN Helper Functions](./helper.md)
- [MSN Quote Functions](./quote.md)
- [MSN Data Models](./models.md)
