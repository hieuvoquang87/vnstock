/**
 * Module for managing company information from VCI data source.
 */

import { getLogger, LogLevel } from '../../core/utils/logger';
import { sendRequest } from '../../core/utils/client';
import { getAssetType } from '../../core/utils/parser';
import { getHeaders } from '../../core/utils/user_agent';
import { _GRAPHQL_URL } from './const';
import { BaseExplorer } from '../base';
import { ApiResponse } from '../../types/api';
import { DataSource } from '../../types/config';
import axios from 'axios';
import { cleanHtml, camelToSnake } from '../../core/utils/parser';
import { generateUserAgent } from '../../core/utils/user_agent';

const logger = getLogger('vnstock.explorer.vci.company');

// Function to generate unique request ID for GraphQL API
function generateRequestId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
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

export interface CompanyEvents {
  symbol: string;
  name: string;
  date: string;
  purpose: string;
  eventType: string;
  exerciseDate: string;
  lastRegistrationDate: string;
  eventStatus: string;
  actualValue: number;
  expectedValue?: number;
  note?: string;
}

export interface CompanyNews {
  id: string;
  title: string;
  content: string;
  source: string;
  symbol: string;
  publishDate: string;
  url: string;
}

/**
 * VCI Explorer class for company information
 */
export class VciCompanyExplorer extends BaseExplorer {
  constructor() {
    super(DataSource.VCI);
    // Set any specific headers required for VCI
    this.setHeaders({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    });
  }

  /**
   * Get company profile information
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to company profile
   */
  async getCompanyProfile(
    symbol: string
  ): Promise<ApiResponse<CompanyProfile | null>> {
    try {
      this.validateSymbol(symbol);

      const url = _GRAPHQL_URL;

      // GraphQL query for company profile
      const query = {
        operationName: 'CompanyInfo',
        variables: {
          ticker: symbol,
          language: 'vi',
        },
        query: `
          query CompanyInfo($ticker: String!, $language: String) {
            CompanyListingInfo(ticker: $ticker) {
              id
              issueShare
              history
              companyProfile
              icbName3
              icbName2
              organName
              website
              address
              phone
              fax
              email
              __typename
            }
            TickerPriceInfo(ticker: $ticker) {
              ticker
              exchange
              __typename
            }
          }
        `,
      };

      logger.debug(`Requesting company profile for ${symbol}`);

      const response = await axios.post(url, query, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': generateUserAgent(),
          'X-Requested-With': 'XMLHttpRequest',
          'X-QuantEdge-Request-Id': generateRequestId(),
        },
        timeout: 30000,
      });

      if (!response?.data?.data) {
        return {
          data: {
            symbol,
            companyName: '',
            exchange: '',
            industry: '',
            sector: '',
            businessAreas: '',
            listingDate: '',
            foundingDate: '',
            website: '',
            address: '',
            phone: '',
            fax: '',
            email: '',
          },
          status: 'error',
          message: 'Failed to fetch company profile',
        };
      }

      const data = response.data.data;
      const companyData = data.CompanyListingInfo;
      const exchangeData = data.TickerPriceInfo;

      if (!companyData) {
        return {
          data: {
            symbol,
            companyName: '',
            exchange: '',
            industry: '',
            sector: '',
            businessAreas: '',
            listingDate: '',
            foundingDate: '',
            website: '',
            address: '',
            phone: '',
            fax: '',
            email: '',
          },
          status: 'error',
          message: 'No company data found',
        };
      }

      // Clean HTML and extract meaningful content
      const companyProfile = cleanHtml(companyData.companyProfile || '');
      const businessAreas = cleanHtml(companyData.history || '');

