import { Injectable } from '@nestjs/common';
import * as bitcoin from 'bitcoinjs-lib';
import { BIP32Factory, BIP32Interface } from 'bip32';
import * as HDNode from 'hdkey';
import { ECPairAPI, ECPairFactory, Signer } from 'ecpair';
const tinysecp = require('tiny-secp256k1');

/*
Initialize the tiny-secp256k1 library as an implementation of the
cryptography.
*/
bitcoin.initEccLib(tinysecp);

@Injectable()
export class BitcoinFamilyService {
  private readonly bip32 = BIP32Factory(tinysecp);
  private readonly ECPair: ECPairAPI = ECPairFactory(tinysecp);

  private tapTweakHash(pubKey: Buffer, h: Buffer | undefined): Buffer {
    return bitcoin.crypto.taggedHash('TapTweak', Buffer.concat(h ? [pubKey, h] : [pubKey]));
  }

  private toXOnly(pubkey: Buffer): Buffer {
    return pubkey.subarray(1, 33);
  }

  private tweakSigner(
    signer: BIP32Interface | HDNode,
    opts?: {
      network?: bitcoin.Network;
      tweakHash?: Buffer;
    },
  ): Signer {
    let privateKey: Uint8Array | undefined = signer.privateKey!;
    if (!privateKey) {
      throw new Error('Private key is required for tweaking signer!');
    }
    if (signer.publicKey[0] === 3) {
      privateKey = tinysecp.privateNegate(privateKey);
    }

    const tweakedPrivateKey = tinysecp.privateAdd(privateKey, this.tapTweakHash(this.toXOnly(signer.publicKey), opts?.tweakHash));
    if (!tweakedPrivateKey) {
      throw new Error('Invalid tweaked private key!');
    }

    return this.ECPair.fromPrivateKey(Buffer.from(tweakedPrivateKey), {
      network: opts?.network,
    });
  }

  createLegacyKeypair(seed: Buffer, derivationPath: string) {
    return HDNode.fromMasterSeed(seed).derive(derivationPath);
  }

  createTaprootKeypair(seed: Buffer, derivationPath: string, network: bitcoin.Network): BIP32Interface {
    return this.bip32.fromSeed(seed, network).derivePath(derivationPath);
  }

  createLegacyAddressFromKeypair(keypair: BIP32Interface | HDNode, network: bitcoin.Network): string {
    const { address } = bitcoin.payments.p2pkh({
      pubkey: keypair.publicKey,
      network: network,
    });
    return address;
  }

  createLegacyAddressFromSeed(seed: Buffer, path: string, network: bitcoin.Network): string {
    const master = this.createLegacyKeypair(seed, path);
    return this.createLegacyAddressFromKeypair(master, network);
  }

  createSegwitAddressFromKeypair(keypair: BIP32Interface | HDNode, network: bitcoin.Network): string {
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: keypair.publicKey,
      network: network,
    });
    return address;
  }

  createSegwitAddressFromSeed(seed: Buffer, path: string, network: bitcoin.Network): string {
    const master = this.createLegacyKeypair(seed, path);
    return this.createSegwitAddressFromKeypair(master, network);
  }

  createTaprootAddressFromKeypair(keypair: BIP32Interface | HDNode, network: bitcoin.Network): string {
    const tweakedSigner = this.tweakSigner(keypair, { network });
    const { address } = bitcoin.payments.p2tr({
      pubkey: this.toXOnly(tweakedSigner.publicKey),
      network,
    });
    return address;
  }

  createTaprootAddressFromSeed(seed: Buffer, path: string, network: bitcoin.Network): string {
    const master = this.createTaprootKeypair(seed, path, network);
    return this.createTaprootAddressFromKeypair(master, network);
  }
}
