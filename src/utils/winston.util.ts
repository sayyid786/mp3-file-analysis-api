import winston from 'winston';
import * as environment from './environment.util';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.splat(),
  winston.format.json(),
);

const logger = winston.createLogger({
  level: environment.getEnvironment().logLevel,
  format: logFormat,
  transports: [new winston.transports.Console()],
});

export const getLogger = (): winston.Logger => {
  return logger;
};

export const flushLogs = async () => {
  return new Promise<void>(resolve => {
    logger.on('finish', () => {
      resolve();
    });
    logger.end();
  });
};

export const logError = (
  theLog: winston.Logger,
  message: string,
  error: unknown,
  metadata?: { [key: string]: string },
) => {
  if (error instanceof Error) {
    theLog.error(message, {
      errorMessage: error.message,
      errorStack: error.stack,
      ...(metadata ? metadata : {}),
    });
  } else {
    theLog.error(message);
  }
};
