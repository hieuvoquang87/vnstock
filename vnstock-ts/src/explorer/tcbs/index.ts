/**
 * TCBS Explorer Module
 * Export all modules from TCBS data source
 */

// Export constants
export * from './const';

// Export models
export * from './models';

// Import specialized explorers
import { TcbsQuoteExplorer } from './quote';
import { TcbsListingExplorer } from './listing';
import { TcbsCompanyExplorer } from './company';
import { TcbsFinancialExplorer } from './financial';
import { TcbsScreenerExplorer } from './screener';
import { TcbsTradingExplorer } from './trading';
import { BaseExplorer } from '../base';
import { DataSource } from '../../types/config';

/**
 * Unified TCBS Explorer that combines all functionality
 */
export class TcbsExplorer extends BaseExplorer {
  public quoteExplorer: TcbsQuoteExplorer;
  public listingExplorer: TcbsListingExplorer;
  public companyExplorer: TcbsCompanyExplorer;
  public financialExplorer: TcbsFinancialExplorer;
  public screenerExplorer: TcbsScreenerExplorer;
  public tradingExplorer: TcbsTradingExplorer;

  constructor() {
    super(DataSource.TCBS);
    this.quoteExplorer = new TcbsQuoteExplorer();
    this.listingExplorer = new TcbsListingExplorer();
    this.companyExplorer = new TcbsCompanyExplorer();
    this.financialExplorer = new TcbsFinancialExplorer();
    this.screenerExplorer = new TcbsScreenerExplorer();
    this.tradingExplorer = new TcbsTradingExplorer();
  }
}
