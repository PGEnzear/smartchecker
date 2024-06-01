import type { RedisOptions } from 'ioredis';
import { Module } from '@nestjs/common';
import { BullModule } from '@taskforcesh/nestjs-bullmq-pro';
import ormconfig from './ormconfig';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BotModule } from './bot/bot.module';
import { UsersModule } from './users/web/users.module';
import { AuthModule } from './auth/auth.module';
import { EnvConfig } from '../config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { PaymentModule } from './payment/payment.module';
import { DayJSModule } from './common/dayjs/dayjs.module';
import { IOModule } from './io/io.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { CacheModule } from '@nestjs/cache-manager';
import { create as ioRedisStore } from 'cache-manager-ioredis';
import { WalletsModule } from './content/wallet/wallet.module';
import { ProxyModule } from './content/proxy/proxy.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ormconfig.options,
      async dataSourceFactory(options) {
        return addTransactionalDataSource(new DataSource(options));
      },
    }),
    CacheModule.register<RedisOptions>({
      isGlobal: true,
      // @ts-ignore
      store: ioRedisStore,
      host: EnvConfig.REDIS_HOST,
      port: EnvConfig.REDIS_PORT,
      password: EnvConfig.REDIS_PASSWORD,
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    BullModule.forRoot({
      connection: {
        host: EnvConfig.REDIS_HOST,
        port: EnvConfig.REDIS_PORT,
        password: EnvConfig.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnFail: true,
        removeOnComplete: true,
        attempts: 1,
      },
    }),
    ThrottlerModule.forRoot({
      ttl: EnvConfig.THROTTLER_TTL,
      limit: EnvConfig.THROTTLER_LIMIT,
      storage: new ThrottlerStorageRedisService({
        host: EnvConfig.REDIS_HOST,
        port: EnvConfig.REDIS_PORT,
        password: EnvConfig.REDIS_PASSWORD,
      } as RedisOptions),
    }),
    IOModule,
    DayJSModule,
    PaymentModule,
    ProxyModule,
    BotModule,
    UsersModule,
    AuthModule,
    WalletsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
