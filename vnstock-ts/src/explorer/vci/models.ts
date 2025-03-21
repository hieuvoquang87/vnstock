/**
 * Models for VCI data source
 */

export interface TickerModel {
  symbol: string;
  start: string;
  end: string;
  interval: string;
}

export class Ticker implements TickerModel {
  symbol: string;
  start: string;
  end: string;
  interval: string;

  constructor(
    symbol: string,
    start: string,
    end: string,
    interval: string = '1D'
  ) {
    this.symbol = symbol.toUpperCase();
    this.start = start;
    this.end = end || new Date().toISOString().split('T')[0]; // Default to today
    this.interval = interval;
  }
}

export interface PriceDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CompanyProfile {
  symbol: string;
  companyName: string;
  exchange: string;
  industry: string;
  sector: string;
  businessAreas: string;
  listingDate: string;
  foundingDate: string;
  website: string;
  address: string;
  phone: string;
  fax: string;
  email: string;
}

export interface FinancialRatio {
  period: string;
  date: string;
  ratioName: string;
  value: number;
}

export interface BalanceSheetItem {
  period: string;
  date: string;
  accountName: string;
  value: number;
}

export interface IncomeStatementItem {
  period: string;
  date: string;
  accountName: string;
  value: number;
}

export interface CashFlowItem {
  period: string;
  date: string;
  accountName: string;
  value: number;
}
