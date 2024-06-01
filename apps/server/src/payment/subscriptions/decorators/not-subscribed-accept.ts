import { SetMetadata } from '@nestjs/common';
 
export const IS_NOT_SUBSCRIBED_ACCEPT_KEY = 'isEmailNotConfirmedAccept';
export const NotSubscribedAccept = () => SetMetadata(IS_NOT_SUBSCRIBED_ACCEPT_KEY, true);