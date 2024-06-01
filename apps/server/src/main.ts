import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { getBotToken } from 'nestjs-telegraf';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { resolveDynamicProviders } from 'nestjs-dynamic-providers';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { AuthAdapter } from './auth/auth.adapter';

const logger = new Logger('TelegramBot');
async function bootstrap() {
  await resolveDynamicProviders();
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  const bot: Telegraf<any> = app.get(getBotToken());
  bot.catch(logger.error);
  if (EnvConfig.TELEGRAM_WEBHOOK_PATH) app.use(bot.webhookCallback(EnvConfig.TELEGRAM_WEBHOOK_PATH));

  app.enableCors();
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useWebSocketAdapter(new AuthAdapter(app));

  const config = new DocumentBuilder().setTitle('OpenAPI').addBearerAuth().setVersion('1.0').build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3001);
}

try {
  bootstrap().catch((err) => {
    logger.error(err, err.stack);
  });
} catch (err) {
  logger.error(err, err.stack);
}
