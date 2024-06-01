import { Context, Scenes } from 'telegraf';
import { TelegramUser } from './telegram-user.entity';

interface Session extends Scenes.WizardSessionData {}

export interface TelegramUserContext extends Context {
  user: TelegramUser;
  scene: Scenes.SceneContextScene<TelegramUserContext, Session>;
  wizard: Scenes.WizardContextWizard<TelegramUserContext>;
}
 