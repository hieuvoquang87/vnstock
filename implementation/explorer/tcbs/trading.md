# TCBS Trading Data Implementation

## Overview

This document details the implementation of trading-related functionality in the TCBS explorer. This includes order book data, intraday trading statistics, foreign trading data, and other trading-related information for stocks on the Vietnam market.

## Order Book API

### Endpoint Information

The TCBS order book API provides real-time or near real-time order book data for listed stocks.

- **Base URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock`
- **Order Book Endpoint**: `/orderbook/{symbol}`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns order book data with the following structure:

```json
{
  "data": {
    "symbol": "VNM",
    "time": "14:30:15",
    "date": "2023-04-08",
    "session": "CONTINUOUS",
    "bidOffers": [
      {
        "price": 80500,
        "volume": 12500
      },
      {
        "price": 80400,
        "volume": 15600
      },
      {
        "price": 80300,
        "volume": 21000
      }
    ],
    "askOffers": [
      {
        "price": 80600,
        "volume": 18700
      },
      {
        "price": 80700,
        "volume": 9800
      },
      {
        "price": 80800,
        "volume": 13400
      }
    ],
    "lastPrice": 80500,
    "lastVolume": 500,
    "totalBidVolume": 49100,
    "totalAskVolume": 41900,
    "bidAskRatio": 1.17
  },
  "status": "success",
  "message": null
}
```

### Implementation

The order book functionality can be implemented with the following TypeScript code:

```typescript
import { TcbsResponse } from './models';
import { TCBS_ENDPOINTS } from './const';
import { BaseExplorer } from '../base';

export class TcbsExplorer extends BaseExplorer {
  // Constructor and other methods...

  /**
   * Order book offer
   */
  interface TcbsOrderOffer {
    price: number;
    volume: number;
  }

  /**
   * Order book data
   */
  interface TcbsOrderBook {
    symbol: string;
    time: string;
    date: string;
    session: string;
    bidOffers: TcbsOrderOffer[];
    askOffers: TcbsOrderOffer[];
    lastPrice: number;
    lastVolume: number;
    totalBidVolume: number;
    totalAskVolume: number;
    bidAskRatio: number;
  }

  /**
   * Get real-time order book data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to order book data
   */
  async getOrderBook(symbol: string): Promise<TcbsResponse<TcbsOrderBook>> {
    this.validateSymbol(symbol);

    const url = `${this.baseUrl}/stock-insight/v1/stock/orderbook/${symbol}`;

    const response = await this.sendRequest<TcbsResponse<TcbsOrderBook>>(
      url,
      'GET'
    );

    return response;
  }

  /**
   * Calculate order book imbalance
   *
   * @param orderBook Order book data
   * @returns Imbalance ratio (-1 to 1, negative means more selling pressure)
   */
  calculateOrderImbalance(orderBook: TcbsOrderBook): number {
    const totalBid = orderBook.totalBidVolume;
    const totalAsk = orderBook.totalAskVolume;
    const total = totalBid + totalAsk;

    if (total === 0) {
      return 0;
    }

    return (totalBid - totalAsk) / total;
  }
}
```

## Intraday Trading Statistics API

### Endpoint Information

The TCBS intraday trading statistics API provides trading data within the current trading day.

- **Base URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock`
- **Intraday Endpoint**: `/intraday/{symbol}`
- **Method**: GET
- **Optional Parameters**:
  - `from`: Start time (format: HH:MM:SS)
  - `to`: End time (format: HH:MM:SS)
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns intraday trading data with the following structure:

```json
{
  "data": {
    "symbol": "VNM",
    "date": "2023-04-08",
    "data": [
      {
        "time": "09:15:03",
        "price": 80200,
        "volume": 1000,
        "side": "BUY"
      },
      {
        "time": "09:22:47",
        "price": 80300,
        "volume": 2000,
        "side": "SELL"
      },
      {
        "time": "09:45:12",
        "price": 80400,
        "volume": 1500,
        "side": "BUY"
      }
      // Additional trades...
    ],
    "summary": {
      "totalVolume": 987600,
      "totalValue": 79382850000,
      "highest": 80800,
      "lowest": 80100,
      "averagePrice": 80380
    }
  },
  "status": "success",
  "message": null
}
```

