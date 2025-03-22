/**
 * Data models for TCBS explorer
 */

/**
 * Generic response format from TCBS APIs
 */
export interface TcbsResponse<T> {
  /** Response data */
  data: T;
  /** Response status */
  status: string;
  /** Response message (if any) */
  message: string | null;
}

/**
 * Represents a stock quote from TCBS API
 */
export interface TcbsStockQuote {
  /** Stock symbol */
  symbol: string;
  /** Current price */
  price: number;
  /** Price change */
  priceChange: number;
  /** Percentage change */
  pctChange: number;
  /** Trading volume */
  volume: number;
  /** Total trading value */
  value: number;
  /** Highest price of the day */
  high: number;
  /** Lowest price of the day */
  low: number;
  /** Opening price */
  open: number;
  /** Previous close price */
  prevClose: number;
  /** Market capitalization */
  marketCap: number;
  /** Last updated timestamp */
  timestamp: string;
}

/**
 * Historical price data point
 */
export interface TcbsHistoricalPrice {
  /** Trading date in YYYY-MM-DD format */
  date: string;
  /** Opening price */
  open: number;
  /** Highest price of the session */
  high: number;
  /** Lowest price of the session */
  low: number;
  /** Closing price */
  close: number;
  /** Trading volume */
  volume: number;
  /** Adjusted close price for dividends */
  adjClose?: number;
}

/**
 * Parameters for historical data request
 */
export interface TcbsHistoricalParams {
  /** Start date in YYYY-MM-DD format */
  fromDate: string;
  /** End date in YYYY-MM-DD format */
  toDate: string;
  /** Data resolution (daily, weekly, monthly) */
  resolution: string;
  /** Whether to use adjusted prices */
  adjusted?: boolean;
}

/**
 * Intraday data point
 */
export interface TcbsIntradayPrice {
  /** Timestamp in milliseconds */
  timestamp: number;
  /** Price at this time */
  price: number;
  /** Volume at this time */
  volume: number;
}

/**
 * Company profile information
 */
export interface TcbsCompanyProfile {
  /** Stock symbol */
  symbol: string;
  /** Company's full name */
  companyName: string;
  /** Short description */
  description: string;
  /** Industry name */
  industry: string;
  /** Sector name */
  sector: string;
  /** Foundation year */
  foundationYear: number;
  /** Number of employees */
  employees: number;
  /** Company website */
  website: string;
  /** Company address */
  address: string;
  /** Market capitalization */
  marketCap: number;
  /** Market capitalization ranking */
  marketCapRank: number;
  /** Free-float percentage */
  freeFloat: number;
  /** State ownership percentage */
  stateOwnership: number;
  /** Foreign ownership percentage */
  foreignOwnership: number;
  /** Maximum foreign ownership allowed percentage */
  foreignOwnershipLimit: number;
  /** Outstanding shares */
  outstandingShares: number;
  /** Financial highlights */
  financialHighlights?: {
    revenue?: number;
    profit?: number;
    eps?: number;
    pe?: number;
    pb?: number;
    roe?: number;
  };
}

/**
 * Major shareholder information
 */
export interface TcbsMajorShareholder {
  /** Shareholder name */
  name: string;
  /** Ownership percentage */
  ownershipPct: number;
  /** Number of shares */
  shares: number;
  /** Shareholder type (organization/individual) */
  type: string;
  /** Last reported date */
  reportDate: string;
}

/**
 * Ownership structure response
 */
export interface TcbsOwnershipData {
  majorShareholders: TcbsMajorShareholder[];
  ownershipSummary: {
    stateOwnership: number;
    foreignOwnership: number;
    otherInstitutions: number;
    individuals: number;
  };
}

/**
 * Financial statement item
 */
export interface TcbsFinancialItem {
  /** Item name */
  name: string;
  /** Item code */
  code: string;
  /** Value for this period */
  value: number;
  /** Growth rate compared to previous period */
  growthQoQ?: number;
  /** Growth rate compared to same period last year */
  growthYoY?: number;
}

/**
 * Financial statement data
 */
export interface TcbsFinancialStatementData {
  /** Financial items */
  items: TcbsFinancialItem[];
  /** Reporting periods */
  periods: string[];
  /** Type of financial statement */
  type: string;
  /** Reporting period frequency */
  period: string;
}

/**
 * Financial ratio data
 */
export interface TcbsFinancialRatio {
  /** Ratio code */
  code: string;
  /** Ratio name */
  name: string;
  /** Ratio values for each period */
  values: number[];
}

/**
 * Financial ratio response data
 */
export interface TcbsFinancialRatioData {
  /** Array of ratios */
  ratios: TcbsFinancialRatio[];
  /** Reporting periods */
  periods: string[];
  /** Frequency of reporting */
  period: string;
}

/**
 * Stock listing data
 */
export interface TcbsStockListing {
  /** Stock symbol */
  symbol: string;
  /** Company name */
  companyName: string;
  /** Exchange code */
  exchange: string;
  /** Industry name */
  industry: string;
  /** Industry code */
  industryCode: string;
  /** Sector name */
  sector: string;
  /** Sector code */
  sectorCode: string;
  /** Market capitalization */
  marketCap: number;
  /** ISIN code */
  isin?: string;
  /** Outstanding shares */
  shareOutstanding: number;
  /** Listing date */
  listedDate: string;
}

/**
 * Technical indicator data point
 */
export interface TcbsTechnicalIndicatorPoint {
  /** Timestamp */
  timestamp: number;
  /** Indicator value(s) */
  value: number | number[];
}

/**
 * Technical indicator data
 */
export interface TcbsTechnicalIndicatorData {
  /** Indicator name */
  name: string;
  /** Indicator parameters */
  params: Record<string, number>;
  /** Indicator data points */
  data: TcbsTechnicalIndicatorPoint[];
}

/**
 * Screened stock result
 */
export interface TcbsScreenedStock {
  /** Stock symbol */
  symbol: string;
  /** Company name */
  companyName: string;
  /** Exchange code */
  exchange: string;
  /** Industry code */
  industryCode: string;
  /** Current price */
  price: number;
  /** Market capitalization */
  marketCap: number;
  /** Trading volume */
  volume: number;
  /** Price to earnings ratio */
  pe: number;
  /** Price to book ratio */
  pb: number;
  /** Return on equity */
  roe: number;
  /** Earnings per share */
  eps: number;
  /** Additional fields based on screening criteria */
  [key: string]: any;
}
