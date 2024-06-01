import { Processor } from '@taskforcesh/nestjs-bullmq-pro';
import { WALLET_BALANCE_BITCOIN_CASH_NAME } from '../wallet.constants';
import { BalanceProcessorMixins, BaseBitcoinBalanceProcessor } from './abstract';
import { CoinGeckoCrypto, CoinGeckoService } from '../coingecko.service';
import * as chains from 'coininfo';
import { Network } from 'src/crypto';
import { BitcoinFamilyService } from 'src/crypto/crypto-providers';

@Processor(WALLET_BALANCE_BITCOIN_CASH_NAME, {
  concurrency: 15,
  group: {
    concurrency: 2,
  },
})
export class BitcoinCashBalanceProcessor extends BaseBitcoinBalanceProcessor {
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
          path: "m/44'/145'/0'/0/0",
          getAddressFunction: async (seed, bitcoinJSInfo) =>
            _bitcoinService.createLegacyAddressFromSeed(seed, "m/44'/145'/0'/0/0", bitcoinJSInfo),
        },
      ],
      chains.bitcoincash.main.toBitcoinJS(),
      CoinGeckoCrypto.BitcoinCash,
      ['bch1.trezor.io', 'bch2.trezor.io'],
    );
  }

  protected getNetwork(): Network {
    return Network.BitcoinCash;
  }
}
