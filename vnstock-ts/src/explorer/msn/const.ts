/**
 * Constants for MSN data source
 */

export const MSN_ENDPOINTS = {
  BASE_URL: 'https://api.msn.com',
  QUOTE: '/api/quote',
  HISTORICAL: '/api/history',
  INTRADAY: '/api/intraday',
  LISTING: '/api/listing',
};

export const MSN_INTERVAL_MAP = {
  '1D': 'D',
  '1W': 'W',
  '1M': 'M',
};

export const MSN_EXCHANGE_MAP = {
  HOSE: 'HOSE',
  HNX: 'HNX',
  UPCOM: 'UPCOM',
};
