# TCBS Company Data Implementation

## Overview

This document details the implementation of company-related functionality in the TCBS explorer. This includes company profiles, business information, ownership structures, and industry classifications.

## Company Profile API

### Endpoint Information

The TCBS company profile API provides detailed information about listed companies and their business operations.

- **Base URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company`
- **Profile Endpoint**: `/profile/{symbol}`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns company profile data with the following structure:

```json
{
  "data": {
    "symbol": "VNM",
    "companyName": "Công ty Cổ phần Sữa Việt Nam",
    "description": "Công ty chuyên sản xuất và kinh doanh các sản phẩm sữa...",
    "industry": "Thực phẩm - Đồ uống",
    "sector": "Hàng tiêu dùng",
    "foundationYear": 1976,
    "employees": 10000,
    "website": "www.vinamilk.com.vn",
    "address": "10 Tân Trào, Quận 7, TP.HCM",
    "marketCap": 168276050000000,
    "marketCapRank": 3,
    "freeFloat": 49.2,
    "stateOwnership": 36.0,
    "foreignOwnership": 58.9,
    "foreignOwnershipLimit": 100.0,
    "outstandingShares": 2089955960,
    "financialHighlights": {
      "revenue": 60000000000000,
      "profit": 11000000000000,
      "eps": 5300,
      "pe": 15.2,
      "pb": 5.4,
      "roe": 30.5
    }
  },
  "status": "success",
  "message": null
}
```

### Implementation

The company profile functionality can be implemented with the following TypeScript code:

```typescript
import { TcbsResponse, TcbsCompanyProfile } from './models';
import { TCBS_ENDPOINTS } from './const';
import { BaseExplorer } from '../base';

export class TcbsExplorer extends BaseExplorer {
  // Constructor and other methods...

  /**
   * Get company profile information
   *
   * @param symbol Stock symbol (e.g., VNM)
   * @returns Promise resolving to company profile data
   */
  async getCompanyProfile(
    symbol: string
  ): Promise<TcbsResponse<TcbsCompanyProfile>> {
    this.validateSymbol(symbol);

    const url = TCBS_ENDPOINTS.COMPANY_PROFILE(symbol);
    const response = await this.sendRequest<TcbsResponse<TcbsCompanyProfile>>(
      url,
      'GET'
    );

    return response;
  }
}
```

## Ownership Structure API

### Endpoint Information

The TCBS ownership API provides information about major shareholders and the ownership structure of listed companies.

- **Base URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company`
- **Ownership Endpoint**: `/ownership/{symbol}`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns ownership data with the following structure:

```json
{
  "data": {
    "majorShareholders": [
      {
        "name": "Tổng Công ty Đầu tư và Kinh doanh vốn Nhà nước",
        "ownershipPct": 36.0,
        "shares": 752383410,
        "type": "Organization",
        "reportDate": "2023-03-31"
      },
      {
        "name": "F&N Dairy Investments Pte Ltd",
        "ownershipPct": 20.01,
        "shares": 418190270,
        "type": "Organization",
        "reportDate": "2023-03-31"
      }
    ],
    "ownershipSummary": {
      "stateOwnership": 36.0,
      "foreignOwnership": 58.9,
      "otherInstitutions": 3.1,
      "individuals": 2.0
    }
  },
  "status": "success",
  "message": null
}
```

### Implementation

The ownership structure functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Get ownership structure information
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @returns Promise resolving to ownership structure data
 */
async getOwnershipStructure(symbol: string): Promise<TcbsResponse<TcbsOwnershipResponse['data']>> {
  this.validateSymbol(symbol);

  const url = `${this.baseUrl}/tcanalysis/v1/company/ownership/${symbol}`;
  const response = await this.sendRequest<TcbsResponse<TcbsOwnershipResponse['data']>>(
    url,
    'GET'
  );

  return response;
}
```

## Industry Classification API

### Endpoint Information

The TCBS industry classification API provides industry and sector information for stocks.

- **Base URL**: `https://apipubaws.tcbs.com.vn/market/v1`
- **Industry Endpoint**: `/industry`
- **Method**: GET
- **Optional Parameters**:
  - `level`: Industry classification level (default: 3)
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns industry classification data with the following structure:

