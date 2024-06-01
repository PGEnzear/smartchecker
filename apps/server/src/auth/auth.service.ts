import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthUserDto, LoginDto } from './dto';
import { UsersService } from 'src/users/web/users.service';
import { JwtService } from '@nestjs/jwt';
import { JWTPayload } from './types';
import { UserSessionsService } from 'src/users/web/user-sessions.service';
import { SubscriptionsService } from 'src/payment';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersSessionsService: UserSessionsService,
    private jwtService: JwtService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  async login(body: LoginDto, device: string) {
    const user = await this.usersService.findByUUID(body.uuid);
    if (!user) throw new NotFoundException();

    const subscription = await this.subscriptionsService.getUserSubscription(user.id);
    if (!subscription) throw new ForbiddenException('SUBSCRIPTION_EXPIRED');

    const session = await this.usersSessionsService.create(user.id, device);

    const accessToken = this.jwtService.sign({ sub: session.uuid } as JWTPayload);
    return new AuthUserDto(user, accessToken);
  }

  getSessionByAccessToken(access_token: string) {
    const decode = this.jwtService.decode(access_token) as JWTPayload
    return this.usersSessionsService.findOne(decode.sub)
  }
}
