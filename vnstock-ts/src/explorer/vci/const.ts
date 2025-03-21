/**
 * Constants for VCI data source
 */

// Base URLs
export const _BASE_URL = 'https://finance.vietstock.vn';
export const _TRADING_URL = 'https://finance.vietstock.vn';
export const _CHART_URL = '/data/getchartdata';
export const _INTRADAY_URL = '/data/orderbook';
export const _GRAPHQL_URL = 'https://api.vietcap.com.vn/data-mt/graphql';

// Interval maps for historical data
export const _INTERVAL_MAP: Record<string, number> = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '30m': 30,
  '1H': 60,
  '1D': 1440,
  '1W': 10080,
  '1M': 43200,
};

// Column mapping for OHLC data
export const _OHLC_MAP: Record<string, string> = {
  t: 'time',
  o: 'open',
  h: 'high',
  l: 'low',
  c: 'close',
  v: 'volume',
};

// Data type mapping for OHLC data
export const _OHLC_DTYPE: Record<string, string> = {
  time: 'datetime',
  open: 'float',
  high: 'float',
  low: 'float',
  close: 'float',
  volume: 'int',
};

// Resample mapping
export const _RESAMPLE_MAP: Record<string, string> = {
  '1m': '1min',
  '5m': '5min',
  '15m': '15min',
  '30m': '30min',
  '1H': 'H',
  '1D': 'D',
  '1W': 'W',
  '1M': 'M',
};

// Group codes for stock categorization
export const _GROUP_CODE = [
  'HOSE',
  'VN30',
  'VNMidCap',
  'VNSmallCap',
  'VNAllShare',
  'VN100',
  'ETF',
  'HNX',
  'HNX30',
  'HNXCon',
  'HNXFin',
  'HNXLCap',
  'HNXMSCap',
  'HNXMan',
  'UPCOM',
  'FU_INDEX',
  'FU_BOND',
  'BOND',
  'CW',
];

// Column mapping for intraday data
export const _INTRADAY_MAP: Record<string, string> = {
  truncTime: 'time',
  matchPrice: 'price',
  matchVol: 'volume',
  matchType: 'match_type',
  id: 'id',
};

// Data type mapping for intraday data
export const _INTRADAY_DTYPE: Record<string, string> = {
  time: 'datetime',
  price: 'float',
  volume: 'int',
  side: 'str',
  position: 'str',
};

// Column mapping for price depth data
export const _PRICE_DEPTH_MAP: Record<string, string> = {
  price: 'price',
  totalVol: 'total_volume',
  priceChange: 'price_change',
  priceChangePercent: 'price_change_percent',
};

// Financial report mappings
export const _FINANCIAL_REPORT_MAP: Record<string, string> = {
  balance_sheet: 'balancesheet',
  income_statement: 'incomestatement',
  cash_flow: 'cashflow',
};

// Financial report period mappings
export const _FINANCIAL_REPORT_PERIOD_MAP: Record<string, string> = {
  year: 'Y',
  quarter: 'Q',
};

// Unit display mappings
export const _UNIT_MAP: Record<string, string> = {
  BILLION: 'tỷ',
  PERCENT: '%',
  INDEX: 'index',
  MILLION: 'triệu',
};

// Supported languages
export const SUPPORTED_LANGUAGES = ['vi', 'en'];

// Index mapping
export const _INDEX_MAPPING: Record<string, string> = {
  VNINDEX: 'VNINDEX',
  VN30INDEX: 'VN30INDEX',
  HNX30INDEX: 'HNX30INDEX',
  HNXINDEX: 'HNXINDEX',
  UPCOMINDEX: 'UPCOMINDEX',
  VNXALLSHARE: 'VNXALLSHARE',
  VN100: 'VN100',
  VNMIDCAP: 'VNMIDCAP',
  VNSMALLCAP: 'VNSMALLCAP',
};

