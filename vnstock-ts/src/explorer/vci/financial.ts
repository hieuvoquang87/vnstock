/**
 * VCI Finance Explorer Module
 */
import axios from 'axios';
import { getLogger } from '../../core/utils/logger';
import { formatPrice, camelToSnake } from '../../core/utils/parser';
import { generateUserAgent } from '../../core/utils/user_agent';
import {
  _GRAPHQL_URL,
  _GROUP_CODE,
  FINANCIAL_INDICATOR_MAP,
  QUARTER_FINANCIAL_MAP,
  YEARLY_FINANCIAL_MAP,
} from './const';

// If you need to generate UUIDs and don't have uuid installed, you can use this function
function generateRequestId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const logger = getLogger('vci.financial');

/**
 * Get financial indicators information from VCI data source
 * @param symbol - Stock symbol
 * @param yearly - Whether to get yearly data (default: false)
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Financial indicators data
 */
export async function getFinancialIndicator(
  symbol: string,
  yearly: boolean = false,
  timeout: number = 30000
): Promise<any> {
  logger.debug(`Getting financial indicator for ${symbol} (yearly=${yearly})`);
  const INDICATOR_MAP = yearly ? YEARLY_FINANCIAL_MAP : QUARTER_FINANCIAL_MAP;

  try {
    const query = {
      operationName: 'CompanyFinancialRatio',
      variables: {
        symbol: symbol,
        language: 'vn',
      },
      query: `query CompanyFinancialRatio($symbol: String!, $language: String) {
        companyFinancialRatio(symbol: $symbol, language: $language) {
          symbol
          values {
            quarter
            year
            ${Object.values(INDICATOR_MAP).join('\n')}
          }
        }
      }`,
    };

    const response = await axios.post(_GRAPHQL_URL, query, {
      headers: {
        'content-type': 'application/json',
        'sec-ch-ua-platform': '"Windows"',
        'user-agent': generateUserAgent(),
        'x-quantedge-request-id': generateRequestId(),
      },
      timeout,
    });

    const data = response.data.data.companyFinancialRatio;
    if (!data || !data.values) {
      logger.error(`No financial indicator data found for ${symbol}`);
      return null;
    }

    const result = data.values.map((item: any) => {
      const transformed: Record<string, any> = {};
      Object.entries(INDICATOR_MAP).forEach(([key, value]) => {
        const snakeKey = camelToSnake(key);
        transformed[snakeKey] = formatPrice(item[value], 4);
      });

      transformed.quarter = item.quarter;
      transformed.year = item.year;
      transformed.period = `${item.quarter}/${item.year}`;

      return transformed;
    });

    return result;
  } catch (error) {
    logger.error(`Error fetching financial indicator for ${symbol}: ${error}`);
    return null;
  }
}

/**
 * Get company financial statements from VCI data source
 * @param symbol - Stock symbol
 * @param statementType - Type of financial statement (incomestatement, balancesheet, cashflow)
 * @param reportType - Type of report (quarter, year)
 * @param timeout - Timeout in milliseconds (default: 30000)
 * @returns Financial statement data
 */
