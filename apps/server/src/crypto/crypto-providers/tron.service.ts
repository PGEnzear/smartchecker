import { Injectable } from '@nestjs/common';
import BIP32Factory from 'bip32';
import * as TronWeb from 'tronweb';
import * as ecc from 'tiny-secp256k1';
const bip32 = BIP32Factory(ecc);

@Injectable()
export class TronService {
  private client: TronWeb = new TronWeb({
    fullNode: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
  });

  createKeypair(
    seed: Buffer,
    derivationPath: string,
  ): {
    publicKey: string;
    privateKey: string;
  } {
    const node = bip32.fromSeed(seed).derivePath(derivationPath);
    return {
      privateKey: node.privateKey!.toString('hex'),
      publicKey: node.publicKey!.toString('hex'),
    };
  }

  createAddressFromKeypair(keypair: { publicKey: string; privateKey: string }): string {
    return this.client.address.fromPrivateKey(keypair.privateKey);
  }

  createAddressFromSeed(seed: Buffer, derivationPath: string) {
    const keypair = this.createKeypair(seed, derivationPath);
    return this.createAddressFromKeypair(keypair);
  }
}
