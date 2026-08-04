import crypto from 'crypto';

interface ParsedInitData {
  query_id?: string;
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
  };
  auth_date: number;
  hash: string;
}

/**
 * Validates initData received from Telegram WebApp using HMAC-SHA256
 */
export function verifyTelegramInitData(initDataRaw: string, botToken: string): ParsedInitData | null {
  try {
    if (!initDataRaw) return null;

    const urlParams = new URLSearchParams(initDataRaw);
    const hash = urlParams.get('hash');
    if (!hash) return null;

    // Filter out hash from parameter list and sort alphabetically
    const dataCheckArr: string[] = [];
    urlParams.forEach((val, key) => {
      if (key !== 'hash') {
        dataCheckArr.push(`${key}=${val}`);
      }
    });

    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // Generate secret key: HMAC-SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Calculate Hash: HMAC-SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return null;
    }

    // Extract user JSON object
    const userStr = urlParams.get('user');
    const user = userStr ? JSON.parse(userStr) : undefined;
    const authDate = parseInt(urlParams.get('auth_date') || '0', 10);

    return {
      query_id: urlParams.get('query_id') || undefined,
      user,
      auth_date: authDate,
      hash,
    };
  } catch (error) {
    console.error('Failed to verify Telegram initData:', error);
    return null;
  }
}
