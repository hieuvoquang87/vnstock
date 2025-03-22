# Implementation of Notification Module

**Original Python Implementation**: [noti.py](/vnstock/botbuilder/noti.py)


## Overview

The Notification Module provides a flexible and unified interface for sending messages and notifications to various messaging platforms. It simplifies the process of integrating notification capabilities into applications, allowing developers to send text messages, files, and images to platforms such as Slack, Telegram, and Lark.

This module serves as a critical component for building automated alerts, monitoring systems, and bots that need to communicate with users through popular messaging platforms. The module handles the complexity of different API requirements for each platform behind a consistent interface.

Key features of the Notification Module include:

1. Platform-agnostic messaging interface
2. Support for multiple messaging platforms (Slack, Telegram, Lark)
3. Capability to send both text messages and files/images
4. Robust validation of configuration parameters
5. Consistent error handling across platforms
6. Customizable message formatting

## Component Structure

The Notification Module is built around the central `Messenger` class, which provides the interface for all messaging operations:

```
Messenger
├── Initialization & Validation
│   ├── __init__() - Initialize with platform, channel, and token
│   └── _validation() - Validate configuration parameters
│
├── Public Interface
│   └── send_message() - Send message or file to specified platform
│
└── Platform-specific Implementations
    ├── Slack
    │   ├── _slack_message() - Send text to Slack
    │   └── _slack_file() - Send file to Slack
    │
    ├── Telegram
    │   ├── _telegram_message() - Send text to Telegram
    │   └── _telegram_photo() - Send photo to Telegram
    │
    └── Lark
        └── _lark_message() - Send message to Lark
```

## Python Implementation

### Messenger Class

The `Messenger` class is the main component of the notification module:

```python
class Messenger:
    def __init__(self, platform: str, channel: Union[str, None], token_key: Union[str, int]):
        """
        Initialize a Messenger object with the platform, channel, and token key.

        Args:
            platform (str): Name of the messaging platform, e.g., 'slack', 'telegram', 'lark'.
            channel (str): Name of the target channel in Slack e.g., '#market_news' or
                          Telegram group id e.g '-1001439492355'.
            token_key (str):
                Slack: Bot token (start with 'xoxb-..') or user token (start with 'xoxp-..').
                Telegram: Token key for the Telegram bot.
                Lark: Webhook token for the Lark Botbuilder.

        Returns:
            Messenger object.
        """
        self.platform = platform
        self.channel = channel
        self.token_key = token_key
        self._validation()

    def _validation(self):
        """
        Validate the Messenger object's attributes.

        Returns:
            raise ValueError if any of the attributes are invalid.
            return raw value if all attributes are valid.
        """
        if self.platform not in ['slack', 'telegram', 'lark']:
            raise ValueError('Invalid platform. Supported platforms are "slack", "telegram", and "lark".')
        if self.token_key is None:
            raise ValueError('Token key is required for messaging!')

        # Platform-specific validations
        if self.platform == 'slack':
            if self.token_key[0:4] != 'xoxb' and self.token_key[0:4] != 'xoxp':
                raise ValueError('Invalid token key for Slack. Bot token must start with "xoxb-" and user token must start with "xoxp-".')
            if self.channel is None:
                raise ValueError('Channel name is required for Slack messaging!')
            elif self.channel[0] != '#':
                raise ValueError('Channel name must start with "#" for Slack messaging!')

        elif self.platform == 'telegram':
            if self.channel is None:
                raise ValueError('Channel name is required for Telegram messaging!')
            elif self.channel[0] != '-':
                raise ValueError('Channel name must start with "-" for Telegram messaging!. For example, "-1001439492355".')

        elif self.platform == 'lark':
            if self.channel is not None:
                raise ValueError('Channel name is not required for Lark messaging!')

    def send_message(self, message: str, file_path: Union[str, None] = None, title: Union[str, None] = None):
        """
        Send a message to a channel or group using the specified platform.

        Args:
            message (str): The message to send
            file_path (str, optional): Path to a file to send. Defaults to None.
            title (str, optional): Title for the file (used in Slack). Defaults to None.

        Returns:
            Response from the respective platform's API
        """
        if self.platform == 'slack':
            if file_path is not None:
                return self._slack_file(message, file_path, title)
            else:
                return self._slack_message(message)

        elif self.platform == 'telegram':
            if file_path is not None:
                return self._telegram_photo(message, file_path)
            else:
                return self._telegram_message(message)

        elif self.platform == 'lark':
            return self._lark_message(message)
```

