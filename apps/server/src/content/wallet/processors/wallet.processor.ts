import { Processor, WorkerHost, OnWorkerEvent } from '@taskforcesh/nestjs-bullmq-pro';
import { JobPro } from '@taskforcesh/bullmq-pro';
import { WALLET_QUEUE_NAME } from '../wallet.constants';
import { BalanceProcessor } from './types';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet, WalletBalance, WalletTask } from '../entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as _ from 'lodash';
import { IOService } from 'src/io/io.service';

@Processor(WALLET_QUEUE_NAME, {
  concurrency: 50,
})
export class WalletProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Wallet) private walletsRepo: Repository<Wallet>,
    @InjectRepository(WalletBalance) private walletBalancesRepo: Repository<WalletBalance>,
    @InjectRepository(WalletTask) private walletTasksRepo: Repository<WalletTask>,
    private ioService: IOService,
  ) {
    super();
  }

  async process(job: JobPro): Promise<number> {
    if (!(await this.walletTasksRepo.findOneBy({ uuid: job.data.taskId }))) return;
    const mnemonic_hash = crypto.createHash('md5').update(job.data.mnemonic).digest('hex');
    const childrenValues = await job.getChildrenValues<BalanceProcessor[]>();
    const wallets = Object.values(childrenValues).flat();
    const totalBalance = _.sumBy(wallets, 'balance');

    await this.walletsRepo.upsert(
      {
        mnemonic_hash,
        userId: job.data.userId,
        mnemonic: job.data.mnemonic,
        balance: totalBalance,
        taskUuid: job.data.taskId,
      },
      {
        conflictPaths: ['userId', 'mnemonic_hash'],
      },
    );

    await this.walletTasksRepo.increment({ uuid: job.data.taskId }, 'totalMnemonics', 1);
    await this.walletTasksRepo.increment({ uuid: job.data.taskId }, 'totalBalance', totalBalance);

    await this.walletBalancesRepo.upsert(
      wallets
        .filter((w) => !!w)
        .map((wallet) => ({
          walletMnemonicHash: mnemonic_hash,
          walletUserId: job.data.userId,
          ...wallet,
        })),
      {
        conflictPaths: ['walletMnemonicHash', 'walletUserId', 'network'],
      },
    );

    if (job.data.index % 3 == 0)
      await this.ioService.emitWalletTaskProcessed(job.data.userId.toString(), {
        wallet: job.data.index,
        taskId: job.data.taskId,
      });

    return totalBalance;
  }
}
