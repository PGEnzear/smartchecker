import * as bip39 from 'bip39';

export function mnemonicToSeed(mnemonic: string) {
  return bip39.mnemonicToSeed(mnemonic);
}
