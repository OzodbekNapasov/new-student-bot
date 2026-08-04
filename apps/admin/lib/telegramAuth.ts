import { TelegramUser } from './types';

const ADMIN_TELEGRAM_ID = '8135594558';

export function parseTelegramInitData(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData);
    const userStr = params.get('user');
    if (!userStr) return null;
    return JSON.parse(userStr) as TelegramUser;
  } catch {
    return null;
  }
}

export function isAdminTelegramId(telegramId: string | number): boolean {
  return String(telegramId) === ADMIN_TELEGRAM_ID;
}

export function getTelegramWebApp() {
  if (typeof window === 'undefined') return null;
  return (window as any).Telegram?.WebApp || null;
}

export function getTelegramUser(): TelegramUser | null {
  const tg = getTelegramWebApp();
  if (!tg?.initDataUnsafe?.user) return null;
  return tg.initDataUnsafe.user as TelegramUser;
}

export function expandTelegramApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.expand();
    tg.ready();
    tg.setHeaderColor('#0f172a');
    tg.setBackgroundColor('#0f172a');
  }
}