### Platform-Specific Methods

The class includes several platform-specific private methods for sending messages and files:

```python
def _slack_file(self, text_comment, file_path, title=None):
    """
    Send a file to a Slack channel using either a bot or a user token.

    Args:
        text_comment (str): Text comment for the file.
        file_path (str): Path to the target file.
        title (str): Optional title for the file.

    Returns:
        dict: Response from the Slack API in JSON format.
    """
    file_name = file_path.split(get_path_delimiter())[-1]
    file_type = file_name.split('.')[-1]
    file_bytes = open(file_path, 'rb').read()
    url = 'https://slack.com/api/files.upload'
    payload = {
        'token': self.token_key,
        'filename': file_name,
        'channels': self.channel,
        'filetype': file_type,
        'initial_comment': text_comment,
        'title': title
    }
    r = requests.post(url, payload, files={'file': file_bytes})
    return r.json()

def _slack_message(self, message):
    """
    Send a message to a Slack channel using either a bot or a user token.

    Args:
        message (str): Text message for the file.

    Returns:
        dict: Response from the Slack API in JSON format.
    """
    header = {
        'Content-type': 'application/json; charset=utf-8',
        'Authorization': 'Bearer {}'.format(self.token_key)
    }
    payload = json.dumps({
        "channel": "{}".format(self.channel),
        "text": "{}".format(message)
    })
    response = requests.post('https://slack.com/api/chat.postMessage', data=payload, headers=header)
    return response.json()

def _telegram_photo(self, message, file_path):
    """
    Send a photo to a Telegram group.

    Args:
        message (str): Your text message.
        file_path (str): Path of the file/photo to send via Telegram.

    Returns:
        object: Response object from the Telegram API.
    """
    file_type = file_path.split('.')[-1]
    if file_type not in ['jpg', 'jpeg', 'png', 'webp']:
        raise ValueError('Invalid file type. Telegram only supports JPG, JPEG, PNG, and WEBP formats.')
    file_name = file_path.split(get_path_delimiter())[-1][0]
    files = [('photo', (file_name, open(file_path, 'rb'), f'image/{file_type}'))]
    url = 'https://api.telegram.org/bot{}/sendPhoto'.format(self.token_key)
    payload = {'chat_id': self.channel, 'caption': message}
    response = requests.post(url, headers={}, data=payload, files=files)
    return response

def _telegram_message(self, message):
    """
    Send a message to a Telegram group.

    Args:
        message (str): Your text message.

    Returns:
        object: Response object from the Telegram API.
    """
    url = 'https://api.telegram.org/bot{}/sendMessage?chat_id={}&text={}'.format(self.token_key, self.channel, message)
    response = requests.post(url)
    return response.json()

def _lark_message(self, message: str, payload: Union[Dict, None] = None):
    """
    Send a message to a Lark Botbuilder Webhook.

    Args:
        message (str): Your text message.
        payload (dict): Optional payload for the message.
    Returns:
        object: Response object from the Lark API.
    """
    url = f'https://botbuilder.larksuite.com/api/trigger-webhook/{self.token_key}'
    if payload is None:
        payload = {'content': message}
    else:
        payload = message
    response = requests.post(url, json=payload)
    return response.json()
```

## TypeScript Implementation

### Messenger Class

The TypeScript implementation of the `Messenger` class provides similar functionality with a more structured approach:

