# Botbuilder Module Implementation

**Original Python Implementation**: [__init__.py](/vnstock/botbuilder/__init__.py)


## Overview

The Botbuilder module provides functionality for creating automated bots and notification systems that interact with financial market data from vnstock. This module enables users to build custom monitoring solutions, automated trading alerts, and integration with messaging platforms to deliver timely financial market insights.

## Purpose

The Botbuilder module serves several key purposes:

1. **Automated Monitoring**: Create systems that continuously monitor market conditions and specific stocks
2. **Alert Generation**: Generate notifications when predefined market conditions are met
3. **Notification Delivery**: Deliver alerts through various channels (messaging apps, email, etc.)
4. **Periodic Reporting**: Schedule and generate recurring reports on market performance
5. **Custom Bot Logic**: Define custom rules and actions for automated financial analysis

## Structure

The Botbuilder module is organized into components:

```
botbuilder/
└── noti.md     - Notification system documentation
```

### Notification System

The Notification component manages the creation and delivery of alerts:

- Alert conditions and triggers
- Message formatting and templating
- Delivery channel configuration (Telegram, Discord, Slack, etc.)
- Rate limiting and batching
- Logging and monitoring

## TypeScript Implementation

In the TypeScript implementation, the Botbuilder module leverages TypeScript's type system to create a flexible yet robust framework for building financial bots.

### Notification System

The notification system can be implemented with a builder pattern:

```typescript
/**
 * Builder for creating notification systems
 */
export class NotificationBuilder {
  private conditions: AlertCondition[] = [];
  private channels: NotificationChannel[] = [];
  private formatters: MessageFormatter[] = [];

  /**
   * Add a condition that will trigger an alert
   * @param condition Condition definition
   */
  addCondition(condition: AlertCondition): NotificationBuilder {
    this.conditions.push(condition);
    return this;
  }

  /**
   * Add a notification channel
   * @param channel Channel to send notifications through
   */
  addChannel(channel: NotificationChannel): NotificationBuilder {
    this.channels.push(channel);
    return this;
  }

  /**
   * Add a message formatter
   * @param formatter Formatter to use for notifications
   */
  addFormatter(formatter: MessageFormatter): NotificationBuilder {
    this.formatters.push(formatter);
    return this;
  }

  /**
   * Build the notification system
   */
  build(): NotificationSystem {
    return new NotificationSystem(
      this.conditions,
      this.channels,
      this.formatters
    );
  }
}
```

### Alert Conditions

Alert conditions should be implemented with a flexible interface:

```typescript
/**
 * Interface for alert conditions
 */
export interface AlertCondition {
  /**
   * Check if the condition is met
   * @param data Data to check against
   */
  isTriggered(data: any): boolean;

  /**
   * Get a description of the condition
   */
  getDescription(): string;
}

/**
 * Price threshold alert condition
 */
export class PriceThresholdCondition implements AlertCondition {
  constructor(
    private symbol: string,
    private threshold: number,
    private compareType: 'above' | 'below'
  ) {}

  isTriggered(data: { symbol: string; price: number }): boolean {
    if (data.symbol !== this.symbol) return false;

    return this.compareType === 'above'
      ? data.price > this.threshold
      : data.price < this.threshold;
  }

  getDescription(): string {
    return `${this.symbol} price ${this.compareType} ${this.threshold}`;
  }
}
```

## Usage Examples

The Botbuilder module can be used to create a variety of bots and notification systems:

```typescript
import {
  NotificationBuilder,
  TelegramChannel,
  PriceThresholdCondition,
} from 'vnstock/botbuilder';
import { Explorer } from 'vnstock/explorer';

// Create a notification system
const notifier = new NotificationBuilder()
  .addCondition(new PriceThresholdCondition('VNM', 100.0, 'above'))
  .addCondition(new PriceThresholdCondition('FPT', 50.0, 'below'))
  .addChannel(new TelegramChannel('BOT_TOKEN', 'CHAT_ID'))
  .addFormatter(new MarkdownFormatter())
  .build();

// Set up monitoring loop
async function monitorPrices() {
  const explorer = Explorer.create('VCI');

  setInterval(async () => {
    try {
      const vnmData = await explorer.quote('VNM');
      const fptData = await explorer.quote('FPT');

      notifier.check([vnmData, fptData]);
    } catch (error) {
      console.error('Monitoring error:', error);
    }
  }, 60000); // Check every minute
}

monitorPrices();
```

## Dependencies

The Botbuilder module has the following dependencies:

1. Explorer module for market data access
2. Core utilities for HTTP requests, logging, etc.
3. External libraries for messaging platforms (optional)
4. Scheduling libraries for periodic tasks

## Implementation Notes

When implementing the Botbuilder module in TypeScript:

1. Use TypeScript interfaces for flexible component design
2. Implement proper error handling for network and API failures
3. Use dependency injection for better testability
4. Consider rate limits and quotas of external messaging platforms
5. Implement proper logging for monitoring and debugging

## Integration Points

The Botbuilder module integrates with several components:

1. **Explorer Module**: Access to market data for monitoring
2. **Core Module**: Utilities for HTTP requests, scheduling, etc.
3. **External APIs**: Messaging platforms for notification delivery
4. **Storage**: Optional persistence for notification history

## References

For detailed implementation of the notification system, refer to:

- [Notification System Documentation](./noti.md)
