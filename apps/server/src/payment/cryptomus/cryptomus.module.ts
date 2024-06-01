import { Module, forwardRef } from '@nestjs/common';
import { CryptomusService } from './cryptomus.service';
import { CryptomusController } from './cryptomus.controller';
import { SubscriptionModule } from '../subscriptions/subscriptions.module';
import { PaymentModule } from '../payment.module';

@Module({
  imports: [forwardRef(() => PaymentModule), SubscriptionModule],
  providers: [CryptomusService],
  controllers: [CryptomusController],
})
export class CryptomusModule {}
