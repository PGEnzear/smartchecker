import { Module } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Payment } from "./payment.entity";
import { SubscriptionModule } from "./subscriptions/subscriptions.module";
import { CryptomusModule } from "./cryptomus/cryptomus.module";

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), SubscriptionModule, CryptomusModule],
  providers: [PaymentService],
  exports: [PaymentService]
})
export class PaymentModule {}