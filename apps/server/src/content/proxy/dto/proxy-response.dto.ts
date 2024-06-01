import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Proxy } from '../proxy.entity';

@Exclude()
export class ProxyResponseDto {
  @ApiProperty({ description: 'The UUID of the proxy' })
  @Expose()
  uuid: string;

  @Expose()
  @ApiProperty()
  url: string;

  @Expose()
  @ApiProperty({ description: 'The creation date of the proxy' })
  created: Date;

  constructor(partial: Partial<Proxy>) {
    Object.assign(this, partial);
    this.url = `${partial.ip}:${partial.port}`;

    if (partial.username && partial.password) {
      this.url = `${partial.ip}:${partial.port}:${partial.username}:${partial.password}`;
    }
  }
}
