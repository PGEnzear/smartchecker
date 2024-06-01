import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegramUser } from './telegram-user.entity';
import { TelegramUsersService } from './telegram-users.service';
import { UsersTelegramMiddleware } from './users.telegram-middleware';
import { UsersModule } from '../web/users.module';

@Module({
  providers: [TelegramUsersService, UsersTelegramMiddleware],
  imports: [TypeOrmModule.forFeature([TelegramUser]), UsersModule],
  exports: [TelegramUsersService, UsersTelegramMiddleware],
})
export class TelegramUsersModule {}
