import { Processor, WorkerHost } from '@taskforcesh/nestjs-bullmq-pro';
import { JobPro } from '@taskforcesh/bullmq-pro';
import { WALLET_BALANCE_EVM_NAME } from '../wallet.constants';
import { Network } from 'src/crypto';
import { EVMService, mnemonicToSeed } from 'src/crypto/crypto-providers';
import { BalanceProcessorMixins } from './abstract';

@Processor(WALLET_BALANCE_EVM_NAME, {
  concurrency: 15,
  group: {
    concurrency: 2,
  },
})
export class EVMBalanceProcessor extends WorkerHost {
  constructor(
    private balanceProcessorMixins: BalanceProcessorMixins,
    private evmService: EVMService,
  ) {
    super();
  }

  async process(job: JobPro): Promise<any> {
    if (await this.balanceProcessorMixins.applySkipStopped(job)) return;
    if (await this.balanceProcessorMixins.applySkipNotHaveProxy(job)) return;
    await this.balanceProcessorMixins.applyRateLimit(this.worker, job, Network.EVM, 10);

    const seed = await mnemonicToSeed(job.data.mnemonic);
    const derivationPath = "m/44'/60'/0'/0/0";
    const address = await this.evmService.createAddressFromSeed(seed, derivationPath);

    try {
      const evmApiUrl = 'https://api.debank.com/user?id=' + address;
      const response = await this.balanceProcessorMixins.requestWithProxy(evmApiUrl, job);

      if (response.data?.data?.user?.desc?.usd_value !== undefined) {
        const balance = response.data.data.user.desc.usd_value;
        return [{ derivationPath, address, balance, network: Network.EVM }];
      } else {
        throw Error();
      }
    } catch (e) {
      return [{ derivationPath, address, balance: 0, network: Network.EVM }];
    }
  }
}