```json
{
  "data": [
    {
      "industryCode": "1000",
      "industryName": "Financials",
      "parentCode": null,
      "level": 1,
      "stocks": []
    },
    {
      "industryCode": "1010",
      "industryName": "Banks",
      "parentCode": "1000",
      "level": 2,
      "stocks": []
    },
    {
      "industryCode": "1011",
      "industryName": "Commercial Banks",
      "parentCode": "1010",
      "level": 3,
      "stocks": ["VCB", "TCB", "BID", "CTG", "MBB"]
    }
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The industry classification functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Industry classification data
 */
interface TcbsIndustry {
  industryCode: string;
  industryName: string;
  parentCode: string | null;
  level: number;
  stocks: string[];
}

/**
 * Get industry classification
 *
 * @param level Industry classification level (1-4)
 * @returns Promise resolving to industry classification data
 */
async getIndustries(level: number = 3): Promise<TcbsResponse<TcbsIndustry[]>> {
  if (level < 1 || level > 4) {
    throw new Error('Industry level must be between 1 and 4');
  }

  const url = `${TCBS_ENDPOINTS.INDUSTRY}?level=${level}`;
  const response = await this.sendRequest<TcbsResponse<TcbsIndustry[]>>(
    url,
    'GET'
  );

  return response;
}

/**
 * Get stocks in a specific industry
 *
 * @param industryCode The industry code
 * @returns Promise resolving to list of stocks in the industry
 */
async getStocksByIndustry(industryCode: string): Promise<string[]> {
  const industries = await this.getIndustries(4);

  // Find the industry or its sub-industries
  const matchingIndustries = industries.data.filter(
    industry => industry.industryCode === industryCode ||
                industry.parentCode === industryCode
  );

  // Extract all stocks from matching industries
  const stocks = new Set<string>();
  matchingIndustries.forEach(industry => {
    industry.stocks.forEach(stock => stocks.add(stock));
  });

  return Array.from(stocks);
}
```

## Company Fundamentals API

### Endpoint Information

The TCBS company fundamentals API provides key financial metrics and business indicators.

- **Base URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company`
- **Fundamentals Endpoint**: `/fundamental/{symbol}`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns fundamental data with the following structure:

```json
{
  "data": {
    "symbol": "VNM",
    "companyName": "Công ty Cổ phần Sữa Việt Nam",
    "marketCap": 168276050000000,
    "industryCode": "3020",
    "industryName": "Food & Beverages",
    "fundamentals": {
      "revenue": {
        "latestValue": 60000000000000,
        "growthYoY": 8.5,
        "growthQoQ": 2.1
      },
      "profit": {
        "latestValue": 11000000000000,
        "growthYoY": 6.3,
        "growthQoQ": 1.8
      },
      "pe": 15.2,
      "pb": 5.4,
      "ps": 2.8,
      "roe": 30.5,
      "roa": 22.7,
      "debtToEquity": 0.21,
      "beta": 0.68
    }
  },
  "status": "success",
  "message": null
}
```

### Implementation

The company fundamentals functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Company fundamental data
 */
interface TcbsFundamental {
  symbol: string;
  companyName: string;
  marketCap: number;
  industryCode: string;
  industryName: string;
  fundamentals: {
    revenue: {
      latestValue: number;
      growthYoY: number;
      growthQoQ: number;
    };
    profit: {
      latestValue: number;
      growthYoY: number;
      growthQoQ: number;
    };
    pe: number;
    pb: number;
    ps: number;
    roe: number;
    roa: number;
    debtToEquity: number;
    beta: number;
  };
}

/**
 * Get company fundamental data
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @returns Promise resolving to company fundamental data
 */
async getCompanyFundamentals(symbol: string): Promise<TcbsResponse<TcbsFundamental>> {
  this.validateSymbol(symbol);

  const url = `${this.baseUrl}/tcanalysis/v1/company/fundamental/${symbol}`;
  const response = await this.sendRequest<TcbsResponse<TcbsFundamental>>(
    url,
    'GET'
  );

  return response;
}
```

## Key Officers API

### Endpoint Information

The TCBS key officers API provides information about the company's executives and board members.

- **Base URL**: `https://apipubaws.tcbs.com.vn/tcanalysis/v1/company`
- **Officers Endpoint**: `/officers/{symbol}`
- **Method**: GET
- **Rate Limit**: Unknown (implement throttling as precaution)
- **Authentication**: None required for public endpoints

### Data Structure

The API returns key officers data with the following structure:

```json
{
  "data": [
    {
      "name": "Mai Kiều Liên",
      "position": "CEO",
      "appointmentDate": "2018-04-01",
      "profile": "Bà Mai Kiều Liên gia nhập Vinamilk từ năm 1984...",
      "shareholding": 578900
    },
    {
      "name": "Lê Thị Băng Tâm",
      "position": "Chairwoman",
      "appointmentDate": "2015-04-01",
      "profile": "Bà Lê Thị Băng Tâm từng giữ chức vụ...",
      "shareholding": 245600
    }
  ],
  "status": "success",
  "message": null
}
```

### Implementation

The key officers functionality can be implemented with the following TypeScript code:

