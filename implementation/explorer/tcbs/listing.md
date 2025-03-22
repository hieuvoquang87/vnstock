# TCBS Listing Data Implementation

## Overview

This document details the implementation of stock listing and industry classification functionality in the TCBS explorer. This includes retrieving stock listings by exchange, filtering stocks by industry, and retrieving market indices information.

## Stock Listing API

### Endpoint Information

The TCBS stock listing API provides a comprehensive list of tradable stocks on the Vietnam stock exchanges.

- **Base URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock`
- **Listing Endpoint**: `/listing`
- **Method**: GET
- **Optional Parameters**:
  - `exchange`: Filter by exchange (`HOSE`, `HNX`, `UPCOM`)
  - `industryCode`: Filter by industry
  - `limit`: Number of results to retrieve (default: 3000)
  - `offset`: Number of results to skip (for pagination)
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns stock listing data with the following structure:

```json
{
  "data": [
    {
      "symbol": "VNM",
      "companyName": "Công ty Cổ phần Sữa Việt Nam",
      "exchange": "HOSE",
      "industry": "Food & Beverages",
      "industryCode": "3020",
      "sector": "Consumer Staples",
      "sectorCode": "3000",
      "marketCap": 168276050000000,
      "isin": "VN0000000241",
      "shareOutstanding": 2089955960,
      "listedDate": "2006-01-19"
    },
    {
      "symbol": "FPT",
      "companyName": "Công ty Cổ phần FPT",
      "exchange": "HOSE",
      "industry": "Software & Services",
      "industryCode": "2010",
      "sector": "Information Technology",
      "sectorCode": "2000",
      "marketCap": 102356080000000,
      "isin": "VN0000000118",
      "shareOutstanding": 1186988000,
      "listedDate": "2006-12-13"
    }
    // Additional stocks...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The stock listing functionality can be implemented with the following TypeScript code:

```typescript
import { TcbsResponse } from './models';
import { TCBS_ENDPOINTS, TcbsExchange } from './const';
import { BaseExplorer } from '../base';

export class TcbsExplorer extends BaseExplorer {
  // Constructor and other methods...

  /**
   * Stock listing data
   */
  interface TcbsStockListing {
    symbol: string;
    companyName: string;
    exchange: string;
    industry: string;
    industryCode: string;
    sector: string;
    sectorCode: string;
    marketCap: number;
    isin?: string;
    shareOutstanding: number;
    listedDate: string;
  }

  /**
   * Parameters for stock listing request
   */
  interface ListingParams {
    exchange?: TcbsExchange;
    industryCode?: string;
    limit?: number;
    offset?: number;
  }

  /**
   * Get stock listings
   *
   * @param params Listing parameters
   * @returns Promise resolving to stock listing data
   */
  async getStockListings(params: ListingParams = {}): Promise<TcbsResponse<TcbsStockListing[]>> {
    const queryParams = new URLSearchParams();

    if (params.exchange) {
      queryParams.append('exchange', params.exchange);
    }

    if (params.industryCode) {
      queryParams.append('industryCode', params.industryCode);
    }

    if (params.limit) {
      if (params.limit < 1 || params.limit > 5000) {
        throw new Error('Limit must be between 1 and 5000');
      }
      queryParams.append('limit', params.limit.toString());
    } else {
      queryParams.append('limit', '3000'); // Default limit
    }

    if (params.offset) {
      queryParams.append('offset', params.offset.toString());
    }

    const url = `${TCBS_ENDPOINTS.LISTING}?${queryParams.toString()}`;

    const response = await this.sendRequest<TcbsResponse<TcbsStockListing[]>>(
      url,
      'GET'
    );

    return response;
  }

  /**
   * Get all stock listings
   *
   * @returns Promise resolving to all stock listings
   */
  async getAllStockListings(): Promise<TcbsResponse<TcbsStockListing[]>> {
    return this.getStockListings({ limit: 5000 });
  }

  /**
   * Get stock listings by exchange
   *
   * @param exchange Exchange code
   * @returns Promise resolving to stock listings for the specified exchange
   */
  async getStockListingsByExchange(exchange: TcbsExchange): Promise<TcbsResponse<TcbsStockListing[]>> {
    return this.getStockListings({ exchange });
  }

  /**
   * Get stock listings by industry
   *
   * @param industryCode Industry code
   * @returns Promise resolving to stock listings for the specified industry
   */
  async getStockListingsByIndustry(industryCode: string): Promise<TcbsResponse<TcbsStockListing[]>> {
    return this.getStockListings({ industryCode });
  }

  /**
   * Search for a stock by company name or symbol
   *
   * @param query Search query
   * @returns Promise resolving to matching stock listings
   */
  async searchStocks(query: string): Promise<TcbsStockListing[]> {
    if (!query || query.length < 2) {
      throw new Error('Search query must be at least 2 characters');
    }

    const allStocks = await this.getAllStockListings();
    const queryLower = query.toLowerCase();

    return allStocks.data.filter(stock =>
      stock.symbol.toLowerCase().includes(queryLower) ||
      stock.companyName.toLowerCase().includes(queryLower)
    );
  }
}
```

## Industry Classification API

### Endpoint Information

The TCBS industry classification API provides information about industry classifications and hierarchies.

- **Base URL**: `https://apipubaws.tcbs.com.vn/market/v1`
- **Industry Endpoint**: `/industry`
- **Method**: GET
- **Optional Parameters**:
  - `level`: Industry classification level (1-4)
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns industry classification data with the following structure:

```json
{
  "data": [
    {
      "industryCode": "1000",
      "industryName": "Financials",
      "parentCode": null,
      "level": 1,
      "stocks": []
    },
    {
      "industryCode": "1010",
      "industryName": "Banks",
      "parentCode": "1000",
      "level": 2,
      "stocks": []
    },
    {
      "industryCode": "1011",
      "industryName": "Commercial Banks",
      "parentCode": "1010",
      "level": 3,
      "stocks": ["VCB", "TCB", "BID", "CTG", "MBB"]
    }
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The industry classification functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Industry classification data
 */
interface TcbsIndustry {
  industryCode: string;
  industryName: string;
  parentCode: string | null;
  level: number;
  stocks: string[];
}

/**
 * Get industry classification
 *
 * @param level Industry classification level (1-4)
 * @returns Promise resolving to industry classification data
 */
async getIndustries(level: number = 3): Promise<TcbsResponse<TcbsIndustry[]>> {
  if (level < 1 || level > 4) {
    throw new Error('Industry level must be between 1 and 4');
  }

  const url = `${TCBS_ENDPOINTS.INDUSTRY}?level=${level}`;
  const response = await this.sendRequest<TcbsResponse<TcbsIndustry[]>>(
    url,
    'GET'
  );

  return response;
}

/**
 * Get stocks in a specific industry
 *
 * @param industryCode The industry code
 * @returns Promise resolving to list of stocks in the industry
 */
async getStocksByIndustry(industryCode: string): Promise<string[]> {
  const industries = await this.getIndustries(4);

  // Find the industry or its sub-industries
  const matchingIndustries = industries.data.filter(
    industry => industry.industryCode === industryCode ||
                industry.parentCode === industryCode
  );

  // Extract all stocks from matching industries
  const stocks = new Set<string>();
  matchingIndustries.forEach(industry => {
    industry.stocks.forEach(stock => stocks.add(stock));
  });

  return Array.from(stocks);
}

/**
 * Get industry hierarchy tree
 *
 * @returns Promise resolving to industry hierarchy tree
 */
async getIndustryHierarchy(): Promise<Record<string, any>> {
  const [sectors, industryGroups, industries, subIndustries] = await Promise.all([
    this.getIndustries(1),
    this.getIndustries(2),
    this.getIndustries(3),
    this.getIndustries(4)
  ]);

  // Build industry hierarchy
  const hierarchy: Record<string, any> = {};

  // Add sectors as root nodes
  sectors.data.forEach(sector => {
    hierarchy[sector.industryCode] = {
      name: sector.industryName,
      children: {}
    };
  });

  // Add industry groups as children of sectors
  industryGroups.data.forEach(group => {
    if (group.parentCode && hierarchy[group.parentCode]) {
      hierarchy[group.parentCode].children[group.industryCode] = {
        name: group.industryName,
        children: {}
      };
    }
  });

  // Add industries as children of industry groups
  industries.data.forEach(industry => {
    if (industry.parentCode) {
      // Find the sector that contains this industry group
      const sectorCode = Object.keys(hierarchy).find(
        sectorCode => hierarchy[sectorCode].children[industry.parentCode]
      );

      if (sectorCode) {
        hierarchy[sectorCode].children[industry.parentCode].children[industry.industryCode] = {
          name: industry.industryName,
          children: {}
        };
      }
    }
  });

  // Add sub-industries as children of industries
  subIndustries.data.forEach(subIndustry => {
    if (subIndustry.parentCode) {
      // Find the industry group that contains this industry
      let sectorCode: string | undefined;
      let groupCode: string | undefined;

      Object.keys(hierarchy).forEach(sc => {
        Object.keys(hierarchy[sc].children).forEach(gc => {
          if (hierarchy[sc].children[gc].children[subIndustry.parentCode]) {
            sectorCode = sc;
            groupCode = gc;
          }
        });
      });

      if (sectorCode && groupCode) {
        hierarchy[sectorCode].children[groupCode].children[subIndustry.parentCode].children[subIndustry.industryCode] = {
          name: subIndustry.industryName,
          stocks: subIndustry.stocks
        };
      }
    }
  });

  return hierarchy;
}
```

## Market Indices API

### Endpoint Information

The TCBS market indices API provides information about stock market indices.

- **Base URL**: `https://apipubaws.tcbs.com.vn/market/v1`
- **Indices Endpoint**: `/indices`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns market indices data with the following structure:

```json
{
  "data": [
    {
      "indexCode": "VNINDEX",
      "indexName": "VN Index",
      "value": 1258.43,
      "change": 2.56,
      "percentChange": 0.2,
      "highest": 1262.35,
      "lowest": 1252.18,
      "volume": 487532100,
      "marketStatus": "CLOSED"
    },
    {
      "indexCode": "HNX",
      "indexName": "HNX Index",
      "value": 235.27,
      "change": 0.75,
      "percentChange": 0.32,
      "highest": 236.12,
      "lowest": 234.18,
      "volume": 54782300,
      "marketStatus": "CLOSED"
    }
    // Additional indices...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The market indices functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Market index data
 */
interface TcbsMarketIndex {
  indexCode: string;
  indexName: string;
  value: number;
  change: number;
  percentChange: number;
  highest: number;
  lowest: number;
  volume: number;
  marketStatus: string;
}

/**
 * Get market indices
 *
 * @returns Promise resolving to market indices data
 */
async getMarketIndices(): Promise<TcbsResponse<TcbsMarketIndex[]>> {
  const url = `${this.baseUrl}/market/v1/indices`;

  const response = await this.sendRequest<TcbsResponse<TcbsMarketIndex[]>>(
    url,
    'GET'
  );

  return response;
}

/**
 * Get a specific market index
 *
 * @param indexCode Index code (e.g., VNINDEX, HNX)
 * @returns Promise resolving to the specified index data
 */
async getMarketIndex(indexCode: string): Promise<TcbsMarketIndex | null> {
  const indices = await this.getMarketIndices();

  const index = indices.data.find(
    index => index.indexCode.toUpperCase() === indexCode.toUpperCase()
  );

  return index || null;
}
```

## Index Constituents API

### Endpoint Information

The TCBS index constituents API provides information about the stocks that make up a market index.

- **Base URL**: `https://apipubaws.tcbs.com.vn/market/v1`
- **Index Constituents Endpoint**: `/index/{indexCode}/constituents`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns index constituents data with the following structure:

```json
{
  "data": [
    {
      "symbol": "VNM",
      "companyName": "Công ty Cổ phần Sữa Việt Nam",
      "weight": 5.2,
      "marketCap": 168276050000000,
      "price": 80500,
      "change": -500,
      "percentChange": -0.62,
      "volume": 1245600,
      "value": 100247920000
    },
    {
      "symbol": "VCB",
      "companyName": "Ngân hàng TMCP Ngoại thương Việt Nam",
      "weight": 7.8,
      "marketCap": 421952220000000,
      "price": 113600,
      "change": 200,
      "percentChange": 0.18,
      "volume": 1023800,
      "value": 116336800000
    }
    // Additional stocks...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The index constituents functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Index constituent data
 */
interface TcbsIndexConstituent {
  symbol: string;
  companyName: string;
  weight: number;
  marketCap: number;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  value: number;
}

/**
 * Get index constituents
 *
 * @param indexCode Index code (e.g., VNINDEX, HNX30)
 * @returns Promise resolving to index constituents data
 */
async getIndexConstituents(indexCode: string): Promise<TcbsResponse<TcbsIndexConstituent[]>> {
  const url = `${this.baseUrl}/market/v1/index/${indexCode}/constituents`;

  const response = await this.sendRequest<TcbsResponse<TcbsIndexConstituent[]>>(
    url,
    'GET'
  );

  return response;
}
```

## Error Handling

The TCBS listing APIs may return various error responses that should be properly handled:

1. **Invalid Parameters**: When parameters like exchange or industry code are invalid
2. **Rate Limiting**: When too many requests are made in a short period
3. **Service Unavailable**: When the TCBS service is down

Error handling should be implemented using the same approach outlined in the quote module documentation.

## Usage Examples

### Getting Stock Listings

```typescript
const tcbsExplorer = new TcbsExplorer();

const getStockListingsExample = async () => {
  try {
    // Get HOSE listings
    const hoseStocks = await tcbsExplorer.getStockListingsByExchange(
      TcbsExchange.HOSE
    );

    console.log(`HOSE Stocks: ${hoseStocks.data.length}`);
    console.log('Top 5 by Market Cap:');

    // Sort by market cap and take top 5
    const top5 = [...hoseStocks.data]
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 5);

    top5.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.symbol} - ${stock.companyName}`);
      console.log(
        `   Market Cap: ${(stock.marketCap / 1e12).toFixed(2)} trillion VND`
      );
      console.log(`   Industry: ${stock.industry} (${stock.industryCode})`);
    });
  } catch (error) {
    console.error('Error fetching stock listings:', error);
  }
};
```

### Searching for Stocks

```typescript
const tcbsExplorer = new TcbsExplorer();

