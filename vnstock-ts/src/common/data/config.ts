import { LogLevel, getLogger } from '../../core/utils/logger';

const logger = getLogger('vnstock.common.data.config');

export class Config {
  static DEFAULT_SOURCE: string = 'VCI';
  static DEFAULT_TIMEOUT: number = 30000; // milliseconds
  static DEFAULT_RETRIES: number = 3;
  static CACHE_SIZE: number = 128;
  static LOG_LEVEL: LogLevel = LogLevel.INFO;

  static setup(config: Partial<typeof Config>): void {
    for (const [key, value] of Object.entries(config)) {
      if (key in Config) {
        (Config as any)[key] = value;
        logger.info(`Updated config: ${key}=${value}`);
      }
    }
  }
}