```typescript
// Add to the TcbsExplorer class

/**
 * Company officer information
 */
interface TcbsOfficer {
  name: string;
  position: string;
  appointmentDate: string;
  profile: string;
  shareholding: number;
}

/**
 * Get key officers of a company
 *
 * @param symbol Stock symbol (e.g., VNM)
 * @returns Promise resolving to key officers data
 */
async getKeyOfficers(symbol: string): Promise<TcbsResponse<TcbsOfficer[]>> {
  this.validateSymbol(symbol);

  const url = `${this.baseUrl}/tcanalysis/v1/company/officers/${symbol}`;
  const response = await this.sendRequest<TcbsResponse<TcbsOfficer[]>>(
    url,
    'GET'
  );

  return response;
}
```

## Error Handling

The TCBS company data APIs may return various error responses that should be properly handled:

1. **Invalid Symbol**: When the provided symbol doesn't exist
2. **Rate Limiting**: When too many requests are made in a short period
3. **Service Unavailable**: When the TCBS service is down

Error handling should be implemented using the same approach outlined in the quote module documentation.

## Usage Examples

### Getting Company Profile

```typescript
const tcbsExplorer = new TcbsExplorer();

const getCompanyInfo = async () => {
  try {
    const profile = await tcbsExplorer.getCompanyProfile('VNM');

    console.log(`Company: ${profile.data.companyName}`);
    console.log(`Industry: ${profile.data.industry}`);
    console.log(`Employees: ${profile.data.employees}`);
    console.log(`Market Cap: ${profile.data.marketCap / 1e12} trillion VND`);
    console.log(`Foreign Ownership: ${profile.data.foreignOwnership}%`);

    // Financial highlights
    if (profile.data.financialHighlights) {
      console.log('\nFinancial Highlights:');
      console.log(
        `Revenue: ${profile.data.financialHighlights.revenue / 1e9} billion VND`
      );
      console.log(
        `Profit: ${profile.data.financialHighlights.profit / 1e9} billion VND`
      );
      console.log(`EPS: ${profile.data.financialHighlights.eps} VND`);
      console.log(`P/E: ${profile.data.financialHighlights.pe}`);
      console.log(`ROE: ${profile.data.financialHighlights.roe}%`);
    }
  } catch (error) {
    console.error('Error fetching company profile:', error);
  }
};
```

### Getting Ownership Structure

```typescript
const tcbsExplorer = new TcbsExplorer();

const getOwnershipInfo = async () => {
  try {
    const ownership = await tcbsExplorer.getOwnershipStructure('VNM');

    console.log('Ownership Summary:');
    const summary = ownership.data.ownershipSummary;
    console.log(`State Ownership: ${summary.stateOwnership}%`);
    console.log(`Foreign Ownership: ${summary.foreignOwnership}%`);
    console.log(`Other Institutions: ${summary.otherInstitutions}%`);
    console.log(`Individuals: ${summary.individuals}%`);

    console.log('\nMajor Shareholders:');
    ownership.data.majorShareholders.forEach((shareholder, index) => {
      console.log(
        `${index + 1}. ${shareholder.name} (${shareholder.ownershipPct}%)`
      );
    });
  } catch (error) {
    console.error('Error fetching ownership data:', error);
  }
};
```

### Getting Industry Classification

```typescript
const tcbsExplorer = new TcbsExplorer();

const getIndustryInfo = async () => {
  try {
    // Get industries at sector level (level 1)
    const sectors = await tcbsExplorer.getIndustries(1);
    console.log('Sectors:');
    sectors.data.forEach((sector) => {
      console.log(`- ${sector.industryName} (${sector.industryCode})`);
    });

    // Get detailed industries (level 3)
    const industries = await tcbsExplorer.getIndustries(3);
    console.log('\nIndustries:');
    industries.data
      .filter((industry) => industry.parentCode === '1000') // Example: Filter financial industries
      .forEach((industry) => {
        console.log(`- ${industry.industryName} (${industry.industryCode})`);
      });

    // Get stocks in a specific industry
    const bankStocks = await tcbsExplorer.getStocksByIndustry('1011'); // Commercial Banks
    console.log('\nBank Stocks:');
    console.log(bankStocks.join(', '));
  } catch (error) {
    console.error('Error fetching industry data:', error);
  }
};
```

## Implementation Considerations

1. **Caching**: Consider implementing a caching mechanism for company data, especially for industry classifications which rarely change.
2. **Rate Limiting**: Implement rate limiting to avoid exceeding TCBS API limits.
3. **Data Transformation**: Provide methods to transform the financial values to more readable formats (e.g., billions or trillions).
4. **Error Handling**: Implement comprehensive error handling for all API calls.
5. **Cross-Referencing**: Provide methods to cross-reference company data with financial data and market data.

## Related Documentation

- [TCBS Models](./models.md) - Data models used in these implementations
- [TCBS Constants](./const.md) - Constants and API endpoints
- [TCBS Explorer Overview](./index.md) - Overview of the TCBS explorer
