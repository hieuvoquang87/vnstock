/**
 * Stock quote and price data module
 */
import { VciExplorer } from '../../core/explorer/vci';
import { ApiResponse, DateRangeParams } from '../../types/api';
import { OHLCData, Quote } from '../../types/models';
import { getLogger } from '../../core/utils/logger';
import { config } from '../../core/config';
import { DataSource } from '../../types/config';

const logger = getLogger('QuoteModule');

/**
 * Quote module for accessing price data
 */
export class QuoteModule {
  private explorer: VciExplorer;

  /**
   * Constructor
   */
  constructor() {
    this.explorer = new VciExplorer();
    logger.debug('Initialized QuoteModule');
  }

  /**
   * Get real-time quote for a stock
   * @param symbol - Stock symbol
   * @returns Quote data
   */
  public async getQuote(symbol: string): Promise<ApiResponse<Quote>> {
    logger.info(`Getting quote for ${symbol}`);
    return this.explorer.getQuote(symbol);
  }

  /**
   * Get quotes for multiple stocks
   * @param symbols - Array of stock symbols
   * @returns Quote data for multiple stocks
   */
  public async getQuotes(symbols: string[]): Promise<ApiResponse<Quote[]>> {
    logger.info(`Getting quotes for ${symbols.length} symbols`);
    return this.explorer.getQuotes(symbols);
  }

  /**
   * Get historical data for a stock
   * @param symbol - Stock symbol
   * @param params - Date range parameters
   * @returns Historical OHLC data
   */
  public async getHistorical(
    symbol: string,
    params: DateRangeParams
  ): Promise<ApiResponse<OHLCData[]>> {
    logger.info(`Getting historical data for ${symbol}`);
    return this.explorer.getHistoricalOHLC(symbol, params);
  }

  /**
   * Get intraday trading data
   * @param symbol - Stock symbol
   * @param date - Trading date (defaults to today)
   * @returns Intraday trading data
   */
  public async getIntraday(
    symbol: string,
    date?: string
  ): Promise<ApiResponse<any>> {
    logger.info(`Getting intraday data for ${symbol}`);
    return this.explorer.getIntraday(symbol, date);
  }

  /**
   * Change the data source
   * @param source - Data source to use
   */
  public setDataSource(source: DataSource): void {
    this.explorer.setSource(source);
    logger.info(`Changed data source to ${source}`);
  }

  /**
   * Get the current data source
   * @returns Current data source
   */
  public getDataSource(): DataSource {
    return this.explorer.getSource();
  }
}
