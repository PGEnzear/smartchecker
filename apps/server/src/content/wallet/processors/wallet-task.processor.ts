import { Processor, WorkerHost, OnWorkerEvent } from '@taskforcesh/nestjs-bullmq-pro';
import { JobPro } from '@taskforcesh/bullmq-pro';
import { WALLET_TASK_QUEUE_NAME } from '../wallet.constants';
import { InjectRepository } from '@nestjs/typeorm';
import { WalletTask } from '../entity';
import { Repository } from 'typeorm';
import { InjectBot } from 'nestjs-telegraf';
import { Markup, Telegraf } from 'telegraf';
import * as _ from 'lodash';
import { EnvConfig } from '@smartchecker/config';
import { IOService } from 'src/io/io.service';

@Processor(WALLET_TASK_QUEUE_NAME, {
  concurrency: 50,
})
export class WalletTaskProcessor extends WorkerHost {
  constructor(
    @InjectRepository(WalletTask) private walletTasksRepo: Repository<WalletTask>,
    @InjectBot() private bot: Telegraf,
    private ioService: IOService,
  ) {
    super();
  }

  async process(job: JobPro): Promise<any> {
    if (!(await this.walletTasksRepo.findOneBy({ uuid: job.id }))) return;
    const childrenValues = await job.getChildrenValues<number>();
    const balances = Object.values(childrenValues);
    const balance = _.sum(balances);

    await this.walletTasksRepo.update({ uuid: job.id }, { completed: true, totalBalance: balance, totalMnemonics: balances.length });
    await this.ioService.emitWalletTaskCompleted(job.data.userId, {
      taskId: job.id,
      mnemonics: balances.length,
      balance,
    });
    await this.bot.telegram.sendMessage(
      job.data.userId,
      `<b>Task Completed! ✅</b>\n` +
        `Total balance: <b>${balance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</b>\n` +
        `Mnemonics: <b>${balances.length}</b>\n` +
        `Task ID: <code>${job.id}</code>`,
      {
        ...Markup.inlineKeyboard([Markup.button.url('Go to panel', EnvConfig.APP_BASEURL)]),
        parse_mode: 'HTML',
      },
    );
  }
}
