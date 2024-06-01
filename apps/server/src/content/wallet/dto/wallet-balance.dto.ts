import { Exclude, Expose, Type } from 'class-transformer';
import { WalletBalance } from '../entity';
import { ApiProperty } from '@nestjs/swagger';
import { WalletDto } from './wallet.dto';
import { Network } from 'src/crypto';

@Exclude()
export class WalletBalanceDto {
  @Expose()
  @ApiProperty()
  balance: number;

  @Expose()
  @Type(() => WalletDto)
  @ApiProperty({ type: WalletDto })
  wallet: WalletDto;

  @Expose()
  @ApiProperty()
  derivationPath: string;

  @Expose()
  @ApiProperty()
  address: string;

  @Expose()
  @ApiProperty({ enum: Network })
  network: Network;

  @Expose()
  @ApiProperty()
  created: Date;

  constructor(partial: Partial<WalletBalance>) {
    Object.assign(this, partial);
  }
}
