import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './payment.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import { TelegramUser } from 'src/users';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDayjs, dayjs } from 'src/common';
import { SubscriptionsService } from './subscriptions';

@Injectable()
export class PaymentService {
  constructor(
    private subscriptionService: SubscriptionsService,
    @InjectRepository(Payment)
    private paymentsRepo: Repository<Payment>,
    @InjectDayjs()
    private dayjs: dayjs,
  ) {}

  async create(subscriptionId: number, telegramUser: TelegramUser) {
    const subscription = this.subscriptionService.findSubscription(subscriptionId);
    if (!subscription) return false;

    const userSubscription = await this.subscriptionService.getUserSubscription(telegramUser.id);
    if (userSubscription) return false;

    let payment = new Payment();
    payment.subscriptionId = subscriptionId;
    payment.telegramUser = telegramUser;
    payment = await this.paymentsRepo.save(payment);

    return { payment, subscription };
  }

  find(id: number) {
    return this.paymentsRepo.findOne({
      where: {
        id,
      },
      relations: ['telegramUser'],
    });
  }

  async delete(id: number) {
    await this.paymentsRepo.delete({ id });
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async clean() {
    await this.paymentsRepo.delete({
      created: LessThanOrEqual(this.dayjs().subtract(1, 'days').toDate()),
    });
  }
}
