import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Proxy } from './proxy.entity';
import { ProxyController } from './proxy.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Proxy])],
  providers: [ProxyService],
  exports: [ProxyService],
  controllers: [ProxyController]
})
export class ProxyModule {}