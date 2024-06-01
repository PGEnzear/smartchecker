import { TelegramUser } from 'src/users';

export function userLink(user: TelegramUser) {
  return `<a href="tg://user?id=${user.id}">${user.username || `#${user.id}`}</a>`;
}
