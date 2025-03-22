/**
 * TCBS Explorer Quote Implementation
 */
import { ApiResponse } from '../../types/api';
import { BaseExplorer } from '../base';
import {
  TcbsResponse,
  TcbsStockQuote,
  TcbsHistoricalPrice,
  TcbsHistoricalParams,
  TcbsIntradayPrice,
} from './models';
import { TCBS_ENDPOINTS, TcbsResolution } from './const';
import { DataSource } from '../../types/config';

/**
 * TCBS Explorer class for stock quote data
 */
export class TcbsExplorer extends BaseExplorer {
  /**
   * Constructor
   */
  constructor() {
    super(DataSource.TCBS);
    // Set any specific headers required for TCBS
    this.setHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  /**
   * Get real-time quote for a stock symbol
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to quote data
   */
  async getQuote(symbol: string): Promise<ApiResponse<TcbsStockQuote>> {
    this.validateSymbol(symbol);

    const url = `${TCBS_ENDPOINTS.QUOTE}/${symbol}`;

    const response = await this.request<TcbsResponse<TcbsStockQuote>>({
      url,
      method: 'GET',
    });

    return {
      data: response.data.data,
      status: response.data.status === 'success' ? 'success' : 'error',
      message: response.data.message || undefined,
    };
  }

  /**
   * Get quotes for multiple stock symbols
   *
   * @param symbols Array of stock symbols
   * @returns Promise resolving to an array of quotes
   */
  async getQuotes(symbols: string[]): Promise<ApiResponse<TcbsStockQuote[]>> {
    if (!symbols.length) {
      throw new Error('At least one symbol must be provided');
    }

    try {
      const quotesPromises = symbols.map((symbol) => this.getQuote(symbol));
      const quotes = await Promise.all(quotesPromises);

      // Extract the data from successful quotes
      const successfulQuotes = quotes
        .filter((quote) => quote.status === 'success' && quote.data)
        .map((quote) => quote.data);

      return {
        data: successfulQuotes,
        status: 'success',
        message: undefined,
      };
    } catch (error) {
      return {
        data: [],
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get intraday trading data for a stock
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param date Optional date in YYYY-MM-DD format
   * @returns Promise resolving to intraday data
   */
  async getIntraday(
    symbol: string,
    date?: string
  ): Promise<ApiResponse<TcbsIntradayPrice[]>> {
    this.validateSymbol(symbol);

    const url = `${TCBS_ENDPOINTS.INTRADAY}/${symbol}${date ? `/${date}` : ''}`;

    const response = await this.request<TcbsResponse<TcbsIntradayPrice[]>>({
      url,
      method: 'GET',
    });

    return {
      data: response.data.data,
      status: response.data.status === 'success' ? 'success' : 'error',
      message: response.data.message || undefined,
    };
  }

  /**
   * Get historical OHLC price data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param params Historical parameters
   * @returns Promise resolving to historical price data
   */
  async getHistoricalOHLC(
    symbol: string,
    params: {
      fromDate: string;
      toDate: string;
      resolution?: string;
      timeframe?: string;
    }
  ): Promise<ApiResponse<TcbsHistoricalPrice[]>> {
    this.validateSymbol(symbol);

    const queryParams = new URLSearchParams();

    // Required parameters
    queryParams.append('from', params.fromDate);
    queryParams.append('to', params.toDate);

    // Optional parameters
    if (params.resolution) {
      queryParams.append('resolution', params.resolution);
    } else {
      // Default to daily resolution
      queryParams.append('resolution', TcbsResolution.DAILY);
    }

    // Use adjusted prices by default
    queryParams.append('adjusted', 'true');

    const url = `${
      TCBS_ENDPOINTS.HISTORICAL
    }/${symbol}/his/v3?${queryParams.toString()}`;

    const response = await this.request<TcbsResponse<TcbsHistoricalPrice[]>>({
      url,
      method: 'GET',
    });

    return {
      data: response.data.data,
      status: response.data.status === 'success' ? 'success' : 'error',
      message: response.data.message || undefined,
    };
  }

  /**
   * Get daily OHLC price data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to daily price data
   */
  async getDailyOHLC(
    symbol: string,
    fromDate: string,
    toDate: string
  ): Promise<ApiResponse<TcbsHistoricalPrice[]>> {
    return this.getHistoricalOHLC(symbol, {
      fromDate,
      toDate,
      resolution: TcbsResolution.DAILY,
    });
  }

  /**
   * Get weekly OHLC price data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to weekly price data
   */
  async getWeeklyOHLC(
    symbol: string,
    fromDate: string,
    toDate: string
  ): Promise<ApiResponse<TcbsHistoricalPrice[]>> {
    return this.getHistoricalOHLC(symbol, {
      fromDate,
      toDate,
      resolution: TcbsResolution.WEEKLY,
    });
  }

  /**
   * Get monthly OHLC price data
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @param fromDate Start date in YYYY-MM-DD format
   * @param toDate End date in YYYY-MM-DD format
   * @returns Promise resolving to monthly price data
   */
  async getMonthlyOHLC(
    symbol: string,
    fromDate: string,
    toDate: string
  ): Promise<ApiResponse<TcbsHistoricalPrice[]>> {
    return this.getHistoricalOHLC(symbol, {
      fromDate,
      toDate,
      resolution: TcbsResolution.MONTHLY,
    });
  }

  /**
   * Validate stock symbol format
   *
   * @param symbol Stock symbol to validate
   * @throws Error if symbol is invalid
   */
  private validateSymbol(symbol: string): void {
    if (!symbol || typeof symbol !== 'string' || symbol.length < 3) {
      throw new Error(`Invalid stock symbol: ${symbol}`);
    }
  }
}
