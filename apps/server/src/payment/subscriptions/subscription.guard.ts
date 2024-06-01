import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Reflector } from '@nestjs/core';
import { IS_NOT_SUBSCRIBED_ACCEPT_KEY } from './decorators';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private subscriptionsService: SubscriptionsService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const user = request.user?.user;
    const notSubscribedAccept = this.reflector.getAllAndOverride<boolean>(IS_NOT_SUBSCRIBED_ACCEPT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (notSubscribedAccept) return true;

    const subscription = await this.subscriptionsService.getUserSubscription(user.id);
    if (!subscription) throw new ForbiddenException('SUBSCRIPTION_EXPIRED');

    return true;
  }
}
