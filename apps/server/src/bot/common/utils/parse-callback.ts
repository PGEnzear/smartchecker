import { TelegramUserContext } from 'src/users';

export function parseCallback(ctx: TelegramUserContext): string[] | boolean {
  if (!ctx.callbackQuery || !('data' in ctx.callbackQuery)) return false;

  const splitted = ctx.callbackQuery.data?.split('|');
  if (splitted?.length < 2) return false;

  splitted.shift();
  return splitted;
}
