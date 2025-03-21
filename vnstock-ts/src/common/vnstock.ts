import { getLogger, LogLevel } from '../core/utils/logger';
import { StockComponents, MSNComponents, Fund } from './data/data_explorer';

const logger = getLogger('vnstock.common.vnstock');

/**
 * Main class for the vnstock library
 */
export class Vnstock {
  /**
   * Supported data sources
   */
  public static SUPPORTED_SOURCES: string[] = ['VCI', 'TCBS', 'MSN'];

  /**
   * Symbol mappings for different data sources
   */
  public static msn_symbol_map: Record<string, string> = {}; // This should be populated from constants

  private symbol: string | null;
  private source: string;
  private showLog: boolean;

  /**
   * Constructor for the Vnstock class
   *
   * @param symbol - The stock symbol to query
   * @param source - The data source to use (default: 'VCI')
   * @param showLog - Whether to show log messages (default: true)
   */
  constructor(
    symbol: string | null = null,
    source: string = 'VCI',
    showLog: boolean = true
  ) {
    this.symbol = symbol;
    this.source = source.toUpperCase();
    this.showLog = showLog;

    if (!Vnstock.SUPPORTED_SOURCES.includes(this.source)) {
      throw new Error(
        `Hiện tại chỉ có nguồn dữ liệu từ ${Vnstock.SUPPORTED_SOURCES.join(
          ', '
        )} được hỗ trợ.`
      );
    }

    if (!showLog) {
      logger.setLevel(LogLevel.CRITICAL);
    }
  }

  /**
   * Get stock data
   *
   * @param symbol - The stock symbol to query
   * @param source - The data source to use (defaults to the instance source)
   * @returns Stock components
   */
  public stock(
    symbol: string | null = null,
    source: string | null = null
  ): StockComponents {
    if (symbol === null) {
      this.symbol = 'VN30F1M';
      logger.info(
        'Mã chứng khoán không được chỉ định, chương trình mặc định sử dụng VN30F1M'
      );
    } else {
      this.symbol = symbol;
    }

    if (source === null) {
      source = this.source;
    } else {
      this.symbol = symbol;
    }

    return new StockComponents(this.symbol || '', source, this.showLog);
  }

  /**
   * Get forex data
   *
   * @param symbol - The forex symbol to query (default: 'EURUSD')
   * @param source - The data source to use (default: 'MSN')
   * @returns MSN components
   */
  public fx(symbol: string = 'EURUSD', source: string = 'MSN'): MSNComponents {
    if (symbol) {
      this.symbol = Vnstock.msn_symbol_map[symbol];
    }
    return new MSNComponents(this.symbol || '', source);
  }

  /**
   * Get cryptocurrency data
   *
   * @param symbol - The cryptocurrency symbol to query (default: 'BTC')
   * @param source - The data source to use (default: 'MSN')
   * @returns MSN components
   */
  public crypto(symbol: string = 'BTC', source: string = 'MSN'): MSNComponents {
    if (symbol) {
      this.symbol = Vnstock.msn_symbol_map[symbol];
    }
    return new MSNComponents(this.symbol || '', source);
  }

  /**
   * Get world index data
   *
   * @param symbol - The index symbol to query (default: 'DJI')
   * @param source - The data source to use (default: 'MSN')
   * @returns MSN components
   */
  public worldIndex(
    symbol: string = 'DJI',
    source: string = 'MSN'
  ): MSNComponents {
    if (symbol) {
      this.symbol = Vnstock.msn_symbol_map[symbol];
    }
    return new MSNComponents(this.symbol || '', source);
  }

  /**
   * Get fund data
   *
   * @param source - The data source to use (default: 'FMARKET')
   * @returns Fund components
   */
  public fund(source: string = 'FMARKET'): Fund {
    return new Fund(source);
  }
}
