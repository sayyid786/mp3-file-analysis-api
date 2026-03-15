import { describe, it } from 'mocha';
import { expect } from 'chai';
import { getHttpLogger } from '../../src/utils/morgan.util';

describe('morgan.util', () => {
  describe('getHttpLogger', () => {
    it('returns a middleware function', () => {
      const middleware = getHttpLogger();
      expect(middleware).to.be.a('function');
    });

    it('middleware calls next', done => {
      const middleware = getHttpLogger();
      const req = {
        requestId: 'test-id',
        method: 'GET',
        url: '/test',
        headers: { 'user-agent': 'test-agent' },
        socket: { remoteAddress: '127.0.0.1' },
        connection: { remoteAddress: '127.0.0.1' },
        httpVersionMajor: 1,
        httpVersionMinor: 1,
      } as any;
      const res = {
        getHeader: () => undefined,
        on: (_event: string, cb: () => void) => cb(),
      } as any;
      middleware(req, res, done);
    });
  });
});
