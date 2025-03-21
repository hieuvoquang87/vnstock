/**
 * Core data model definitions
 */

/**
 * Ticker symbol information
 */
export interface Ticker {
  symbol: string;
  exchange: string;
  type?: string;
  fullName?: string;
}

/**
 * Candle/OHLC data for price charts
 */
export interface OHLCData {
  symbol: string;
  time: string | number; // Timestamp or ISO date string
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change?: number;
  percentChange?: number;
  source?: string;
  assetType?: string;
}

/**
 * Real-time price quote
 */
export interface Quote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  time: string | number;
  exchange: string;
  source?: string;
}

/**
 * Company information
 */
export interface CompanyProfile {
  symbol: string;
  exchange: string;
  companyName: string;
  industryID?: number;
  industry?: string;
  sector?: string;
  established?: string;
  website?: string;
  overview?: string;
  employees?: number;
  address?: string;
  phone?: string;
  revenue?: number;
  profit?: number;
  chartingSymbol?: string;
  isin?: string;
}

/**
 * Financial statement types
 */
export enum FinancialStatementType {
  INCOME = 'income',
  BALANCE = 'balance',
  CASH_FLOW = 'cashflow',
}

/**
 * Financial reporting periods
 */
export enum FinancialPeriod {
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

/**
 * Financial statement data
 */
export interface FinancialStatement {
  symbol: string;
  type: FinancialStatementType;
  period: FinancialPeriod;
  year: number;
  quarter?: number;
  reportDate?: string;
  items: Record<string, number>;
  unit?: string;
  currency?: string;
}

/**
 * Financial ratio data
 */
export interface FinancialRatio {
  symbol: string;
  date: string;
  period: string;
  ratios: Record<string, number>;
}

/**
 * Intraday trading data
 */
export interface IntradayTrade {
  symbol: string;
  time: string;
  price: number;
  volume: number;
  side?: 'buy' | 'sell';
  change?: number;
  percentChange?: number;
  source?: string;
}

/**
 * Stock ownership data
 */
export interface OwnershipData {
  symbol: string;
  ownershipType: string;
  ownerName: string;
  percentage: number;
  sharesOwned: number;
  value?: number;
  reportDate: string;
}

/**
 * Stock listing data
 */
export interface StockListing {
  symbol: string;
  exchange: string;
  shortName: string;
  fullName: string;
  industry?: string;
  sector?: string;
  marketCap?: number;
  sharesOutstanding?: number;
  status?: string;
  listedDate?: string;
}

/**
 * Trading session information
 */
export interface TradingSession {
  time: string;
  session: string;
  isTrading: boolean;
  status: string;
  message?: string;
}