```typescript
/**
 * Platform types supported by the Messenger
 */
export type MessagingPlatform = 'slack' | 'telegram' | 'lark';

/**
 * Configuration for the Messenger
 */
export interface MessengerConfig {
  platform: MessagingPlatform;
  channel: string | null;
  tokenKey: string;
}

/**
 * Message sending options
 */
export interface SendMessageOptions {
  message: string;
  filePath?: string;
  title?: string;
  payload?: Record<string, any>;
}

/**
 * Class for sending messages to various messaging platforms
 */
export class Messenger {
  private platform: MessagingPlatform;
  private channel: string | null;
  private tokenKey: string;

  /**
   * Create a new Messenger instance
   *
   * @param config - Configuration for the messenger
   */
  constructor(config: MessengerConfig) {
    this.platform = config.platform;
    this.channel = config.channel;
    this.tokenKey = config.tokenKey;
    this.validate();
  }

  /**
   * Validate the messenger configuration
   *
   * @throws Error if configuration is invalid
   */
  private validate(): void {
    if (!['slack', 'telegram', 'lark'].includes(this.platform)) {
      throw new Error(
        'Invalid platform. Supported platforms are "slack", "telegram", and "lark".'
      );
    }

    if (!this.tokenKey) {
      throw new Error('Token key is required for messaging!');
    }

    // Platform-specific validations
    switch (this.platform) {
      case 'slack':
        if (
          !this.tokenKey.startsWith('xoxb') &&
          !this.tokenKey.startsWith('xoxp')
        ) {
          throw new Error(
            'Invalid token key for Slack. Bot token must start with "xoxb-" and user token must start with "xoxp-".'
          );
        }
        if (!this.channel) {
          throw new Error('Channel name is required for Slack messaging!');
        }
        if (!this.channel.startsWith('#')) {
          throw new Error(
            'Channel name must start with "#" for Slack messaging!'
          );
        }
        break;

      case 'telegram':
        if (!this.channel) {
          throw new Error('Channel name is required for Telegram messaging!');
        }
        if (!this.channel.startsWith('-')) {
          throw new Error(
            'Channel name must start with "-" for Telegram messaging!. For example, "-1001439492355".'
          );
        }
        break;

      case 'lark':
        if (this.channel !== null) {
          throw new Error('Channel name is not required for Lark messaging!');
        }
        break;
    }
  }

  /**
   * Send a message through the configured platform
   *
   * @param options - Message options
   * @returns Promise resolving to the platform API response
   */
  public async sendMessage(options: SendMessageOptions): Promise<any> {
    const { message, filePath, title, payload } = options;

    switch (this.platform) {
      case 'slack':
        if (filePath) {
          return await this.sendSlackFile(message, filePath, title);
        } else {
          return await this.sendSlackMessage(message);
        }

      case 'telegram':
        if (filePath) {
          return await this.sendTelegramPhoto(message, filePath);
        } else {
          return await this.sendTelegramMessage(message);
        }

      case 'lark':
        return await this.sendLarkMessage(message, payload);

      default:
        throw new Error(`Unsupported platform: ${this.platform}`);
    }
  }

  // Platform-specific implementation methods would follow here...
}
```

### Platform-Specific Methods

The TypeScript implementation includes platform-specific methods similar to the Python version:

```typescript
/**
 * Send a file to a Slack channel
 *
 * @param message - Message text
 * @param filePath - Path to the file
 * @param title - Optional file title
 * @returns Promise resolving to Slack API response
 */
private async sendSlackFile(message: string, filePath: string, title?: string): Promise<any> {
  const fs = require('fs');
  const path = require('path');
  const FormData = require('form-data');

  const fileName = path.basename(filePath);
  const fileType = path.extname(filePath).substring(1);
  const fileContent = fs.readFileSync(filePath);

  const formData = new FormData();
  formData.append('token', this.tokenKey);
  formData.append('channels', this.channel);
  formData.append('filename', fileName);
  formData.append('filetype', fileType);
  formData.append('initial_comment', message);

  if (title) {
    formData.append('title', title);
  }

  formData.append('file', fileContent, { filename: fileName });

  const response = await axios.post('https://slack.com/api/files.upload', formData, {
    headers: {
      ...formData.getHeaders(),
    }
  });

  return response.data;
}

/**
 * Send a text message to a Slack channel
 *
 * @param message - Message text
 * @returns Promise resolving to Slack API response
 */
private async sendSlackMessage(message: string): Promise<any> {
  const response = await axios.post(
    'https://slack.com/api/chat.postMessage',
    {
      channel: this.channel,
      text: message
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.tokenKey}`
      }
    }
  );

  return response.data;
}

/**
 * Send a photo to a Telegram group
 *
 * @param message - Message caption
 * @param filePath - Path to the photo
 * @returns Promise resolving to Telegram API response
 */
private async sendTelegramPhoto(message: string, filePath: string): Promise<any> {
  const fs = require('fs');
  const path = require('path');
  const FormData = require('form-data');

  const fileType = path.extname(filePath).substring(1).toLowerCase();
  const supportedTypes = ['jpg', 'jpeg', 'png', 'webp'];

  if (!supportedTypes.includes(fileType)) {
    throw new Error('Invalid file type. Telegram only supports JPG, JPEG, PNG, and WEBP formats.');
  }

  const fileName = path.basename(filePath);
  const fileContent = fs.readFileSync(filePath);

  const formData = new FormData();
  formData.append('chat_id', this.channel);
  formData.append('caption', message);
  formData.append('photo', fileContent, { filename: fileName });

  const response = await axios.post(
    `https://api.telegram.org/bot${this.tokenKey}/sendPhoto`,
    formData,
    {
      headers: {
        ...formData.getHeaders()
      }
    }
  );

  return response.data;
}

