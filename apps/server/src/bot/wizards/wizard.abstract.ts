import { Markup } from 'telegraf';

export const cancelMarkupButton = Markup.button.callback('Отмена', 'cancel');
export const cancelMarkup = Markup.inlineKeyboard([cancelMarkupButton]);
