import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthUserDto, LoginDto } from './dto';
import { AuthService } from './auth.service';
import { CurrentSession, User, UserDto, UserSession } from 'src/users';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth } from './auth.decorator';
import { Device, HCaptcha } from 'src/common';
import { UserSessionsService } from 'src/users/web/user-sessions.service';
import { SessionNotConfirmedAccept } from 'src/users/web/decorators';
import { NotSubscribedAccept } from 'src/payment';
import { ThrottlerBehindProxyGuard } from 'src/common/guards';

@UseGuards(ThrottlerBehindProxyGuard)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userSessionsService: UserSessionsService,
  ) {}

  @Post('login')
  @HCaptcha()
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  login(@Body() body: LoginDto, @Device() device: string) {
    return this.authService.login(body, device);
  }

  @Get('me')
  @Auth()
  @ApiBearerAuth()
  @ApiOkResponse({ type: UserDto })
  @ApiUnauthorizedResponse()
  me(@CurrentSession() { user }: UserSession) {
    return new UserDto(user);
  }

  @Get('logout')
  @Auth()
  @ApiBearerAuth()
  @SessionNotConfirmedAccept()
  @NotSubscribedAccept()
  @ApiUnauthorizedResponse()
  logout(@CurrentSession() session: UserSession) {
    return this.userSessionsService.deleteOne(session.uuid);
  }
}
