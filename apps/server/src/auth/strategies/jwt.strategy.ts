import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { EnvConfig } from '@smartchecker/config';
import { JWTPayload } from '../types/jwt.payload';
import { UserSessionsService } from 'src/users/web/user-sessions.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userSessionsService: UserSessionsService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: EnvConfig.JWT_SECRET,
    });
  }

  async validate({ sub }: JWTPayload) {
    const session = await this.userSessionsService.findOne(sub);
    return session || false;
  }
}
