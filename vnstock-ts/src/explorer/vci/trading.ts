/**
 * Module for managing real-time trading data from VCI data source.
 */

import { getLogger, LogLevel } from '../../core/utils/logger';
import { sendRequest } from '../../core/utils/client';
import { getAssetType } from '../../core/utils/parser';
import { getHeaders } from '../../core/utils/user_agent';
import { tradingHours } from '../../core/utils/market';
import { _TRADING_URL, _PRICE_INFO_MAP } from './const';

const logger = getLogger('vnstock.explorer.vci.trading');

interface PriceBoard {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  value: number;
  lastUpdated: string;
  [key: string]: any;
}

export class Trading {
  private symbol: string;
  private dataSource: string;
  private assetType: string;
  private baseUrl: string;
  private headers: Record<string, string>;
  private showLog: boolean;

  /**
   * Initialize trading data provider for a specific stock from VCI data source.
   *
   * @param symbol - The stock symbol to query trading data for.
   * @param randomAgent - Whether to use a random user agent. Default is false.
   * @param showLog - Show log information for debugging. Default is true.
   */
  constructor(
    symbol: string = 'VN30F1M',
    randomAgent: boolean = false,
    showLog: boolean = true
  ) {
    this.symbol = symbol.toUpperCase();
    this.dataSource = 'VCI';
    this.assetType = getAssetType(this.symbol);
    this.baseUrl = _TRADING_URL;
    this.headers = getHeaders(this.dataSource);
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel(LogLevel.CRITICAL);
    }
  }

  /**
   * Get real-time price board data for a list of symbols.
   *
   * @param symbolsList - Array of stock symbols to get price data for. Default is the symbol from constructor.
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of price board data for the requested symbols
   */
  public async priceBoard(
    symbolsList: string[] = [this.symbol],
    showLog: boolean = this.showLog
  ): Promise<PriceBoard[]> {
    const marketStatus = tradingHours();

    // Prepare unique list of symbols (uppercase)
    const uniqueSymbols = Array.from(
      new Set(symbolsList.map((s) => s.toUpperCase()))
    );

    if (showLog) {
      logger.info(
        `Fetching price board for symbols: ${uniqueSymbols.join(', ')}`
      );
      logger.info(
        `Market status: ${marketStatus.session}, trading: ${marketStatus.is_trading_hour}`
      );
    }

    // GraphQL query to fetch real-time price data
    const payload = {
      query: `query Query($symbols: [String!]!) {
        MarketRealtimeDetailMultipleStocks(symbols: $symbols) {
          realtimeDetail {
            ticker
            open_price
            highest_price
            lowest_price
            last_price
            match_price
            match_qtty
            total_match_qtty
            total_match_value
            price_change
            percent_price_change
            reference_price
            ceiling_price
            floor_price
            foreign_current_room
            foreign_total_room
            foreign_total_volume
            foreign_buy_value
            foreign_sell_value
            foreign_buy_volume
            foreign_sell_volume
            timestamp
          }
        }
      }`,
      variables: {
        symbols: uniqueSymbols,
      },
    };

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: `${this.baseUrl}/graphql`,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (
        !responseData.data ||
        !responseData.data.MarketRealtimeDetailMultipleStocks
      ) {
        return [];
      }

      // Process the data
      const results: PriceBoard[] = [];

      for (const stockData of responseData.data
        .MarketRealtimeDetailMultipleStocks.realtimeDetail) {
        const processedData: Record<string, any> = {
          symbol: stockData.ticker,
          lastUpdated: new Date(stockData.timestamp).toISOString(),
        };

        // Map fields using PRICE_INFO_MAP
        for (const [originalKey, mappedKey] of Object.entries(
          _PRICE_INFO_MAP
        )) {
          if (stockData[originalKey] !== undefined) {
            processedData[mappedKey] = stockData[originalKey];
          }
        }

        // Include additional computed fields
        processedData.price = stockData.match_price || stockData.last_price;
        processedData.change = stockData.price_change;
        processedData.changePct = stockData.percent_price_change;
        processedData.volume = stockData.total_match_qtty;
        processedData.value = stockData.total_match_value;

        results.push(processedData as PriceBoard);
      }

      return results;
    } catch (error) {
      logger.error(`Error fetching price board: ${error}`);
      throw error;
    }
  }

  /**
   * Get order book data (bid-ask) for a stock.
   *
   * @param symbol - Stock symbol to get order book for. Default is the symbol from constructor.
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Order book data with bids and asks
   */
  public async orderBook(
    symbol: string = this.symbol,
    showLog: boolean = this.showLog
  ): Promise<any> {
    const marketStatus = tradingHours();
    if (
      !marketStatus.is_trading_hour &&
      marketStatus.data_status === 'preparing'
    ) {
      throw new Error(
        `${marketStatus.time}: Order book data is not available during pre-market preparation. Please try again later.`
      );
    }

    // GraphQL query to fetch order book data
    const payload = {
      query: `query Query($symbol: String!) {
        OrderBookData(symbol: $symbol) {
          symbol
          timestamp
          asks {
            price
            volume
          }
          bids {
            price
            volume
          }
        }
      }`,
      variables: {
        symbol: symbol.toUpperCase(),
      },
    };

    if (showLog) {
      logger.info(`Fetching order book for symbol: ${symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: `${this.baseUrl}/graphql`,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.OrderBookData) {
        return null;
      }

      const orderBookData = responseData.data.OrderBookData;

      // Process and return the data
      return {
        symbol: orderBookData.symbol,
        timestamp: new Date(orderBookData.timestamp).toISOString(),
        bids: orderBookData.bids.map((bid: any) => ({
          price: bid.price,
          volume: bid.volume,
        })),
        asks: orderBookData.asks.map((ask: any) => ({
          price: ask.price,
          volume: ask.volume,
        })),
      };
    } catch (error) {
      logger.error(`Error fetching order book: ${error}`);
      throw error;
    }
  }

  /**
   * Get foreign trading activity for a stock.
   *
   * @param symbol - Stock symbol to get foreign trading for. Default is the symbol from constructor.
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Foreign trading data
   */
  public async foreignTrading(
    symbol: string = this.symbol,
    showLog: boolean = this.showLog
  ): Promise<any> {
    // GraphQL query to fetch foreign trading data
    const payload = {
      query: `query Query($symbol: String!) {
        ForeignTrading(symbol: $symbol) {
          symbol
          date
          buyVolume
          sellVolume
          netVolume
          buyValue
          sellValue
          netValue
        }
      }`,
      variables: {
        symbol: symbol.toUpperCase(),
      },
    };

    if (showLog) {
      logger.info(`Fetching foreign trading for symbol: ${symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: `${this.baseUrl}/graphql`,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.ForeignTrading) {
        return null;
      }

      const foreignData = responseData.data.ForeignTrading;

      // Process and return the data
      return {
        symbol: foreignData.symbol,
        date: foreignData.date,
        buyVolume: foreignData.buyVolume,
        sellVolume: foreignData.sellVolume,
        netVolume: foreignData.netVolume,
        buyValue: foreignData.buyValue,
        sellValue: foreignData.sellValue,
        netValue: foreignData.netValue,
      };
    } catch (error) {
      logger.error(`Error fetching foreign trading: ${error}`);
      throw error;
    }
  }
}
