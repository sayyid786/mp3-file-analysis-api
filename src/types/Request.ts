import winston from 'winston';

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      logger: winston.Logger;
    }
  }
}
