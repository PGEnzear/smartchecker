import { Action, Context, Start, Update } from 'nestjs-telegraf';
import { TelegramUserContext } from 'src/users';
import { UseFilters, UseGuards } from '@nestjs/common';
import { IsNotBannedGuard, IsPMGuard } from './common/guards';
import { BotService } from './bot.service';
import { ContextWithParams, UserContextWithParams } from './decorators/context-with-params';
import { VoidExceptionFilter } from './common';
import { TelegrafThrottlerGuard } from 'src/common/guards';

@Update()
@UseGuards(IsNotBannedGuard, TelegrafThrottlerGuard)
@UseFilters(VoidExceptionFilter)
export class BotUpdate {
  constructor(private botService: BotService) {}

  @Start()
  @Action('start')
  @UseGuards(IsPMGuard)
  start(@Context() ctx: TelegramUserContext) {
    return this.botService.mainMenu(ctx);
  }

  @Action('subscriptions')
  @UseGuards(IsPMGuard)
  subscriptions(@Context() ctx: TelegramUserContext) {
    return this.botService.subscriptions(ctx);
  }

  @Action([/^subscription\|(.+)/])
  @UseGuards(IsPMGuard)
  subscription(@ContextWithParams() ctx: UserContextWithParams) {
    this.botService.subscription(ctx);
  }

  @Action('support')
  @UseGuards(IsPMGuard)
  support(@Context() ctx: TelegramUserContext) {
    return this.botService.support(ctx);
  }

  @Action('web-panel')
  @UseGuards(IsPMGuard)
  webPanel(@Context() ctx: TelegramUserContext) {
    return this.botService.webPanel(ctx);
  }

  @Action('regenerate_uuid')
  @UseGuards(IsPMGuard)
  regenerateUuid(@Context() ctx: TelegramUserContext) {
    return this.botService.regenerateUuid(ctx);
  }

  @Action([/^confirm_session\|(.+)/])
  @UseGuards(IsPMGuard)
  adminWorker(@ContextWithParams() ctx: UserContextWithParams) {
    this.botService.confirmSession(ctx);
  }
}
