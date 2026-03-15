import * as winston from './utils/winston.util';
import * as environment from './utils/environment.util';
import npm from '../package.json';
import * as express from './utils/express.util';
import { logError } from './utils/winston.util';
import * as appHelper from './helpers/app.helper';

const moduleName = '/app';

const sigInt = async () => {
  const log = winston
    .getLogger()
    .child({ module: moduleName, function: 'sigInt', log_type: 'app' });

  log.info('app recieved a sig int, shutting down');
  await shutdown();
};

const sigTerm = async () => {
  const log = winston
    .getLogger()
    .child({ module: moduleName, function: 'sigTerm', log_type: 'app' });

  log.info('app recieved a sig term, shutting down');
  await shutdown();
};

export const shutdown = async (withError?: boolean): Promise<void> => {
  const log = winston
    .getLogger()
    .child({ module: moduleName, function: 'shutdown', log_type: 'app' });

  if (!appHelper.getAlreadyShutdown()) {
    let errorOccured = false;
    appHelper.setAlreadyShutdown();

    log.verbose('stopping express');
    try {
      await express.stop(log);
    } catch (err) {
      logError(log, 'error stopping express', err);
      errorOccured = true;
    }

    log.verbose('flushing logs');
    await winston.flushLogs();

    if (withError || errorOccured) {
      process.exit(1);
    }
  }
};

export const startup = async (): Promise<void> => {
  const log = winston
    .getLogger()
    .child({ module: moduleName, function: 'startup' });

  log.debug(
    'nodeEnv: %s, version: %s',
    environment.getEnvironment().nodeEnv,
    npm.version,
  );

  log.verbose('starting express');
  try {
    await express.start(log);
  } catch (err) {
    logError(log, 'error starting express', err);
    await shutdown(true);
  }

  log.verbose('wiring up shutdown handlers');
  process.on('SIGINT', sigInt);
  process.on('SIGTERM', sigTerm);

  log.info('startup complete');
};

/* istanbul ignore next */
if (require.main === module) {
  startup();
}
