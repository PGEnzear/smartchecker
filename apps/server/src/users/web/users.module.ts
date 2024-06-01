import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserSessionsService } from './user-sessions.service';
import { UserSession } from './user-session.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserSession])],
  providers: [UsersService, UserSessionsService],
  exports: [UsersService, UserSessionsService],
})
export class UsersModule {}
 