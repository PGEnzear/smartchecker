import { Injectable } from '@nestjs/common';
import { TelegrafModuleOptions, TelegrafOptionsFactory } from 'nestjs-telegraf';
import { EnvConfig } from '@smartchecker/config';
import { TelegramUserContext, UsersTelegramMiddleware } from 'src/users';
import { session } from 'telegraf';

@Injectable()
export class BotConfigService implements TelegrafOptionsFactory {
  constructor(private userMiddleware: UsersTelegramMiddleware) {}

  async createTelegrafOptions(): Promise<TelegrafModuleOptions> {
    return {
      token: EnvConfig.TELEGRAM_BOT_TOKEN,
      launchOptions: {
        dropPendingUpdates: true,
        webhook:
          EnvConfig.TELEGRAM_WEBHOOK_PATH && EnvConfig.API_BASEURL
            ? {
                domain: new URL(EnvConfig.API_BASEURL).host,
                hookPath: EnvConfig.TELEGRAM_WEBHOOK_PATH,
              }
            : undefined,
      },
      middlewares: [session(), (ctx: TelegramUserContext, next: Function) => this.userMiddleware.register(ctx, next)],
    };
  }
}
