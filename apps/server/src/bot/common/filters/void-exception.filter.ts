import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';

@Catch()
export class VoidExceptionFilter implements ExceptionFilter {
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {}
}
