import { Injectable } from '@nestjs/common';
import { CryptomusClient, WebhookRequest } from './sdk';
import { EnvConfig } from '@smartchecker/config';
import { PaymentService } from '../payment.service';
import { TelegramUser } from 'src/users';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { SubscriptionsService } from '../subscriptions';

@Injectable()
export class CryptomusService {
  private cryptomusClient: CryptomusClient;

  constructor(
    private subscriptionService: SubscriptionsService,
    private paymentsService: PaymentService,
    private eventsEmitter: EventEmitter2,
  ) {
    this.cryptomusClient = new CryptomusClient(EnvConfig.CRYPTOMUS_API_PAYMENT_KEY, EnvConfig.CRYPTOMUS_MERCHANT_ID);
  }

  @OnEvent('payment.cryptomus.create')
  async create(telegramUser: TelegramUser, subscriptionId: number) {
    const paymentData = await this.paymentsService.create(subscriptionId, telegramUser);
    if (!paymentData) return;

    const { payment, subscription } = paymentData;

    const urlCallback = new URL(EnvConfig.API_BASEURL);
    urlCallback.pathname = '/payment/cryptomus';

    const cryptomusPayments = await this.cryptomusClient.payment();
    const invoice = await cryptomusPayments.create({
      order_id: payment.id.toString(),
      currency: 'USD',
      amount: subscription.price.toString(),
      url_callback: urlCallback.toString(),
    });

    this.eventsEmitter.emit('payment.cryptomus.created', telegramUser, subscription, invoice);
  }

  async verify(data: WebhookRequest) {
    const valid = this.cryptomusClient.verifyWebhookSignature(data);
    if (!valid || data.status != 'paid') return;

    const payment = await this.paymentsService.find(Number(data.order_id));
    if (!payment) return;

    await this.subscriptionService.setUserSubscription(payment.telegramUser.id, payment.subscriptionId);
    await this.paymentsService.delete(payment.id);

    this.eventsEmitter.emit('payment.cryptomus.paid', payment);
  }
}
