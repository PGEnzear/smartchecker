import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet, WalletBalance, WalletTask } from './entity';
import { WalletsController } from './wallet.controller';
import { BullModule } from '@taskforcesh/nestjs-bullmq-pro';
import { WALLET_CHILDREN_QUEUES, WALLET_FLOW_NAME, WALLET_QUEUE_NAME, WALLET_TASK_QUEUE_NAME } from './wallet.constants';
import { WalletTasksService } from './wallet-tasks.service';
import { InjectDynamicProviders } from 'nestjs-dynamic-providers';
import { CryptoProvidersModule } from 'src/crypto/crypto-providers/crypto-providers.module';
import { CoinGeckoService } from './coingecko.service';
import { WalletsService } from './wallet.service';
import { BalanceProcessorMixins } from './processors/abstract';
import { ProxyModule } from '../proxy/proxy.module';

@InjectDynamicProviders({
  pattern: '**/*.processor.js',
  filterPredicate: (type) => Reflect.hasMetadata('bullmq:processor_metadata', type),
})
@Module({
  imports: [
    ProxyModule,
    CryptoProvidersModule,
    TypeOrmModule.forFeature([WalletBalance, Wallet, WalletTask]),
    BullModule.registerFlowProducer({
      name: WALLET_FLOW_NAME,
    }),
    BullModule.registerQueue({
      name: WALLET_QUEUE_NAME,
    }),
    BullModule.registerQueue({
      name: WALLET_TASK_QUEUE_NAME,
    }),
    ...WALLET_CHILDREN_QUEUES.map((name) =>
      BullModule.registerQueue({
        name,
      }),
    ),
  ],
  providers: [BalanceProcessorMixins, WalletTasksService, WalletsService, CoinGeckoService],
  exports: [WalletTasksService],
  controllers: [WalletsController],
})
export class WalletsModule {}
