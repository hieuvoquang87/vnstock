/**
 * Utility for managing user agent strings and request headers
 */

/**
 * List of common user agents
 */
export const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
];

/**
 * Generate a random user agent string
 * @returns A random user agent string
 */
export function generateUserAgent(): string {
  const randomIndex = Math.floor(Math.random() * USER_AGENTS.length);
  return USER_AGENTS[randomIndex];
}

/**
 * Data source specific headers
 */
const DATA_SOURCE_HEADERS: Record<string, Record<string, string>> = {
  VCI: {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    Origin: 'https://finance.vietstock.vn',
    Referer: 'https://finance.vietstock.vn/',
    'X-Requested-With': 'XMLHttpRequest',
  },
  TCBS: {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    Origin: 'https://tcinvest.tcbs.com.vn',
    Referer: 'https://tcinvest.tcbs.com.vn/',
    'X-Requested-With': 'XMLHttpRequest',
  },
  SSI: {
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Content-Type': 'application/json',
    Origin: 'https://iboard.ssi.com.vn',
    Referer: 'https://iboard.ssi.com.vn/',
    'X-Requested-With': 'XMLHttpRequest',
  },
};

/**
 * Get headers for a specific data source
 * @param source - The data source to get headers for
 * @returns Headers for the specified data source
 */
export function getHeaders(source: string): Record<string, string> {
  const baseHeaders = DATA_SOURCE_HEADERS[source] || {};
  return {
    ...baseHeaders,
    'User-Agent': generateUserAgent(),
  };
}
