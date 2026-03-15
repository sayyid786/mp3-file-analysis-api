import { describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { getLogger, flushLogs, logError } from '../../src/utils/winston.util';

chai.use(sinonChai);

describe('winston.util', () => {
  describe('getLogger', () => {
    it('returns a winston logger', () => {
      const logger = getLogger();
      expect(logger).to.have.property('info').that.is.a('function');
      expect(logger).to.have.property('error').that.is.a('function');
    });
  });

  describe('flushLogs', () => {
    it('resolves when the logger finishes', async () => {
      // flushLogs ends the logger stream; we just verify it resolves
      await expect(flushLogs()).to.eventually.be.undefined;
    });
  });

  describe('logError', () => {
    it('logs error message and stack when error is an Error instance', () => {
      const logger = getLogger();
      const errorStub = sinon.stub(logger, 'error');
      const err = new Error('test error');

      logError(logger, 'something went wrong', err);

      expect(errorStub).to.be.calledOnce;
      const args = errorStub.firstCall.args as any[];
      expect(args[0]).to.equal('something went wrong');
      expect(args[1]).to.include({ errorMessage: 'test error' });

      errorStub.restore();
    });

    it('logs error message with metadata when provided', () => {
      const logger = getLogger();
      const errorStub = sinon.stub(logger, 'error');
      const err = new Error('meta error');

      logError(logger, 'with metadata', err, { key: 'value' });

      expect(errorStub).to.be.calledOnce;
      const args = errorStub.firstCall.args as any[];
      expect(args[1]).to.include({ key: 'value', errorMessage: 'meta error' });

      errorStub.restore();
    });

    it('logs just the message when error is not an Error instance', () => {
      const logger = getLogger();
      const errorStub = sinon.stub(logger, 'error');

      logError(logger, 'non-error thrown', 'some string error');

      expect(errorStub).to.be.calledOnceWith('non-error thrown');

      errorStub.restore();
    });
  });
});
