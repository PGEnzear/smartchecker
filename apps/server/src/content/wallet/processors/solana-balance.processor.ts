import { Processor, WorkerHost } from '@taskforcesh/nestjs-bullmq-pro';
import { JobPro } from '@taskforcesh/bullmq-pro';
import { WALLET_BALANCE_SOLANA_NAME } from '../wallet.constants';
import { SolanaService } from 'src/crypto/crypto-providers';
import { CoinGeckoCrypto, CoinGeckoService } from '../coingecko.service';
import { BalanceProcessor } from './types';
import { BalanceProcessorMixins } from './abstract';
import { mnemonicToSeed } from 'bip39';
import { clusterApiUrl } from '@solana/web3.js';
import { Network } from 'src/crypto';

@Processor(WALLET_BALANCE_SOLANA_NAME, {
  concurrency: 15,
  group: {
    concurrency: 2,
  },
})
export class SolanaBalanceProcessor extends WorkerHost {
  constructor(
    private balanceProcessorMixins: BalanceProcessorMixins,
    private solanaService: SolanaService,
    private coinGecko: CoinGeckoService,
  ) {
    super();
  }

  async process(job: JobPro): Promise<BalanceProcessor[]> {
    if (await this.balanceProcessorMixins.applySkipStopped(job)) return;
    if (await this.balanceProcessorMixins.applySkipNotHaveProxy(job)) return;
    await this.balanceProcessorMixins.applyRateLimit(this.worker, job, Network.Solana, 10);

    const seed = await mnemonicToSeed(job.data.mnemonic);
    const derivationPath = "m/44'/501'/0'/0'";
    const address = await this.solanaService.createAddressFromSeed(seed, derivationPath);

    const requestData = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [
        address,
        {
          encoding: 'base58',
        },
      ],
    };

    try {
      const response = await this.balanceProcessorMixins.requestWithProxy(clusterApiUrl('mainnet-beta'), job, 'post', requestData);
      const accountInfo = response.data.result.value;
      const balanceLamports = accountInfo.lamports;
      const balanceSol = balanceLamports / 10 ** 9; // Convert lamports to SOL
      const balance = Math.ceil(balanceSol * this.coinGecko.getRate(CoinGeckoCrypto.Solana) * 100) / 100;

      return [{ derivationPath, address, balance, network: Network.Solana }];
    } catch (e) {
      return [{ derivationPath, address, balance: 0, network: Network.Solana }];
    }
  }
}
