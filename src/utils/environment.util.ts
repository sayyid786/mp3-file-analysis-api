import { Environment } from '../types/Environment';

function getStringValue(name: string): string {
  const stringValue = process.env[name];
  if (!stringValue) {
    throw new Error(`Environment variable ${name} is undefined`);
  }
  return stringValue;
}

function getStringValueInList(name: string, list: string[]): string {
  const stringValue = getStringValue(name);
  if (!list.includes(stringValue)) {
    throw new Error(`Environment variable ${name} must be ${list.join(', ')}`);
  }
  return stringValue;
}

function getNumberValue(name: string) {
  const stringValue = getStringValue(name);
  const numberValue = parseInt(stringValue, 10);

  if (isNaN(numberValue)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return numberValue;
}

function getBoolValue(name: string) {
  const stringValue = getStringValueInList(name, ['true', 'false']);
  return stringValue === 'true';
}

function loadEnvironment() {
  const nodeEnv = getStringValueInList('NODE_ENV', [
    'development',
    'staging',
    'production',
  ]);

  const logLevel = getStringValueInList('LOG_LEVEL', [
    'silly',
    'debug',
    'verbose',
    'info',
    'warn',
    'error',
  ]);

  const serverPort = getNumberValue('SERVER_PORT');
  const serverSecureCookies = getBoolValue('SERVER_SECURE_COOKIES');
  const serverUrl = getStringValue('SERVER_URL');

  return {
    nodeEnv,
    logLevel,
    server: {
      port: serverPort,
      secureCookies: serverSecureCookies,
      url: serverUrl,
    },
  };
}

const environment = loadEnvironment();

function getEnvironment(): Environment {
  return environment;
}

export { getEnvironment };
