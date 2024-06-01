import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ProxyCreateMultipleDTO {
  @ApiProperty({
    description: 'Array of proxy strings.',
    isArray: true,
    example: [
      'username:password@ip:port', // Example of proxy with credentials
      'ip:port:username:password', // Example of reversed proxy with credentials
      'ip:port', // Example of proxy without credentials
    ],
  })
  @IsString({ each: true })
  items: string[];
}
