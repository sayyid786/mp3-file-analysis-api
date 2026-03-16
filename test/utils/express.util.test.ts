import { describe, it, beforeEach, afterEach } from 'mocha';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import http from 'http';
import winston from 'winston';

import * as expressUtil from '../../src/utils/express.util';
import * as expressHelper from '../../src/helpers/express.helper';
import * as environmentUtil from '../../src/utils/environment.util';
import * as morganUtil from '../../src/utils/morgan.util';
import * as winstonUtil from '../../src/utils/winston.util';

import mockLogger from '../helpers/logger.helper';
import mockEnvironment from '../helpers/environment.helper';

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('express.util', () => {
  let sandbox: sinon.SinonSandbox;
  let logger: winston.Logger;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(environmentUtil, 'getEnvironment').returns(mockEnvironment);
    sandbox
      .stub(morganUtil, 'getHttpLogger')
      .returns((_req: any, _res: any, next: any) => next());
    sandbox.stub(winstonUtil, 'logError');
    logger = mockLogger;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('start', () => {
    it('starts the server and sets it on the helper', async () => {
      const setServerStub = sandbox.stub(expressHelper, 'setServer');
      const fakeServer = new http.Server();
      sandbox.stub(fakeServer, 'listen').returns(fakeServer);
      sandbox.stub(http, 'createServer').returns(fakeServer as any);
      await expressUtil.start(logger);
      expect(setServerStub).to.be.calledOnce;
    });

    it('exercises request metadata middleware', done => {
      const setServerStub = sandbox.stub(expressHelper, 'setServer');
      const fakeServer = new http.Server();
      // Capture the express app passed to createServer so we can call it directly
      const createServerStub = sandbox
        .stub(http, 'createServer')
        .callsFake((app: any) => {
          // Fire a fake request through the express app to hit the metadata middleware
          const req = {
            method: 'GET',
            url: '/test',
            headers: {},
            socket: {},
            on: sinon.stub(),
          } as any;
          const res = {
            setHeader: sinon.stub(),
            getHeader: sinon.stub(),
            on: (_e: string, cb: () => void) => cb(),
          } as any;
          app(req, res, () => {
            expect(req.requestId).to.be.a('string');
            expect(req.logger).to.exist;
            expect(res.setHeader).to.be.calledWith(
              'MP3-FILE-ANALYSIS-ID',
              req.requestId,
            );
            done();
          });
          sandbox.stub(fakeServer, 'listen').returns(fakeServer);
          return fakeServer as any;
        });
      expressUtil.start(logger).catch(done);
      void setServerStub;
      void createServerStub;
    });

    it('throws when http.createServer throws', async () => {
      sandbox.stub(expressHelper, 'setServer');
      sandbox.stub(http, 'createServer').throws(new Error('create error'));
      await expect(expressUtil.start(logger)).to.be.rejectedWith(
        'Failed to start express server',
      );
    });
  });

  describe('stop', () => {
    it('does nothing when no server is set', async () => {
      sandbox.stub(expressHelper, 'getServer').returns(undefined);
      await expect(expressUtil.stop(logger)).to.not.be.rejected;
    });

    it('stops the server when one is set', async () => {
      const stopStub = sinon.stub();
      sandbox
        .stub(expressHelper, 'getServer')
        .returns({ stop: stopStub } as any);
      await expressUtil.stop(logger);
      expect(stopStub).to.be.calledOnce;
    });

    it('throws when server.stop() throws', async () => {
      const stopStub = sinon.stub().throws(new Error('stop error'));
      sandbox
        .stub(expressHelper, 'getServer')
        .returns({ stop: stopStub } as any);
      await expect(expressUtil.stop(logger)).to.be.rejectedWith(
        'Error stopping express',
      );
    });
  });
});
