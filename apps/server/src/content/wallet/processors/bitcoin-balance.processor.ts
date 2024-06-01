import { BitcoinFamilyService } from 'src/crypto/crypto-providers';
import { WALLET_BALANCE_BITCOIN_NAME } from '../wallet.constants';
import { CoinGeckoCrypto, CoinGeckoService } from '../coingecko.service';
import * as chains from 'coininfo';
import { Processor } from '@taskforcesh/nestjs-bullmq-pro';
import { Network } from 'src/crypto';
import { BalanceProcessorMixins, BaseBitcoinBalanceProcessor } from './abstract';

@Processor(WALLET_BALANCE_BITCOIN_NAME, {
  concurrency: 15,
  group: {
    concurrency: 2,
  },
})
export class BitcoinBalanceProcessor extends BaseBitcoinBalanceProcessor {
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
          path: "m/44'/0'/0'/0/0",
          getAddressFunction: async (seed, bitcoinJSInfo) =>
            _bitcoinService.createLegacyAddressFromSeed(seed, "m/44'/0'/0'/0/0", bitcoinJSInfo),
        },
        {
          path: "m/84'/0'/0'/0/0",
          getAddressFunction: async (seed, bitcoinJSInfo) =>
            _bitcoinService.createSegwitAddressFromSeed(seed, "m/84'/0'/0'/0/0", bitcoinJSInfo),
        },
        {
          path: "m/86'/0'/0'/0/0",
          getAddressFunction: async (seed, bitcoinJSInfo) =>
            _bitcoinService.createTaprootAddressFromSeed(seed, "m/86'/0'/0'/0/0", bitcoinJSInfo),
        },
      ], // Bitcoin derivation paths and address functions
      chains.bitcoin.main.toBitcoinJS(), // BitcoinJSInfo
      CoinGeckoCrypto.Bitcoin, // CoinGeckoCrypto for Bitcoin
      ['btc1.trezor.io', 'btc2.trezor.io'], // Bitcoin-specific nodes
    );
  }

  protected getNetwork(): Network {
    return Network.Bitcoin;
  }
}
