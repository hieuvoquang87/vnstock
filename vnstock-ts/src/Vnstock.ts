/**
 * Main Vnstock class
 */
import { CompanyModule, ListingModule, QuoteModule } from './common/data';
import { configure } from './core/config';
import { DataSource, VnstockConfig } from './types/config';
import { getLogger } from './core/utils/logger';

const logger = getLogger('Vnstock');

/**
 * Main Vnstock class for accessing Vietnam stock market data
 */
export class Vnstock {
  private readonly _quote: QuoteModule;
  private readonly _listing: ListingModule;
  private readonly _company: CompanyModule;

  /**
   * Constructor
   * @param config - Optional configuration options
   */
  constructor(config?: Partial<VnstockConfig>) {
    // Configure library if custom config is provided
    if (config) {
      configure(config);
    }

    logger.info('Initializing Vnstock');

    // Initialize modules
    this._quote = new QuoteModule();
    this._listing = new ListingModule();
    this._company = new CompanyModule();
  }

  /**
   * Change the data source for all modules
   * @param source - Data source to use
   */
  public setDataSource(source: DataSource): void {
    this._quote.setDataSource(source);
    this._listing.setDataSource(source);
    this._company.setDataSource(source);
    logger.info(`Changed data source to ${source}`);
  }

  /**
   * Access to quote module for price data
   */
  public get quote(): QuoteModule {
    return this._quote;
  }

  /**
   * Access to listing module for ticker data
   */
  public get listing(): ListingModule {
    return this._listing;
  }

  /**
   * Access to company module for company information
   */
  public get company(): CompanyModule {
    return this._company;
  }
}
