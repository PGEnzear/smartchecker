import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_SESSION_NOT_CONFIRMED_ACCEPT_KEY } from '../decorators';

@Injectable() 
export class SessionConfirmedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const isSessionNotConfirmedAccept = this.reflector.getAllAndOverride<boolean>(IS_SESSION_NOT_CONFIRMED_ACCEPT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSessionNotConfirmedAccept) return true;

    if (!request.user?.confirmed) throw new UnauthorizedException('SESSION_NOT_CONFIRMED');
    else return true;
  }
}
