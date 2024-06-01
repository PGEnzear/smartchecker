import { UseGuards, applyDecorators } from '@nestjs/common';
import { AppAuthGuard } from './auth.guard';
import { ApiBearerAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { SubscriptionGuard } from 'src/payment/subscriptions/subscription.guard';
import { SessionConfirmedGuard } from 'src/users';

export function Auth() {
  return applyDecorators(
    UseGuards(AppAuthGuard, SessionConfirmedGuard, SubscriptionGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Subscription expired' }),
  );
}