const searchStocksExample = async () => {
  try {
    // Search for "bank" or "ngân hàng" (bank in Vietnamese)
    const searchResults = await tcbsExplorer.searchStocks('ngân hàng');

    console.log(`Found ${searchResults.length} banks:`);

    searchResults.forEach((stock, index) => {
      console.log(`${index + 1}. ${stock.symbol} - ${stock.companyName}`);
      console.log(`   Exchange: ${stock.exchange}`);
      console.log(
        `   Market Cap: ${(stock.marketCap / 1e12).toFixed(2)} trillion VND`
      );
    });
  } catch (error) {
    console.error('Error searching stocks:', error);
  }
};
```

### Getting Industries and Stocks by Industry

```typescript
const tcbsExplorer = new TcbsExplorer();

const getIndustriesExample = async () => {
  try {
    // Get industries at level 2 (industry groups)
    const industryGroups = await tcbsExplorer.getIndustries(2);

    console.log('Industry Groups:');
    industryGroups.data.forEach((group) => {
      console.log(`- ${group.industryName} (${group.industryCode})`);
    });

    // Get all stocks in the banking industry
    const bankStocks = await tcbsExplorer.getStocksByIndustry('1011'); // Banks

    console.log('\nBanking Stocks:');
    console.log(bankStocks.join(', '));

    // Get stocks in banking industry with details
    const bankStocksDetails = await tcbsExplorer.getStockListingsByIndustry(
      '1011'
    );

    console.log('\nTop 3 Banks by Market Cap:');
    bankStocksDetails.data
      .sort((a, b) => b.marketCap - a.marketCap)
      .slice(0, 3)
      .forEach((stock, index) => {
        console.log(`${index + 1}. ${stock.symbol} - ${stock.companyName}`);
        console.log(
          `   Market Cap: ${(stock.marketCap / 1e12).toFixed(2)} trillion VND`
        );
      });
  } catch (error) {
    console.error('Error fetching industry data:', error);
  }
};
```

### Getting Market Indices

```typescript
const tcbsExplorer = new TcbsExplorer();