/**
 * Send a text message to a Telegram group
 *
 * @param message - Message text
 * @returns Promise resolving to Telegram API response
 */
private async sendTelegramMessage(message: string): Promise<any> {
  const response = await axios.post(
    `https://api.telegram.org/bot${this.tokenKey}/sendMessage?chat_id=${this.channel}&text=${encodeURIComponent(message)}`
  );

  return response.data;
}

/**
 * Send a message to a Lark webhook
 *
 * @param message - Message text
 * @param payload - Optional custom payload
 * @returns Promise resolving to Lark API response
 */
private async sendLarkMessage(message: string, payload?: Record<string, any>): Promise<any> {
  const url = `https://botbuilder.larksuite.com/api/trigger-webhook/${this.tokenKey}`;
  const data = payload || { content: message };

  const response = await axios.post(url, data);
  return response.data;
}
```

## Usage Examples

### Python Examples

#### Sending a Simple Message to Slack

```python
from vnstock.botbuilder.noti import Messenger

# Initialize a Slack messenger
slack_messenger = Messenger(
    platform='slack',
    channel='#market_alerts',
    token_key='xoxb-your-slack-bot-token'
)

# Send a message
response = slack_messenger.send_message('Market alert: VN-Index has increased by 2.5%')
print(f"Message sent: {response['ok']}")
```

#### Sending a Chart Image to Telegram

```python
from vnstock.botbuilder.noti import Messenger
import matplotlib.pyplot as plt
import numpy as np

# Create a sample chart
x = np.linspace(0, 10, 100)
y = np.sin(x)
plt.figure(figsize=(10, 6))
plt.plot(x, y)
plt.title('Stock Price Trend')
plt.savefig('stock_chart.png')

# Initialize a Telegram messenger
telegram_messenger = Messenger(
    platform='telegram',
    channel='-1001439492355',  # Telegram group ID
    token_key='1234567890:your-telegram-bot-token'
)

# Send the chart with a caption
response = telegram_messenger.send_message(
    message='Daily stock price trend analysis',
    file_path='stock_chart.png'
)

print(f"Message sent successfully: {response.get('ok', False)}")
```

#### Sending a Notification to Lark

```python
from vnstock.botbuilder.noti import Messenger

# Initialize a Lark messenger
lark_messenger = Messenger(
    platform='lark',
    channel=None,  # Not required for Lark
    token_key='your-lark-webhook-token'
)

# Send a simple message
response = lark_messenger.send_message('Market alert: New earnings report available')
print(f"Message sent: {response.get('code') == 0}")

# Send a structured message
custom_payload = {
    'card': {
        'config': {
            'wide_screen_mode': True
        },
        'header': {
            'title': {
                'tag': 'plain_text',
                'content': 'Stock Alert'
            },
            'template': 'red'
        },
        'elements': [
            {
                'tag': 'div',
                'text': {
                    'tag': 'plain_text',
                    'content': 'VNM has dropped below support level'
                }
            }
        ]
    }
}

response = lark_messenger._lark_message('', payload=custom_payload)
print(f"Structured message sent: {response.get('code') == 0}")
```

### TypeScript Examples

#### Sending a Simple Message to Slack

```typescript
import { Messenger } from 'vnstock-ts/botbuilder/noti';

async function sendSlackAlert() {
  // Initialize a Slack messenger
  const slackMessenger = new Messenger({
    platform: 'slack',
    channel: '#market_alerts',
    tokenKey: 'xoxb-your-slack-bot-token',
  });

  // Send a message
  try {
    const response = await slackMessenger.sendMessage({
      message: 'Market alert: VN-Index has increased by 2.5%',
    });
    console.log(`Message sent: ${response.ok}`);
  } catch (error) {
    console.error('Failed to send message:', error);
  }
}

sendSlackAlert();
```

#### Sending a Chart Image to Telegram

```typescript
import { Messenger } from 'vnstock-ts/botbuilder/noti';
import * as fs from 'fs';
import * as path from 'path';

