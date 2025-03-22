/**
 * Company information module
 */
import { VciExplorer } from '../../explorer/vci';
import { ApiResponse } from '../../types/api';
import { CompanyProfile, OwnershipData } from '../../types/models';
import { getLogger } from '../../core/utils/logger';
import { DataSource } from '../../types/config';

const logger = getLogger('CompanyModule');

/**
 * Company module for accessing company information
 */
export class CompanyModule {
  private explorer: VciExplorer;

  /**
   * Constructor
   */
  constructor() {
    this.explorer = new VciExplorer();
    logger.debug('Initialized CompanyModule');
  }

  /**
   * Get company profile information
   * @param symbol - Stock symbol
   * @returns Company profile data
   */
  public async getProfile(
    symbol: string
  ): Promise<ApiResponse<CompanyProfile>> {
    logger.info(`Getting company profile for ${symbol}`);
    return this.explorer.getCompanyProfile(symbol);
  }

  /**
   * Get company ownership information
   * @param symbol - Stock symbol
   * @returns Ownership data
   */
  public async getOwnership(
    symbol: string
  ): Promise<ApiResponse<OwnershipData>> {
    logger.info(`Getting ownership data for ${symbol}`);
    return this.explorer.getOwnership(symbol);
  }

  /**
   * Get company information for multiple symbols
   * @param symbols - Array of stock symbols
   * @returns Map of company profiles by symbol
   */
  public async getMultipleProfiles(
    symbols: string[]
  ): Promise<Record<string, ApiResponse<CompanyProfile>>> {
    logger.info(`Getting company profiles for ${symbols.length} symbols`);

    const result: Record<string, ApiResponse<CompanyProfile>> = {};

    // Process in batches to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map((symbol) =>
        this.getProfile(symbol)
          .then((response) => {
            result[symbol] = response;
            return response;
          })
          .catch((error) => {
            logger.error(
              `Error getting profile for ${symbol}: ${error.message}`
            );
            result[symbol] = {
              status: 'error',
              data: {} as CompanyProfile,
              error: error.message,
            } as ApiResponse<CompanyProfile>;
            return null;
          })
      );

      await Promise.all(promises);

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < symbols.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return result;
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
