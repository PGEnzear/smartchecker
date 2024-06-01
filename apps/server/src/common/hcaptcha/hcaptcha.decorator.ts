import { applyDecorators, UseGuards } from '@nestjs/common';
import { HCaptchaGuard } from './hcaptcha.guard';

export function HCaptcha() {
  return applyDecorators(UseGuards(HCaptchaGuard));
}
