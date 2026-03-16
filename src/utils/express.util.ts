import express, { Request, Response } from 'express';
import http from 'http';
import stoppable from 'stoppable';
import cors from 'cors';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import winston from 'winston';
import { v4 as uuid } from 'uuid';
import * as environment from './environment.util';
import { getHttpLogger } from './morgan.util';
import { logError } from './winston.util';
import router from '../server/routes';
import * as helpers from '../helpers/express.helper';

const moduleName = '/utils/express';

const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MP3 File Analysis API',
      version: '1.0.0',
      description:
        'API for uploading MP3 files and returning frame count analysis.',
    },
    servers: [{ url: '/' }],
  },
  apis: ['./src/server/routes/*.ts', './build/src/server/routes/*.js'],
});

export const start = async (logger: winston.Logger) => {
  const log = logger.child({ module: moduleName, function: 'start' });

  log.verbose('creating express app');
  const app = express();

  log.verbose('adding metadata to request and response');
  app.use((req: Request, res: Response, next) => {
    const requestId = uuid();
    req.requestId = requestId;
    req.logger = log.child({ requestId, log_type: 'req' });
    res.setHeader('MP3-FILE-ANALYSIS-ID', req.requestId);
    next();
  });

  log.verbose('configuring express modules');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors({ origin: true, credentials: true }));

  log.verbose('adding http logger');
  app.use(getHttpLogger());

  log.verbose('configuring swagger docs');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  log.verbose('configuring routes');
  app.use('/', router);

  const {
    server: { port },
  } = environment.getEnvironment();

  try {
    log.verbose('creating http server');
    const server = stoppable(http.createServer(app));

    log.verbose('starting http server');
    server.listen(port);
    helpers.setServer(server);
  } catch (err) {
    logError(log, 'error starting server', err);
    throw new Error('Failed to start express server', { cause: err });
  }
  log.debug('http server listening on port %d', port);
};

export const stop = async (logger: winston.Logger) => {
  const log = logger.child({ module: moduleName, function: 'stop' });

  const server = helpers.getServer();
  if (server) {
    log.verbose('stopping http server');
    try {
      server.stop();
    } catch (err) {
      logError(log, 'error stopping http server', err);
      throw new Error('Error stopping express', { cause: err });
    }
  }
};
