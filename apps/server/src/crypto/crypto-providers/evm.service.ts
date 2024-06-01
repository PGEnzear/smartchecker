import { Injectable } from '@nestjs/common';
import * as HDNode from 'hdkey';
import Web3, { HttpProvider } from 'web3';

@Injectable()
export class EVMService {
  private web3: Web3 = new Web3(new HttpProvider("https://rpc.ankr.com/eth"));

  createKeypair(seed: Buffer, derivationPath: string): HDNode {
    return HDNode.fromMasterSeed(seed).derive(derivationPath);
  }

  createAddressFromKeypair(keypair: HDNode): string {
    const { address } = this.web3.eth.accounts.privateKeyToAccount(keypair.privateKey);
    return address;
  }

  createAddressFromSeed(seed: Buffer, derivationPath: string): string {
    const keypair = this.createKeypair(seed, derivationPath);
    return this.createAddressFromKeypair(keypair);
  }
}
