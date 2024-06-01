import { ExecutionContext } from "@nestjs/common";

export function userSessionFactory<T>(ctx: ExecutionContext): T {
  const contextType = ctx.getType();
  if (contextType === 'http') {
    const { user } = ctx.switchToHttp().getRequest();
    return user;
  } else if (contextType === 'rpc') {
    throw new Error('Rpc context is not implemented yet');
  } else if (contextType === 'ws') {
    throw new Error('Websockets context is not implemented yet');
  } else if (contextType === 'graphql') {
    throw new Error('graphql context is not implemented yet');
  }
  throw new Error('Invalid context');
}