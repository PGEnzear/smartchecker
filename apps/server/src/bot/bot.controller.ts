import { Controller, Get, Header, Inject, NotFoundException, Param, Res, UseInterceptors } from '@nestjs/common';
import { ApiProduces, ApiTags } from '@nestjs/swagger';
import { InjectBot } from 'nestjs-telegraf';
import { CurrentSession, TelegramUserContext, UserSession } from 'src/users';
import { Telegraf } from 'telegraf';
import axios from 'axios';
import { CACHE_MANAGER, CacheInterceptor } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Auth } from 'src/auth';

@Controller('bot')
@ApiTags('bot')
export class BotController {
  constructor(
    @InjectBot() private bot: Telegraf<TelegramUserContext>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Auth()
  @Get('avatar')
  @Header('Cache-Control', 'public, max-age=3600')
  async avatar(@Res() res: Response, @CurrentSession() { user }: UserSession) {
    try {
      let link = await this.cacheManager.get<string>('avatar-' + user.id);
      if (!link) {
        const avatars = await this.bot.telegram.getUserProfilePhotos(user.id, undefined, 1);
        const photoId = avatars.photos?.[0]?.[0]?.file_id;
        const { href } = await this.bot.telegram.getFileLink(photoId);
        link = href;
        await this.cacheManager.set('avatar-' + user.id, link, 600);
      }
      axios({
        method: 'get',
        url: link,
        responseType: 'stream',
      }).then(function (response) {
        response.data.pipe(res);
      });
    } catch (e) {
      throw new NotFoundException();
    }
  }
}
