import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { EnvConfig } from '@smartchecker/config';
import { InjectBot } from 'nestjs-telegraf';
import { InjectDayjs, dayjs } from 'src/common';
import { Payment, SubscriptionsService } from 'src/payment';
import { TelegramUser, TelegramUserContext, UserDto, UserSession } from 'src/users';
import { UsersService } from 'src/users/web/users.service';
import { Markup, Telegraf } from 'telegraf';
import { UserContextWithParams } from './decorators/context-with-params';
import { UserSessionsService } from 'src/users/web/user-sessions.service';
import { IOService } from 'src/io/io.service';
import { PaymentResult } from 'src/payment/cryptomus/sdk';
import * as _ from 'lodash';

@Injectable()
export class BotService {
  constructor(
    @InjectDayjs() private dayjs: dayjs,
    private eventsEmitter: EventEmitter2,
    private subscriptionsService: SubscriptionsService,
    private usersService: UsersService,
    private sessionsService: UserSessionsService,
    private ioService: IOService,
    @InjectBot() private bot: Telegraf<TelegramUserContext>,
  ) {}

  async mainMenu(ctx: TelegramUserContext) {
    const message =
      `<b>Welcome to the SmartChecker!</b>\n` +
      `Explore your options:\n\n` +
      `<b>Web-panel 🌐</b> - Access our panel.\n` +
      `<b>Subscribe 💰</b> - Learn about plans.\n` +
      `<b>Support 🛠️</b> - Get help from us.\n\n` +
      `<em>Just click the relevant button to make your choice.</em>\n\n` +
      `<b>Let's get started! 🚀</b>`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('Web-panel 🌐', 'web-panel')],
      [Markup.button.callback('Subscribe 💰', 'subscriptions'), Markup.button.callback('Support 🛠️', 'support')],
    ]);

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, { ...keyboard, parse_mode: 'HTML' });
    } else await ctx.replyWithHTML(message, keyboard);
  }

  async subscriptions(ctx: TelegramUserContext) {
    const message =
      `<b>🚀 Get Your Subscription Now! 🚀</b>\n\n` +
      `<b>🕒 2 weeks:</b> Explore the capabilities of the panel\n` +
      `<b>💰 1 month:</b> Enjoy a month of seamless panel usage\n` +
      `<b>🌟 3 months:</b> Unlock three months of uninterrupted panel access\n` +
      `<b>⚡ 6 months:</b> Lightning-speed processing - <b>Priority 1</b>!\n` +
      `<b>🌈 1 year:</b> Supercharged processing with <b>Priority 2</b>!\n\n` +
      `<em>Priority means your tasks are done faster. If you pick a 6-month plan, your wallet processing gets a boost (Priority 1). And with a full year, it's super efficient (Priority 2).</em>\n\n` +
      `🔐 Once you subscribe, you can access the web-panel right away.`;

    const buttons = this.subscriptionsService
      .findSubscriptions()
      .map((subscription) => Markup.button.callback(`${subscription.name} | $${subscription.price}`, `subscription|${subscription.id}`));
    const keyboard = Markup.inlineKeyboard(
      _.chunk(buttons, 2)
        .reverse()
        .concat([[Markup.button.callback('Go back', 'start')]]),
    );

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, { ...keyboard, parse_mode: 'HTML' });
    } else await ctx.replyWithHTML(message, keyboard);
  }

  async subscription(ctx: UserContextWithParams) {
    const userSubscription = await this.subscriptionsService.getUserSubscription(ctx.user.id);
    if (userSubscription) {
      await ctx.editMessageText(`<b>🚫 You cannot purchase a subscription, as you already have an active</b>`, { parse_mode: 'HTML' });
      return
    }

    const message = '<b>Please wait while we generate your payment 🔄</b>';

    const subscriptionId = ctx.params?.[0];
    await ctx.editMessageText(message, { parse_mode: 'HTML' });
    this.eventsEmitter.emit('payment.cryptomus.create', ctx.user, subscriptionId);
  }

  async support(ctx: TelegramUserContext) {
    const message =
      `<b>Need Help?</b> Support Team is Here! 🛠️\n\n` +
      `If you're unsure, facing issues, or need guidance, don't hesitate to reach out. We're here to assist you with technical matters, offer advice, or solve problems.\n\n` +
      `To contact us, simply start a chat - @\n\n` +
      `<em>Your experience matters, and we're committed to making it as smooth as possible. Feel free to connect with us anytime.</em>`;
    const keyboard = Markup.inlineKeyboard([Markup.button.callback('Go back', 'start')]);

    if (ctx.callbackQuery) {
      await ctx.editMessageText(message, { ...keyboard, parse_mode: 'HTML' });
    } else await ctx.replyWithHTML(message, keyboard);
  }

  async webPanel(ctx: TelegramUserContext) {
    const userSubscription = await this.subscriptionsService.getUserSubscription(ctx.user.id);
    const user = await this.usersService.findByTelegramID(ctx.user.id);
    let subscription;
    if (userSubscription) subscription = this.subscriptionsService.findSubscription(userSubscription.subscriptionId);

    const messageNotSubscribed =
      `<b>Web Panel 🌐</b>\n\n` +
      `<em>To use the panel's features, you'll need a subscription.</em>\n\n` +
      `To see subscription options, check out <b>Subscribe 💰</b>`;

    const keyboardNotSubscribed = Markup.inlineKeyboard([
      [Markup.button.callback('Subscribe 💰', 'subscriptions')],
      [Markup.button.callback('Go back', 'start')],
    ]);

    const message =
      `<b>Web-panel 🌐</b>\n\n` +
      `Your subscription grants you complete access to our panel's features.\n\n` +
      `<b>Subscription Expiry:</b> ${this.dayjs(userSubscription?.expired).format('ll')} ⏳\n` +
      `<b>Priority:</b> ${subscription?.priority || 0} ⚡\n` +
      `<b>Tasks in Queue:</b> 0 📋\n\n` +
      `For web-panel login, use 🔑\n` +
      `╚ UUID: <code>${user.uuid}</code>\n` +
      `Web-panel address 🌐\n` +
      `╚ ${EnvConfig.APP_BASEURL}\n\n` +
      `<em>Thank you for choosing SmartChecker!</em>`;

    const keyboard = Markup.inlineKeyboard([
      [Markup.button.callback('Regenerate UUID ♻️', 'regenerate_uuid')],
      [Markup.button.callback('Go back', 'start')],
    ]);

    if (userSubscription) {
      if (ctx.callbackQuery) {
        await ctx.editMessageText(message, { ...keyboard, parse_mode: 'HTML' });
      } else await ctx.replyWithHTML(message, keyboard);
    } else {
      if (ctx.callbackQuery) {
        await ctx.editMessageText(messageNotSubscribed, { ...keyboardNotSubscribed, parse_mode: 'HTML' });
      } else await ctx.replyWithHTML(messageNotSubscribed, keyboardNotSubscribed);
    }
  }

  @OnEvent('session.create')
  async onSessionCreate(session: UserSession) {
    await this.bot.telegram.sendMessage(
      session.user.id,
      `<b>🔑 Confirm Your Login</b>\n\n` +
        `We've noticed an attempt to access your web-panel account. If it was you, please confirm by clicking the button below.\n\n` +
        `<b>🔐 Date & Time:</b> ${this.dayjs(session.created).format('lll')}\n` +
        `<b>👽 Device:</b> ${session.device}\n\n` +
        `<em>If you didn't try to log in, it's advised to regenerate your UUID for security.</em>`,
      {
        ...Markup.inlineKeyboard([[Markup.button.callback('✅ Confirm', `confirm_session|${session.uuid}`)]]),
        parse_mode: 'HTML',
      },
    );
  }

  async confirmSession(ctx: UserContextWithParams) {
    const session = await this.sessionsService.findOne(ctx.params[0], ctx.user.id);
    if (!session) {
      await ctx.editMessageText(
        `<b>⛔ Session Not Found</b>\n\n` +
          `We're sorry, but the session you're trying to access couldn't be found. If you believe this is an error, please contact our support team for assistance.\n\n` +
          `<em>Feel free to reach out if you have any questions or need help. 🛠️</em>`,
        { parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } },
      );
      return;
    }

    await this.sessionsService.confirmSession(ctx.params[0], ctx.user.id);
    this.ioService.emitSessionConfirmed(session.uuid, new UserDto(session.user));
    await ctx.editMessageText(
      `<b>✅ Authorization Successful!</b>\n\n` +
        `Your device is now allowed to enter the panel.\n\n` +
        `<em>If you don't land on the panel, refresh the page and give it another shot.</em>`,
      { parse_mode: 'HTML', reply_markup: { inline_keyboard: [] } },
    );
  }

  async regenerateUuid(ctx: TelegramUserContext) {
    this.ioService.emitLogout(ctx.user.id.toString());
    await this.sessionsService.delete(ctx.user.id);
    await this.usersService.regenerateUUID(ctx.user.id);
    await this.webPanel(ctx)
  }

  @OnEvent('payment.cryptomus.created')
  async cryptomusPaymentGenerated(telegramUser: TelegramUser, subscription: any, invoice: PaymentResult) {
    const message =
      `<b>Thank you for choosing SmartChecker! We're all set to handle your payment. 😊</b>\n\n` +
      `You've chosen the ${subscription.time} subscription, priced at $${subscription.price.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      })}.\n\n` +
      `<em>⚠️ Make sure your payment details are accurate. If you enter wrong info, you might lose your funds. You've got 1 hour to finish the payment.</em>`;

    await this.bot.telegram.sendMessage(telegramUser.id, message, {
      ...Markup.inlineKeyboard([Markup.button.url('Pay', invoice.result.url)]),
      parse_mode: 'HTML',
    });
  }

  @OnEvent('payment.cryptomus.paid')
  async cryptomusPaymentPaid(payment: Payment) {
    const message =
      `Congratulations on your successful subscription payment with SmartChecker! 🎉\n\n` + `We're thrilled you've chosen our service!`;

    await this.bot.telegram.sendMessage(payment.telegramUser.id, message, {
      parse_mode: 'HTML',
    });
  }
}
