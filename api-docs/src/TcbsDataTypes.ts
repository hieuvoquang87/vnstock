// Company Information Types

export interface CompanyOverview {
  ticker: string;
  exchange: string;
  shortName: string;
  industryID: number;
  industryIDv2: string;
  industryIdLevel2: string;
  industryIdLevel4: string;
  industry: string;
  industryEn: string;
  establishedYear: string;
  noEmployees: number;
  noShareholders: number;
  foreignPercent: number;
  website: string;
  stockRating: number;
  deltaInWeek: number;
  deltaInMonth: number;
  deltaInYear: number;
  outstandingShare: number;
  issueShare: number;
  companyType: string;
}

export interface ShareHolder {
  no: number;
  ticker: string;
  name: string;
  ownPercent: number;
}

export interface ShareholdersInfo {
  listShareHolder: ShareHolder[];
}

export interface InsiderDeal {
  no: number;
  ticker: string;
  anDate: string;
  dealingMethod: number;
  dealingAction: string;
  quantity: number;
  price: number;
  ratio: number;
}

export interface InsiderDeals {
  listInsiderDealing: InsiderDeal[];
}

export interface Subsidiary {
  no: number;
  ticker: string;
  companyName: string;
  ownPercent: number;
}

export interface Subsidiaries {
  listSubCompany: Subsidiary[];
}

export interface CompanyOfficer {
  no: number;
  ticker: string;
  name: string;
  position: string | null;
  ownPercent: number;
}

export interface CompanyOfficers {
  listKeyOfficer: CompanyOfficer[];
}

export interface CompanyEvent {
  rsi: number;
  rs: number;
  id: number;
  ticker: string;
  price: number;
  priceChange: number;
  priceChangeRatio: number;
  priceChangeRatio1M: number;
  eventName: string;
  eventCode: string;
  notifyDate: string;
  exerDate: string;
  regFinalDate: string;
  exRigthDate: string;
  eventDesc: string;
}

export interface CompanyEvents {
  listEventNews: CompanyEvent[];
}

export interface CompanyNewsItem {
  rsi: number;
  rs: number;
  ticker: string;
  price: number;
  priceChange: number;
  priceChangeRatio: number;
  priceChangeRatio1M: number;
  id: number;
  title: string;
  source: string;
  publishDate: string;
}

export interface CompanyNews {
  listActivityNews: CompanyNewsItem[];
}

export interface Dividend {
  no: number;
  ticker: string;
  exerciseDate: string;
  cashYear: number;
  cashDividendPercentage: number;
  issueMethod: string;
}

export interface Dividends {
  listDividendPaymentHis: Dividend[];
}

// Financial Report Types

export interface BalanceSheetItem {
  ticker: string;
  quarter: number;
  year: number;
  shortAsset: number;
  cash: number;
  shortInvest: number;
  shortReceivable: number;
  inventory: number;
  longAsset: number;
  fixedAsset: number;
  asset: number;
  debt: number;
  shortDebt: number;
  longDebt: number;
  equity: number;
  capital: number;
  centralBankDeposit: number | null;
  otherBankDeposit: number | null;
  otherBankLoan: number | null;
  stockInvest: number | null;
  customerLoan: number | null;
  badLoan: number | null;
  provision: number | null;
  netCustomerLoan: number | null;
  otherAsset: number | null;
  otherBankCredit: number | null;
  oweOtherBank: number | null;
  oweCentralBank: number | null;
  valuablePaper: number | null;
  payableInterest: number | null;
  receivableInterest: number | null;
  deposit: number | null;
  otherDebt: number | null;
  fund: number | null;
  unDistributedIncome: number;
  minorShareHolderProfit: number;
  payable: number;
}

export type BalanceSheet = BalanceSheetItem[];

export interface IncomeStatementItem {
  ticker: string;
  quarter: number;
  year: number;
  revenue: number;
  yearRevenueGrowth: number | null;
  quarterRevenueGrowth: number | null;
  costOfGoodSold: number;
  grossProfit: number;
  operationExpense: number;
  operationProfit: number;
  yearOperationProfitGrowth: number | null;
  quarterOperationProfitGrowth: number | null;
  interestExpense: number;
  preTaxProfit: number;
  postTaxProfit: number;
  shareHolderIncome: number;
  yearShareHolderIncomeGrowth: number | null;
  quarterShareHolderIncomeGrowth: number | null;
  investProfit: number | null;
  serviceProfit: number | null;
  otherProfit: number | null;
  provisionExpense: number | null;
  operationIncome: number | null;
  ebitda: number;
}

