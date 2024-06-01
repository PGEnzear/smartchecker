import { Processor, WorkerHost } from '@taskforcesh/nestjs-bullmq-pro';
import { JobPro } from '@taskforcesh/bullmq-pro';
import { WALLET_BALANCE_TRON_NAME } from '../wallet.constants';
import { Network } from 'src/crypto';
import { TronService, mnemonicToSeed } from 'src/crypto/crypto-providers';
import { BalanceProcessorMixins } from './abstract';

@Processor(WALLET_BALANCE_TRON_NAME, {
  concurrency: 15,
  group: {
    concurrency: 2,
  },
})
export class TronBalanceProcessor extends WorkerHost {
  constructor(
    private balanceProcessorMixins: BalanceProcessorMixins,
    private tronService: TronService,
  ) {
    super();
  }

  async process(job: JobPro): Promise<any> {
    if (await this.balanceProcessorMixins.applySkipStopped(job)) return;
    if (await this.balanceProcessorMixins.applySkipNotHaveProxy(job)) return;
    await this.balanceProcessorMixins.applyRateLimit(this.worker, job, Network.Tron, 10);

    const seed = await mnemonicToSeed(job.data.mnemonic);
    const derivationPath = "m/44'/195'/0'/0/0";
    const address = await this.tronService.createAddressFromSeed(seed, derivationPath);

    try {
      const tronApiUrl = 'https://apilist.tronscanapi.com/api/account/token_asset_overview?address=' + address;
      const response = await this.balanceProcessorMixins.requestWithProxy(tronApiUrl, job);

      if (response.data && response.data.totalAssetInUsd !== undefined) {
        const balance = response.data.totalAssetInUsd;
        return [{ derivationPath, address, balance, network: Network.Tron }];
      } else {
        throw Error();
      }
    } catch (e) {
      return [{ derivationPath, address, balance: 0, network: Network.Tron }];
    }
  }
}
