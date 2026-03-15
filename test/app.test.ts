/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';

import * as appHelper from '../src/helpers/app.helper';
import * as app from '../src/app';
import * as winston from '../src/utils/winston.util';
import * as expressUtil from '../src/utils/express.util';
import * as environmentUtil from '../src/utils/environment.util';

import mockLogger from './helpers/logger.helper';
import mockEnvironment from './helpers/environment.helper';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('app', () => {
  let sandbox: sinon.SinonSandbox;
  let alreadyShutdownStub: sinon.SinonStub;
  let processStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(winston, 'getLogger').returns(mockLogger);
    sandbox.stub(winston, 'flushLogs').resolves();
    sandbox.stub(environmentUtil, 'getEnvironment').returns(mockEnvironment);
    alreadyShutdownStub = sandbox
      .stub(appHelper, 'getAlreadyShutdown')
      .returns(false);
    processStub = sandbox.stub(process, 'exit');
  });
  afterEach(() => {
    processStub.reset();
    sandbox.restore();
  });

  describe('shutdown', () => {
    let expressStopStub: sinon.SinonStub;
    let setAlreadyShutdownStub: sinon.SinonStub;

    beforeEach(() => {
      expressStopStub = sandbox.stub(expressUtil, 'stop').resolves();
      setAlreadyShutdownStub = sandbox.stub(appHelper, 'setAlreadyShutdown');
    });

    it('successful shutdown with no error', async () => {
      await app.shutdown();
      expect(expressStopStub).to.be.calledOnce;
      expect(processStub).to.not.be.called;
    });

    it('calls process.exit(1) when withError is true', async () => {
      await app.shutdown(true);
      expect(processStub).to.be.calledOnceWith(1);
    });

    it('calls process.exit(1) when express.stop throws', async () => {
      expressStopStub.rejects(new Error('stop error'));
      await app.shutdown();
      expect(processStub).to.be.calledOnceWith(1);
    });

    it('does nothing if already shutdown', async () => {
      alreadyShutdownStub.returns(true);
      await app.shutdown();
      expect(expressStopStub).to.not.be.called;
      expect(setAlreadyShutdownStub).to.not.be.called;
    });
  });

  describe('startup', () => {
    it('successful start up of service', async () => {
      const expressConnectStub = sandbox.stub(expressUtil, 'start').resolves();
      await app.startup();
      expect(expressConnectStub).to.be.calledOnce;
    });

    it('calls shutdown with error when express.start throws', async () => {
      sandbox.stub(expressUtil, 'start').rejects(new Error('start error'));
      sandbox.stub(expressUtil, 'stop').resolves();
      sandbox.stub(appHelper, 'setAlreadyShutdown');
      await app.startup();
      expect(processStub).to.be.calledOnceWith(1);
    });
  });

  describe('signal handlers', () => {
    afterEach(() => {
      process.removeAllListeners('SIGINT');
      process.removeAllListeners('SIGTERM');
    });

    it('SIGINT triggers shutdown', async () => {
      sandbox.stub(expressUtil, 'start').resolves();
      sandbox.stub(expressUtil, 'stop').resolves();
      const setAlreadyShutdownStub = sandbox.stub(appHelper, 'setAlreadyShutdown');
      await app.startup();
      process.emit('SIGINT');
      await new Promise<void>(resolve => setTimeout(resolve, 10));
      expect(setAlreadyShutdownStub).to.be.called;
    });

    it('SIGTERM triggers shutdown', async () => {
      sandbox.stub(expressUtil, 'start').resolves();
      sandbox.stub(expressUtil, 'stop').resolves();
      const setAlreadyShutdownStub = sandbox.stub(appHelper, 'setAlreadyShutdown');
      await app.startup();
      process.emit('SIGTERM');
      await new Promise<void>(resolve => setTimeout(resolve, 10));
      expect(setAlreadyShutdownStub).to.be.called;
    });
  });
});
