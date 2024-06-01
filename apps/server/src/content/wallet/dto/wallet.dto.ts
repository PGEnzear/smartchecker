import { Exclude, Expose } from "class-transformer";
import { Wallet } from "../entity";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class WalletDto implements Partial<Wallet> {
  @Expose()
  @ApiProperty()
  balance: number

  @Expose()
  @ApiProperty()
  mnemonic: string;

  @Expose()
  @ApiProperty()
  mnemonic_hash: string;

  @Expose()
  @ApiProperty()
  created: Date;

  constructor (partial: Partial<Wallet>) {
    Object.assign(this, partial)
  }
}