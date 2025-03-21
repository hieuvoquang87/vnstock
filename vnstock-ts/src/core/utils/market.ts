import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);

// Set timezone to Vietnam
const TIMEZONE = 'Asia/Ho_Chi_Minh';

interface MarketStatus {
  time: string;
  is_trading_hour: boolean;
  data_status: string;
  session: string;
  message?: string;
}

/**
 * Market utilities for handling trading hours and market status
 */

/**
 * Market session information
 */
interface MarketSession {
  time: string;
  session: string;
  is_trading_hour: boolean;
  data_status: string;
}

/**
 * Check if current time is within trading hours
 * @returns Market session information
 */
export function tradingHours(): MarketSession {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  // Vietnam timezone offset (UTC+7)
  const offset = 7 * 60;
  const localOffset = -now.getTimezoneOffset();
  const vietnamTime = new Date(now.getTime() + (offset - localOffset) * 60000);

  const dayOfWeek = vietnamTime.getDay(); // 0 is Sunday, 6 is Saturday
  const hour = vietnamTime.getHours();
  const minute = vietnamTime.getMinutes();
  const currentTime = hour * 60 + minute;

  // Weekend check
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return {
      time: timeStr,
      session: 'weekend',
      is_trading_hour: false,
      data_status: 'closed',
    };
  }

  // Pre-market
  if (currentTime >= 8 * 60 && currentTime < 9 * 60) {
    return {
      time: timeStr,
      session: 'pre-market',
      is_trading_hour: false,
      data_status: 'preparing',
    };
  }

  // Morning session
  if (currentTime >= 9 * 60 && currentTime < 11 * 60 + 30) {
    return {
      time: timeStr,
      session: 'morning',
      is_trading_hour: true,
      data_status: 'live',
    };
  }

  // Lunch break
  if (currentTime >= 11 * 60 + 30 && currentTime < 13 * 60) {
    return {
      time: timeStr,
      session: 'lunch',
      is_trading_hour: false,
      data_status: 'lunch',
    };
  }

  // Afternoon session
  if (currentTime >= 13 * 60 && currentTime < 15 * 60) {
    return {
      time: timeStr,
      session: 'afternoon',
      is_trading_hour: true,
      data_status: 'live',
    };
  }

  // Post-market
  if (currentTime >= 15 * 60 && currentTime < 16 * 60 + 45) {
    return {
      time: timeStr,
      session: 'post-market',
      is_trading_hour: false,
      data_status: 'closing',
    };
  }

  // After hours
  return {
    time: timeStr,
    session: 'after-hours',
    is_trading_hour: false,
    data_status: 'closed',
  };
}
