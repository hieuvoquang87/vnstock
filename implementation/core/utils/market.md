# Market Utilities Implementation

**Original Python Implementation**: [market.py](/vnstock/core/utils/market.py)


## Overview

The `market.py` file provides utility functions to check market trading hours and data availability status. This module is essential for determining when markets are open, what trading session is active, and whether real-time data is available.

## Functions

### `tradingHours(market?, customTime?, enableLog?, language?)`

Checks if the current time is within trading hours and provides context about data availability.

#### Parameters

- `market` (optional): Market to check ('HOSE', 'HNX', 'UPCOM', 'Futures', or null).
  - Default is 'HOSE'.
  - If null, returns simplified data based on common market hours.
- `customTime` (optional): Custom time for testing. Default is null (current time).
- `enableLog` (optional): Whether to enable detailed log messages. Default is false.
- `language` (optional): Language for messages ('en' for English, 'vi' for Vietnamese). Default is 'en'.

#### Returns

An object with the following properties:

- `is_trading_hour` (boolean): Whether it's currently trading hours
- `trading_session` (string): Current trading session type (e.g., 'pre_market', 'ato', 'continuous', 'lunch_break', 'atc', 'post_close', 'post_market', 'weekend', 'after_hours')
- `data_status` (string): Data availability status (e.g., 'historical_only', 'preparing', 'real_time', 'settling')
- `time` (string): Current time in HH:MM:SS format
- `market` (string): Market being checked or "general" if market is null

#### Throws

- `Error`: If the market parameter is not valid

## Implementation Details

### Market Schedules

The function uses predefined market schedules:

```typescript
const marketSchedules = {
  HOSE: {
    trading_start: '09:00',
    ato_end: '09:15',
    lunch_start: '11:30',
    lunch_end: '13:00',
    atc_start: '14:30',
    atc_end: '14:45',
    trading_end: '15:00',
  },
  HNX: {
    trading_start: '09:00',
    lunch_start: '11:30',
    lunch_end: '13:00',
    atc_start: '14:30',
    atc_end: '14:45',
    trading_end: '15:00',
  },
  UPCOM: {
    trading_start: '09:00',
    lunch_start: '11:30',
    lunch_end: '13:00',
    trading_end: '14:30',
  },
  Futures: {
    trading_start: '08:45',
    ato_end: '09:00',
    lunch_start: '11:30',
    lunch_end: '13:00',
    atc_start: '14:30',
    atc_end: '14:45',
    trading_end: '14:45',
  },
};
```

### Trading Sessions

The function determines the current trading session:

1. Weekend detection - checks if the current day is Saturday or Sunday
2. Pre-market - before the market opens
3. ATO (At-The-Open) - opening auction period
4. Continuous trading - regular trading session
5. Lunch break - midday pause in trading
6. ATC (At-The-Close) - closing auction period
7. Post-close - period between ATC end and trading end
8. Post-market - period immediately after market close
9. After-hours - late evening/night after market close

### Data Availability Status

The function determines the data availability status:

1. `historical_only` - only historical data is available
2. `preparing` - within 2 hours before market open
3. `real_time` - real-time data is available during market hours
4. `settling` - within 4 hours after market close when data is still being finalized

### Time Zone Handling

The function uses the Vietnam timezone (Asia/Ho_Chi_Minh) for all time calculations.

## TypeScript Implementation Example

