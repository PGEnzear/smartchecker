import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { EnvConfig } from '@smartchecker/config';
import { verify } from 'hcaptcha';

@Injectable()
export class HCaptchaGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.hcaptcha;

    return await verify(EnvConfig.HCAPTCHA_SECRETKEY, token)
      .then((data) => data.success)
      .catch(() => false);
  }
}
