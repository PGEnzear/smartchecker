import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { EnvConfig } from '@smartchecker/config';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { TelegramUserContext } from 'src/users';

@Injectable()
export class TelegrafThrottlerGuard extends ThrottlerGuard {
  async handleRequest(context: ExecutionContext, limit: number, ttl: number): Promise<boolean> {
    const ctx = TelegrafExecutionContext.create(context).getContext<TelegramUserContext>();
    if (ctx.callbackQuery) return true;

    const key = this.generateKey(context, ctx.user.id.toString());
    const { totalHits } = await this.storageService.increment(key, EnvConfig.TELEGRAM_THROTTLER_TTL);

    if (totalHits > EnvConfig.TELEGRAM_THROTTLER_LIMIT) {
      ctx.replyWithHTML(`<b>⛔ Rate Limit Exceeded</b>\n\n` + `Oops! It seems you've reached the rate limit for this action.`);
      throw new ThrottlerException();
    }

    return true;
  }
}
