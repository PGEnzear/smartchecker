import { Global, Module } from "@nestjs/common";
import { SubscriptionsService } from "./subscriptions.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Subscription } from "./subscriptions.entity";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  providers: [SubscriptionsService],
  exports: [SubscriptionsService]
}) 
export class SubscriptionModule {}