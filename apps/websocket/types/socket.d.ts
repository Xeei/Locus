import { Logger } from 'pino';

declare module 'socket.io' {
  interface Socket {
    log: Logger;
  }
}