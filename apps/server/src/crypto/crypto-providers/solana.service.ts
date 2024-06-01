import { Injectable } from '@nestjs/common';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { derivePath } from 'ed25519-hd-key';

@Injectable()
export class SolanaService {
  private connection = new Connection(clusterApiUrl('mainnet-beta'));

  createKeypair(seed: Buffer, derivationPath: string): Keypair {
    return Keypair.fromSeed(derivePath(derivationPath, seed.toString('hex')).key);
  }

  getBalance(address: string) {
    return this.connection.getBalance(new PublicKey(address));
  }

  createAddressFromKeypair(keypair: Keypair): string {
    return new PublicKey(keypair.publicKey).toBase58();
  }

  createAddressFromSeed(seed: Buffer, derivationPath: string): string {
    const keypair = this.createKeypair(seed, derivationPath);
    return this.createAddressFromKeypair(keypair);
  }
}
