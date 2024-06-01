import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/web/users.module';
import { JwtModule } from '@nestjs/jwt';
import { EnvConfig } from '@smartchecker/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: EnvConfig.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
