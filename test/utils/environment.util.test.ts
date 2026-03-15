import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';

const validEnv = {
  NODE_ENV: 'development',
  LOG_LEVEL: 'silly',
  SERVER_PORT: '8000',
  SERVER_SECURE_COOKIES: 'false',
  SERVER_URL: 'localhost:8000',
};

describe('environment.util', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    Object.assign(process.env, validEnv);
  });

  afterEach(() => {
    // Restore original env vars
    Object.keys(validEnv).forEach(key => delete process.env[key]);
    Object.assign(process.env, originalEnv);
  });

  describe('getEnvironment', () => {
    it('returns a valid environment object', () => {
      // Re-require to get a fresh module with our env vars
      delete require.cache[require.resolve('../../src/utils/environment.util')];
      const { getEnvironment } = require('../../src/utils/environment.util');
      const env = getEnvironment();
      expect(env.nodeEnv).to.equal('development');
      expect(env.logLevel).to.equal('silly');
      expect(env.server.port).to.equal(8000);
      expect(env.server.secureCookies).to.equal(false);
      expect(env.server.url).to.equal('localhost:8000');
    });

    it('throws when NODE_ENV is missing', () => {
      delete process.env.NODE_ENV;
      delete require.cache[require.resolve('../../src/utils/environment.util')];
      expect(() => require('../../src/utils/environment.util')).to.throw(
        'Environment variable NODE_ENV is undefined',
      );
    });

    it('throws when NODE_ENV is not in valid list', () => {
      process.env.NODE_ENV = 'invalid';
      delete require.cache[require.resolve('../../src/utils/environment.util')];
      expect(() => require('../../src/utils/environment.util')).to.throw(
        'Environment variable NODE_ENV must be',
      );
    });

    it('throws when SERVER_PORT is not a number', () => {
      process.env.SERVER_PORT = 'notanumber';
      delete require.cache[require.resolve('../../src/utils/environment.util')];
      expect(() => require('../../src/utils/environment.util')).to.throw(
        'Environment variable SERVER_PORT must be a number',
      );
    });

    it('throws when SERVER_URL is missing', () => {
      delete process.env.SERVER_URL;
      delete require.cache[require.resolve('../../src/utils/environment.util')];
      expect(() => require('../../src/utils/environment.util')).to.throw(
        'Environment variable SERVER_URL is undefined',
      );
    });

    it('parses SERVER_SECURE_COOKIES as true', () => {
      process.env.SERVER_SECURE_COOKIES = 'true';
      delete require.cache[require.resolve('../../src/utils/environment.util')];
      const { getEnvironment } = require('../../src/utils/environment.util');
      expect(getEnvironment().server.secureCookies).to.equal(true);
    });
  });
});