// Price info mapping
export const _PRICE_INFO_MAP: Record<string, string> = {
  ev: 'ev', // Enterprise Value
  ticker: 'symbol',
  // Price-related columns
  open_price: 'open',
  ceiling_price: 'ceiling',
  floor_price: 'floor',
  reference_price: 'ref_price',
  highest_price: 'high',
  lowest_price: 'low',
  price_change: 'price_change',
  percent_price_change: 'price_change_pct',

  // Year-based metrics
  highest_price1_year: 'high_price_1y',
  lowest_price1_year: 'low_price_1y',
  percent_lowest_price_change1_year: 'pct_low_change_1y',
  percent_highest_price_change1_year: 'pct_high_change_1y',

  // Foreign ownership related
  foreign_total_volume: 'foreign_volume',
  foreign_total_room: 'foreign_room',
  foreign_holding_room: 'foreign_holding_room',

  // Other metrics
  average_match_volume2_week: 'avg_match_volume_2w',
};

// Financial indicator mapping for all report types
export const FINANCIAL_INDICATOR_MAP: Record<string, string> = {
  revenue: 'Doanh thu thuần',
  grossProfit: 'Lợi nhuận gộp',
  operatingProfit: 'Lợi nhuận từ HĐKD',
  netProfit: 'Lợi nhuận sau thuế',
  totalAssets: 'Tổng tài sản',
  shareholderEquity: 'Vốn chủ sở hữu',
  liabilities: 'Nợ phải trả',
  roe: 'ROE',
  roa: 'ROA',
  eps: 'EPS',
  bvps: 'BVPS',
  pe: 'P/E',
  pb: 'P/B',
};

// Quarter financial report field mapping
export const QUARTER_FINANCIAL_MAP: Record<string, string> = {
  netSales: 'netSales',
  costOfGoodsSold: 'costOfGoodsSold',
  grossProfit: 'grossProfit',
  financialIncome: 'financialIncome',
  financialExpense: 'financialExpense',
  interestExpense: 'interestExpense',
  sellingExpenses: 'sellingExpenses',
  generalAndAdministrativeExpenses: 'generalAndAdministrativeExpenses',
  operatingProfit: 'operatingProfit',
  profitFromJointVenture: 'profitFromJointVenture',
  otherProfit: 'otherProfit',
  profitBeforeTax: 'profitBeforeTax',
  corporateIncomeTax: 'corporateIncomeTax',
  profitAfterTax: 'profitAfterTax',
  minorityInterest: 'minorityInterest',
  attributableToParentCompany: 'attributableToParentCompany',
  eps: 'eps',
};

// Yearly financial report field mapping
export const YEARLY_FINANCIAL_MAP: Record<string, string> = {
  netSales: 'netSales',
  costOfGoodsSold: 'costOfGoodsSold',
  grossProfit: 'grossProfit',
  financialIncome: 'financialIncome',
  financialExpense: 'financialExpense',
  interestExpense: 'interestExpense',
  sellingExpenses: 'sellingExpenses',
  generalAndAdministrativeExpenses: 'generalAndAdministrativeExpenses',
  operatingProfit: 'operatingProfit',
  profitFromJointVenture: 'profitFromJointVenture',
  otherProfit: 'otherProfit',
  profitBeforeTax: 'profitBeforeTax',
  corporateIncomeTax: 'corporateIncomeTax',
  profitAfterTax: 'profitAfterTax',
  minorityInterest: 'minorityInterest',
  attributableToParentCompany: 'attributableToParentCompany',
  eps: 'eps',
};

