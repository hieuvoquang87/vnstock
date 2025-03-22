/**
 * VCI Explorer Module
 * Export all modules from VCI data source
 */

// Export constants
export * from './const';

// Export models
export * from './models';

// Import specialized explorers
import { VciQuoteExplorer } from './quote';
import { VciListingExplorer } from './listing';
import { VciCompanyExplorer } from './company';
import { VciFinancialExplorer } from './financial';
import { VciTradingExplorer } from './trading';
import { BaseExplorer } from '../base';
import { DataSource } from '../../types/config';

/**
 * Unified VCI Explorer that combines all functionality
 */
export class VciExplorer extends BaseExplorer {
  public quoteExplorer: VciQuoteExplorer;
  public listingExplorer: VciListingExplorer;
  public companyExplorer: VciCompanyExplorer;
  public financialExplorer: VciFinancialExplorer;
  public tradingExplorer: VciTradingExplorer;

  constructor() {
    super(DataSource.VCI);
    this.quoteExplorer = new VciQuoteExplorer();
    this.listingExplorer = new VciListingExplorer();
    this.companyExplorer = new VciCompanyExplorer();
    this.financialExplorer = new VciFinancialExplorer();
    this.tradingExplorer = new VciTradingExplorer();
  }
}