async function sendTelegramChart() {
  // Assume chart has been created and saved to stock_chart.png
  const chartPath = path.join(__dirname, 'stock_chart.png');

  // Ensure file exists
  if (!fs.existsSync(chartPath)) {
    console.error('Chart file not found');
    return;
  }

  // Initialize a Telegram messenger
  const telegramMessenger = new Messenger({
    platform: 'telegram',
    channel: '-1001439492355', // Telegram group ID
    tokenKey: '1234567890:your-telegram-bot-token',
  });

  // Send the chart with a caption
  try {
    const response = await telegramMessenger.sendMessage({
      message: 'Daily stock price trend analysis',
      filePath: chartPath,
    });
    console.log('Message sent successfully:', response.ok);
  } catch (error) {
    console.error('Failed to send photo:', error);
  }
}

sendTelegramChart();
```

#### Sending a Notification to Lark

```typescript
import { Messenger } from 'vnstock-ts/botbuilder/noti';

async function sendLarkNotification() {
  // Initialize a Lark messenger
  const larkMessenger = new Messenger({
    platform: 'lark',
    channel: null, // Not required for Lark
    tokenKey: 'your-lark-webhook-token',
  });

  // Send a simple message
  try {
    const response = await larkMessenger.sendMessage({
      message: 'Market alert: New earnings report available',
    });
    console.log(`Message sent: ${response.code === 0}`);
  } catch (error) {
    console.error('Failed to send message:', error);
  }

  // Send a structured message
  const customPayload = {
    card: {
      config: {
        wide_screen_mode: true,
      },
      header: {
        title: {
          tag: 'plain_text',
          content: 'Stock Alert',
        },
        template: 'red',
      },
      elements: [
        {
          tag: 'div',
          text: {
            tag: 'plain_text',
            content: 'VNM has dropped below support level',
          },
        },
      ],
    },
  };

  try {
    const response = await larkMessenger.sendMessage({
      message: '',
      payload: customPayload,
    });
    console.log(`Structured message sent: ${response.code === 0}`);
  } catch (error) {
    console.error('Failed to send structured message:', error);
  }
}

sendLarkNotification();
```

## Implementation Details

### Platform-Specific Considerations

Each messaging platform has unique requirements and capabilities that the Notification Module handles:

1. **Slack**:

   - Requires different token types (bot tokens vs. user tokens)
   - Supports file uploads with comments and titles
   - Uses channel names prefixed with `#`

2. **Telegram**:

   - Uses numeric channel/group IDs prefixed with `-`
   - Limited image format support (JPG, JPEG, PNG, WEBP)
   - Different API endpoints for messages vs. photos

3. **Lark**:
   - Uses webhook-based integration
   - Supports structured message cards with custom formatting
   - Does not require channel specification

### Error Handling

The Notification Module implements comprehensive error handling:

1. **Configuration Validation**: Validates platform, channel, and token format before any API calls
2. **Input Validation**: Checks file types, message formats, and other inputs
3. **API Error Handling**: Returns API responses to allow error handling by consumers
4. **Descriptive Error Messages**: Provides clear error messages specific to each validation issue

### Path Handling

The module handles file paths across different operating systems:

1. **Path Delimiter Detection**: Uses the `get_path_delimiter()` utility to determine the appropriate path delimiter for the current OS
2. **Filename Extraction**: Extracts filenames and extensions from paths correctly on all platforms
3. **File Reading**: Properly reads binary file data for uploads

## Dependencies

### Python Dependencies

- `requests`: For making HTTP requests to platform APIs
- `json`: For JSON serialization and deserialization
- `typing`: For type hints (Union, Dict)
- Custom utilities:
  - `get_path_delimiter`: For cross-platform path handling

### TypeScript Dependencies

- `axios`: For making HTTP requests to platform APIs
- `form-data`: For multipart form submissions (file uploads)
- Node.js built-ins:
  - `fs`: For file system access
  - `path`: For path manipulation

## Implementation Notes

1. **Cross-Platform Design**: The module is designed to work across different operating systems with proper path handling
2. **Extensibility**: The class structure allows for easy addition of new messaging platforms
3. **Validation First**: All configurations are validated before any API requests are made
4. **Unified Interface**: The `send_message` method provides a consistent interface regardless of platform
5. **File Support**: Built-in support for sending files and images
6. **Error Propagation**: API errors are propagated to allow proper handling by consumers
7. **Minimal Dependencies**: Uses only standard libraries and common dependencies
8. **Type Safety**: Uses type hints in Python and strong typing in TypeScript
9. **Comprehensive Documentation**: All methods and parameters are documented
10. **Clear Error Messages**: Provides specific and helpful error messages for troubleshooting