      return {
        data: {
          symbol,
          companyName: companyData.organName || '',
          exchange: exchangeData?.exchange || '',
          industry: companyData.icbName3 || '',
          sector: companyData.icbName2 || '',
          businessAreas: businessAreas,
          listingDate: '', // Not directly available in the response
          foundingDate: '', // Not directly available in the response
          website: companyData.website || '',
          address: companyData.address || '',
          phone: companyData.phone || '',
          fax: companyData.fax || '',
          email: companyData.email || '',
        },
        status: 'success',
        message: 'Successfully fetched company profile',
      };
    } catch (error) {
      return {
        data: {
          symbol,
          companyName: '',
          exchange: '',
          industry: '',
          sector: '',
          businessAreas: '',
          listingDate: '',
          foundingDate: '',
          website: '',
          address: '',
          phone: '',
          fax: '',
          email: '',
        },
        status: 'error',
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Validate stock symbol format
   *
   * @param symbol Stock symbol to validate
   * @throws Error if symbol is invalid
   */
  private validateSymbol(symbol: string): void {
    if (!symbol || typeof symbol !== 'string' || symbol.length < 3) {
      throw new Error(`Invalid stock symbol: ${symbol}`);
    }
  }
}

export class Company {
  private symbol: string;
  private assetType: string;
  private headers: Record<string, string>;
  private showLog: boolean;
  private dataCache: Record<string, any> = {};

  /**
   * Retrieve information about a company by stock symbol from VCI data source.
   *
   * @param symbol - Stock symbol of the company to retrieve information.
   * @param showLog - Show log information for debugging. Default is true.
   */
  constructor(symbol: string, showLog: boolean = true) {
    this.symbol = symbol.toUpperCase();
    this.assetType = getAssetType(this.symbol);
    this.headers = getHeaders('VCI');
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel(LogLevel.CRITICAL);
    }

    // If asset type is not a stock, raise an error
    if (this.assetType !== 'stock') {
      throw new Error(
        'Invalid stock symbol. Only stocks have company information.'
      );
    }
  }

  /**
   * Fetch data for the company from the VCI GraphQL API.
   * This method is internal but exposed for use by other modules.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Company data object
   */
  public async _fetchData(showLog: boolean = this.showLog): Promise<any> {
    // Use cache if available
    const cacheKey = this.symbol;
    if (this.dataCache[cacheKey]) {
      return this.dataCache[cacheKey];
    }

    // GraphQL query to fetch company data
    const payload = {
      query: `query CompanyInfo($symbol: String!) {
        CompanyListingInfo(symbol: $symbol) {
          comGroupCode
          exchange
          exchange_vi
          exchangeName
          icbCode
          icbName
          icbName2
          icbName3
          icbName4
          industry
          industry_vi
          isBank
          isInsurance
          isSecurities
          mainSector
          noSectors
          organCode
          organName
          organShortName
          organTypeCode
          ticker
        }
        CompanyProfile(symbol: $symbol) {
          address
          businessLicense
          businessType
          charterCapital
          companyProfile
          email
          employeeNumber
          fax
          foreignRate
          industryCode
          industryName
          issuedDate
          listingDate
          officeAddress
          officeName
          organCode
          organName
          organTypeCode
          owner
          phone
          stateRate
          taxIDNumber
          ticker
          website
        }
      }`,
      variables: {
        symbol: this.symbol,
      },
    };

    if (showLog) {
      logger.info(`Fetching company data for ${this.symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      // Cache the result
      this.dataCache[cacheKey] = responseData.data;
      return responseData.data;
    } catch (error) {
      logger.error(`Error fetching company data: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch company overview information.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Company overview information
   */
  public async overview(showLog: boolean = this.showLog): Promise<any> {
    try {
      const data = await this._fetchData(showLog);

      if (!data) {
        throw new Error(`No data found for company ${this.symbol}`);
      }

      // Process and return the overview data
      return {
        symbol: this.symbol,
        companyName: data.CompanyProfile.organName,
        exchange: data.CompanyListingInfo.exchange,
        industry: data.CompanyListingInfo.industry,
        icbSector: data.CompanyListingInfo.icbName,
        businessAreas: data.CompanyProfile.businessType || '',
        listingDate: data.CompanyProfile.listingDate,
        charterCapital: data.CompanyProfile.charterCapital,
        foreignRate: data.CompanyProfile.foreignRate,
        stateRate: data.CompanyProfile.stateRate,
        employeeNumber: data.CompanyProfile.employeeNumber,
      };
    } catch (error) {
      logger.error(`Error getting company overview: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch detailed company profile information.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Detailed company profile
   */
  public async profile(
    showLog: boolean = this.showLog
  ): Promise<CompanyProfile> {
    try {
      const data = await this._fetchData(showLog);

      if (!data || !data.CompanyProfile) {
        throw new Error(`No profile data found for company ${this.symbol}`);
      }

      // Process and return the profile data
      return {
        symbol: this.symbol,
        companyName: data.CompanyProfile.organName,
        exchange: data.CompanyListingInfo.exchange,
        industry: data.CompanyListingInfo.industry,
        sector: data.CompanyListingInfo.icbName,
        businessAreas: data.CompanyProfile.businessType || '',
        listingDate: data.CompanyProfile.listingDate,
        foundingDate: data.CompanyProfile.issuedDate,
        website: data.CompanyProfile.website,
        address: data.CompanyProfile.address,
        phone: data.CompanyProfile.phone,
        fax: data.CompanyProfile.fax,
        email: data.CompanyProfile.email,
      };
    } catch (error) {
      logger.error(`Error getting company profile: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch information about major shareholders of the company.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of major shareholders
   */
  public async shareholders(showLog: boolean = this.showLog): Promise<any[]> {
    // GraphQL query to fetch shareholders data
    const payload = {
      query: `query Query($symbol: String!) {
        CompanyMajorHolders(symbol: $symbol) {
          fullName
          position
          shareNumber
          sharePercent
        }
      }`,
      variables: {
        symbol: this.symbol,
      },
    };

    if (showLog) {
      logger.info(`Fetching shareholders data for ${this.symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.CompanyMajorHolders) {
        return [];
      }

      // Process and return shareholders data
      return responseData.data.CompanyMajorHolders.map((holder: any) => ({
        shareholder: holder.fullName,
        position: holder.position,
        shares: holder.shareNumber,
        percentage: holder.sharePercent,
      }));
    } catch (error) {
      logger.error(`Error fetching shareholders data: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch insider trading information for the company.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of insider transactions
   */
  public async insiderDeals(showLog: boolean = this.showLog): Promise<any[]> {
    // GraphQL query to fetch insider deals data
    const payload = {
      query: `query Query($symbol: String!) {
        CompanyInsiderDeals(symbol: $symbol) {
          announcementDate
          dealMethod
          dealStatus
          dealType
          expectedEndDate
          expectedStartDate
          holderName
          holderPosition
          registerVolume
          transactionDate
          volumeBeforeDeal
          volumeAfterDeal
        }
      }`,
      variables: {
        symbol: this.symbol,
      },
    };

    if (showLog) {
      logger.info(`Fetching insider deals data for ${this.symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.CompanyInsiderDeals) {
        return [];
      }

      // Process and return insider deals data
      return responseData.data.CompanyInsiderDeals.map((deal: any) => ({
        announcementDate: deal.announcementDate,
        transactionDate: deal.transactionDate,
        holderName: deal.holderName,
        position: deal.holderPosition,
        dealType: deal.dealType,
        dealMethod: deal.dealMethod,
        volumeBefore: deal.volumeBeforeDeal,
        volumeAfter: deal.volumeAfterDeal,
        registerVolume: deal.registerVolume,
        dealStatus: deal.dealStatus,
        expectedStartDate: deal.expectedStartDate,
        expectedEndDate: deal.expectedEndDate,
      }));
    } catch (error) {
      logger.error(`Error fetching insider deals data: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch subsidiary companies information.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of subsidiary companies
   */
  public async subsidiaries(showLog: boolean = this.showLog): Promise<any[]> {
    // GraphQL query to fetch subsidiaries data
    const payload = {
      query: `query Query($symbol: String!) {
        CompanySubsidiaries(symbol: $symbol) {
          businessLine
          charter
          isListed
          ownershipPercentage
          subsidiaryName
          ticker
        }
      }`,
      variables: {
        symbol: this.symbol,
      },
    };

    if (showLog) {
      logger.info(`Fetching subsidiaries data for ${this.symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.CompanySubsidiaries) {
        return [];
      }

      // Process and return subsidiaries data
      return responseData.data.CompanySubsidiaries.map((sub: any) => ({
        name: sub.subsidiaryName,
        ticker: sub.ticker,
        isListed: sub.isListed,
        businessLine: sub.businessLine,
        charter: sub.charter,
        ownershipPercentage: sub.ownershipPercentage,
      }));
    } catch (error) {
      logger.error(`Error fetching subsidiaries data: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch information about company officers and management.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of company officers
   */
  public async officers(showLog: boolean = this.showLog): Promise<any[]> {
    // GraphQL query to fetch officers data
    const payload = {
      query: `query Query($symbol: String!) {
        CompanyOfficers(symbol: $symbol) {
          gender
          name
          position
          title
        }
      }`,
      variables: {
        symbol: this.symbol,
      },
    };

    if (showLog) {
      logger.info(`Fetching officers data for ${this.symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.CompanyOfficers) {
        return [];
      }

      // Process and return officers data
      return responseData.data.CompanyOfficers.map((officer: any) => ({
        name: officer.name,
        position: officer.position,
        title: officer.title,
        gender: officer.gender,
      }));
    } catch (error) {
      logger.error(`Error fetching officers data: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch upcoming events for the company.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of company events
   */
  public async events(
    showLog: boolean = this.showLog
  ): Promise<CompanyEvents[]> {
    // GraphQL query to fetch events data
    const payload = {
      query: `query Query($symbol: String!) {
        CompanyEvents(symbol: $symbol) {
          actualValue
          date
          eventStatus
          eventType
          exerciseDate
          expectedValue
          lastRegistrationDate
          name
          note
          purpose
          symbol
        }
      }`,
      variables: {
        symbol: this.symbol,
      },
    };

    if (showLog) {
      logger.info(`Fetching events data for ${this.symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.CompanyEvents) {
        return [];
      }

      // Process and return events data
      return responseData.data.CompanyEvents.map(
        (event: any): CompanyEvents => ({
          symbol: event.symbol,
          name: event.name,
          date: event.date,
          purpose: event.purpose,
          eventType: event.eventType,
          exerciseDate: event.exerciseDate,
          lastRegistrationDate: event.lastRegistrationDate,
          eventStatus: event.eventStatus,
          actualValue: event.actualValue,
          expectedValue: event.expectedValue,
          note: event.note,
        })
      );
    } catch (error) {
      logger.error(`Error fetching events data: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch news related to the company.
   *
   * @param limit - Maximum number of news items to return. Default is 10.
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of news items
   */
  public async news(
    limit: number = 10,
    showLog: boolean = this.showLog
  ): Promise<CompanyNews[]> {
    // GraphQL query to fetch news data
    const payload = {
      query: `query Query($symbol: String!, $limit: Int!) {
        CompanyNews(symbol: $symbol, limit: $limit) {
          content
          id
          publishDate
          source
          symbol
          title
          url
        }
      }`,
      variables: {
        symbol: this.symbol,
        limit,
      },
    };

    if (showLog) {
      logger.info(`Fetching news data for ${this.symbol}, limit: ${limit}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.CompanyNews) {
        return [];
      }

      // Process and return news data
      return responseData.data.CompanyNews.map(
        (news: any): CompanyNews => ({
          id: news.id,
          title: news.title,
          content: news.content,
          source: news.source,
          symbol: news.symbol,
          publishDate: news.publishDate,
          url: news.url,
        })
      );
    } catch (error) {
      logger.error(`Error fetching news data: ${error}`);
      throw error;
    }
  }

  /**
   * Fetch dividend history for the company.
   *
   * @param showLog - Show log information. Default is the instance's showLog value.
   * @returns Array of dividend events
   */
  public async dividends(showLog: boolean = this.showLog): Promise<any[]> {
    // GraphQL query to fetch dividend data
    const payload = {
      query: `query Query($symbol: String!) {
        CompanyDividends(symbol: $symbol) {
          cash
          cashYear
          closedDate
          eventTypeName
          exerciseDate
          issueDate
          lastRegistrationDate
          publicDate
          ratio
          stock
          stockYear
          year
        }
      }`,
      variables: {
        symbol: this.symbol,
      },
    };

    if (showLog) {
      logger.info(`Fetching dividend data for ${this.symbol}`);
    }

    try {
      // Use sendRequest instead of direct fetch
      const responseData = await sendRequest<any>({
        url: _GRAPHQL_URL,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!responseData.data || !responseData.data.CompanyDividends) {
        return [];
      }

      // Process and return dividend data
      return responseData.data.CompanyDividends.map((div: any) => ({
        year: div.year,
        cashYear: div.cashYear,
        stockYear: div.stockYear,
        eventType: div.eventTypeName,
        cash: div.cash,
        stock: div.stock,
        ratio: div.ratio,
        issueDate: div.issueDate,
        exerciseDate: div.exerciseDate,
        lastRegistrationDate: div.lastRegistrationDate,
        publicDate: div.publicDate,
        closedDate: div.closedDate,
      }));
    } catch (error) {
      logger.error(`Error fetching dividend data: ${error}`);
      throw error;
    }
  }
}
