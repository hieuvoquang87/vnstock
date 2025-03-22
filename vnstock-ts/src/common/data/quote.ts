/**
 * Stock quote and price data module
 */
import { VciExplorer } from '../../explorer/vci';
import { TcbsExplorer } from '../../explorer/tcbs';
import { SsiExplorer } from '../../explorer/ssi';
import { ApiResponse, DateRangeParams } from '../../types/api';
import { OHLCData, Quote } from '../../types/models';
import { getLogger } from '../../core/utils/logger';
import { config } from '../../core/config';
import { DataSource } from '../../types/config';

const logger = getLogger('QuoteModule');

// Type for supported explorers
type SupportedExplorer = VciExplorer | TcbsExplorer | SsiExplorer;

/**
 * Quote module for accessing price data
 */
export class QuoteModule {
  private explorer: SupportedExplorer;
  private explorers: Partial<Record<DataSource, SupportedExplorer>>;

  /**
   * Constructor
   */
  constructor() {
    // Initialize explorers for different data sources
    this.explorers = {
      [DataSource.VCI]: new VciExplorer(),
      [DataSource.TCBS]: new TcbsExplorer(),
      [DataSource.SSI]: new SsiExplorer(),
    };

    // Set the default explorer
    const defaultSource = config.get('defaultSource');
    // Ensure we have a valid explorer (default to VCI if specified explorer is not available)
    const vciExplorer = this.explorers[DataSource.VCI] as VciExplorer;
    this.explorer = this.explorers[defaultSource] || vciExplorer;

    logger.debug(
      `Initialized QuoteModule with default source: ${defaultSource}`
    );
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
   * Get historical OHLC data
   * @param symbol - Stock symbol
   * @param params - Date range parameters
   * @returns Historical OHLC data
   */
  public async getHistorical(
    symbol: string,
    params: DateRangeParams
  ): Promise<ApiResponse<OHLCData[]>> {
    logger.info(`Getting historical data for ${symbol}`);

    // Check if the explorer has the getHistoricalOHLC method with the expected signature
    if (this.explorer instanceof VciExplorer) {
      return this.explorer.getHistoricalOHLC(
        symbol,
        params.fromDate,
        params.toDate || new Date().toISOString().split('T')[0], // Default to today
        params.timeframe || '1D' // Use timeframe instead of resolution
      );
    } else {
      // For other explorers, maintain backward compatibility
      // @ts-ignore - Different explorers may have different method signatures
      return this.explorer.getHistoricalOHLC(symbol, params);
    }
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

    // Only SSI and VCI have intraday endpoints
    if (this.explorer instanceof SsiExplorer) {
      return this.explorer.getIntraday(symbol, date);
    } else if (this.explorer instanceof VciExplorer) {
      // VCI explorer expects a number for resolution
      return this.explorer.getIntraday(symbol, 1, date);
    } else {
      logger.warning(
        `Intraday data not available for current source: ${this.getDataSource()}`
      );
      throw new Error(
        `Intraday data not available for data source: ${this.getDataSource()}`
      );
    }
  }

  /**
   * Change the data source
   * @param source - Data source to use
   */
  public setDataSource(source: DataSource): void {
    const explorer = this.explorers[source];
    if (!explorer) {
      logger.error(`Data source not implemented: ${source}`);
      throw new Error(`Data source not implemented: ${source}`);
    }

    this.explorer = explorer;
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
