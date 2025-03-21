/**
 * Stock listing and ticker data module
 */
import { VciExplorer } from '../../core/explorer/vci';
import { ApiResponse, PaginationParams } from '../../types/api';
import { StockListing } from '../../types/models';
import { getLogger } from '../../core/utils/logger';
import { DataSource } from '../../types/config';
import { EXCHANGES } from '../../core/config/const';

const logger = getLogger('ListingModule');

/**
 * Listing module for accessing ticker data
 */
export class ListingModule {
  private explorer: VciExplorer;

  /**
   * Constructor
   */
  constructor() {
    this.explorer = new VciExplorer();
    logger.debug('Initialized ListingModule');
  }

  /**
   * Get all stock listings
   * @param params - Pagination parameters
   * @returns List of all stocks
   */
  public async getAllStocks(
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    logger.info('Getting all stock listings');
    return this.explorer.getListing(params);
  }

  /**
   * Get stocks by exchange
   * @param exchange - Exchange (HOSE, HNX, UPCOM)
   * @param params - Pagination parameters
   * @returns List of stocks filtered by exchange
   */
  public async getStocksByExchange(
    exchange: string,
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    if (!EXCHANGES.includes(exchange)) {
      throw new Error(
        `Invalid exchange: ${exchange}. Valid options are: ${EXCHANGES.join(
          ', '
        )}`
      );
    }

    logger.info(`Getting stock listings for exchange: ${exchange}`);
    return this.explorer.getFilteredListing(exchange, undefined, params);
  }

  /**
   * Get stocks by industry
   * @param industry - Industry ID or name
   * @param params - Pagination parameters
   * @returns List of stocks filtered by industry
   */
  public async getStocksByIndustry(
    industry: string | number,
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    logger.info(`Getting stock listings for industry: ${industry}`);
    return this.explorer.getFilteredListing(undefined, industry, params);
  }

  /**
   * Get stocks by exchange and industry
   * @param exchange - Exchange (HOSE, HNX, UPCOM)
   * @param industry - Industry ID or name
   * @param params - Pagination parameters
   * @returns List of stocks filtered by exchange and industry
   */
  public async getStocksByExchangeAndIndustry(
    exchange: string,
    industry: string | number,
    params?: PaginationParams
  ): Promise<ApiResponse<StockListing[]>> {
    if (!EXCHANGES.includes(exchange)) {
      throw new Error(
        `Invalid exchange: ${exchange}. Valid options are: ${EXCHANGES.join(
          ', '
        )}`
      );
    }

    logger.info(
      `Getting stock listings for exchange: ${exchange}, industry: ${industry}`
    );
    return this.explorer.getFilteredListing(exchange, industry, params);
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
