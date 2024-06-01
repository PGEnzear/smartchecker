import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FlowProducerPro, QueuePro } from '@taskforcesh/bullmq-pro';
import { InjectFlowProducer, InjectQueue } from '@taskforcesh/nestjs-bullmq-pro';
import { User } from 'src/users';
import { WALLET_CHILDREN_QUEUES, WALLET_FLOW_NAME, WALLET_QUEUE_NAME, WALLET_TASK_QUEUE_NAME } from './wallet.constants';
import { EOL } from 'os';
import { SubscriptionsService } from 'src/payment';
import { Telegraf } from 'telegraf';
import { InjectBot } from 'nestjs-telegraf';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletTask } from './entity';
import { IsNull, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { WalletTaskDto } from './dto';

@Injectable()
export class WalletTasksService {
  constructor(
    private subscriptionsService: SubscriptionsService,
    @InjectRepository(WalletTask) private walletTasksRepo: Repository<WalletTask>,
    @InjectBot() private bot: Telegraf,
    @InjectFlowProducer(WALLET_FLOW_NAME) private walletFlowProducer: FlowProducerPro,
    @InjectQueue(WALLET_TASK_QUEUE_NAME) private walletTaskQueue: QueuePro,
  ) {}

  async create(user: User, file: Express.Multer.File) {
    const userSubscription = await this.subscriptionsService.getUserSubscription(user.id);
    const subscription = await this.subscriptionsService.findSubscription(userSubscription.subscriptionId);
    const wallets = file.buffer
      .toString('utf-8')
      .replaceAll('\r', '')
      .split(EOL)
      .filter((phrase) => phrase.trim().split(/\s+/g).length >= 12);
    if (!wallets.length) throw new BadRequestException();

    const task = await this.walletTasksRepo.save({ user, loadedMnemonics: wallets.length });
    const flow = await this.walletFlowProducer.add({
      name: WALLET_TASK_QUEUE_NAME,
      queueName: WALLET_TASK_QUEUE_NAME,
      opts: {
        jobId: task.uuid,
        removeOnComplete: true,
        removeOnFail: true,
        removeDependencyOnFailure: true,
      },
      data: {
        userId: user.id,
      },
      children: wallets.map((wallet, i) => ({
        queueName: WALLET_QUEUE_NAME,
        name: WALLET_QUEUE_NAME,
        data: {
          mnemonic: wallet,
          userId: user.id,
          index: i + 1,
          taskId: task.uuid,
        },
        opts: {
          removeOnComplete: true,
          removeOnFail: true,
          removeDependencyOnFailure: true,
        },
        children: [
          ...WALLET_CHILDREN_QUEUES.map((name) => ({
            queueName: name,
            name: name,
            data: {
              mnemonic: wallet,
              taskId: task.uuid,
              userId: user.id,
            },
            opts: {
              group: {
                id: user.id.toString() + '-' + name,
                priority: subscription.priority,
              },
              attempts: 3,
              backoff: {
                type: 'exponential',
                delay: 1000,
              },
              removeOnComplete: true,
              removeOnFail: true,
              removeDependencyOnFailure: true,
            },
          })),
        ],
      })),
    });

    await this.bot.telegram.sendMessage(
      user.id,
      `<b>Task Added! 📝</b>\n` + `Mnemonics: <b>${wallets.length}</b>\n` + `Task ID: <code>${flow.job.id}</code>`,
      {
        parse_mode: 'HTML',
      },
    );

    return new WalletTaskDto(task);
  }

  async find(userId?: number) {
    const walletTasks = await this.walletTasksRepo.find({
      take: 10,
      order: { created: 'DESC' },
      where: { ...(userId ? { user: { id: userId } } : {}) },
    });
    return walletTasks.map((i) => instanceToPlain(new WalletTaskDto(i)));
  }

  async stop(uuid: string, userId?: number) {
    const task = await this.walletTasksRepo.findOne({
      where: { uuid, completed: IsNull(), ...(userId ? { user: { id: userId } } : {}) },
      relations: ['user'],
    });
    if (!task) throw new NotFoundException();

    const flow = await this.walletFlowProducer.getFlow({
      id: uuid,
      queueName: WALLET_TASK_QUEUE_NAME,
    });
    await this.walletTaskQueue.remove(uuid, {
      removeChildren: true,
    });
    // await Promise.all(
    //   flow.children.map(
    //     (children) =>
    //       children?.job?.remove({
    //         removeChildren: true,
    //       }),
    //   ),
    // );
    await this.walletTasksRepo.delete({ uuid });

    await this.bot.telegram.sendMessage(task.user.id, `<b>Task Canceled ⛔️</b>\n` + `Task ID: <code>${uuid}</code>`, {
      parse_mode: 'HTML',
    });
  }
}
