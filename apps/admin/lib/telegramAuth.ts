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
  if (typeof window === 'undefined') return null;

  const tg = getTelegramWebApp();

  // 1. Direct initDataUnsafe.user
  if (tg?.initDataUnsafe?.user) {
    return tg.initDataUnsafe.user as TelegramUser;
  }

  // 2. Parse tg.initData string
  if (tg?.initData) {
    const user = parseTelegramInitData(tg.initData);
    if (user) return user;
  }

  // 3. Fallback: Parse URL hash / search params for Telegram WebApp data
  try {
    const hash = window.location.hash;
    const search = window.location.search;

    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const searchParams = new URLSearchParams(search);

    const tgWebAppData = hashParams.get('tgWebAppData') || searchParams.get('tgWebAppData');
    if (tgWebAppData) {
      const user = parseTelegramInitData(tgWebAppData);
      if (user) return user;
    }

    const userParam = hashParams.get('user') || searchParams.get('user');
    if (userParam) {
      return JSON.parse(userParam) as TelegramUser;
    }

    const tgIdParam = searchParams.get('tg_id') || hashParams.get('tg_id');
    if (tgIdParam) {
      return { id: Number(tgIdParam), first_name: 'User' } as TelegramUser;
    }
  } catch {}

  return null;
}

export function expandTelegramApp() {
  const tg = getTelegramWebApp();
  if (tg) {
    try {
      tg.expand();
      tg.ready();
      tg.setHeaderColor('#0f172a');
      tg.setBackgroundColor('#0f172a');
    } catch {}
  }
}
