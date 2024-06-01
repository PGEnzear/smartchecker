import { DataSource } from 'typeorm';
import { EnvConfig } from '../../../packages/config';

// Entities
import { TelegramUser, User, UserSession } from './users';
import { Payment, Subscription } from './payment';
import { Wallet, WalletBalance, WalletTask } from './content';
import { Proxy } from './content/proxy/proxy.entity';

export default new DataSource({
  type: EnvConfig.DATABASE_TYPE as any,
  host: EnvConfig.DATABASE_HOST,
  port: EnvConfig.DATABASE_PORT,
  username: EnvConfig.DATABASE_USER,
  password: EnvConfig.DATABASE_PASSWORD,
  database: EnvConfig.DATABASE_NAME,
  entities: [User, TelegramUser, UserSession, Subscription, Payment, Wallet, WalletBalance, WalletTask, Proxy],
  synchronize: EnvConfig.DEVELOPMENT,
  extra: {
    charset: 'utf8mb4_unicode_ci',
  },
});
