import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { userSessionFactory } from 'src/common/factories';
import { UserSession } from './user-session.entity';

export const CurrentSession = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const user = userSessionFactory<UserSession>(ctx);
  return user;
});