### Implementation

The intraday trading statistics functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Intraday trade data
 */
interface TcbsIntradayTrade {
  time: string;
  price: number;
  volume: number;
  side: 'BUY' | 'SELL';
}

/**
 * Intraday trading summary
 */
interface TcbsIntradaySummary {
  totalVolume: number;
  totalValue: number;
  highest: number;
  lowest: number;
  averagePrice: number;
}

/**
 * Intraday trading data
 */
interface TcbsIntradayData {
  symbol: string;
  date: string;
  data: TcbsIntradayTrade[];
  summary: TcbsIntradaySummary;
}

/**
 * Get intraday trading data
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @param from Start time (optional, format: HH:MM:SS)
 * @param to End time (optional, format: HH:MM:SS)
 * @returns Promise resolving to intraday trading data
 */
async getIntradayData(
  symbol: string,
  from?: string,
  to?: string
): Promise<TcbsResponse<TcbsIntradayData>> {
  this.validateSymbol(symbol);

  let url = `${TCBS_ENDPOINTS.INTRADAY(symbol)}`;
  const params = new URLSearchParams();

  if (from) {
    params.append('from', from);
  }

  if (to) {
    params.append('to', to);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await this.sendRequest<TcbsResponse<TcbsIntradayData>>(
    url,
    'GET'
  );

  return response;
}

/**
 * Get volume by side (buy/sell)
 *
 * @param intradayData Intraday trading data
 * @returns Object with buy and sell volumes
 */
getVolumeByTradeSide(intradayData: TcbsIntradayData): { buy: number; sell: number } {
  const result = {
    buy: 0,
    sell: 0
  };

  intradayData.data.forEach(trade => {
    if (trade.side === 'BUY') {
      result.buy += trade.volume;
    } else {
      result.sell += trade.volume;
    }
  });

  return result;
}
```

## Foreign Trading Data API

### Endpoint Information

The TCBS foreign trading data API provides information about foreign investor activities.

- **Base URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock`
- **Foreign Trading Endpoint**: `/foreign-trading/{symbol}`
- **Method**: GET
- **Optional Parameters**:
  - `from`: Start date (format: YYYY-MM-DD)
  - `to`: End date (format: YYYY-MM-DD)
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns foreign trading data with the following structure:

```json
{
  "data": [
    {
      "date": "2023-04-08",
      "buyVolume": 156700,
      "sellVolume": 98400,
      "netVolume": 58300,
      "buyValue": 12625035000,
      "sellValue": 7922820000,
      "netValue": 4702215000
    },
    {
      "date": "2023-04-07",
      "buyVolume": 143500,
      "sellVolume": 112800,
      "netVolume": 30700,
      "buyValue": 11566525000,
      "sellValue": 9090640000,
      "netValue": 2475885000
    }
    // Additional days...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The foreign trading data functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Foreign trading data for a single day
 */
interface TcbsForeignTradingDay {
  date: string;
  buyVolume: number;
  sellVolume: number;
  netVolume: number;
  buyValue: number;
  sellValue: number;
  netValue: number;
}

/**
 * Get foreign trading data
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @param from Start date (format: YYYY-MM-DD)
 * @param to End date (format: YYYY-MM-DD)
 * @returns Promise resolving to foreign trading data
 */
async getForeignTradingData(
  symbol: string,
  from?: string,
  to?: string
): Promise<TcbsResponse<TcbsForeignTradingDay[]>> {
  this.validateSymbol(symbol);

  let url = `${this.baseUrl}/stock-insight/v1/stock/foreign-trading/${symbol}`;
  const params = new URLSearchParams();

  if (from) {
    params.append('from', from);
  }

  if (to) {
    params.append('to', to);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await this.sendRequest<TcbsResponse<TcbsForeignTradingDay[]>>(
    url,
    'GET'
  );

  return response;
}

/**
 * Calculate cumulative foreign trading data
 *
 * @param foreignTradingData Foreign trading data
 * @returns Cumulative data
 */
calculateCumulativeForeignTrading(foreignTradingData: TcbsForeignTradingDay[]): {
  totalBuyVolume: number;
  totalSellVolume: number;
  totalNetVolume: number;
  totalBuyValue: number;
  totalSellValue: number;
  totalNetValue: number;
} {
  const result = {
    totalBuyVolume: 0,
    totalSellVolume: 0,
    totalNetVolume: 0,
    totalBuyValue: 0,
    totalSellValue: 0,
    totalNetValue: 0
  };

  foreignTradingData.forEach(day => {
    result.totalBuyVolume += day.buyVolume;
    result.totalSellVolume += day.sellVolume;
    result.totalNetVolume += day.netVolume;
    result.totalBuyValue += day.buyValue;
    result.totalSellValue += day.sellValue;
    result.totalNetValue += day.netValue;
  });

  return result;
}
```

## Trading Statistics API

### Endpoint Information

The TCBS trading statistics API provides aggregate trading statistics for stocks.

- **Base URL**: `https://apipubaws.tcbs.com.vn/stock-insight/v1/stock`
- **Trading Statistics Endpoint**: `/trading-statistics/{symbol}`
- **Method**: GET
- **Optional Parameters**:
  - `from`: Start date (format: YYYY-MM-DD)
  - `to`: End date (format: YYYY-MM-DD)
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns trading statistics data with the following structure:

```json
{
  "data": [
    {
      "date": "2023-04-08",
      "totalVolume": 3255700,
      "totalValue": 262451411000,
      "totalTrades": 1753,
      "averageVolumePerTrade": 1857,
      "blockDeals": {
        "volume": 450000,
        "value": 36225000000,
        "count": 3
      }
    },
    {
      "date": "2023-04-07",
      "totalVolume": 2897400,
      "totalValue": 233441470000,
      "totalTrades": 1589,
      "averageVolumePerTrade": 1823,
      "blockDeals": {
        "volume": 320000,
        "value": 25776000000,
        "count": 2
      }
    }
    // Additional days...
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The trading statistics functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Block deal data
 */
interface TcbsBlockDeal {
  volume: number;
  value: number;
  count: number;
}

/**
 * Trading statistics for a single day
 */
interface TcbsTradingStatisticsDay {
  date: string;
  totalVolume: number;
  totalValue: number;
  totalTrades: number;
  averageVolumePerTrade: number;
  blockDeals: TcbsBlockDeal;
}

/**
 * Get trading statistics
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @param from Start date (format: YYYY-MM-DD)
 * @param to End date (format: YYYY-MM-DD)
 * @returns Promise resolving to trading statistics data
 */
async getTradingStatistics(
  symbol: string,
  from?: string,
  to?: string
): Promise<TcbsResponse<TcbsTradingStatisticsDay[]>> {
  this.validateSymbol(symbol);

  let url = `${this.baseUrl}/stock-insight/v1/stock/trading-statistics/${symbol}`;
  const params = new URLSearchParams();

  if (from) {
    params.append('from', from);
  }

  if (to) {
    params.append('to', to);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await this.sendRequest<TcbsResponse<TcbsTradingStatisticsDay[]>>(
    url,
    'GET'
  );

  return response;
}

/**
 * Calculate average daily trading volume
 *
 * @param tradingStatistics Trading statistics data
 * @returns Average daily trading volume
 */
calculateADTV(tradingStatistics: TcbsTradingStatisticsDay[]): number {
  if (tradingStatistics.length === 0) {
    return 0;
  }

  const totalVolume = tradingStatistics.reduce(
    (sum, day) => sum + day.totalVolume,
    0
  );

  return totalVolume / tradingStatistics.length;
}
```

## Error Handling

The TCBS trading data APIs may return various error responses that should be properly handled:

1. **Invalid Symbol**: When the provided symbol doesn't exist
2. **Invalid Date Range**: When the date range is invalid
3. **Rate Limiting**: When too many requests are made in a short period
4. **Service Unavailable**: When the TCBS service is down

Error handling should be implemented using the same approach outlined in the quote module documentation.

## Usage Examples

### Getting Order Book Data

```typescript
const tcbsExplorer = new TcbsExplorer();

const getOrderBookExample = async () => {
  try {
    const orderBook = await tcbsExplorer.getOrderBook('VNM');

    console.log(
      `Order Book for ${orderBook.data.symbol} (${orderBook.data.date} ${orderBook.data.time}):`
    );

    console.log('\nBid Offers (Buy):');
    orderBook.data.bidOffers.forEach((offer, index) => {
      console.log(
        `${
          index + 1
        }. Price: ${offer.price.toLocaleString()} VND | Volume: ${offer.volume.toLocaleString()}`
      );
    });

    console.log('\nAsk Offers (Sell):');
    orderBook.data.askOffers.forEach((offer, index) => {
      console.log(
        `${
          index + 1
        }. Price: ${offer.price.toLocaleString()} VND | Volume: ${offer.volume.toLocaleString()}`
      );
    });

    console.log('\nSummary:');
    console.log(
      `Last Price: ${orderBook.data.lastPrice.toLocaleString()} VND | Last Volume: ${orderBook.data.lastVolume.toLocaleString()}`
    );
    console.log(
      `Total Bid Volume: ${orderBook.data.totalBidVolume.toLocaleString()}`
    );
    console.log(
      `Total Ask Volume: ${orderBook.data.totalAskVolume.toLocaleString()}`
    );
    console.log(`Bid/Ask Ratio: ${orderBook.data.bidAskRatio.toFixed(2)}`);

    // Calculate order imbalance
    const imbalance = tcbsExplorer.calculateOrderImbalance(orderBook.data);
    console.log(`Order Imbalance: ${(imbalance * 100).toFixed(2)}%`);
    console.log(`Pressure: ${imbalance > 0 ? 'Buying' : 'Selling'}`);
  } catch (error) {
    console.error('Error fetching order book:', error);
  }
};
```

### Getting Intraday Trading Data

```typescript
const tcbsExplorer = new TcbsExplorer();

const getIntradayDataExample = async () => {
  try {
    // Get trading data from 9:00 to 11:30
    const intradayData = await tcbsExplorer.getIntradayData(
      'VNM',
      '09:00:00',
      '11:30:00'
    );

    console.log(
      `Intraday Trading for ${intradayData.data.symbol} (${intradayData.data.date}):`
    );

    console.log('\nRecent Trades:');
    intradayData.data.data.slice(0, 5).forEach((trade, index) => {
      console.log(
        `${index + 1}. Time: ${
          trade.time
        } | Price: ${trade.price.toLocaleString()} VND | Volume: ${trade.volume.toLocaleString()} | Side: ${
          trade.side
        }`
      );
    });

    console.log('\nSummary:');
    const summary = intradayData.data.summary;
    console.log(`Total Volume: ${summary.totalVolume.toLocaleString()}`);
    console.log(
      `Total Value: ${(summary.totalValue / 1e9).toFixed(2)} billion VND`
    );
    console.log(
      `Price Range: ${summary.lowest.toLocaleString()} - ${summary.highest.toLocaleString()} VND`
    );
    console.log(`Average Price: ${summary.averagePrice.toLocaleString()} VND`);

    // Calculate volume by trade side
    const volumeBySide = tcbsExplorer.getVolumeByTradeSide(intradayData.data);
    console.log(
      `\nBuy Volume: ${volumeBySide.buy.toLocaleString()} (${(
        (volumeBySide.buy / summary.totalVolume) *
        100
      ).toFixed(2)}%)`
    );
    console.log(
      `Sell Volume: ${volumeBySide.sell.toLocaleString()} (${(
        (volumeBySide.sell / summary.totalVolume) *
        100
      ).toFixed(2)}%)`
    );
  } catch (error) {
    console.error('Error fetching intraday data:', error);
  }
};
```

### Getting Foreign Trading Data

```typescript
const tcbsExplorer = new TcbsExplorer();

const getForeignTradingExample = async () => {
  try {
    // Get foreign trading data for the past week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const from = oneWeekAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    const to = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const foreignTrading = await tcbsExplorer.getForeignTradingData(
      'VNM',
      from,
      to
    );

    console.log(`Foreign Trading for VNM (${from} to ${to}):`);

    foreignTrading.data.forEach((day) => {
      const netSign = day.netVolume >= 0 ? '+' : '';
      console.log(`\n${day.date}:`);
      console.log(
        `Buy Volume: ${day.buyVolume.toLocaleString()} | Value: ${(
          day.buyValue / 1e9
        ).toFixed(2)} billion VND`
      );
      console.log(
        `Sell Volume: ${day.sellVolume.toLocaleString()} | Value: ${(
          day.sellValue / 1e9
        ).toFixed(2)} billion VND`
      );
      console.log(
        `Net Volume: ${netSign}${day.netVolume.toLocaleString()} | Value: ${netSign}${(
          day.netValue / 1e9
        ).toFixed(2)} billion VND`
      );
    });

    // Calculate cumulative data
    const cumulative = tcbsExplorer.calculateCumulativeForeignTrading(
      foreignTrading.data
    );

    console.log('\nCumulative Foreign Trading:');
    console.log(
      `Total Buy Volume: ${cumulative.totalBuyVolume.toLocaleString()}`
    );
    console.log(
      `Total Sell Volume: ${cumulative.totalSellVolume.toLocaleString()}`
    );
    console.log(
      `Total Net Volume: ${cumulative.totalNetVolume.toLocaleString()}`
    );
    console.log(
      `Total Buy Value: ${(cumulative.totalBuyValue / 1e9).toFixed(
        2
      )} billion VND`
    );
    console.log(
      `Total Sell Value: ${(cumulative.totalSellValue / 1e9).toFixed(
        2
      )} billion VND`
    );
    console.log(
      `Total Net Value: ${(cumulative.totalNetValue / 1e9).toFixed(
        2
      )} billion VND`
    );
  } catch (error) {
    console.error('Error fetching foreign trading data:', error);
  }
};
```

### Getting Trading Statistics

```typescript
const tcbsExplorer = new TcbsExplorer();

const getTradingStatisticsExample = async () => {
  try {
    // Get trading statistics for the past month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const from = oneMonthAgo.toISOString().split('T')[0]; // YYYY-MM-DD
    const to = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const tradingStats = await tcbsExplorer.getTradingStatistics(
      'VNM',
      from,
      to
    );

    console.log(`Trading Statistics for VNM (${from} to ${to}):`);

    console.log('\nRecent Days:');
    tradingStats.data.slice(0, 5).forEach((day) => {
      console.log(`\n${day.date}:`);
      console.log(
        `Total Volume: ${day.totalVolume.toLocaleString()} | Value: ${(
          day.totalValue / 1e9
        ).toFixed(2)} billion VND`
      );
      console.log(
        `Total Trades: ${day.totalTrades.toLocaleString()} | Avg Volume per Trade: ${day.averageVolumePerTrade.toLocaleString()}`
      );
      console.log(
        `Block Deals: ${
          day.blockDeals.count
        } trades, ${day.blockDeals.volume.toLocaleString()} shares, ${(
          day.blockDeals.value / 1e9
        ).toFixed(2)} billion VND`
      );
    });

    // Calculate ADTV (Average Daily Trading Volume)
    const adtv = tcbsExplorer.calculateADTV(tradingStats.data);

    console.log('\nLiquidity Metrics:');
    console.log(
      `Average Daily Trading Volume (ADTV): ${adtv.toLocaleString()} shares`
    );
    console.log(
      `Average Daily Trading Value (ADTV): ${(
        (adtv * tradingStats.data[0].totalValue) /
        tradingStats.data[0].totalVolume /
        1e9
      ).toFixed(2)} billion VND`
    );
  } catch (error) {
    console.error('Error fetching trading statistics:', error);
  }
};
```

## Implementation Considerations

1. **Real-time Updates**: Consider implementing WebSocket connections for real-time order book updates if available.
2. **Rate Limiting**: Implement rate limiting to avoid exceeding TCBS API limits, especially for frequently updated data like order books.
3. **Caching**: Implement a short-lived cache for order book data and a longer-lived cache for historical trading statistics.
4. **Data Transformation**: Provide helper methods to transform trading data into formats suitable for visualization.
5. **Error Handling**: Implement comprehensive error handling for all API calls.
6. **Trading Indicators**: Derive additional trading indicators from raw data, such as volume profile, price momentum, etc.

## Related Documentation

- [TCBS Models](./models.md) - Data models used in these implementations
- [TCBS Constants](./const.md) - Constants and API endpoints
- [TCBS Explorer Overview](./index.md) - Overview of the TCBS explorer
- [TCBS Quote Implementation](./quote.md) - Quote and historical price data
