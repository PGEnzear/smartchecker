import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TelegrafExecutionContext } from 'nestjs-telegraf';
import { parseCallback } from '../common';
import { TelegramUserContext } from 'src/users';

export type UserContextWithParams = TelegramUserContext & {
  params: string[] | boolean;
};

export const ContextWithParams = createParamDecorator(
  (_, ctx: ExecutionContext) => {
    const context = TelegrafExecutionContext.create(
      ctx,
    ).getContext() as TelegramUserContext;
    const params = parseCallback(context);

    return Object.assign(context, {
      params,
    }) as UserContextWithParams;
  },
);