const getMarketIndicesExample = async () => {
  try {
    // Get all market indices
    const indices = await tcbsExplorer.getMarketIndices();

    console.log('Market Indices:');
    indices.data.forEach((index) => {
      const changeSymbol = index.change >= 0 ? '+' : '';
      console.log(
        `${index.indexName} (${index.indexCode}): ${index.value.toFixed(
          2
        )} ${changeSymbol}${index.change.toFixed(
          2
        )} (${changeSymbol}${index.percentChange.toFixed(2)}%)`
      );
    });

    // Get VN30 index
    const vn30 = await tcbsExplorer.getMarketIndex('VN30');

    if (vn30) {
      console.log('\nVN30 Details:');
      console.log(`Value: ${vn30.value.toFixed(2)}`);
      console.log(
        `Change: ${vn30.change.toFixed(2)} (${vn30.percentChange.toFixed(2)}%)`
      );
      console.log(
        `Range: ${vn30.lowest.toFixed(2)} - ${vn30.highest.toFixed(2)}`
      );
      console.log(`Volume: ${vn30.volume.toLocaleString()}`);
      console.log(`Market Status: ${vn30.marketStatus}`);

      // Get VN30 constituents
      const vn30Constituents = await tcbsExplorer.getIndexConstituents('VN30');

      console.log('\nTop 5 VN30 Constituents by Weight:');
      vn30Constituents.data
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 5)
        .forEach((stock, index) => {
          console.log(`${index + 1}. ${stock.symbol} - ${stock.companyName}`);
          console.log(`   Weight: ${stock.weight.toFixed(2)}%`);
          console.log(
            `   Price: ${stock.price} (${
              stock.percentChange >= 0 ? '+' : ''
            }${stock.percentChange.toFixed(2)}%)`
          );
        });
    }
  } catch (error) {
    console.error('Error fetching market indices:', error);
  }
};
```

## Implementation Considerations

1. **Caching**: Consider implementing a caching mechanism for industry data and stock listings, as they rarely change.
2. **Rate Limiting**: Implement rate limiting to avoid exceeding TCBS API limits.
3. **Search Optimization**: Optimize the search function for better performance with large datasets.
4. **Industry Hierarchy Visualization**: Consider implementing helper methods to visualize the industry hierarchy.
5. **Error Handling**: Implement comprehensive error handling for all API calls.
6. **Market Cap Formatting**: Provide utility functions to format market capitalization values (e.g., millions, billions, or trillions).

## Related Documentation

- [TCBS Models](./models.md) - Data models used in these implementations
- [TCBS Constants](./const.md) - Constants and API endpoints
- [TCBS Explorer Overview](./index.md) - Overview of the TCBS explorer
- [TCBS Company Data](./company.md) - Company profile and industry data
