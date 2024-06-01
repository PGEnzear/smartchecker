import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users';
import { UserDto } from 'src/users';

export class AuthUserDto {
  @ApiProperty({ type: UserDto })
  user: UserDto;

  @ApiProperty()
  accessToken: string;

  constructor(user: Partial<User>, accessToken: string) {
    this.user = new UserDto(user);
    this.accessToken = accessToken;
  }
}
