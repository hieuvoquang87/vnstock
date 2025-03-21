/**
 * History module for VCI.
 */

import { LogLevel, getLogger } from '../../core/utils/logger';
import { sendRequest } from '../../core/utils/client';
import { getAssetType } from '../../core/utils/parser';
import { tradingHours } from '../../core/utils/market';
import { getHeaders } from '../../core/utils/user_agent';
import {
  ohlcToDataframe,
  OHLCDataPoint,
  intradayToDataframe,
  IntradayDataPoint,
} from '../../core/utils/transform';
import { Ticker } from './models';
import {
  _BASE_URL,
  _TRADING_URL,
  _CHART_URL,
  _INTERVAL_MAP,
  _OHLC_MAP,
  _OHLC_DTYPE,
  _RESAMPLE_MAP,
  _INTRADAY_URL,
  _INTRADAY_MAP,
  _INTRADAY_DTYPE,
  _INDEX_MAPPING,
} from './const';

const logger = getLogger('vnstock.explorer.vci.quote');

export class Quote {
  private symbol: string;
  private dataSource: string;
  private assetType: string;
  private baseUrl: string;
  private headers: Record<string, string>;
  private intervalMap: Record<string, number>;
  private showLog: boolean;

  constructor(
    symbol: string,
    randomAgent: boolean = false,
    showLog: boolean = true
  ) {
    this.symbol = symbol.toUpperCase();
    this.dataSource = 'VCI';
    this.assetType = getAssetType(this.symbol);
    this.baseUrl = _TRADING_URL;
    this.headers = getHeaders(this.dataSource);
    this.intervalMap = _INTERVAL_MAP;
    this.showLog = showLog;

    if (!showLog) {
      logger.setLevel(LogLevel.CRITICAL);
    }

    if (this.symbol.includes('INDEX')) {
      this.symbol = this.validateIndex();
    }
  }

  private validateIndex(): string {
    if (!Object.keys(_INDEX_MAPPING).includes(this.symbol)) {
      throw new Error(
        `Không tìm thấy mã chứng khoán ${
          this.symbol
        }. Các giá trị hợp lệ: ${Object.keys(_INDEX_MAPPING).join(', ')}`
      );
    }
    return _INDEX_MAPPING[this.symbol];
  }

  private validateInput(
    start: string,
    end: string | null,
    interval: string
  ): Ticker {
    if (!Object.keys(this.intervalMap).includes(interval)) {
      throw new Error(
        `Giá trị interval không hợp lệ: ${interval}. Vui lòng chọn: ${Object.keys(
          this.intervalMap
        ).join(', ')}`
      );
    }

    return new Ticker(
      this.symbol,
      start,
      end || new Date().toISOString().split('T')[0],
      interval
    );
  }