// ICB4 industry classification to company type code mapping
export const _ICB4_COMTYPE_CODE_MAP: Record<string, string> = {
  'Bán lẻ phức hợp': 'CT',
  'Bảo hiểm nhân thọ': 'BH',
  'Bảo hiểm phi nhân thọ': 'BH',
  'Bất động sản': 'CT',
  'Chuyển phát nhanh': 'CT',
  'Chăm sóc y tế': 'CT',
  'Chất thải & Môi trường': 'CT',
  'Containers & Đóng gói': 'CT',
  'Công nghiệp phức hợp': 'CT',
  'Công nghệ sinh học': 'CT',
  'Dược phẩm': 'CT',
  'Dịch vụ Máy tính': 'CT',
  'Dịch vụ giải trí': 'CT',
  'Dịch vụ tiêu dùng chuyên ngành': 'CT',
  'Dịch vụ truyền thông': 'CT',
  'Dịch vụ vận tải': 'CT',
  'Dụng cụ y tế': 'CT',
  'Giải trí & Truyền thông': 'CT',
  'Giầy dép': 'CT',
  'Hàng May mặc': 'CT',
  'Hàng cá nhân': 'CT',
  'Hàng không': 'CT',
  'Hàng điện & điện tử': 'CT',
  Internet: 'CT',
  'Khai khoáng': 'CT',
  'Khai thác Than': 'CT',
  'Khai thác vàng': 'CT',
  'Kho bãi, hậu cần và bảo dưỡng': 'CT',
  'Khách sạn': 'CT',
  'Kim Loại màu': 'CT',
  'Lâm sản và Chế biến gỗ': 'CT',
  'Lốp xe': 'CT',
  'Máy công nghiệp': 'CT',
  'Môi giới chứng khoán': 'CK',
  'Ngân hàng': 'NH',
  'Nhà cung cấp thiết bị': 'CT',
  'Nhà hàng và quán bar': 'CT',
  Nhôm: 'CT',
  'Nhựa, cao su & sợi': 'CT',
  'Nuôi trồng nông & hải sản': 'CT',
  Nước: 'CT',
  'Phân phối dược phẩm': 'CT',
  'Phân phối hàng chuyên dụng': 'CT',
  'Phân phối thực phẩm': 'CT',
  'Phân phối xăng dầu & khí đốt': 'CT',
  'Phần cứng': 'CT',
  'Phần mềm': 'CT',
  'Phụ tùng ô tô': 'CT',
  'Quản lý tài sản': 'NH',
  'Sách, ấn bản & sản phẩm văn hóa': 'CT',
  'Sản phẩm hóa dầu, Nông dược & Hóa chất khác': 'CT',
  'Sản xuất & Phân phối Điện': 'CT',
  'Sản xuất bia': 'CT',
  'Sản xuất giấy': 'CT',
  'Sản xuất và Khai thác dầu khí': 'CT',
  'Sản xuất ô tô': 'CT',
  'Thiết bị gia dụng': 'CT',
  'Thiết bị viễn thông': 'CT',
  'Thiết bị và Dịch vụ Dầu khí': 'CT',
  'Thiết bị văn phòng': 'CT',
  'Thiết bị y tế': 'CT',
  'Thiết bị điện': 'CT',
  'Thuốc lá': 'CT',
  'Thép và sản phẩm thép': 'CT',
  'Thực phẩm': 'CT',
  'Tiện ích khác': 'CT',
  'Tài chính cá nhân': 'NH',
  'Tài chính đặc biệt': 'CT',
  'Tái bảo hiểm': 'BH',
  'Tư Vấn, Định giá, Môi giới Bất động sản': 'CT',
  'Tư vấn & Hỗ trợ KD': 'CT',
  'Vang & Rượu mạnh': 'CT',
  'Viễn thông cố định': 'CT',
  'Viễn thông di động': 'CT',
  'Vận tải Thủy': 'CT',
  'Vận tải hành khách & Du lịch': 'CT',
  'Vật liệu xây dựng & Nội thất': 'CT',
  'Xe tải & Đóng tàu': 'CT',
  'Xây dựng': 'CT',
  'Điện tử tiêu dùng': 'CT',
  'Đào tạo & Việc làm': 'CT',
  'Đường sắt': 'CT',
  'Đồ chơi': 'CT',
  'Đồ gia dụng lâu bền': 'CT',
  'Đồ gia dụng một lần': 'CT',
  'Đồ uống & giải khát': 'CT',
};
