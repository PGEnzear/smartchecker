import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { TelegramUserContext } from 'src/users';

@Injectable()
export class IsPMGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { chat } = TelegrafExecutionContext.create(context).getContext<TelegramUserContext>();

    if (chat.type !== 'private') throw new Error();

    return true;
  }
}