export async function getFinancialStatement(
  symbol: string,
  statementType: string = 'incomestatement',
  reportType: string = 'quarter',
  timeout: number = 30000
): Promise<any> {
  logger.debug(
    `Getting financial statement for ${symbol} (statementType=${statementType}, reportType=${reportType})`
  );

  const validStatementTypes = ['incomestatement', 'balancesheet', 'cashflow'];
  const validReportTypes = ['quarter', 'year'];

  if (!validStatementTypes.includes(statementType.toLowerCase())) {
    logger.error(
      `Invalid statement type: ${statementType}. Must be one of ${validStatementTypes.join(
        ', '
      )}`
    );
    return null;
  }

  if (!validReportTypes.includes(reportType.toLowerCase())) {
    logger.error(
      `Invalid report type: ${reportType}. Must be one of ${validReportTypes.join(
        ', '
      )}`
    );
    return null;
  }

  try {
    interface QueryVariables {
      symbol: string;
      language: string;
      companyFinancialsQuarterReportFilter?: {
        symbol: string;
        type: string;
        year: number;
        quarter: number;
        isLast: boolean;
      };
      companyFinancialsYearReportFilter?: {
        symbol: string;
        type: string;
        year: number;
        isLast: boolean;
      };
    }

    // Initialize the query variables
    const variables: QueryVariables = {
      symbol: symbol,
      language: 'vn',
    };

    // Set the appropriate filter based on report type
    if (reportType.toLowerCase() === 'quarter') {
      variables.companyFinancialsQuarterReportFilter = {
        symbol: symbol,
        type: statementType.toUpperCase(),
        year: 0,
        quarter: 0,
        isLast: true,
      };
    } else {
      variables.companyFinancialsYearReportFilter = {
        symbol: symbol,
        type: statementType.toUpperCase(),
        year: 0,
        isLast: true,
      };
    }

    const query = {
      operationName: 'CompanyFinancials',
      variables: variables,
      query:
        reportType.toLowerCase() === 'quarter'
          ? `query CompanyFinancials($symbol: String!, $language: String, $companyFinancialsQuarterReportFilter: CompanyFinancialsQuarterReportFilter) {
            companyFinancialsQuarterReport(filter: $companyFinancialsQuarterReportFilter, language: $language) {
              symbol
              name
              quarterName
              yearName
              values {
                field
                description
                values {
                  quarterName
                  yearName
                  value
                }
              }
            }
          }`
          : `query CompanyFinancials($symbol: String!, $language: String, $companyFinancialsYearReportFilter: CompanyFinancialsYearReportFilter) {
            companyFinancialsYearReport(filter: $companyFinancialsYearReportFilter, language: $language) {
              symbol
              name
              yearName
              values {
                field
                description
                values {
                  yearName
                  value
                }
              }
            }
          }`,
    };

    const response = await axios.post(_GRAPHQL_URL, query, {
      headers: {
        'content-type': 'application/json',
        'sec-ch-ua-platform': '"Windows"',
        'user-agent': generateUserAgent(),
        'x-quantedge-request-id': generateRequestId(),
      },
      timeout,
    });

    const responseKey =
      reportType.toLowerCase() === 'quarter'
        ? 'companyFinancialsQuarterReport'
        : 'companyFinancialsYearReport';

    const data = response.data.data[responseKey];
    if (!data || !data.values) {
      logger.error(`No financial statement data found for ${symbol}`);
      return null;
    }

    let periodMappings: string[] = [];

    if (reportType.toLowerCase() === 'quarter') {
      const quarterPeriods = data.values.flatMap((item: any) =>
        item.values.map((v: any) => `${v.quarterName}/${v.yearName}`)
      );
      periodMappings = [...new Set(quarterPeriods)] as string[];
    } else {
      const yearPeriods = data.values.flatMap((item: any) =>
        item.values.map((v: any) => v.yearName)
      );
      periodMappings = [...new Set(yearPeriods)] as string[];
    }

    const result: Record<string, any>[] = [];

    periodMappings.forEach((period) => {
      const entry: Record<string, any> = { period };

      data.values.forEach((item: any) => {
        const fieldName = item.field;
        const description = item.description;

        if (reportType.toLowerCase() === 'quarter') {
          const [quarter, year] = period.split('/');
          const value = item.values.find(
            (v: any) => v.quarterName === quarter && v.yearName === year
          )?.value;

          entry[fieldName] = value !== undefined ? formatPrice(value, 4) : null;
          entry.description = description;
        } else {
          const value = item.values.find(
            (v: any) => v.yearName === period
          )?.value;
          entry[fieldName] = value !== undefined ? formatPrice(value, 4) : null;
          entry.description = description;
        }
      });

      result.push(entry);
    });

    return result;
  } catch (error) {
    logger.error(`Error fetching financial statement for ${symbol}: ${error}`);
    return null;
  }
}
