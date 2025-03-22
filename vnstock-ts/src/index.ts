/**
 * vnstock-ts - Vietnam stock market data in TypeScript
 * Main entry point
 */

// Main class
import { Vnstock } from './Vnstock';

// Data modules
import {
  CompanyModule,
  FinanceModule,
  ListingModule,
  QuoteModule,
} from './common/data';

// Export data modules directly
export { CompanyModule, FinanceModule, ListingModule, QuoteModule };

// Configuration
export { configure } from './core/config';
export { DataSource, LogLevel } from './types/config';

// Export types
export * from './types/api';
export * from './types/models';
export * from './types/config';

// Default export
export default Vnstock;
