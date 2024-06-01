import { Module } from '@nestjs/common';
import { BitcoinFamilyService } from './bitconin-family.service';
import { EVMService } from './evm.service';
import { SolanaService } from './solana.service';
import { TronService } from './tron.service';

@Module({
  providers: [BitcoinFamilyService, EVMService, SolanaService, TronService],
  exports: [BitcoinFamilyService, EVMService, SolanaService, TronService],
})
export class CryptoProvidersModule {}
