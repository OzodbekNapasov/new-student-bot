import * as crypto from 'crypto';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export function verifyTelegramWebAppData(
  initData: string,
  botToken: string,
): TelegramUser | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    if (!hash) return null;

    urlParams.delete('hash');

    const params: string[] = [];
    urlParams.forEach((val, key) => {
      params.push(`${key}=${val}`);
    });

    params.sort();

    const dataCheckString = params.join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return null;
    }

    const userParam = urlParams.get('user');
    if (!userParam) return null;

    return JSON.parse(userParam) as TelegramUser;
  } catch (error) {
    return null;
  }
}
