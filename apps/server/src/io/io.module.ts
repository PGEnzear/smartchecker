import { Global, Module } from '@nestjs/common';
import { IOGateway } from './io.gateway';
import { IOService } from './io.service';

@Global()
@Module({
  providers: [IOGateway, IOService],
  exports: [IOService],
})
export class IOModule {}