import { SetMetadata } from '@nestjs/common';

export const IS_SESSION_NOT_CONFIRMED_ACCEPT_KEY = 'IS_SESSION_NOT_CONFIRMED_ACCEPT_KEY';
export const SessionNotConfirmedAccept = () => SetMetadata(IS_SESSION_NOT_CONFIRMED_ACCEPT_KEY, true);