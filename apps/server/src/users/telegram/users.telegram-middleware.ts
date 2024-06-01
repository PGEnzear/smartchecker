import { Injectable } from '@nestjs/common';
import { TelegramUsersService } from './telegram-users.service';
import { TelegramUserContext } from './telegram-users.types';

@Injectable()
export class UsersTelegramMiddleware {
  constructor(private usersService: TelegramUsersService) {}

  async register(ctx: TelegramUserContext, next: Function): Promise<void> {
    ctx.user = await this.usersService.createOrUpdate(
      ctx.from.id,
      {
        username: ctx.from.username,
        active: true,
      },
      ctx,
    );

    next(ctx);
  }
}
