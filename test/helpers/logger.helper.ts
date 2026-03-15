import winston from 'winston';
const logger = winston.createLogger({
  level: 'error',
  transports: [new winston.transports.Console({ silent: true })],
});

export default logger;