  /**
   * Tải lịch sử giá của mã chứng khoán từ nguồn dữ liệu VCI.
   *
   * @param start - Thời gian bắt đầu lấy dữ liệu, có thể là ngày dạng string kiểu "YYYY-MM-DD"
   * @param end - Thời gian kết thúc lấy dữ liệu. Mặc định là null, chương trình tự động lấy thời điểm hiện tại.
   * @param interval - Khung thời gian trích xuất dữ liệu giá lịch sử. Giá trị nhận: 1m, 5m, 15m, 30m, 1H, 1D, 1W, 1M. Mặc định là "1D".
   * @param toJson - Chuyển đổi dữ liệu lịch sử trả về dưới dạng JSON. Mặc định là false.
   * @param showLog - Hiển thị thông tin log giúp debug dễ dàng. Mặc định là false.
   * @param countBack - Số lượng dữ liệu trả về từ thời điểm cuối.
   * @param floating - Số chữ số thập phân cho giá. Mặc định là 2.
   * @returns Dữ liệu lịch sử giá
   */
  async history(
    start: string,
    end: string | null = null,
    interval: string = '1D',
    toJson: boolean = false,
    showLog: boolean = false,
    countBack: number | null = null,
    floating: number = 2
  ): Promise<OHLCDataPoint[] | string> {
    // Validate inputs
    const ticker = this.validateInput(start, end, interval);

    const startTime = new Date(ticker.start);

    // Calculate end timestamp
    let endStamp: number;
    if (end) {
      const endTime = new Date(ticker.end);
      if (startTime > endTime) {
        throw new Error(
          'Thời gian bắt đầu không thể lớn hơn thời gian kết thúc.'
        );
      }
      endStamp = Math.floor(endTime.getTime() / 1000);
    } else {
      // Add one day to current time to ensure we get today's data
      const currentTime = new Date();
      currentTime.setDate(currentTime.getDate() + 1);
      endStamp = Math.floor(currentTime.getTime() / 1000);
    }

    const startStamp = Math.floor(startTime.getTime() / 1000);
    const intervalValue = this.intervalMap[ticker.interval];

    // Prepare request
    const url = this.baseUrl + _CHART_URL;
    const payload = {
      timeFrame: intervalValue,
      symbols: [this.symbol],
      from: startStamp,
      to: endStamp,
    };

    try {
      // Use the send_request utility from api_client
      const jsonData = await sendRequest<any[]>({
        url,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      if (!jsonData || !jsonData.length) {
        throw new Error(
          'Không tìm thấy dữ liệu. Vui lòng kiểm tra lại mã chứng khoán hoặc thời gian truy xuất.'
        );
      }

      // Use the ohlc_to_df utility from data_transform
      let result = ohlcToDataframe(
        jsonData[0],
        _OHLC_MAP,
        _OHLC_DTYPE,
        this.assetType,
        this.symbol,
        this.dataSource,
        ticker.interval,
        floating,
        _RESAMPLE_MAP
      );

      if (countBack) {
        result = result.slice(-countBack);
      }

      if (toJson) {
        return JSON.stringify(result);
      }

      return result;
    } catch (error) {
      logger.error(`Error fetching history data: ${error}`);
      throw error;
    }
  }

  /**
   * Truy xuất dữ liệu khớp lệnh của mã chứng khoán bất kỳ từ nguồn dữ liệu VCI
   *
   * @param pageSize - Số lượng dữ liệu trả về trong một lần request. Mặc định là 100.
   * @param lastTime - Thời gian cắt dữ liệu, dùng để lấy dữ liệu sau thời gian cắt. Mặc định là null.
   * @param toJson - Chuyển đổi dữ liệu lịch sử trả về dưới dạng JSON. Mặc định là false.
   * @param showLog - Hiển thị thông tin log giúp debug dễ dàng. Mặc định là false.
   * @returns Dữ liệu giao dịch theo tick
   */
  async intraday(
    pageSize: number = 100,
    lastTime: string | null = null,
    toJson: boolean = false,
    showLog: boolean = false
  ): Promise<IntradayDataPoint[] | string> {
    const marketStatus = tradingHours();
    if (
      marketStatus.is_trading_hour === false &&
      marketStatus.data_status === 'preparing'
    ) {
      throw new Error(
        `${marketStatus.time}: Dữ liệu khớp lệnh không thể truy cập trong thời gian chuẩn bị phiên mới. Vui lòng quay lại sau.`
      );
    }

    if (!this.symbol) {
      throw new Error(
        'Vui lòng nhập mã chứng khoán cần truy xuất khi khởi tạo Trading Class.'
      );
    }

    if (pageSize > 30_000) {
      logger.warning(
        'Bạn đang yêu cầu truy xuất quá nhiều dữ liệu, điều này có thể gây lỗi quá tải.'
      );
    }

    const url = `${this.baseUrl}${_INTRADAY_URL}/LEData/getAll`;
    const payload = {
      symbol: this.symbol,
      limit: pageSize,
      truncTime: lastTime,
    };

    try {
      // Fetch data using the send_request utility
      const data = await sendRequest<any>({
        url,
        headers: this.headers,
        method: 'POST',
        payload,
        showLog,
      });

      // Transform data using intraday_to_df utility
      const result = intradayToDataframe(
        data,
        _INTRADAY_MAP,
        _INTRADAY_DTYPE,
        this.symbol,
        this.assetType,
        this.dataSource
      );

      if (toJson) {
        return JSON.stringify(result);
      }

      return result;
    } catch (error) {
      logger.error(`Error fetching intraday data: ${error}`);
      throw error;
    }
  }

  /**
   * Truy xuất thống kê độ bước giá & khối lượng khớp lệnh của mã chứng khoán bất kỳ từ nguồn dữ liệu VCI.
   *
   * @param toJson - Chuyển đổi dữ liệu lịch sử trả về dưới dạng JSON. Mặc định là false.
   * @param showLog - Hiển thị thông tin log giúp debug dễ dàng. Mặc định là false.
   * @returns Dữ liệu độ sâu giá
   */
  async priceDepth(
    toJson: boolean = false,
    showLog: boolean = false
  ): Promise<any[] | string> {
    const marketStatus = tradingHours();
    if (
      marketStatus.is_trading_hour === false &&
      marketStatus.data_status === 'preparing'
    ) {
      throw new Error(
        `${marketStatus.time}: Dữ liệu khớp lệnh không thể truy cập trong thời gian chuẩn bị phiên mới. Vui lòng quay lại sau.`
      );
    }

    // This is a placeholder since the implementation would require more details about the API
    // In a real implementation, we would make an API call and process the results
    logger.warning('Price depth functionality is not fully implemented');

    // Return an empty array for now
    return toJson ? '[]' : [];
  }
}
