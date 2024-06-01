import { Controller, Get, Body, Patch } from '@nestjs/common';
import { Auth } from 'src/auth';
import { CurrentSession, UserSession } from 'src/users';
import { ProxyService } from './proxy.service';
import { ProxyCreateMultipleDTO, ProxyResponseDto } from './dto';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';

@Auth()
@Controller('proxy')
@ApiTags('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all proxies' }) // Swagger operation summary
  @ApiOkResponse({ description: 'Return an array of proxies.', type: ProxyResponseDto, isArray: true })
  find(@CurrentSession() { user }: UserSession): Promise<ProxyResponseDto[]> {
    return this.proxyService.find(user);
  }

  @Patch()
  @ApiOperation({ summary: 'Update proxies' }) // Swagger operation summary
  @ApiOkResponse({ description: 'Return an array of updated proxies.', type: ProxyResponseDto, isArray: true })
  updateProxies(@CurrentSession() { user }: UserSession, @Body() data: ProxyCreateMultipleDTO): Promise<ProxyResponseDto[]> {
    return this.proxyService.updateProxies(user, data);
  }
}
