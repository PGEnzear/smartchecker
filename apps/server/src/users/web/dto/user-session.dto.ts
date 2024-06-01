import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { UserSession } from "../user-session.entity";

@Exclude()
export class UserSessionDto {
  @Expose()
  @ApiProperty()
  uuid: string;

  @Expose()
  @ApiProperty({ required: false })
  device?: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  created: Date;

  constructor(partial: Partial<UserSession>) {
    Object.assign(this, partial);
  }
}