export type IncomeStatement = IncomeStatementItem[];

export interface CashFlowItem {
  ticker: string;
  quarter: number;
  year: number;
  operationCashFlow: number;
  investCashFlow: number;
  financeCashFlow: number;
  netCashFlow: number;
}

export type CashFlow = CashFlowItem[];

export interface FinancialRatioItem {
  ticker: string;
  quarter: number;
  year: number;
  roe: number;
  roa: number;
  daysOfInventory: number;
  daysOfPayable: number;
  daysOfReceivable: number;
  ebitOnInterest: number;
  currentPayableOnEquity: number;
  currentRatio: number;
  quickRatio: number;
  netDebtOnEquity: number;
  netDebtOnEbitda: number;
  // Add more properties as needed
}

export type FinancialRatios = FinancialRatioItem[];

// Market Data Types

export interface HistoricalPriceDataItem {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tradingDate: string;
}

export interface HistoricalPriceData {
  ticker: string;
  data: HistoricalPriceDataItem[];
}

export interface IntradayTradingDataItem {
  p: number; // price
  v: number; // volume
  cp: number; // change price
  rcp: number; // rate change price
  a: string; // action
  ba: number; // buy amount
  sa: number; // sell amount
  hl: boolean; // highlight
  pcp: number; // percent change price
  t: string; // time
}

export interface IntradayTradingData {
  page: number;
  size: number;
  headIndex: number;
  numberOfItems: number;
  total: number;
  ticker: string;
  data: IntradayTradingDataItem[];
}

export interface PriceBoardItem {
  t: string; // ticker
  cp: number; // close price
  fv: number;
  mav: number;
  nstv: number;
  nstp: number;
  rsi: number;
  macdv: number;
  macdsignal: string;
  tsignal: string;
  avgsignal: string;
  ma20: number;
  ma50: number;
  ma100: number;
  session: number;
  mw3d: number;
  mw1m: number;
  mw3m: number;
  mw1y: number;
  rs3d: number;
  rs1m: number;
  rs3m: number;
  rs1y: number;
  rsavg: number;
  hp1m: number;
  hp3m: number;
  hp1y: number;
  lp1m: number;
  lp3m: number;
  lp1y: number;
  hp1yp: number;
  lp1yp: number;
  pe: number;
  pb: number;
  roe: number;
  oscore: number;
  av: number;
  bv: number;
  ev: number;
  hmp: number;
  mscore: number;
  delta1m: number;
  delta1y: number;
  seq: number;
  vnid3d: number;
  vnid1m: number;
  vnid3m: number;
  vnid1y: number;
  vnipe: number;
  vnipb: number;
  roa: number;
  dividend: number;
}

export interface PriceBoard {
  data: PriceBoardItem[];
}

// Stock Screener Types

export interface MultiLanguageField {
  vi: string;
  en: string;
}

export interface ScreenerItem {
  ticker: string;
  exchangeName: MultiLanguageField;
  industryName: MultiLanguageField;
  companyName: string;
  marketCap: number;
  roe: number;
  stockRating: number;
  businessOperation: number;
  businessModel: number;
  financialHealth: number;
  alpha: number;
  beta: number;
  relativeStrength: null | number;
  uptrend: null | boolean;
  activeBuyPercentage: number | null;
  strongBuyPercentage: number | null;
  suddenlyHighVolumeMatching: number | null;
  forecastVolumeRatio: number | null;
  priceCrossAboveSma5: null | boolean;
  priceCrossBelowSma5: null | boolean;
  priceCrossAboveSma20: null | boolean;
  priceCrossBelowSma20: null | boolean;
  pe: number;
  pb: number;
  evEbitda: number | null;
  dividendYield: number;
  priceVsSMA5: MultiLanguageField | null;
  priceVsSMA20: MultiLanguageField | null;
  revenueGrowth1Year: number;
  revenueGrowth5Year: number;
  epsGrowth1Year: number | null;
  epsGrowth5Year: number | null;
  grossMargin: number | null;
  netMargin: number | null;
  doe: number | null;
  avgTradingValue5Day: number;
  // There are many more fields in the stock screener response
}

export interface StockScreeningData {
  numOfTicker: any[];
  searchData: {
    pageContent: ScreenerItem[];
  };
}
