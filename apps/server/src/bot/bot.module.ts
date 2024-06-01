import { Module } from '@nestjs/common';
import { SCENE_METADATA, TelegrafModule } from 'nestjs-telegraf';
import { TelegramUsersModule } from 'src/users';
import { BotConfigService } from './bot-config.service';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { InjectDynamicProviders } from 'nestjs-dynamic-providers';
import { UsersModule } from 'src/users/web/users.module';
import { BotController } from './bot.controller';

@InjectDynamicProviders({
  pattern: '**/*.wizard.js',
  filterPredicate: (type) => Reflect.hasMetadata(SCENE_METADATA, type),
})
@Module({
  imports: [
    TelegrafModule.forRootAsync({
      imports: [TelegramUsersModule],
      useClass: BotConfigService,
    }),
    TelegramUsersModule,
    UsersModule
  ],
  providers: [BotUpdate, BotService],
  exports: [],
  controllers: [BotController]
})
export class BotModule {}
