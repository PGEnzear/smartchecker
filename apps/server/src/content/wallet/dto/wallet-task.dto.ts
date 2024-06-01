import { Exclude, Expose } from "class-transformer";
import { WalletTask } from "../entity";
import { ApiProperty } from "@nestjs/swagger";

@Exclude()
export class WalletTaskDto implements Partial<WalletTask> {
  @Expose()
  @ApiProperty()
  uuid: string;

  @Expose()
  @ApiProperty({ required: false })
  totalMnemonics: number

  @Expose()
  @ApiProperty()
  loadedMnemonics: number

  @Expose()
  @ApiProperty({ required: false })
  totalBalance: number

  @Expose()
  @ApiProperty({ required: false })
  completed: boolean;

  @Expose()
  @ApiProperty()
  created: Date;

  constructor (partial: Partial<WalletTask>) {
    Object.assign(this, partial)
  }
}