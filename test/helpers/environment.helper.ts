import { Environment } from '../../src/types/Environment';

const environment: Environment = {
  nodeEnv: 'development',
  logLevel: 'silly',
  server: {
    port: 8000,
    secureCookies: false,
    url: 'localhost:8000',
  },
};

export default environment;
