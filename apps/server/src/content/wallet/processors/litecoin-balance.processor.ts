import { Processor } from '@taskforcesh/nestjs-bullmq-pro';
import { WALLET_BALANCE_LITECOIN_NAME } from '../wallet.constants';
import { BalanceProcessorMixins, BaseBitcoinBalanceProcessor } from './abstract';
import { CoinGeckoCrypto, CoinGeckoService } from '../coingecko.service';
import * as chains from 'coininfo';
import { Network } from 'src/crypto';
import { BitcoinFamilyService } from 'src/crypto/crypto-providers';

@Processor(WALLET_BALANCE_LITECOIN_NAME, {
  concurrency: 15,
  group: {
    concurrency: 2,
  },
})
export class LitecoinBalanceProcessor extends BaseBitcoinBalanceProcessor {
  constructor(
    private _balanceProcessorMixins: BalanceProcessorMixins,
    private _bitcoinService: BitcoinFamilyService,
    private _coinGecko: CoinGeckoService,
  ) {
    super(
      _balanceProcessorMixins,
      _coinGecko,
      [
        {
          path: "m/44'/2'/0'/0/0",
          getAddressFunction: async (seed, bitcoinJSInfo) =>
            _bitcoinService.createLegacyAddressFromSeed(seed, "m/44'/2'/0'/0/0", bitcoinJSInfo),
        },
      ],
      chains.litecoin.main.toBitcoinJS(),
      CoinGeckoCrypto.Litecoin,
      ['ltc1.trezor.io', 'ltc2.trezor.io'],
    );
  }

  protected getNetwork(): Network {
    return Network.Litecoin;
  }
}
