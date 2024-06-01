import { WorkerHost } from '@taskforcesh/nestjs-bullmq-pro';
import { JobPro } from '@taskforcesh/bullmq-pro';
import { Network } from 'src/crypto';
import { mnemonicToSeed } from 'src/crypto/crypto-providers';
import { Blockbook } from 'blockbook-client';
import { Logger } from '@nestjs/common';
import { CoinGeckoCrypto, CoinGeckoService } from '../../coingecko.service';
import { BalanceProcessor } from '../types';
import { BalanceProcessorMixins } from './balance-processor.mixin';

export abstract class BaseBitcoinBalanceProcessor extends WorkerHost {
  private logger = new Logger(this.constructor.name);
  private blockbook: Blockbook;

  protected constructor(
    private balanceProcessorMixins: BalanceProcessorMixins,
    private coinGecko: CoinGeckoService,
    private derivationPathsAndFunctions: { path: string, getAddressFunction: (seed: Buffer, bitcoinJSInfo: any) => Promise<string> }[],
    private bitcoinJSInfo: any,
    private coinGeckoCrypto: CoinGeckoCrypto,
    private nodes: string[],
  ) {
    super();
    this.blockbook = new Blockbook({ nodes });
  }

  async onApplicationBootstrap() {
    await this.blockbook.connect();
    this.logger.log('Connected to blockbook');
  }

  async process(job: JobPro): Promise<BalanceProcessor[]> {
    if (await this.balanceProcessorMixins.applySkipStopped(job)) return;
    await this.balanceProcessorMixins.applyRateLimit(this.worker, job, this.getNetwork(), 10);

    const rate = this.coinGecko.getRate(this.coinGeckoCrypto);
    const balances: BalanceProcessor[] = [];

    for (const { path, getAddressFunction } of this.derivationPathsAndFunctions) {
      const seed = await mnemonicToSeed(job.data.mnemonic);
      const address = await getAddressFunction(seed, this.bitcoinJSInfo);
      const balance = Math.ceil((await this.getBlockbookBalance(address)) * rate * 100) / 100;

      balances.push({
        address: address,
        derivationPath: path,
        balance: balance,
        network: this.getNetwork(),
      });
    }

    return balances;
  }

  private async getBlockbookBalance(address: string) {
    const { balance } = await this.blockbook.getAddressDetails(address);
    return Number(balance);
  }

  protected abstract getNetwork(): Network;
}