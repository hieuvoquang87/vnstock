/**
 * Stock listing and ticker data module
 */
import { VciExplorer } from '../../explorer/vci';
import { TcbsExplorer } from '../../explorer/tcbs';
import { SsiExplorer } from '../../explorer/ssi';
import { ApiResponse, PaginationParams } from '../../types/api';
import { StockListing } from '../../types/models';
import { getLogger } from '../../core/utils/logger';
import { DataSource } from '../../types/config';
import { EXCHANGES } from '../../core/config/const';
import { config } from '../../core/config';

const logger = getLogger('ListingModule');

// Type for supported explorers
type SupportedExplorer = VciExplorer | TcbsExplorer | SsiExplorer;

/**
 * Listing module for accessing ticker data
 */
export class ListingModule {
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
      `Initialized ListingModule with default source: ${defaultSource}`
    );
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

    if (this.explorer instanceof VciExplorer) {
      return this.explorer.getListing(params);
    } else if (this.explorer instanceof TcbsExplorer) {
      return this.explorer.getListing(params);
    } else if (this.explorer instanceof SsiExplorer) {
      return this.explorer.getListing(params);
    }

    // This should never happen as we ensure explorer is always valid in constructor
    throw new Error(`Invalid explorer type: ${typeof this.explorer}`);
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

    if (this.explorer instanceof VciExplorer) {
      return this.explorer.getFilteredListing(exchange, undefined, params);
    } else if (this.explorer instanceof SsiExplorer) {
      return this.explorer.getFilteredListing(exchange, undefined, params);
    } else if (this.explorer instanceof TcbsExplorer) {
      return this.explorer.getFilteredListing(exchange, undefined, params);
    }

    // This should never happen as we ensure explorer is always valid in constructor
    throw new Error(`Invalid explorer type: ${typeof this.explorer}`);
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

    // Only VCI supports filtering by industry directly
    if (this.explorer instanceof VciExplorer) {
      return this.explorer.getFilteredListing(undefined, industry, params);
    } else {
      logger.warning(
        `Industry filtering not supported by data source: ${this.getDataSource()}`
      );
      throw new Error(
        `Industry filtering not supported by data source: ${this.getDataSource()}`
      );
    }
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

    // Only VCI supports filtering by both exchange and industry
    if (this.explorer instanceof VciExplorer) {
      return this.explorer.getFilteredListing(exchange, industry, params);
    } else {
      logger.warning(
        `Industry filtering not supported by data source: ${this.getDataSource()}`
      );
      throw new Error(
        `Industry filtering not supported by data source: ${this.getDataSource()}`
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