```typescript
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBusinessDay from 'dayjs/plugin/isBusinessDay';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBusinessDay);

// Set timezone to Vietnam
const TIMEZONE = 'Asia/Ho_Chi_Minh';

interface MarketSession {
  is_trading_hour: boolean;
  trading_session: string;
  data_status: string;
  time: string;
  market: string;
}

interface MarketSchedule {
  trading_start: string;
  ato_end?: string;
  lunch_start: string;
  lunch_end: string;
  atc_start?: string;
  atc_end?: string;
  trading_end: string;
}

/**
 * Check if current time is within trading hours with data availability context
 * @param market Market to check ('HOSE', 'HNX', 'UPCOM', 'Futures', or null)
 * @param customTime Custom time for testing
 * @param enableLog Whether to enable detailed log messages
 * @param language Language for messages ('en' for English, 'vi' for Vietnamese)
 * @returns Trading status information
 */
export function tradingHours(
  market: string | null = 'HOSE',
  customTime: Date | null = null,
  enableLog: boolean = false,
  language: string = 'en'
): MarketSession {
  // Validate market parameter
  const validMarkets = ['HOSE', 'HNX', 'UPCOM', 'Futures', null];
  if (market !== null && !validMarkets.includes(market)) {
    throw new Error(
      `Unknown market: ${market}. Valid markets: HOSE, HNX, UPCOM, Futures, null`
    );
  }

  // Validate language parameter
  if (language !== 'en' && language !== 'vi') {
    language = 'en'; // Default to English if invalid
  }

  // Market schedules
  const marketSchedules: Record<string, MarketSchedule> = {
    HOSE: {
      trading_start: '09:00',
      ato_end: '09:15',
      lunch_start: '11:30',
      lunch_end: '13:00',
      atc_start: '14:30',
      atc_end: '14:45',
      trading_end: '15:00',
    },
    HNX: {
      trading_start: '09:00',
      lunch_start: '11:30',
      lunch_end: '13:00',
      atc_start: '14:30',
      atc_end: '14:45',
      trading_end: '15:00',
    },
    UPCOM: {
      trading_start: '09:00',
      lunch_start: '11:30',
      lunch_end: '13:00',
      trading_end: '14:30',
    },
    Futures: {
      trading_start: '08:45',
      ato_end: '09:00',
      lunch_start: '11:30',
      lunch_end: '13:00',
      atc_start: '14:30',
      atc_end: '14:45',
      trading_end: '14:45',
    },
  };

  // Get current time in Vietnam timezone
  let now = customTime ? dayjs(customTime).tz(TIMEZONE) : dayjs().tz(TIMEZONE);

  // Log messages
  const logMessagesEn = {
    pre_market:
      '🌅 Markets still snoozing! Your data might be wearing pajamas too.',
    ato: '🔔 ATO in progress! Prices are playing musical chairs.',
    continuous: '💸 Trading in full swing! Money printer go brrrr!',
    lunch_break:
      '🍜 Lunch break! Even algorithms need to slurp some digital noodles.',
    atc: '🏁 ATC time! Final sprint to determine closing prices.',
    post_close: '🧹 Post-close cleanup. Last chance to sweep up some bargains!',
    post_market:
      "🌙 Markets closed but data's still settling in... like your food after dinner.",
    weekend:
      '🏖️ Weekend mode! Markets closed. Time to touch grass instead of charts.',
    historical:
      '📚 Deep in after-hours territory. Only historical data here, like dinosaur fossils.',
  };

  const logMessagesVi = {
    pre_market:
      '🌅 Thị trường vẫn đang ngủ! Dữ liệu của bạn cũng có thể đang nghỉ ngơi.',
    ato: '🔔 ATO đang diễn ra! Giá cả đang định hình.',
    continuous:
      '💸 Giao dịch đang diễn ra sôi động! Thị trường đang hoạt động mạnh.',
    lunch_break: '🍜 Giờ nghỉ trưa! Ngay cả thuật toán cũng cần nghỉ ngơi.',
    atc: '🏁 Giờ ATC! Nước rút cuối cùng để xác định giá đóng cửa.',
    post_close:
      '🧹 Dọn dẹp sau giờ đóng cửa. Cơ hội cuối để giao dịch thỏa thuận!',
    post_market: '🌙 Thị trường đã đóng cửa nhưng dữ liệu vẫn đang ổn định...',
    weekend:
      '🏖️ Chế độ cuối tuần! Thị trường đóng cửa. Thời gian để nghỉ ngơi.',
    historical: '📚 Ngoài giờ giao dịch. Chỉ có dữ liệu lịch sử ở đây.',
  };

  const logMessages = language === 'en' ? logMessagesEn : logMessagesVi;

  // Check for weekend (0 is Sunday, 6 is Saturday in dayjs)
  const dayOfWeek = now.day();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    if (enableLog) {
      console.info(logMessages['weekend']);
    }

    return {
      is_trading_hour: false,
      trading_session: 'weekend',
      data_status: 'historical_only',
      time: now.format('HH:mm:ss'),
      market: market === null ? 'general' : market,
    };
  }

  // Handle market=null case - use HOSE as reference
  const schedule =
    market === null ? marketSchedules['HOSE'] : marketSchedules[market];
  const marketDisplay = market === null ? 'general' : market;

  // Parse times from schedule
  const currentTimeMinutes = now.hour() * 60 + now.minute();

  // Parse schedule times to minutes for comparison
  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const tradingStartMinutes = parseTimeToMinutes(schedule.trading_start);
  const lunchStartMinutes = parseTimeToMinutes(schedule.lunch_start);
  const lunchEndMinutes = parseTimeToMinutes(schedule.lunch_end);
  const tradingEndMinutes = parseTimeToMinutes(schedule.trading_end);

  // Define data availability windows
  const prepWindowStartMinutes = tradingStartMinutes - 2 * 60; // 2 hours before trading
  const settlingWindowEndMinutes = tradingEndMinutes + 4 * 60; // 4 hours after trading

  // Determine market phase and trading status
  let isTrading = false;
  let tradingSession = '';
  let dataStatus = '';

  // Before market open
  if (currentTimeMinutes < tradingStartMinutes) {
    tradingSession = 'pre_market';
    if (currentTimeMinutes >= prepWindowStartMinutes) {
      dataStatus = 'preparing'; // Within 2 hours before market open
    } else {
      dataStatus = 'historical_only'; // More than 2 hours before market open
    }

    if (enableLog) {
      console.info(logMessages['pre_market']);
    }
  }
  // After market close
  else if (currentTimeMinutes >= tradingEndMinutes) {
    if (currentTimeMinutes <= settlingWindowEndMinutes) {
      tradingSession = 'post_market';
      dataStatus = 'settling'; // Within 4 hours after market close

      if (enableLog) {
        console.info(logMessages['post_market']);
      }
    } else {
      tradingSession = 'after_hours';
      dataStatus = 'historical_only'; // More than 4 hours after market close

      if (enableLog) {
        console.info(logMessages['historical']);
      }
    }
  }
  // During market hours
  else {
    // Check for various trading sessions
    // Implementation continues with checks for ATO, lunch break, ATC, post-close, and continuous trading
    // [Code omitted for brevity]
    // This would include all the session checks and setting appropriate flags
  }

  // Return comprehensive result
  return {
    is_trading_hour: isTrading,
    trading_session: tradingSession,
    data_status: dataStatus,
    time: now.format('HH:mm:ss'),
    market: marketDisplay,
  };
}
```

## Dependencies

- In Python: datetime, pytz, logging, typing
- For TypeScript example: dayjs with UTC, timezone, and isBusinessDay plugins

## Notes

- The implementation accurately tracks all market phases and data availability windows
- Timezone handling is critical for this function to work correctly
- Consider caching results for short periods (e.g., 1 minute) to reduce calculations
- The function provides both functional data (is trading active) and contextual data (what session, data status)
- For web applications, you may want to update the status periodically
- Custom time parameter is useful for testing the behavior at different times
