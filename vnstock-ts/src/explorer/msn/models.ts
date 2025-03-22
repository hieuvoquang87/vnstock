/**
 * Models for MSN data source
 */

/**
 * MSN stock quote response
 */
export interface MsnStockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  exchange: string;
  companyName: string;
}

/**
 * MSN historical price data
 */
export interface MsnHistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose?: number;
}

/**
 * MSN intraday price data
 */
export interface MsnIntradayPrice {
  timestamp: string;
  price: number;
  volume: number;
}

/**
 * MSN stock listing
 */
export interface MsnStockListing {
  symbol: string;
  companyName: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
}
