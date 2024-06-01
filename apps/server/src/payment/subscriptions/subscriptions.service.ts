import { Injectable } from '@nestjs/common';
import * as subscriptions from './subscriptions.json';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from './subscriptions.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { InjectDayjs, dayjs } from 'src/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectDayjs() private dayjs: dayjs,
    @InjectRepository(Subscription) private subscriptionsRepo: Repository<Subscription>,
    private eventEmitter: EventEmitter2,
  ) {}

  findSubscriptions() {
    return subscriptions;
  }

  findSubscription(id: number) {
    return subscriptions.find((s) => s.id == id);
  }

  getUserSubscription(userId: number) {
    return this.subscriptionsRepo.findOneBy({ userId });
  }

  setUserSubscription(userId: number, id: number) {
    const subscription = this.findSubscription(id);
    if (!subscription) return false;
    return this.subscriptionsRepo.save({
      subscriptionId: id,
      userId,
      expired: this.dayjs().add(subscription.time, 'seconds').toDate(),
    });
  }

  async removeUserSubscription(userId: number) {
    await this.subscriptionsRepo.delete({ userId });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async tasks() {
    // Remove expired subscriptions
    const subscriptions = await this.subscriptionsRepo.find({
      where: {
        expired: LessThanOrEqual(this.dayjs().toDate()),
      },
      relations: ['telegramUser'],
    });

    for (const s of subscriptions) {
      await this.subscriptionsRepo.delete({ userId: s.userId });
      this.eventEmitter.emit('subscription.expired', s);
    }
  }
}
