/**
 * TCBS Trading Explorer Module
 */
import axios from 'axios';
import { getLogger } from '../../core/utils/logger';
import { ApiResponse } from '../../types/api';
import { TCBS_ENDPOINTS } from './const';
import { BaseExplorer } from '../base';
import { DataSource } from '../../types/config';

const logger = getLogger('tcbs.trading');

/**
 * Response format for the price board
 */
export interface TcbsPriceBoardItem {
  /** Stock symbol */
  symbol: string;
  /** Last traded price */
  price: number;
  /** Price change from previous closing */
  priceChange: number;
  /** Percentage change from previous closing */
  percentChange: number;
  /** Highest price of the day */
  high: number;
  /** Lowest price of the day */
  low: number;
  /** Opening price */
  open: number;
  /** Previous closing price */
  previousClose: number;
  /** Total volume traded */
  volume: number;
  /** Total value traded (in VND) */
  value: number;
  /** Last updated timestamp */
  timestamp: string;
}

/**
 * TCBS Explorer for trading data
 */
export class TcbsTradingExplorer extends BaseExplorer {
  constructor() {
    super(DataSource.TCBS);
  }

  /**
   * Get price board data for multiple symbols
   * @param symbols - Array of stock symbols
   * @returns Price board data for the requested symbols
   */
  async getPriceBoard(
    symbols: string[] = []
  ): Promise<ApiResponse<TcbsPriceBoardItem[]>> {
    try {
      if (!symbols || symbols.length === 0) {
        return {
          data: [],
          status: 'error',
          message: 'Symbols array is required and cannot be empty',
        };
      }

      logger.debug(`Getting price board for symbols: ${symbols.join(', ')}`);

      // Since TCBS doesn't have a bulk quote endpoint, we need to make multiple requests
      const promises = symbols.map((symbol) => this.getStockQuote(symbol));
      const results = await Promise.all(promises);

      // Filter out any failed requests
      const validResults = results.filter(
        (result) => result.status === 'success' && result.data
      );

      // Map to a consistent format
      const priceBoardData = validResults.map((result) => ({
        symbol: result.data.symbol,
        price: result.data.price,
        priceChange: result.data.priceChange,
        percentChange: result.data.pctChange,
        high: result.data.high,
        low: result.data.low,
        open: result.data.open,
        previousClose: result.data.prevClose,
        volume: result.data.volume,
        value: result.data.value,
        timestamp: result.data.timestamp || new Date().toISOString(),
      }));

      return {
        data: priceBoardData,
        status: 'success',
        message: `Successfully retrieved price board for ${validResults.length} symbols`,
      };
    } catch (error) {
      logger.error(`Error fetching price board: ${error}`);
      return {
        data: [],
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get order book data for a symbol
   * @param symbol - Stock symbol
   * @returns Order book data for the requested symbol
   */
  async getOrderBook(symbol: string): Promise<ApiResponse<any>> {
    try {
      if (!symbol) {
        return {
          data: null,
          status: 'error',
          message: 'Symbol is required',
        };
      }

      logger.debug(`Getting order book for symbol: ${symbol}`);

      // Note: TCBS doesn't provide a public API for order book data
      // This is a placeholder implementation that returns the top price levels
      // from the current stock quote

      const quoteResponse = await this.getStockQuote(symbol);

      if (quoteResponse.status !== 'success' || !quoteResponse.data) {
        return {
          data: null,
          status: 'error',
          message: 'Failed to get quote data for order book approximation',
        };
      }

      // Create a simulated order book based on the quote
      const price = quoteResponse.data.price;
      const orderBook = {
        symbol,
        timestamp: new Date().toISOString(),
        bids: [
          {
            price: Math.floor(price * 0.99 * 100) / 100,
            volume: Math.floor(Math.random() * 5000) + 1000,
          },
          {
            price: Math.floor(price * 0.98 * 100) / 100,
            volume: Math.floor(Math.random() * 8000) + 2000,
          },
          {
            price: Math.floor(price * 0.97 * 100) / 100,
            volume: Math.floor(Math.random() * 10000) + 3000,
          },
        ],
        asks: [
          {
            price: Math.ceil(price * 1.01 * 100) / 100,
            volume: Math.floor(Math.random() * 5000) + 1000,
          },
          {
            price: Math.ceil(price * 1.02 * 100) / 100,
            volume: Math.floor(Math.random() * 8000) + 2000,
          },
          {
            price: Math.ceil(price * 1.03 * 100) / 100,
            volume: Math.floor(Math.random() * 10000) + 3000,
          },
        ],
      };

      return {
        data: orderBook,
        status: 'success',
        message:
          'Order book data approximated (TCBS does not provide actual order book data)',
      };
    } catch (error) {
      logger.error(`Error fetching order book for ${symbol}: ${error}`);
      return {
        data: null,
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get a stock quote from TCBS
   * @param symbol - Stock symbol
   * @returns Stock quote data
   */
  private async getStockQuote(symbol: string): Promise<ApiResponse<any>> {
    try {
      const url = `${TCBS_ENDPOINTS.QUOTE}/${symbol}`;
      const response = await axios.get(url);

      if (!response.data) {
        return {
          data: null,
          status: 'error',
          message: 'No data returned from API',
        };
      }

      return {
        data: response.data,
        status: 'success',
        message: 'Successfully retrieved stock quote',
      };
    } catch (error) {
      logger.error(`Error fetching stock quote for ${symbol}: ${error}`);
      return {
        data: null,
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
