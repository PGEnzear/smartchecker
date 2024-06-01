import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getDevice } from '../factories';

export const Device = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const useragent = request.headers['user-agent'];

  return getDevice(useragent);
});